import asyncio
from datetime import datetime, time
from zoneinfo import ZoneInfo
from database import SessionLocal, PriceHistory, upsert_market_data
from kotak_client import get_client
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
        self.is_running = True
        self.override_market_hours = False

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
                segment = 'nse_indices' if symbol == Config.VIX_SYMBOL else 'nse_cm'
                
                scrip = self.client.search_scrip(exchange_segment=segment, symbol=symbol)
                
                if scrip:
                    token = scrip[0]['instrument_token']
                    
                    quote = self.client.quotes(
                        instrument_tokens=[{'instrument_token': token, 'exchange_segment': segment}],
                        quote_type='ltp'
                    )
                    
                    price = float(quote['message'][0]['last_traded_price'])
                    
                    upsert_market_data(symbol, price)
                    
                    status = "VOLATILE" if symbol == Config.VIX_SYMBOL and price > 20 else "STABLE"
                    print(f"[{'HIGH' if priority==1 else 'IDLE'} | {status}] {symbol}: {price}")
                else:
                    print(f"Could not find token for {symbol}")

            except Exception as e:
                print(f"Error processing {symbol}: {e}")

            if priority == 2:
                asyncio.create_task(self._delayed_requeue(symbol, priority))

            wait_time = 0.5 if priority == 1 else 2.0
            await asyncio.sleep(wait_time)
            self.queue.task_done()

    async def _delayed_requeue(self, symbol, priority):
        await asyncio.sleep(5)
        await self.add_request(symbol, priority)

market_processor = MarketProcessor()