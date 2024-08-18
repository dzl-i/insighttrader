from lxml import etree

parser = etree.XMLParser(ns_clean=True)

def process_articles(xml_str, process_function, dataset_id):
    """
    Parse XML string of AFR article data and run function on each one.

    Parameters:
    - xml_str: String representation of the AFR XML document.
    - process_function: A function that takes a dictionary representing an article.
    """
    xml = etree.fromstring(xml_str, parser=parser)

    # Iterate over each dossier in the XML
    for dossier in xml.xpath('//dcdossier'):
        guid = dossier.get('guid')
        modified = dossier.get('modified')

        for doc in dossier.xpath('.//document'):
            # Extract article information
            page_no = doc.xpath('string(.//PAGENO)').strip()
            try:
                page_no = int(page_no)
            except ValueError:
                page_no = 0
            
            article_data = {
                'guid': guid,
                'modified': modified,
                'publication_date': doc.xpath('string(.//PUBLICATIONDATE)').strip(),
                'section': doc.xpath('string(.//SECTION)').strip(),
                'page_no': page_no,
                'author': doc.xpath('string(.//BYLINE)').strip(),
                'classifications': doc.xpath('.//CLASSIFICATION/text()'),
                'headline': doc.xpath('string(.//HEADLINE)').strip(),
                'text': " ".join(doc.xpath('.//TEXT//text()')).strip(),
                'dataset_id': dataset_id,
            }
            
            # If any of the required fields are missing, skip this article
            if not article_data['publication_date'] or not article_data['headline'] or not article_data['text']:
                continue

            # Call the passed function for the current article
            process_function(article_data)
