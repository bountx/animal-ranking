import os
import glob
from time import sleep
from animal import Animal
from translation import Translation
from supabase import create_client, Client  # type: ignore
import dotenv

dotenv.load_dotenv()

# Initialize Supabase client and storage bucket
SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
SUPABASE: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
BUCKET_NAME = "animal_photos"

def upload_and_verify(bucket, upload_path, file_data, max_retries=3, delay=1):
    """
    Uploads a file and verifies its presence in the bucket by checking for a public URL.
    Retries the upload if verification fails.
    """
    for attempt in range(max_retries):
        # Attempt to upload the file
        bucket.upload(upload_path, file_data)
        # Wait briefly to ensure the file is processed
        sleep(delay)
        # Check if the file exists by retrieving its public URL
        public_url_response = bucket.get_public_url(upload_path)
        print(f"Debug: public_url_response type: {type(public_url_response)}, value: {public_url_response}")
        
        # If response is a string URL or similar, use it directly
        if public_url_response and isinstance(public_url_response, str):
            return public_url_response
        
        # If response is a dict-like object, attempt to extract the URL
        if public_url_response and hasattr(public_url_response, 'get'):
            public_url = public_url_response.get("publicURL")
            if public_url:
                return public_url
        
        print(f"Verification failed for {upload_path}. Retrying ({attempt + 1}/{max_retries})...")
    return None


def add_animal_transactionally(animal: Animal, translations: list[Translation]) -> dict:
    # Initialize storage bucket
    bucket = SUPABASE.storage.from_(BUCKET_NAME)
    
    # Directory containing images
    images_dir = "images"
    
    # Find all image files matching the pattern {animal.name}_*.jpg or {animal.name}_*.jpeg
    image_paths = []
    for ext in ["jpg", "jpeg"]:
        image_paths.extend(glob.glob(os.path.join(images_dir, f"{animal.name}_*.{ext}")))
    
    image_urls = []
    
    # Upload images and collect their verified public URLs
    for image_path in image_paths:
        filename = os.path.basename(image_path)
        upload_path = f"{animal.name}/{filename}"
        
        # Read file data
        with open(image_path, "rb") as f:
            file_data = f.read()
        
        # Use the new verification function
        public_url = upload_and_verify(bucket, upload_path, file_data)
        if public_url:
            image_urls.append(public_url)
        else:
            print(f"Failed to verify upload of {filename} after retries.")
    
    # Prepare payloads for translations and image URLs using native Python objects
    translations_payload = [
        {
            "language": t.language,
            "animal": {"name": t.animal.name, "article": t.animal.article}
        } for t in translations
    ]
    image_urls_payload = image_urls

    # Call the stored procedure using RPC to execute all insertions atomically
    try:
        response = SUPABASE.rpc(
            "add_animal_full",
            {
                "p_animal_name": animal.name,
                "p_animal_article": animal.article,
                "p_translations": translations_payload,
                "p_image_urls": image_urls_payload
            }
        ).execute()
        return response.data
    except Exception as e:
        print(f"Error inserting animal: {e}")
        raise

# Example usage
if __name__ == "__main__":
    new_animal = Animal(name="Sloth Bear", article="the")
    translations_list = [
        Translation(language="pl", animal=Animal(name="Niedźwiedź himalajski", article="ten")),
        Translation(language="de", animal=Animal(name="Schloth Bear", article="der"))
    ]
    
    result = add_animal_transactionally(new_animal, translations_list)
    print(result)
