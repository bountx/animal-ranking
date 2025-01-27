import os
import requests
from serpapi.google_search import GoogleSearch
import dotenv
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from PIL import Image
import io

# Load environment variables
dotenv.load_dotenv()

# Retrieve SerpAPI key from environment variables
SERAPI_KEY: str = os.getenv("SERAPI_KEY")
TARGET_SIZE = 200 * 1024  # 200KB in bytes

def compress_image(image_data, max_size=TARGET_SIZE):
    """Compress image to WebP format under specified size."""
    # Open image from binary data
    img = Image.open(io.BytesIO(image_data))
    
    # Convert to RGB if necessary (WebP doesn't support RGBA)
    if img.mode in ('RGBA', 'LA'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        img = background
    
    # Start with quality 80 and adjust based on size
    quality = 80
    while quality > 5:  # Don't go below quality 5
        buffer = io.BytesIO()
        img.save(buffer, format="WEBP", quality=quality)
        size = buffer.tell()
        
        if size <= max_size:
            return buffer.getvalue()
        
        quality -= 10
    
    # If we get here, even lowest quality is too big
    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=5)
    return buffer.getvalue()

def download_images_serpapi(keyword, num_images=5):
    # Define search parameters
    params = {
        "q": f"{keyword} animal",
        "tbm": "isch",
        "ijn": "0",
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
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["GET"]
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
            response.raise_for_status()
            
            if 'image' not in response.headers.get('Content-Type', ''):
                print(f"[{idx + 1}/{total_images}] URL does not point to an image. Skipping.")
                idx += 1
                continue
                
            # Compress the image to WebP
            compressed_image = compress_image(response.content)
            
            # Save the compressed WebP file
            file_path = os.path.join(
                images_folder,
                f"{keyword.replace(' ', '_')}_{downloaded + 1}.webp"
            )
            
            with open(file_path, 'wb') as handler:
                handler.write(compressed_image)
                
            file_size = os.path.getsize(file_path) / 1024  # Size in KB
            print(f"[{idx + 1}/{total_images}] Downloaded and compressed: {file_path} ({file_size:.1f}KB)")
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