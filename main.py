from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from processor import market_processor
from config import Config
import uvicorn
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(market_processor.process_loop())
    await market_processor.add_request(Config.VIX_SYMBOL, priority=2)
    await market_processor.add_request("TATSILV", priority=2)
    await market_processor.add_request("SILVERBEES", priority=2)
    yield
    market_processor.is_running = False
    await task

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    from brain import fingpt
    sentiment = fingpt.get_sentiment(f"Latest market movement for {symbol}")
    decision = "BUY" if sentiment > 0.3 else "SELL" if sentiment < -0.3 else "HOLD"
    return {
        "symbol": symbol,
        "sentiment_score": sentiment,
        "recommendation": decision
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, ws="none")