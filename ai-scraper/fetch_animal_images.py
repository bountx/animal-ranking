import os
import requests
from serpapi import GoogleSearch
import dotenv
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Load environment variables
dotenv.load_dotenv()

# Retrieve SerpAPI key from environment variables
SERAPI_KEY: str = os.getenv("SERAPI_KEY")

def download_images_serpapi(keyword, num_images=5):
    # Define search parameters
    params = {
        "q": f"{keyword} animal",
        "tbm": "isch",
        "ijn": "0",  # Page number for pagination, if needed
        "api_key": SERAPI_KEY
    }
    
    # Perform the search
    search = GoogleSearch(params)
    results = search.get_dict()
    images_results = results.get("images_results", [])
    
    if not images_results:
        print("No image results found.")
        return
    
    # Ensure the images directory exists
    images_folder = "images"
    os.makedirs(images_folder, exist_ok=True)
    
    # Set up a requests session with retry strategy
    session = requests.Session()
    retries = Retry(
        total=3,  # Total number of retries
        backoff_factor=1,  # Wait 1s, then 2s, then 4s between retries
        status_forcelist=[500, 502, 503, 504],  # Retry on these HTTP status codes
        allowed_methods=["GET"]  # Retry only on GET requests
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    
    # Define headers to mimic a browser
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/58.0.3029.110 Safari/537.3'
        )
    }
    
    downloaded = 0
    idx = 0
    total_images = len(images_results)
    
    while downloaded < num_images and idx < total_images:
        image_info = images_results[idx]
        image_url = image_info.get("original")
        
        if not image_url:
            print(f"[{idx + 1}/{total_images}] No URL found for this image. Skipping.")
            idx += 1
            continue
        
        try:
            print(f"[{idx + 1}/{total_images}] Attempting to download image: {image_url}")
            response = session.get(image_url, headers=headers, timeout=10)
            response.raise_for_status()  # Raise an HTTPError for bad responses
            
            # Optional: Validate image content type
            if 'image' not in response.headers.get('Content-Type', ''):
                print(f"[{idx + 1}/{total_images}] URL does not point to an image. Skipping.")
                idx += 1
                continue
            
            img_data = response.content
            file_extension = os.path.splitext(image_url)[1].split('?')[0]  # Handle URLs with query params
            if file_extension.lower() not in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
                file_extension = '.jpg'  # Default to .jpg if unknown
            
            # Save the file directly into the "images" folder
            file_path = os.path.join(
                images_folder, 
                f"{keyword.replace(' ', '_')}_{downloaded + 1}{file_extension}"
            )
            
            with open(file_path, 'wb') as handler:
                handler.write(img_data)
            print(f"[{idx + 1}/{total_images}] Downloaded: {file_path}")
            downloaded += 1
        except requests.exceptions.RequestException as req_err:
            print(f"[{idx + 1}/{total_images}] Request error: {req_err}. Retrying...")
        except Exception as e:
            print(f"[{idx + 1}/{total_images}] Unexpected error: {e}. Skipping.")
        
        idx += 1
    
    if downloaded < num_images:
        print(f"Downloaded {downloaded} out of {num_images} images.")
    else:
        print(f"Successfully downloaded {downloaded} images.")

if __name__ == "__main__":
    keyword = input("Enter a keyword to search for images: ")
    download_images_serpapi(keyword)
