import requests

def fetch_wiki_page(keyword):
    """
    Search for a Wikipedia page by keyword and return the page title.
    """
    print(f"Searching for Wikipedia page with keyword: {keyword}")
    search_url = "https://en.wikipedia.org/w/api.php"
    search_params = {
        "action": "query",
        "list": "search",
        "srsearch": keyword,
        "format": "json",
        "utf8": 1,
    }
    response = requests.get(search_url, params=search_params)
    data = response.json()
    
    search_results = data.get("query", {}).get("search", [])
    if not search_results:
        print(f"No Wikipedia results for keyword: {keyword}")
        return None
    # Return the title of the first search result
    page_title = search_results[0]["title"]
    print(f"Found page title: {page_title}")
    return page_title

def fetch_wiki_content(title):
    """
    Given a Wikipedia page title, fetch and return the content.
    If it's a disambiguation page with Animals section, fetch the first animal entry instead.
    """
    print(f"Fetching content for Wikipedia page title: {title}")
    page_url = "https://en.wikipedia.org/w/api.php"
    page_params = {
        "action": "query",
        "prop": "extracts",
        "explaintext": True,
        "titles": title,
        "format": "json",
        "utf8": 1,
    }
    
    response = requests.get(page_url, params=page_params)
    data = response.json()
    pages = data.get("query", {}).get("pages", {})
    page = next(iter(pages.values()))
    extract = page.get("extract", "")
    
    # Check if there's an Animals section
    if "== Animals ==" in extract:
        # Get the content right after == Animals ==
        animal_section = extract.split("== Animals ==")[1].split("==")[0].strip()
        # Get the first line and extract the animal name
        first_animal = animal_section.split('\n')[0].split(',')[0].strip()
        
        # Fetch the article for this animal
        return fetch_wiki_content(first_animal)
    
    # If no Animals section, return the content as is
    return extract
