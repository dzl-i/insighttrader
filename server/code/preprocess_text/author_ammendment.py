import psycopg2
import os

DB_ENDPOINT = os.getenv('DB_ENDPOINT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')

def update_authors_in_db(authors):
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_ENDPOINT, port=DB_PORT)
    cursor = conn.cursor()

    batch_size = 1000
    authors_list = list(authors.items())
    
    try:
        for i in range(0, len(authors_list), batch_size):
            batch = authors_list[i:i + batch_size]
            for guid, author_info in batch:
                # if author_info['author'] == 'Perry Williams':
                cursor.execute("UPDATE articles SET author = %s WHERE guid = %s;", (author_info['author'], guid))
            conn.commit()
            print(f"Batch {i // batch_size + 1}")
    except Exception as e:
        print(f"Error updating database: {str(e)}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def handler(event, context):
    update_authors_in_db(event)
