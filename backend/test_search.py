from kotak_client import get_client, login_session

def run_test():
    client = get_client()
    print("Logging in...")
    if not login_session(client):
        print("Login failed!")
        return

    print("\n--- SEARCHING FOR 'VIX' ---")
    vix_result = client.search_scrip(exchange_segment="nse_cm", symbol="VIX")
    print(vix_result)

    print("\n--- SEARCHING FOR 'SILVER' ---")
    silver_result = client.search_scrip(exchange_segment="nse_cm", symbol="SILVER")
    print(silver_result)

if __name__ == "__main__":
    run_test()