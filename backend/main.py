from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from processor import market_processor
from config import Config
from database import init_db, SessionLocal, PriceHistory, upsert_market_data
import uvicorn
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Database tables...")
    init_db() 
    
    # Pre-seed your local cache with common core assets so they are ready instantly
    print("Pre-seeding common market trackers into local cache...")
    upsert_market_data("INDIA VIX", 19.50)
    upsert_market_data("TATSILV-EQ", 25.50)
    upsert_market_data("SILVERBEES-EQ", 253.00)
    upsert_market_data("RELIANCE-EQ", 2400.00)
    upsert_market_data("TATASTEEL-EQ", 150.00)
    
    # Start the continuous live price monitoring engine
    task = asyncio.create_task(market_processor.process_loop())
    
    # Queue up the initial assets for live tracking
    await market_processor.add_request(Config.VIX_SYMBOL, priority=2)
    await market_processor.add_request("TATSILV-EQ", priority=2)
    await market_processor.add_request("SILVERBEES-EQ", priority=2)
    
    yield
    market_processor.is_running = False
    await task

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.50.46:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/track/{symbol}")
async def track_stock_live(symbol: str):
    await market_processor.add_request(symbol.upper(), priority=1)
    return {"status": "Priority tracking started", "symbol": symbol}

@app.get("/brain/analyze/{symbol}")
async def analyze_stock(symbol: str):
    try:
        segment = 'nse_cm'
        token = symbol.upper()
        
        db_session = SessionLocal()
        vix_record = db_session.query(PriceHistory).filter(PriceHistory.symbol.ilike("%VIX%")).first()
        live_vix = float(vix_record.price) if vix_record else 18.5
        db_session.close()

        if "VIX" not in symbol.upper():
            search_term = symbol.split('-')[0]
            raw_results = market_processor.client.search_scrip(exchange_segment=segment, symbol=search_term)
            
            results_list = []
            if str(type(raw_results)) == "<class 'pandas.core.frame.DataFrame'>":
                results_list = raw_results.to_dict('records')
            elif isinstance(raw_results, dict):
                data_val = raw_results.get('data', [])
                msg_val = raw_results.get('message', [])
                results_list = data_val if isinstance(data_val, list) else (msg_val if isinstance(msg_val, list) else [])
            elif isinstance(raw_results, list):
                results_list = raw_results
                
            if results_list and len(results_list) > 0:
                target_scrip = results_list[0]
                for s in results_list:
                    if isinstance(s, dict) and (s.get('pGroup') == 'EQ' or s.get('pTrdSymbol') == symbol.upper()):
                        target_scrip = s
                        break
                if isinstance(target_scrip, dict):
                    token = target_scrip.get('pSymbol') or target_scrip.get('instrument_token') or target_scrip.get('token')

        try:
            quote = market_processor.client.quotes(
                instrument_tokens=[{'instrument_token': str(token), 'exchange_segment': segment}],
                quote_type='all'
            )
        except Exception:
            quote = market_processor.client.quotes(
                instrument_tokens=[{'instrument_token': str(token), 'exchange_segment': segment}],
                quote_type='ltp'
            )
        
        market_profile = f"--- COGNITIVE TRADING SYSTEM QUANT MATRIX ---\n"
        market_profile += f"Asset Symbol Under Audit: {symbol.upper()}\n"
        market_profile += f"Systemic Risk Regime -> LIVE INDIA VIX LEVEL: {live_vix}\n"
        
        if isinstance(quote, dict):
            msg_data = quote.get('message', quote.get('data', []))
            q = msg_data[0] if isinstance(msg_data, list) and len(msg_data) > 0 else (msg_data if isinstance(msg_data, dict) else quote)
            
            if isinstance(q, dict) and 'fault' not in q:
                ltp = float(q.get('last_traded_price') or q.get('ltp') or 0.0)
                open_p = float(q.get('open_price') or q.get('op') or q.get('open') or ltp)
                high_p = float(q.get('high_price') or q.get('hp') or q.get('high') or ltp)
                low_p = float(q.get('low_price') or q.get('lp') or q.get('low') or ltp)
                close_p = float(q.get('close_price') or q.get('cp') or q.get('close') or ltp)
                volume = q.get('volume') or q.get('v') or q.get('totTrdQty') or "N/A"
                net_change = q.get('netChange') or q.get('pChange') or q.get('nc') or "0.0"
                
                total_buy_vol = float(q.get('totalBuyQuantity') or q.get('totBuyQty') or q.get('tbq') or 1.0)
                total_sell_vol = float(q.get('totalSellQuantity') or q.get('totSellQty') or q.get('tsq') or 1.0)
                obi_ratio = round(total_buy_vol / total_sell_vol, 3) if total_sell_vol > 0 else 1.0
                
                denom = (high_p - low_p)
                intraday_location = round((ltp - low_p) / denom, 3) if denom > 0 else 0.5
                
                market_profile += (
                    f"1. TIME-SERIES PRICE STRUCTURE:\n"
                    f"   - Current Last Traded Price: ₹{ltp}\n"
                    f"   - Open: ₹{open_p} | High: ₹{high_p} | Low: ₹{low_p} | Previous Close: ₹{close_p}\n"
                    f"   - Intraday High/Low Range Proximity Ratio: {intraday_location}\n"
                    f"   - Net Session Deviation: {net_change}%\n\n"
                    f"2. LIQUIDITY & CLUSTER DEPTH STRUCTURE:\n"
                    f"   - Total Traded Volume: {volume}\n"
                    f"   - Total Order Book Buy Bids: {total_buy_vol} shares\n"
                    f"   - Total Order Book Sell Offers: {total_sell_vol} shares\n"
                    f"   - Order Book Imbalance (OBI) Velocity Ratio: {obi_ratio}\n"
                )
            else:
                try:
                    fallback_quote = market_processor.client.quotes(instrument_tokens=[{'instrument_token': str(token), 'exchange_segment': segment}], quote_type='ltp')
                    f_data = fallback_quote.get('message', fallback_quote.get('data', []))
                    f_item = f_data[0] if isinstance(f_data, list) and len(f_data) > 0 else (f_data if isinstance(f_data, dict) else {})
                    ltp = f_item.get('last_traded_price') or f_item.get('ltp') or "N/A"
                    market_profile += f"   - Current Last Traded Price: ₹{ltp}\n"
                except Exception:
                    market_profile += f"Raw Quote Array Dump: {str(quote)}"
        else:
            market_profile += f"Raw Quote Array Dump: {str(quote)}"
            
        from brain import fingpt
        analysis_results = fingpt.get_detailed_analysis(market_profile)
        return {
            "symbol": symbol,
            **analysis_results
        }
        
    except Exception as e:
        print(f"Brain analysis bridge error: {e}")
        from brain import fingpt
        analysis_results = fingpt.get_detailed_analysis(f"Technical summary for trading item {symbol}")
        return {
            "symbol": symbol,
            **analysis_results
        }

@app.get("/search/")
async def search_symbols_empty():
    return []

@app.get("/search/{query}")
async def search_symbols(query: str):
    try:
        # STEP 1: Fast local database lookup first
        db = SessionLocal()
        cached_records = db.query(PriceHistory).filter(PriceHistory.symbol.ilike(f"%{query}%")).limit(8).all()
        db.close()
        
        # If we have matches locally, return them immediately (takes ~2ms!)
        if cached_records and len(cached_records) >= 3:
            return [{"symbol": r.symbol, "name": "Cached Equity/ETF Asset"} for r in cached_records]
            
        # STEP 2: Fallback to Kotak ONLY if database doesn't have it
        raw_results = market_processor.client.search_scrip(exchange_segment="nse_cm", symbol=query.upper())
        
        results_list = []
        if str(type(raw_results)) == "<class 'pandas.core.frame.DataFrame'>":
            results_list = raw_results.to_dict('records')
        elif isinstance(raw_results, dict):
            data_val = raw_results.get('data', [])
            msg_val = raw_results.get('message', [])
            results_list = data_val if isinstance(data_val, list) else (msg_val if isinstance(msg_val, list) else [])
        elif isinstance(raw_results, list):
            results_list = raw_results
            
        formatted_results = []
        if isinstance(results_list, list):
            for item in results_list:
                if not isinstance(item, dict):
                    continue
                
                group = str(item.get('pGroup', '')).upper()
                sym = item.get('pTrdSymbol') or item.get('pSymbolName') or item.get('trdSymbol') or item.get('symbol')
                
                if group != 'EQ' and (sym and not str(sym).upper().endswith('-EQ')):
                    continue
                
                name = item.get('pDesc') or item.get('pEngName') or item.get('companyName') or item.get('name')
                
                if sym:
                    # Save the asset definition quietly into our database so it's cached locally next time!
                    upsert_market_data(str(sym), 0.0)
                    formatted_results.append({
                        "symbol": str(sym),
                        "name": str(name).title() if name else "NSE Listed Equity"
                    })
        
        seen = set()
        unique_results = []
        for r in formatted_results:
            if r['symbol'] not in seen:
                seen.add(r['symbol'])
                unique_results.append(r)
                if len(unique_results) == 8:
                    break
                    
        return unique_results
    except Exception as e:
        print(f"Search API error: {e}")
        return []

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, ws="none")