import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import unquote, quote

def fetch_wiki_page(keyword):
    """
    Searches Google for keyword + 'wikipedia' and fetches the first Wikipedia page found.
    Forces English results by using Google's language and region parameters.
    """
    try:
        # Construct Google search URL with English language parameters
        search_query = quote(f"{keyword} wikipedia")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        # Add parameters to force English results
        google_url = (
            f"https://www.google.com/search"
            f"?q={search_query}"
            f"&hl=en"           # Interface language
            f"&lr=lang_en"      # Search language
            f"&gl=us"           # Geographic location
            f"&cr=countryUS"    # Country restrict
        )
        
        # Make Google search request
        response = requests.get(google_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all links in the search results
        search_results = soup.find_all('a')
        wiki_url = None
        
        # Look for the first English Wikipedia link
        for link in search_results:
            url = link.get('href', '')
            if 'wikipedia.org/wiki/' in str(url) and 'en.wikipedia.org' in str(url):
                wiki_url = re.search(r'https://[^&]*wikipedia\.org/wiki/[^&]+', url)
                if wiki_url:
                    wiki_url = wiki_url.group(0)
                    break
        
        if not wiki_url:
            return {'error': f'No Wikipedia page found for "{keyword}"'}

        # Fetch the Wikipedia page directly
        wiki_response = requests.get(wiki_url, headers=headers)
        wiki_soup = BeautifulSoup(wiki_response.text, 'html.parser')
        
        # Get the content
        content_div = wiki_soup.find(id='mw-content-text')
        paragraphs = content_div.find_all('p')
        content = '\n'.join([p.text for p in paragraphs if p.text.strip()])
        
        return content
        
    except Exception as e:
        return {'error': f'An error occurred: {str(e)}'}

if __name__ == "__main__":
    keyword = input("Enter a keyword to search on Wikipedia: ")
    page_data = fetch_wiki_page(keyword)
    if 'error' in page_data:
        print(page_data['error'])
    else:
        print(page_data)