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

def fetch_wikipedia_content(title):
    """
    Given a Wikipedia page title, fetch and return the plain text content.
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
    # There should only be one page in this dictionary
    page = next(iter(pages.values()))
    extract = page.get("extract", "")
    print(f"Content fetched for page title: {title}")
    return extract

if __name__ == "__main__":
    keyword = input("Enter a keyword to search on Wikipedia: ")
    page_title = fetch_wiki_page(keyword)
    if page_title:
        content = fetch_wikipedia_content(page_title)
        print(content)
    else:
        print("No page found.")
