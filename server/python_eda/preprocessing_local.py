import boto3
import json
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
from nltk.stem.wordnet import WordNetLemmatizer
from nltk import ne_chunk
import re
from textblob import TextBlob
from nltk.tree import Tree
from nltk.tag import pos_tag

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nltk.download('punkt')
nltk.download('wordnet')
nltk.download('stopwords')
nltk_stopwords = stopwords.words('english')


topic_words = { "Business and Economy": [
    "superannuation", "gst", "asic", "ato", "bas", "payg", "fringe", "stamp", "land", "duty",
    "mining", "agriculture", "tourism", "education", "finance", "construction", "manufacturing", "retail",
    "health", "services", "technology", "innovation", "startup", "export", "import", "trade",
    "investment", "equity", "currency", "dollar", "shares", "stock", "bond", "commodity",
    "market", "exchange", "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra",
    "hobart", "darwin", "rba", "interest", "rate", "loan", "mortgage", "banking",
    "insurance", "pension", "superfund", "dividend", "revenue", "profit", "loss", "budget",
    "deficit", "surplus", "inflation", "gdp", "economy", "fiscal", "monetary", "policy",
    "regulation", "deregulation", "tariff", "quota", "barrier", "agreement", "partnership", "competition",
    "monopoly", "oligopoly", "sme", "enterprise", "corporation", "subsidiary", "branch", "headquarters",
    "tax", "credit", "debit", "ledger", "accounting", "audit", "balance", "statement",
    "cashflow", "asset", "liability", "equity", "valuation", "merger", "acquisition", "ipo",
    "venture", "capital", "angel", "investor", "crowdfunding", "portfolio", "diversification", "risk",
    "return", "yield", "benchmark", "index", "compliance", "governance", "ethics", "sustainability",
    "responsibility", "innovation", "disruption", "automation", "blockchain", "cryptocurrency", "fintech", "ai",
    "big", "data", "cloud", "computing", "e-commerce", "digital", "marketing", "social",
    "media", "branding", "consumer", "demand", "supply", "price", "cost", "wage",
    "salary", "employment", "unemployment", "labour", "force", "union", "negotiation", "contract",
    "legislation", "policy", "reform", "subsidy", "grant", "incentive", "trade", "deal"
], 
    "Politics and Government" : [
    "parliament", "senate", "house", "representatives", "government", "opposition", "coalition", "labor",
    "liberal", "greens", "nationals", "democracy", "federal", "state", "local", "election",
    "vote", "ballot", "campaign", "policy", "legislation", "bill", "law", "act",
    "constitution", "referendum", "plebiscite", "budget", "tax", "spending", "defence", "health",
    "education", "welfare", "infrastructure", "transport", "energy", "environment", "trade", "foreign",
    "affairs", "immigration", "citizenship", "rights", "freedom", "justice", "court", "high",
    "judiciary", "legal", "mp", "senator", "minister", "prime", "premier", "mayor",
    "council", "electorate", "constituency", "debate", "discussion", "policy", "reform", "amendment",
    "motion", "question", "session", "sitting", "committee", "inquiry", "report", "findings",
    "recommendation", "implementation", "regulation", "compliance", "oversight", "audit", "expenditure", "revenue",
    "deficit", "surplus", "debt", "borrowing", "funding", "grant", "subsidy", "pension",
    "benefit", "allowance", "service", "program", "initiative", "project", "partnership", "agreement",
    "treaty", "diplomacy", "security", "defence", "military", "intelligence", "surveillance", "border",
    "control", "asylum", "refugee", "settlement", "integration", "multiculturalism", "diversity", "equity",
    "inclusion", "gender", "equality", "access", "participation", "engagement", "transparency", "accountability",
    "ethics", "integrity", "corruption", "scandal", "investigation", "prosecution", "conviction", "sentencing",
    "appeal", "pardon", "indigenous", "aboriginal", "torres", "strait", "islander", "land",
    "rights", "treaty", "reconciliation", "sovereignty", "self-determination", "culture", "heritage", "preservation",
    "conservation", "climate", "change", "sustainability", "renewable", "energy", "carbon", "emission",
    "reduction", "adaptation", "mitigation", "biodiversity", "ecosystem", "protection", "management", "policy",
    "strategy", "planning", "development", "growth", "innovation", "technology", "research", "education",
    "healthcare", "social", "welfare", "community", "service", "support", "assistance", "relief"
], 
    "Finance and Markets": [
    "superannuation", "asic", "rba", "asx", "aud", "shares", "bonds", "dividends", "interest", "loans",
    "mortgages", "insurance", "banks", "fintech", "cryptocurrency", "blockchain", "investments", "portfolio",
    "superfund", "pension", "annuity", "taxation", "gst", "capital", "gains", "losses", "deductions",
    "budget", "deficit", "surplus", "economy", "inflation", "deflation", "recession", "growth",
    "gdp", "trade", "balance", "exports", "imports", "tariffs", "quotas", "foreign",
    "exchange", "currency", "valuation", "risk", "management", "hedge", "fund", "equity",
    "market", "liquidity", "volatility", "speculation", "arbitrage", "leverage", "margin", "broker",
    "dealer", "trader", "analyst", "adviser", "consultant", "audit", "compliance", "regulation",
    "legislation", "ethics", "governance", "transparency", "accountability", "credit", "rating", "debt",
    "securities", "derivative", "option", "futures", "swap", "commodity", "metal", "gold",
    "silver", "coal", "iron", "ore", "agriculture", "wheat", "wool", "cattle",
    "dairy", "water", "resources", "sustainable", "investment", "ethical", "green", "bonds",
    "climate", "change", "carbon", "emissions", "renewable", "energy", "solar", "wind",
    "technology", "innovation", "startup", "venture", "capital", "private", "equity", "ipo",
    "merger", "acquisition", "takeover", "restructuring", "bankruptcy", "insolvency", "payout", "return",
    "yield", "diversification", "strategy", "planning", "forecasting", "analysis", "research", "report",
    "data", "statistics", "benchmark", "index", "fund", "management", "fee", "expense",
    "income", "wealth", "savings", "retirement", "estate", "planning", "trust", "beneficiary"
],  
    "Technology and Internet": [
    "nbn", "broadband", "telstra", "optus", "vodafone", "5g", "internet", "wifi", "cloud", "data",
    "security", "encryption", "privacy", "vpn", "ai", "machine", "learning", "robotics", "automation", "software",
    "hardware", "device", "mobile", "smartphone", "tablet", "laptop", "desktop", "server", "storage", "network",
    "infrastructure", "technology", "innovation", "startup", "entrepreneur", "venture", "capital", "funding", "research",
    "development", "digital", "transformation", "e-commerce", "online", "shopping", "payment", "gateway", "fintech",
    "cryptocurrency", "blockchain", "bitcoin", "ethereum", "cybersecurity", "hacking", "phishing", "malware", "ransomware",
    "firewall", "antivirus", "software", "development", "programming", "coding", "algorithm", "application", "app",
    "platform", "user", "interface", "experience", "design", "web", "website", "hosting", "domain", "social",
    "media", "facebook", "twitter", "instagram", "linkedin", "youtube", "google", "search", "engine", "optimization",
    "analytics", "data", "mining", "big", "technology", "trends", "virtual", "reality", "augmented", "reality",
    "iot", "internet", "things", "wearable", "technology", "health", "tech", "edtech", "legaltech", "agtech",
    "energy", "sustainability", "green", "tech", "cloud", "computing", "saas", "paas", "iaas", "subscription",
    "model", "scalability", "agile", "scrum", "devops", "cyber", "safety", "ethics", "regulation", "policy",
    "compliance", "gdpr", "accc", "afr", "ato", "asx", "asic", "innovation", "hub", "incubator", "accelerator"
],
    "Property and Real Estate" : [
    "property", "real", "estate", "housing", "market", "mortgage", "rent", "lease", "landlord", "tenant",
    "apartment", "house", "townhouse", "villa", "unit", "estate", "agent", "broker", "auction", "sale",
    "purchase", "offer", "bid", "contract", "settlement", "conveyancing", "title", "deed", "stamp", "duty",
    "valuation", "appraisal", "inspection", "renovation", "development", "planning", "zoning", "council", "permit",
    "construction", "building", "architecture", "design", "landscape", "garden", "pool", "garage", "driveway",
    "fence", "security", "alarm", "cctv", "energy", "efficiency", "solar", "panels", "water", "tank",
    "heating", "cooling", "air", "conditioning", "insulation", "location", "suburb", "city", "rural", "coastal",
    "investment", "portfolio", "yield", "return", "capital", "gain", "loss", "equity", "leverage", "finance",
    "bank", "lender", "interest", "rate", "fixed", "variable", "deposit", "downpayment", "savings", "budget",
    "insurance", "policy", "claim", "coverage", "risk", "survey", "report", "maintenance", "repair", "upgrade",
    "fixture", "fitting", "furniture", "decor", "style", "trend", "market", "analysis", "forecast", "trend",
    "bubble", "crash", "boom", "slump", "recovery", "affordability", "accessibility", "first", "home", "buyer",
    "incentive", "scheme", "grant", "stamp", "duty", "concession", "negative", "gearing", "capital", "works",
    "depreciation", "tax", "break", "benefit", "exemption", "reit", "trust", "portfolio", "diversification"
],
    "Employment and Workforce": [
    "employment", "workforce", "job", "career", "occupation", "profession", "industry", "sector", "company", "business",
    "organisation", "employer", "employee", "workplace", "office", "factory", "site", "shift", "hour", "wage",
    "salary", "income", "pay", "remuneration", "benefit", "bonus", "overtime", "leave", "holiday", "vacation",
    "sick", "maternity", "paternity", "flexible", "part-time", "full-time", "casual", "contract", "temporary", "permanent",
    "union", "negotiation", "agreement", "contract", "dispute", "strike", "lockout", "mediation", "arbitration", "award",
    "commission", "fair", "work", "standards", "rights", "entitlement", "dismissal", "redundancy", "termination", "resignation",
    "recruitment", "hiring", "application", "interview", "cv", "resume", "cover", "letter", "reference", "background",
    "check", "skill", "qualification", "experience", "training", "development", "promotion", "advancement", "career", "path",
    "succession", "planning", "mentorship", "coaching", "performance", "review", "feedback", "goal", "objective", "assessment",
    "diversity", "inclusion", "equality", "equity", "culture", "engagement", "wellbeing", "safety", "health", "work-life",
    "balance", "telework", "remote", "work", "home", "office", "commute", "mobility", "relocation", "expatriate",
    "immigration", "visa", "skill", "shortage", "talent", "acquisition", "retention", "turnover", "attrition", "layoff",
    "outsourcing", "offshoring", "gig", "economy", "freelance", "contractor", "self-employed", "entrepreneur", "startup", "innovation"
], 
    "Energy and Resources": [
    "coal", "iron", "ore", "gold", "copper", "bauxite", "uranium", "nickel", "gas", "natural",
    "petroleum", "oil", "shale", "renewable", "solar", "wind", "hydro", "geothermal", "biomass", "biofuel",
    "energy", "power", "electricity", "generation", "transmission", "distribution", "grid", "storage", "battery", "tesla",
    "efficiency", "sustainability", "carbon", "emission", "reduction", "climate", "change", "environment", "conservation", "water",
    "management", "waste", "recycling", "policy", "regulation", "legislation", "subsidy", "tariff", "incentive", "investment",
    "project", "development", "exploration", "extraction", "mining", "drilling", "fracking", "export", "import", "market",
    "price", "demand", "supply", "trade", "agreement", "partnership", "technology", "innovation", "research", "development",
    "solar", "panel", "turbine", "farm", "hydroelectric", "dam", "nuclear", "fission", "fusion", "reactor",
    "ethanol", "biodiesel", "liquefied", "compressed", "natural", "gas", "lng", "cng", "pipeline", "infrastructure",
    "network", "capacity", "peak", "off-peak", "baseload", "dispatchable", "intermittent", "reliability", "security", "vulnerability",
    "resilience", "adaptation", "mitigation", "audit", "assessment", "benchmark", "certification", "standard", "rating", "label",
    "footprint", "offset", "sequestration", "capture", "storage", "leakage", "vent", "flare", "rehabilitation", "remediation",
    "safeguard", "protection", "conservation", "stewardship", "custodian", "heritage", "landscape", "biodiversity", "ecosystem", "habitat"
], 
    "Media and Entertainment": [
    "television", "radio", "newspaper", "magazine", "journalism", "broadcast", "streaming", "podcast", "film", "cinema",
    "documentary", "series", "drama", "comedy", "reality", "news", "sport", "music", "concert", "festival",
    "theatre", "play", "performance", "art", "exhibition", "gallery", "book", "novel", "literature", "poetry",
    "dance", "ballet", "opera", "symphony", "orchestra", "band", "singer", "musician", "composer", "dj",
    "video", "game", "gaming", "esports", "virtual", "reality", "animation", "graphic", "design", "photography",
    "cinematography", "production", "editing", "soundtrack", "score", "album", "track", "stream", "download", "platform",
    "social", "media", "facebook", "twitter", "instagram", "youtube", "tiktok", "snapchat", "linkedin", "blog",
    "vlog", "influencer", "content", "creator", "advertisement", "marketing", "promotion", "campaign", "branding", "sponsorship",
    "audience", "viewer", "listener", "reader", "subscriber", "rating", "review", "critic", "award", "nomination",
    "fame", "celebrity", "star", "talent", "agent", "manager", "producer", "director", "screenwriter", "actor",
    "actress", "host", "presenter", "reporter", "anchor", "journalist", "editor", "publisher", "copyright", "license",
    "royalty", "streaming", "service", "app", "website", "channel", "network", "satellite", "cable", "digital",
    "analog", "hd", "4k", "vr", "ar", "ai", "tech", "innovation", "trend", "future", "culture", "entertainment",
    "leisure", "hobby", "interest", "passion", "creativity", "inspiration", "imagination", "story", "narrative", "character"
], 
    "Law and Crime": [
    "law", "crime", "justice", "court", "trial", "judge", "jury", "defendant", "plaintiff", "prosecution",
    "defense", "verdict", "sentence", "appeal", "bail", "custody", "prison", "parole", "lawyer", "solicitor",
    "barrister", "attorney", "legal", "litigation", "suit", "case", "evidence", "testimony", "witness", "allegation",
    "charge", "conviction", "acquittal", "punishment", "fine", "community", "service", "rehabilitation", "crime", "rate",
    "theft", "robbery", "burglary", "assault", "fraud", "embezzlement", "corruption", "bribery", "money", "laundering",
    "drug", "trafficking", "homicide", "manslaughter", "kidnapping", "arson", "vandalism", "trespass", "cybercrime", "phishing",
    "hacking", "identity", "theft", "piracy", "stalking", "harassment", "assault", "battery", "domestic", "violence",
    "sexual", "assault", "rape", "child", "abuse", "neglect", "smuggling", "terrorism", "extortion", "blackmail",
    "illegal", "gambling", "prostitution", "human", "trafficking", "counterfeiting", "forgery", "perjury", "obstruction", "justice",
    "conspiracy", "manslaughter", "negligence", "malpractice", "infringement", "libel", "slander", "defamation", "privacy", "breach",
    "discrimination", "rights", "freedom", "constitution", "legislation", "regulation", "ordinance", "statute", "code", "act",
    "amendment", "policy", "procedure", "enforcement", "agency", "police", "detective", "officer", "sheriff", "marshal",
    "federal", "state", "local", "government", "authority", "jurisdiction", "sovereignty", "treaty", "agreement", "convention"
],
    "Education and Research": [
    "education", "research", "university", "college", "school", "academy", "institute", "scholarship", "tuition", "course",
    "curriculum", "program", "degree", "diploma", "certificate", "graduate", "undergraduate", "postgraduate", "phd", "doctorate",
    "faculty", "professor", "lecturer", "teacher", "student", "pupil", "enrollment", "learning", "study", "homework",
    "assignment", "thesis", "dissertation", "textbook", "library", "laboratory", "experiment", "science", "mathematics", "engineering",
    "technology", "humanities", "arts", "social", "sciences", "business", "law", "medicine", "nursing", "pharmacy",
    "biology", "chemistry", "physics", "geology", "psychology", "history", "geography", "language", "literature", "philosophy",
    "education", "policy", "reform", "accreditation", "assessment", "evaluation", "qualification", "standard", "achievement", "performance",
    "literacy", "numeracy", "skill", "competency", "training", "development", "workshop", "seminar", "conference", "symposium",
    "grant", "funding", "sponsorship", "endowment", "publication", "journal", "article", "paper", "findings", "results",
    "data", "analysis", "methodology", "ethics", "peer", "review", "collaboration", "partnership", "innovation", "breakthrough",
    "technology", "transfer", "patent", "copyright", "intellectual", "property", "discovery", "invention", "experimentation", "exploration",
    "fieldwork", "survey", "questionnaire", "interview", "case", "study", "research", "project", "thesis", "dissertation",
    "academia", "scholar", "scientist", "researcher", "fellow", "postdoc", "lectureship", "tenure", "curriculum", "pedagogy",
    "elearning", "online", "distance", "education", "mooc", "tutorial", "webinar", "virtual", "classroom", "platform"
], 
    "Healthcare and Pharmaceuticals": [
    "healthcare", "pharmaceuticals", "medicine", "hospital", "clinic", "surgery", "doctor", "nurse", "pharmacist", "dentist",
    "psychiatrist", "therapist", "patient", "treatment", "prescription", "drug", "medication", "vaccine", "therapy", "diagnosis",
    "illness", "disease", "condition", "symptom", "recovery", "rehabilitation", "surgical", "procedure", "operation", "emergency",
    "ambulance", "paramedic", "care", "support", "health", "wellness", "nutrition", "diet", "exercise", "fitness",
    "mental", "wellbeing", "counseling", "psychology", "research", "trial", "study", "laboratory", "innovation", "development",
    "biotechnology", "genetics", "genomics", "immunology", "oncology", "cardiology", "neurology", "pediatrics", "geriatrics", "endocrinology",
    "radiology", "imaging", "ultrasound", "mri", "ct", "scan", "vaccination", "immunization", "health", "insurance", "medicare",
    "bulk", "billing", "pharmacy", "dispensary", "formulary", "generic", "brand", "patent", "regulation", "compliance",
    "safety", "quality", "efficacy", "side", "effect", "adverse", "reaction", "contraindication", "dosage", "administration",
    "oral", "topical", "injectable", "infusion", "screening", "prevention", "public", "health", "epidemic", "pandemic",
    "outbreak", "contagion", "quarantine", "isolation", "hygiene", "sanitation", "virus", "bacteria", "infection", "antibiotic",
    "resistance", "immunity", "pathogen", "vector", "transmission", "vulnerability", "risk", "assessment", "management", "policy",
    "legislation", "ethics", "consent", "privacy", "data", "record", "electronic", "health", "record", "ehealth",
    "telehealth", "telemedicine", "digital", "health", "app", "platform", "wearable", "device", "monitoring", "intervention"
],
    "Infrastructure and Transport": [
    "infrastructure", "transport", "road", "highway", "freeway", "bridge", "tunnel", "rail", "train", "tram",
    "metro", "bus", "bicycle", "pathway", "pedestrian", "crossing", "airport", "runway", "hangar", "terminal",
    "port", "harbour", "dock", "wharf", "shipping", "cargo", "freight", "logistics", "distribution", "supply",
    "chain", "vehicle", "car", "truck", "van", "motorcycle", "scooter", "bike", "electric", "hybrid",
    "fuel", "diesel", "petrol", "charging", "station", "parking", "lot", "garage", "toll", "ticket",
    "fare", "pass", "card", "navigation", "gps", "traffic", "congestion", "signal", "sign", "lane",
    "roundabout", "intersection", "bypass", "public", "private", "commute", "journey", "trip", "route", "map",
    "engineering", "construction", "maintenance", "repair", "upgrade", "expansion", "investment", "project", "planning", "design",
    "safety", "security", "emergency", "service", "rescue", "evacuation", "accessibility", "mobility", "innovation", "technology",
    "sustainability", "environment", "emission", "pollution", "clean", "green", "renewable", "energy", "efficiency", "conservation",
    "policy", "regulation", "legislation", "authority", "agency", "department", "funding", "grant", "subsidy", "partnership",
    "network", "system", "capacity", "demand", "supply", "user", "customer", "passenger", "operator", "provider"
],
    "Environment and Sustainability": [
    "environment", "sustainability", "conservation", "biodiversity", "ecology", "nature", "wildlife", "habitat", "forest", "bushland",
    "reef", "ocean", "water", "river", "lake", "wetland", "coast", "beach", "desert", "outback",
    "climate", "change", "global", "warming", "carbon", "emission", "greenhouse", "gas", "renewable", "energy",
    "solar", "wind", "hydro", "geothermal", "bioenergy", "recycling", "waste", "management", "pollution", "air",
    "water", "soil", "landfill", "conservation", "area", "national", "park", "protected", "area", "reserve",
    "flora", "fauna", "endangered", "species", "invasive", "species", "pest", "control", "ecosystem", "restoration",
    "reforestation", "afforestation", "deforestation", "land", "management", "agriculture", "permaculture", "organic", "farming", "sustainable",
    "development", "urban", "planning", "green", "space", "building", "design", "efficiency", "water", "saving", "energy",
    "saving", "transport", "cycling", "walking", "public", "transport", "electric", "vehicle", "carbon", "footprint", "offset",
    "green", "technology", "innovation", "research", "education", "awareness", "community", "engagement", "policy", "regulation",
    "legislation", "funding", "investment", "grant", "subsidy", "partnership", "volunteer", "campaign", "advocacy", "movement",
    "clean", "air", "clean", "water", "marine", "conservation", "coral", "reef", "protection", "sustainable", "fishing",
    "aquaculture", "marine", "park", "ocean", "clean", "up", "plastic", "reduction", "reuse", "reduce", "recycle",
    "environmental", "justice", "equity", "indigenous", "rights", "land", "rights", "cultural", "heritage", "traditional", "knowledge"
],
    "Society and Culture": [
    "society", "culture", "community", "heritage", "tradition", "language", "aboriginal", "torres", "strait", "islander",
    "multicultural", "immigration", "diversity", "equality", "inclusion", "reconciliation", "respect", "celebration", "art", "music",
    "dance", "theatre", "literature", "poetry", "storytelling", "film", "cinema", "photography", "painting", "sculpture",
    "gallery", "museum", "festival", "ceremony", "ritual", "custom", "belief", "religion", "spirituality", "ancestry",
    "history", "colonial", "settlement", "exploration", "convict", "migration", "citizenship", "nationality", "identity", "democracy",
    "government", "law", "justice", "freedom", "rights", "welfare", "health", "education", "employment", "economy",
    "environment", "conservation", "sustainability", "urban", "rural", "regional", "coastal", "outback", "landscape", "wildlife",
    "flora", "fauna", "climate", "weather", "beach", "ocean", "reef", "bush", "desert", "mountain",
    "river", "lake", "sport", "recreation", "leisure", "hobby", "volunteer", "charity", "nonprofit", "activism",
    "advocacy", "campaign", "movement", "equality", "justice", "accessibility", "mobility", "technology", "innovation", "research",
    "development", "globalization", "trade", "international", "relations", "peace", "security", "humanitarian", "aid", "cooperation",
    "exchange", "dialogue", "understanding", "partnership", "collaboration", "network", "community", "engagement", "participation", "involvement",
    "contribution", "impact", "change", "progress", "future", "legacy", "memory", "commemoration", "monument", "landmark"
],
    "International Relations and Trade": [
    "international", "relations", "trade", "diplomacy", "treaty", "agreement", "partnership", "alliance", "negotiation", "dialogue",
    "cooperation", "conflict", "resolution", "peace", "security", "defense", "military", "strategy", "policy", "foreign",
    "affairs", "embassy", "consulate", "ambassador", "diplomat", "summit", "conference", "forum", "union", "organization",
    "commission", "delegation", "sanction", "embargo", "tariff", "quota", "trade", "barrier", "export", "import",
    "commodity", "goods", "service", "market", "economy", "investment", "finance", "currency", "exchange", "rate",
    "inflation", "deficit", "surplus", "balance", "payment", "development", "aid", "grant", "loan", "funding",
    "assistance", "humanitarian", "relief", "project", "program", "initiative", "sustainability", "environment", "climate", "change",
    "energy", "resource", "conservation", "biodiversity", "pandemic", "health", "education", "culture", "technology", "innovation",
    "research", "collaboration", "intellectual", "property", "patent", "copyright", "standard", "regulation", "compliance", "ethics",
    "globalization", "multilateral", "bilateral", "regional", "asia", "pacific", "asean", "apec", "g20", "un",
    "nato", "who", "wto", "imf", "world", "bank", "oecd", "unesco", "climate", "accord",
    "kyoto", "paris", "agreement", "migration", "refugee", "visa", "citizenship", "expatriate", "multiculturalism", "diversity"
]
}



def assign_topic(text, topic_keywords):
    if not text.strip():
        return "Unknown"
    
    vectorizer = TfidfVectorizer()
    
    text_vector = vectorizer.fit_transform([text])
    
    topic_vectors = vectorizer.transform([' '.join(keywords) for keywords in topic_keywords.values()])
    similarity_scores = cosine_similarity(text_vector, topic_vectors)
    
    best_topic_index = similarity_scores.argmax()
    
    best_topic = list(topic_keywords.keys())[best_topic_index]
    return best_topic


def clean_and_prepare_text(input_text, pattern=r'[^\w\s]', to_lowercase=True, filter_stopwords=True, stemming=True):
    cleaned_text = re.sub(pattern, '', input_text)
    if to_lowercase:
        cleaned_text = cleaned_text.lower()
    tokenized_text = word_tokenize(cleaned_text)
    if filter_stopwords:
        tokenized_text = [word for word in tokenized_text if word not in nltk_stopwords]
    if stemming:
        processor = PorterStemmer()
    else:
        processor = WordNetLemmatizer()
    processed_text = [processor.stem(word) if stemming else processor.lemmatize(word) for word in tokenized_text]
    return ' '.join(processed_text)

def adage_to_df(json_data):
    adage_data = json.loads(json_data)

    events = adage_data["events"]
    data = []

    for event in events:
        guid = event["attribute"]["guid"]
        modified = pd.Timestamp.now().isoformat()
        section = event["attribute"]["section"]
        publication_date = pd.to_datetime(event["attribute"]["publication_date"])
        page_no = event["attribute"]["page_no"]
        classifications = event["attribute"]["classifications"]
        headline = event["attribute"]["headline"]
        text = event["attribute"]["text"]

        data.append({
            'guid': guid,
            'modified': modified,
            'section': section,
            'publication_date': publication_date,
            'page_no': page_no,
            # 'byline': byline,
            'classifications': classifications,
            'headline': headline,
            'text': text
        })
    df = pd.DataFrame(data)

    return df


def sentiment(text):
    blob = TextBlob(text)
    return blob.sentiment.polarity, blob.sentiment.subjectivity

def named_entity_recognition(tagged_tokens):
    tree = ne_chunk(tagged_tokens)
    return tree

def get_continuous_chunks(text, chunk_func=named_entity_recognition):
    chunked = chunk_func(pos_tag(word_tokenize(text)))
    continuous_chunk = []
    current_chunk = []

    for i in chunked:
        if type(i) == Tree:
            current_chunk.append(" ".join([token for token, pos in i.leaves()]))
        else:
            if current_chunk:
                named_entity = " ".join(current_chunk)
                if named_entity not in continuous_chunk:
                    continuous_chunk.append(named_entity)
                current_chunk = []

    if current_chunk:
        named_entity = " ".join(current_chunk)
        if named_entity not in continuous_chunk:
            continuous_chunk.append(named_entity)
    return continuous_chunk

def sentence_lngth(text):
    sentences = nltk.sent_tokenize(text)
    if len(sentences) == 0:
        return 0
    return sum(len(nltk.word_tokenize(sentence)) for sentence in sentences) / len(sentences)

def df_to_adage(df, s3):
    # df = df.head(1)
    adage_data_model_new = {
        "data_source": "Australian Financial Review",
        "dataset_type": "News_Articles",
        "dataset_id": "AFR",
        "time_object": {
            "timestamp": pd.Timestamp.now().isoformat(),
            "timezone": "GMT+11"
        },
        "events": []
    }
    for _, row in df.iterrows():
        try:
            publication_date = ""
            if not pd.isna(row["publication_date"]):
                publication_date = row["publication_date"].strftime("%Y-%m-%d")
            

            event = {
                "time_object": {
                    "timestamp": publication_date,
                    "duration": 0,
                    "duration_unit": "second",
                    "timezone": "GMT+11"
                },
                "event_type": "article",
                "attribute": {
                    "guid": row["guid"],
                    "headline": row["headline"],
                    "section": row["section"],
                    "modified": row["modified"],
                    "publication_date": publication_date,
                    "page_no": row["page_no"],
                    "classifications": row["classifications"],
                    "text": row.get("text"),
                    "pre_processed_text": row.get("pre_processed_text"),
                    "word_count" : row.get("word_count"),
                    "sentiment_polarity": row.get("sent_polarity"),
                    "sentiment_subjectivity": row.get("sent_subjectivity"), 
                    "avg_sentence_length": row.get("avg_sentence_length"),
                    "named_entities": row.get("named_entities"),
                    "topic": row.get("topic")
                }
            }
            # s3.put_object(Bucket="seng3011-student", Key=f"SE3011-24-F11A-02/test_preprocessed/afr/{row["guid"]}.json", Body=event)
            # print(event)
            adage_data_model_new["events"].append(event)
        except Exception as e:
            print(f"Error: {e}")
        

    adage_data_model_new["time_object"]["timestamp"] = df["modified"].max().isoformat()

    return json.dumps(adage_data_model_new,default=str, indent=2)


def handler(event, context):
    try:
        s3 = boto3.client(
            "s3",
            aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
            aws_secret_access_key="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"
        )

        body = event["queryStringParameters"]

        dataset_id = body["dataset_id"]
        start_year = int(body.get("start_year", "0"))
        end_year = int(body.get("end_year", "9999"))
        yr = None
        if (start_year == end_year):
            yr = start_year
        else:
            yr = 2015
        path = f"SE3011-24-F11A-02/processed_data_large/{dataset_id}"
        jsons = s3.list_objects_v2(Bucket="seng3011-student", Prefix=path).get("Contents", [])
        print(jsons)
        for file in jsons[1:]:
            file_name = file['Key']
            print(file_name)
            year = file_name.split("/")[-1].split(".")[0][:4]
            print(year)
            print("da", year)
            if int(year) not in [2015,2016, 2017, 2018, 2019, 2020, 2021, 2022]:
                print(f"processing: {year}")
                continue
            
            adage_data_model = s3.get_object(Bucket="seng3011-student", Key=file['Key'])['Body'].read().decode('utf-8')
            df = adage_to_df(adage_data_model)
            df['modified'] = pd.to_datetime(df['modified'])
            print("modified")
            df['publication_date'] = pd.to_datetime(df['publication_date'], errors='coerce')
            preprocess_settings = (r'[^\w\s]', False, True, False)
            pattern, lower, stopword_removal, stem = preprocess_settings
            preprocess_fn = lambda x: clean_and_prepare_text(x, pattern, lower, stopword_removal, stem)
            df['pre_processed_text'] = df['text'].apply(preprocess_fn)
            print("pre_processed")
            df['word_count'] = df['text'].apply(lambda x: len(str(x).split()))
            df[['sent_polarity', 'sent_subjectivity']] = df['text'].apply(lambda x: pd.Series(sentiment(x)))
            df['avg_sentence_length'] = df['text'].apply(sentence_lngth)
            print("pre named")
            df['named_entities'] = df['pre_processed_text'].apply(get_continuous_chunks)  
            print("named_entities")
            df['topic'] = df['pre_processed_text'].apply(lambda x: assign_topic(x, topic_words))
            print("topic done")
            adage_data_modell = df_to_adage(df, s3)
            l = f"SE3011-24-F11A-02/test_preprocessed/afr/{year}.json"
            print(f"saving {year} to {l}")
            # print(adage_data_modell)
            # print(adage_data_modell)
            s3.put_object(Bucket="seng3011-student", Key=f"SE3011-24-F11A-02/test_preprocessed/afr/{year}.json", Body=adage_data_modell)


        return {
            "statusCode": 200,
            "body": '{"status":"Success"}',
            "headers": {
                "Content-Type": "application/json",
            },
        }
        
    except Exception as e:
        msg = f"error occured while preprocessing data: {str(e)}"
        return {
            "statusCode": 500,
            "body": json.dumps({"status": "Error", "message": msg}),
            "headers": {
                "Content-Type": "application/json",
            },
        }
        

if __name__ == "__main__":
    event = {"queryStringParameters": {
        "dataset_id": "afr",
        "start_year": "2015",
        "end_year": "2015"
    }}
    context = {}
    result = handler(event, context)
    # s3 = boto3.client(
    #     "s3",
    #     aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
    #     aws_secret_access_key="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"
    # )

    # jsons = s3.list_objects_v2(Bucket="seng3011-student", Prefix="SE3011-24-F11A-02/processed_data/afr")['Contents']
    # for file in jsons:
    #     file_name = file['Key']
    #     year = file_name.split("/")[-1].split(".")[0][:4]
    #     if year not in ["2015"]:
    #         continue
    #     adage_data_model = s3.get_object(Bucket="seng3011-student", Key=file['Key'])['Body'].read().decode('utf-8')
    #     df = adage_to_df(adage_data_model)
    #     df['modified'] = pd.to_datetime(df['modified'])
    #     df['publication_date'] = pd.to_datetime(df['publication_date'], errors='coerce')
    #     preprocess_settings = (r'[^\w\s]', False, True, False)
    #     pattern, lower, stopword_removal, stem = preprocess_settings
    #     preprocess_fn = lambda x: clean_and_prepare_text(x, pattern, lower, stopword_removal, stem)
    #     df['pre_processed_text'] = df['text'].apply(preprocess_fn)
    #     df['word_count'] = df['text'].apply(lambda x: len(str(x).split()))
    #     df[['sent_polarity', 'sent_subjectivity']] = df['text'].apply(lambda x: pd.Series(sentiment(x)))
    #     df['avg_sentence_length'] = df['text'].apply(sentence_lngth)
    #     adage_data_modelw = append_to_adage(adage_data_model, df)
        
    #     print(adage_data_modelw)
        # s3 = boto3.client(
        #     "s3",
        #     aws_access_key_id="AKIAVRUVQGYFWWABVYBW",
        #     aws_secret_access_key="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"
        # )