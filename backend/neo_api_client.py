class NeoAPI:
    """Stub implementation for the Kotak Neo API client.

    Replace this stub with the actual SDK implementation or install the
    proper package that provides `neo_api_client`.
    """

    def __init__(self, consumer_key: str, environment: str):
        self.consumer_key = consumer_key
        self.environment = environment

    def totp_login(self, mobilenumber: str, ucc: str, totp: str):
        """Perform TOTP login for Kotak Neo.

        Replace this method with the actual login implementation.
        """
        raise NotImplementedError("neo_api_client NeoAPI.totp_login() is not implemented")

    def totp_validate(self, mpin: str):
        """Validate the TOTP login using the MPIN.

        Replace this method with the actual validation implementation.
        """
        raise NotImplementedError("neo_api_client NeoAPI.totp_validate() is not implemented")
