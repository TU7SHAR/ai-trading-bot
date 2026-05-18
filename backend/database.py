from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import insert
import datetime
import os
from dotenv import load_dotenv

load_dotenv()
Base = declarative_base()

class PriceHistory(Base):
    __tablename__ = "market_data"
    symbol = Column(String, primary_key=True)
    price = Column(Float)
    sentiment = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# NEW: Historical time-series table to log real-time order depth
class OrderBookHistory(Base):
    __tablename__ = "order_book_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String, index=True)
    price = Column(Float)
    buy_volume = Column(Float)
    sell_volume = Column(Float)
    obi_ratio = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

engine = create_engine(os.getenv("DATABASE_URL"))
SessionLocal = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def upsert_market_data(symbol, price, sentiment=None):
    db = SessionLocal()
    try:
        stmt = insert(PriceHistory).values(
            symbol=symbol, price=price, sentiment=sentiment, timestamp=datetime.datetime.utcnow()
        )
        
        update_dict = {"price": price, "timestamp": datetime.datetime.utcnow()}
        if sentiment is not None:
            update_dict["sentiment"] = sentiment
            
        upsert_stmt = stmt.on_conflict_do_update(index_elements=['symbol'], set_=update_dict)
        db.execute(upsert_stmt)
        db.commit()
    finally:
        db.close()

# NEW: Helper function to append market microstructure snapshots
def save_order_book_tick(symbol, price, buy_volume, sell_volume, obi_ratio):
    db = SessionLocal()
    try:
        tick = OrderBookHistory(
            symbol=symbol,
            price=price,
            buy_volume=buy_volume,
            sell_volume=sell_volume,
            obi_ratio=obi_ratio,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(tick)
        db.commit()
    except Exception as e:
        print(f"Database error logging time-series tick: {e}")
    finally:
        db.close()