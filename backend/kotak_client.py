from neo_api_client import NeoAPI
from config import Config

def get_client():
    client = NeoAPI(
        consumer_key=Config.CONSUMER_KEY,
        environment='prod'
    )
    return client

def login_session(client, totp):
    try:
        # V2 Updated Login Method
        client.totp_login(
            mobilenumber=Config.MOBILE,
            ucc=Config.UCC,
            totp=totp
        )
        # V2 Updated Validation Method
        client.totp_validate(mpin=Config.MPIN)
        return True
    except Exception as e:
        print(f"Login failed: {e}")
        return False