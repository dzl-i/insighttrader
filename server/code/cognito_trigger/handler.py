def handler(event, context):
    # Confirm the user
    event["response"]["autoConfirmUser"] = True

    # Set the email as verified if it is in the request
    if "email" in event["request"]["userAttributes"]:
        event["response"]["autoVerifyEmail"] = True

    # Return to Amazon Cognito
    return event
