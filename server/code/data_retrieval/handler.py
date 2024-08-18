import json
import psycopg2
import os
from datetime import datetime
from psycopg2.extras import RealDictCursor
from helpers import convert_to_adage_event, construct_adage_json

DB_ENDPOINT = os.getenv('DB_ENDPOINT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')

def handler(event, context):
    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_ENDPOINT, port=DB_PORT)
        cursor = conn.cursor(cursor_factory=RealDictCursor)  # Use RealDictCursor to get column names

        query_params = event.get("queryStringParameters", {})
        start_date = query_params.get("start_date", "2000-01-01")
        end_date = query_params.get("end_date", "2023-12-31")
        sort = query_params.get("sort", "publication_date")
        order = query_params.get("order", "asc").lower()
        page = int(query_params.get("page", 1))
        pageSize = int(query_params.get("page_size", 50))
        
        if page < 1:
            page = 1

        if pageSize < 1:
            pageSize = 1
            
        if pageSize > 100:
            pageSize = 100
        
        if start_date > end_date:
            start_date, end_date = end_date, start_date

        allowed_sort_fields = ["publication_date", "modified", "headline", "page_no", "section"]
        if sort not in allowed_sort_fields:
            sort = "publication_date"

        if order not in ['asc', 'desc']:
            order = 'asc'

        # Base query for counting total records
        count_query = """
        SELECT COUNT(DISTINCT a.guid) AS total
        FROM articles a
        WHERE a.publication_date BETWEEN %s AND %s
        """
        count_params = [start_date, end_date]

        # Base query for fetching records
        base_query = """
        SELECT a.guid, a.headline, a.author, a.section, a.publication_date,
               a.page_no, a.word_count, a.sentiment_polarity, a.sentiment_subjectivity,
               a.avg_sentence_length,
               string_agg(DISTINCT c.classification, ',') AS classifications,
               string_agg(DISTINCT e.entity, ',') AS named_entities
        FROM articles a
        LEFT JOIN article_classifications ac ON a.guid = ac.article_guid
        LEFT JOIN classifications c ON ac.classification_id = c.id
        LEFT JOIN article_named_entities ae ON a.guid = ae.article_guid
        LEFT JOIN named_entities e ON ae.entity_id = e.id
        WHERE a.publication_date BETWEEN %s AND %s
        """
        fetch_params = [start_date, end_date]

        # Apply filters to both count and fetch queries
        filters = ""
        if 'author' in query_params:
            filters += " AND a.author ILIKE %s"
            count_params.append(f"%{query_params['author']}%")
            fetch_params.append(f"%{query_params['author']}%")
        if 'headline' in query_params:
            filters += " AND a.headline ILIKE %s"
            count_params.append(f"%{query_params['headline']}%")
            fetch_params.append(f"%{query_params['headline']}%")
        if 'section' in query_params:
            filters += " AND a.section ILIKE %s"
            count_params.append(query_params['section'])
            fetch_params.append(query_params['section'])
        if 'page_no' in query_params:
            filters += " AND a.page_no = %s"
            count_params.append(query_params['page_no'])
            fetch_params.append(query_params['page_no'])
        if 'guid' in query_params:
            filters += " AND a.guid = %s"
            count_params.append(query_params['guid'])
            fetch_params.append(query_params['guid'])
            
        count_query += filters
        cursor.execute(count_query, count_params)
        total_records = cursor.fetchone()['total']
        total_pages = (total_records + pageSize - 1) // pageSize  # Total pages

        fetch_query = base_query + filters + " GROUP BY a.guid" + f" ORDER BY a.{sort} {order}"
        fetch_query += " LIMIT %s OFFSET %s"
        fetch_params.extend([pageSize, (page - 1) * pageSize])
        
        cursor.execute(fetch_query, fetch_params)
        items = cursor.fetchall()
    
        adage_items = [convert_to_adage_event(item) for item in items]
        adage_json = construct_adage_json(adage_items)

        cursor.close()
        conn.close()
    
        return {
            "statusCode": 200,
            "body": json.dumps({"dataset": adage_json, "total_events": total_records, "total_pages": total_pages, "events_in_page": len(items), "current_page": page}, indent=2),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e)),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }
        }
