import boto3
import psycopg2
import os
import json
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from time import sleep
from psycopg2.extras import execute_values

DB_ENDPOINT = os.getenv('DB_ENDPOINT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')

def update_articles_in_db(articles):
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_ENDPOINT, port=DB_PORT)
    cursor = conn.cursor()
    
    try:
        count = 0
        for guid, article_info in articles.items():
            cursor.execute("""
                UPDATE articles SET 
                    sentiment_polarity = %s,
                    sentiment_subjectivity = %s,
                    avg_sentence_length = %s,
                    topic = %s
                WHERE guid = %s;
            """, (article_info['sentiment_polarity'], article_info['sentiment_subjectivity'], article_info['avg_sentence_length'], article_info['topic'], guid))
            
            if 'named_entities' in article_info:
                unique_entities = list(set(article_info['named_entities'][:14]))
                execute_values(cursor,
                            "INSERT INTO named_entities (entity) VALUES %s ON CONFLICT (entity) DO NOTHING;",
                            [(entity,) for entity in unique_entities])
                cursor.execute("SELECT id, entity FROM named_entities WHERE entity = ANY(%s);", (unique_entities,))
                entity_to_id = {entity: id for id, entity in cursor.fetchall()}
                article_entities = [(guid, entity_to_id[entity]) for entity in article_info['named_entities'][:14] if entity in entity_to_id]
                execute_values(cursor,
                            "INSERT INTO article_named_entities (article_guid, entity_id) VALUES %s ON CONFLICT DO NOTHING;",
                            article_entities)
            count += 1

            if count % 100 == 0:
                conn.commit()
                print(f"Processed {count}.")
                sleep(0.1)
        conn.commit()
        print("Successfully updated the database.")
    except Exception as e:
        print(f"Error updating database: {str(e)}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def handler(event, context):
    if 'articles' in event:
        update_articles_in_db(event['articles'])
