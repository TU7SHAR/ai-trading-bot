import asyncio
from datetime import datetime, time
from zoneinfo import ZoneInfo
from database import SessionLocal, PriceHistory, upsert_market_data
from kotak_client import get_client, login_session
from config import Config

def is_market_open():
    ist = ZoneInfo('Asia/Kolkata')
    now = datetime.now(tz=ist)
    
    if now.weekday() > 4:
        return False
        
    start_time = time(9, 15)
    end_time = time(15, 30)
    
    return start_time <= now.time() <= end_time

class MarketProcessor:
    def __init__(self):
        self.queue = asyncio.PriorityQueue()
        self.client = get_client()
        
        print("Authenticating Kotak Client...")
        login_success = login_session(self.client)
        if not login_success:
            print("CRITICAL: Failed to authenticate with Kotak API.")
            
        self.is_running = True
        self.override_market_hours = True 

    async def add_request(self, symbol, priority=2):
        await self.queue.put((priority, symbol))

    async def process_loop(self):
        print("Market Processor Engine Started...")
        while self.is_running:
            if not is_market_open() and not self.override_market_hours:
                print("Market is closed. Sleeping...")
                await asyncio.sleep(60)
                continue

            priority, symbol = await self.queue.get()
            
            try:
                if "VIX" in symbol.upper():
                    segment = 'nse_cm'
                    token = "INDIA VIX" if symbol.upper() == "INDIA VIX" else symbol
                else:
                    segment = 'nse_cm'
                    search_term = symbol.split('-')[0]
                    raw_scrip = self.client.search_scrip(exchange_segment=segment, symbol=search_term)
                    
                    scrip_list = []
                    if str(type(raw_scrip)) == "<class 'pandas.core.frame.DataFrame'>":
                        scrip_list = raw_scrip.to_dict('records')
                    elif isinstance(raw_scrip, dict):
                        data_val = raw_scrip.get('data', [])
                        msg_val = raw_scrip.get('message', [])
                        if isinstance(data_val, list):
                            scrip_list = data_val
                        elif isinstance(msg_val, list):
                            scrip_list = msg_val
                    elif isinstance(raw_scrip, list):
                        scrip_list = raw_scrip
                    
                    token = None
                    if scrip_list and len(scrip_list) > 0:
                        target_scrip = scrip_list[0]
                        for s in scrip_list:
                            if isinstance(s, dict) and (s.get('pGroup') == 'EQ' or s.get('pTrdSymbol') == symbol):
                                target_scrip = s
                                break
                        
                        if isinstance(target_scrip, dict):
                            token = target_scrip.get('pSymbol') or target_scrip.get('instrument_token') or target_scrip.get('token')

                if not token:
                    print(f"[{symbol}] Could not find a valid token in segment '{segment}'.")
                else:
                    # UPGRADED: Pull full quote information to capture real-time order depth data
                    try:
                        quote = self.client.quotes(
                            instrument_tokens=[{'instrument_token': str(token), 'exchange_segment': segment}],
                            quote_type='all'
                        )
                    except Exception:
                        quote = self.client.quotes(
                            instrument_tokens=[{'instrument_token': str(token), 'exchange_segment': segment}],
                            quote_type='ltp'
                        )
                    
                    price = None
                    buy_vol = 1.0
                    sell_vol = 1.0
                    
                    if isinstance(quote, dict):
                        msg_data = quote.get('message', quote.get('data', []))
                        if isinstance(msg_data, list) and len(msg_data) > 0 and isinstance(msg_data[0], dict):
                            q_data = msg_data[0]
                        elif isinstance(msg_data, dict):
                            q_data = msg_data
                        else:
                            q_data = quote
                        
                        price = q_data.get('last_traded_price') or q_data.get('ltp')
                        buy_vol = q_data.get('totalBuyQuantity') or q_data.get('totBuyQty') or q_data.get('tbq') or 1.0
                        sell_vol = q_data.get('totalSellQuantity') or q_data.get('totSellQty') or q_data.get('tsq') or 1.0
                        
                    if price is not None:
                        price = float(price)
                        buy_vol = float(buy_vol)
                        sell_vol = float(sell_vol)
                        obi_ratio = round(buy_vol / sell_vol, 3) if sell_vol > 0 else 1.0
                        
                        # Maintain live snapshot tracking table
                        upsert_market_data(symbol, price)
                        
                        # NEW: Commit snapshot to our historical time-series data table
                        from database import save_order_book_tick
                        save_order_book_tick(symbol, price, buy_vol, sell_vol, obi_ratio)
                        
                        status = "BUY_PRESSURE" if obi_ratio > 1.2 else ("SELL_PRESSURE" if obi_ratio < 0.8 else "BALANCED")
                        print(f"[{'HIGH' if priority==1 else 'IDLE'} | {status}] {symbol}: ₹{price} | OBI: {obi_ratio}")
                    else:
                        print(f"[{symbol}] Could not extract live data fields. Response: {quote}")

            except Exception as e:
                print(f"Error processing {symbol}: {repr(e)}")

            if priority == 2:
                asyncio.create_task(self._delayed_requeue(symbol, priority))

            wait_time = 1.0 if priority == 1 else 3.0
            await asyncio.sleep(wait_time)
            self.queue.task_done()

    async def _delayed_requeue(self, symbol, priority):
        await asyncio.sleep(5)
        await self.add_request(symbol, priority)

market_processor = MarketProcessor()