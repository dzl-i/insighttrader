import psycopg2
import os
import json
from datetime import datetime

DB_ENDPOINT = os.getenv('DB_ENDPOINT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')

def handler(event, context):
    if 'Records' not in event:
        event = json.loads(event['body'])

    records = event.get('Records', [])
    if len(records) == 0:
        return {
            'statusCode': 400,
            'body': json.dumps('No records found'),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
        }
    
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_ENDPOINT, port=DB_PORT)
    cursor = conn.cursor()
    
    for record in records:
        try:
            message = record['body']
            if isinstance(message, str):
                message = json.loads(message)
            
            if 'guid' not in message or 'headline' not in message or 'publication_date' not in message:
                continue

            modified_dt = datetime.fromisoformat(message['modified'])
            publication_date = datetime.strptime(message['publication_date'], "%Y%m%d").date()

            # Insert into articles table
            cursor.execute("""
                INSERT INTO articles (guid, headline, author, section, modified, publication_date, page_no, word_count, sentiment_polarity, sentiment_subjectivity, avg_sentence_length, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (guid) DO NOTHING;
                """, (
                    message['guid'],
                    message['headline'],
                    message.get('author', ''),
                    message.get('section', ''),
                    modified_dt,
                    publication_date,
                    message.get('page_no', ''),
                    message.get('word_count', 0),
                    message.get('sentiment_polarity', 0.0),
                    message.get('sentiment_subjectivity', 0.0),
                    message.get('avg_sentence_length', 0.0),
                    datetime.now(),
                )
            )

            # Handle classifications
            if 'classifications' in message:
                for classification in message['classifications']:
                    cursor.execute("INSERT INTO classifications (classification) VALUES (%s) ON CONFLICT (classification) DO NOTHING;", (classification,))
                    cursor.execute("SELECT id FROM classifications WHERE classification = %s;", (classification,))
                    classification_id = cursor.fetchone()[0]
                    cursor.execute("INSERT INTO article_classifications (article_guid, classification_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;", (message['guid'], classification_id))
            
            conn.commit()

            print("Processed record", message['guid'])

        except Exception as e:
            print(f"Error processing record: {str(e)}")
            conn.rollback()

    cursor.close()
    conn.close()

    return {
        'statusCode': 200,
        'body': json.dumps('Success'),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
    }

if __name__ == "__main__":
    print(handler({
        "Records": [
            {
                "body": json.dumps({
                    'guid': 'TESTTESTTEST',
                    'modified': '2018-01-28T06:31:31+11:00',
                    'publication_date': '20170131',
                    'section': 'News',
                    'page_no': '1',
                    'headline': 'Test headline',
                    'word_count': 100,
                    'sentiment_polarity': 0.5,
                    'sentiment_subjectivity': 0.5,
                    'avg_sentence_length': 10,
                    'text': 'Test text'
                })
            }
        ]
    }, None))
