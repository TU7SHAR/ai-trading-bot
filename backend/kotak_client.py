import pyotp
try:
    from neo_api_client import NeoAPI
except ImportError:
    NeoAPI = None
from config import Config

def get_client():
    client = NeoAPI(
        consumer_key=Config.CONSUMER_KEY,
        environment='prod'
    )
    return client

def login_session(client):
    try:
        totp_secret = getattr(Config, 'TOTP_SECRET', None)
        if not totp_secret:
            print("Please add KOTAK_TOTP_SECRET to your .env file!")
            return False
            
        # Generate the current 6-digit TOTP automatically
        totp = pyotp.TOTP(totp_secret).now()
        print(f"[DEBUG] Generated live TOTP: {totp}")
        print(f"[DEBUG] Sending Mobile: {Config.MOBILE} | UCC: {Config.UCC}")
        
        # 1. Step 1 Login
        login_response = client.totp_login(
            mobile_number=Config.MOBILE,
            ucc=Config.UCC,
            totp=totp
        )
        print(f"[DEBUG] Raw TOTP Login Response: {login_response}")
        
        # 2. Step 2 Validation
        validation_response = client.totp_validate(mpin=Config.MPIN)
        print(f"[DEBUG] Raw MPIN Validation Response: {validation_response}")
        
        # Check if either response contains an error string or dictionary
        if isinstance(login_response, dict) and "error" in str(login_response).lower():
            return False
        if isinstance(validation_response, dict) and "error" in str(validation_response).lower():
            return False
            
        print("Successfully logged into Kotak Neo API!")
        return True
    except Exception as e:
        print(f"Login pipeline encountered a code error: {e}")
        return False