
from datetime import datetime

def preprocess_message(message):
    # Changing guid to event_id
    message['event_id'] = message['guid']
    del message['guid']
    
    message['modified'] = datetime.strptime(message['modified'], '%Y-%m-%dT%H:%M:%S%z').isoformat()
    message['publication_date_full'] = datetime.strptime(message['publication_date'], '%Y%m%d').isoformat()
    
    # Convert publication_date to YYYY-MM-DD format
    message['publication_date'] = message['publication_date_full'][:10]
    
    return message
