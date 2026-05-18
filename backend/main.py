from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from processor import market_processor
from config import Config
from database import init_db, SessionLocal, PriceHistory, upsert_market_data
import uvicorn
import asyncio
import random
from datetime import datetime, timedelta

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

from database import OrderBookHistory

@app.get("/brain/analyze/{symbol}")
async def analyze_stock(symbol: str):
    try:
        segment = 'nse_cm'
        token = symbol.upper()
        
        db_session = SessionLocal()
        # Query volatility benchmarks
        vix_record = db_session.query(PriceHistory).filter(PriceHistory.symbol.ilike("%VIX%")).first()
        live_vix = float(vix_record.price) if vix_record else 18.5
        
        # NEW: Fetch trailing time-series data to feed maximum context to the AI model
        historical_ticks = db_session.query(OrderBookHistory).filter(
            OrderBookHistory.symbol == symbol.upper()
        ).order_by(OrderBookHistory.id.desc()).limit(10).all()
        
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
        market_profile += f"Systemic Risk Regime -> LIVE INDIA VIX LEVEL: {live_vix}\n\n"
        
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
                    f"1. LIVE SNAPSHOT STRUCTURE:\n"
                    f"   - Current Last Traded Price: ₹{ltp}\n"
                    f"   - Open: ₹{open_p} | High: ₹{high_p} | Low: ₹{low_p} | Previous Close: ₹{close_p}\n"
                    f"   - Intraday High/Low Range Proximity Ratio: {intraday_location}\n"
                    f"   - Net Session Deviation: {net_change}%\n"
                    f"   - Total Traded Volume: {volume}\n"
                    f"   - Order Book Buy Bids: {total_buy_vol} shares | Sell Offers: {total_sell_vol} shares\n"
                    f"   - Order Book Imbalance (OBI) Velocity Ratio: {obi_ratio}\n\n"
                )
        
        # NEW: Format trailing history stream logs directly into the text data prompt
        market_profile += "2. HISTORICAL LIQUIDITY & MOMENTUM MOMENTUM TREND (Oldest to Newest):\n"
        if historical_ticks:
            for t in reversed(historical_ticks):
                market_profile += (
                    f"   - Time: {t.timestamp.strftime('%H:%M:%S')} | "
                    f"Price: ₹{t.price} | "
                    f"Bids Vol: {t.buy_volume} | Offers Vol: {t.sell_volume} | "
                    f"OBI Ratio: {t.obi_ratio}\n"
                )
        else:
            market_profile += "   - No historical tracking ticks logged yet.\n"

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

from database import OrderBookHistory

import random
from datetime import datetime, timedelta
from database import OrderBookHistory, PriceHistory, SessionLocal

@app.get("/history/{symbol}")
async def get_symbol_history(symbol: str, timeframe: str = "1M"):
    """
    Retrieves historical order book ticks. If the database table is empty,
    it automatically generates clean historical baseline rows so the frontend chart 
    works immediately.
    """
    symbol_upper = symbol.upper()
    db = SessionLocal()
    
    # 1. Attempt to query real ticks from the time-series history table
    records = db.query(OrderBookHistory).filter(
        OrderBookHistory.symbol == symbol_upper
    ).order_by(OrderBookHistory.id.desc()).limit(24).all()
    
    # Check current cached last traded price for scale reference
    cached_record = db.query(PriceHistory).filter(PriceHistory.symbol == symbol_upper).first()
    db.close()
    
    base_price = float(cached_record.price) if (cached_record and cached_record.price > 0) else 2450.0
    if base_price == 0:
        base_price = 2450.0

    series_data = []

    # 2. FALLBACK: If table is empty, generate initial baseline data points immediately
    if not records:
        current_time = datetime.now()
        for i in range(24):
            timestamp = current_time - timedelta(seconds=i * 5)
            # Generate mild mock volume imbalances around equilibrium (1.0)
            simulated_obi = round(0.7 + (random.random() * 0.6), 2)
            simulated_price = round(base_price + (random.random() - 0.5) * 3, 2)
            
            series_data.append({
                "time": timestamp.strftime("%H:%M:%S"),
                "price": simulated_price,
                "buy_vol": float(random.randint(10000, 50000)),
                "sell_vol": float(random.randint(10000, 50000)),
                "obi_ratio": simulated_obi,
                "variation": "UP" if simulated_obi >= 1.0 else "DOWN"
            })
        series_data.reverse() # Sort in chronological order (left to right)
        return {
            "symbol": symbol_upper,
            "timeframe": timeframe,
            "series": series_data
        }

    # 3. REAL DATA: If real ticks exist, format them sequentially
    for r in reversed(records):
        series_data.append({
            "time": r.timestamp.strftime("%H:%M:%S"),
            "price": r.price,
            "buy_vol": r.buy_volume,
            "sell_vol": r.sell_volume,
            "obi_ratio": r.obi_ratio,
            "variation": "UP" if r.obi_ratio >= 1.0 else "DOWN"
        })
        
    return {
        "symbol": symbol_upper,
        "timeframe": timeframe,
        "series": series_data
    }

@app.get("/download-master")
async def download_scrip_master():
    """
    Exposes a clean dump of currently cached master scrip data elements 
    from the background client processor memory layer mapping.
    """
    try:
        # Request a broad script lookup match array directly from the client asset layer
        raw_scrip = market_processor.client.search_scrip(exchange_segment="nse_cm", symbol="RELIANCE")
        
        # If the client library uses an internal pandas DataFrame file, return the records directly
        if str(type(raw_scrip)) == "<class 'pandas.core.frame.DataFrame'>":
            return {
                "count": len(raw_scrip),
                "source": "DataFrame cache file",
                "scrips": raw_scrip.to_dict('records')[:1000] # Return the first 1,000 for visibility
            }
        
        return {
            "status": "Success",
            "message": "Scrip lookup engine active",
            "details": str(type(raw_scrip))
        }
    except Exception as e:
        return {"error": f"Failed compiling download dump: {e}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, ws="none")