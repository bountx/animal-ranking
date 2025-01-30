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
        print(f"Attempting to upload {upload_path}, attempt {attempt + 1}")
        bucket.upload(upload_path, file_data)
        sleep(delay)  # Ensure the upload completes
        
        public_url_response = bucket.get_public_url(upload_path)
        
        if isinstance(public_url_response, str) and public_url_response.startswith("http"):
            print(f"Upload verified for {upload_path}")
            return public_url_response

        print(f"Verification failed for {upload_path}. Retrying ({attempt + 1}/{max_retries})...")

    print(f"Failed to upload {upload_path} after {max_retries} attempts")
    return None


def get_animal_by_name(animal_name: str):
    """Fetches the animal record by name, if it exists."""
    response = SUPABASE.table("animals").select("*").eq("name", animal_name).execute()
    return response.data[0] if response.data else None


def add_animal_transactionally(animal: Animal, translations: list[Translation]) -> dict:
    print(f"Starting transaction for animal: {animal.name}")

    bucket = SUPABASE.storage.from_(BUCKET_NAME)
    
    # Check if animal already exists
    existing_animal = get_animal_by_name(animal.name)
    is_new = existing_animal is None

    images_dir = "images"
    image_paths = glob.glob(os.path.join(images_dir, f"{animal.name.replace(' ', '_')}_*.webp"))
    
    image_urls = []

    for image_path in image_paths:
        filename = os.path.basename(image_path)
        upload_path = f"{animal.name}/{filename}"
        
        with open(image_path, "rb") as f:
            file_data = f.read()

        public_url = upload_and_verify(bucket, upload_path, file_data)
        if public_url:
            image_urls.append(public_url)
        else:
            print(f"Failed to verify upload of {filename}")

    translations_payload = [
        {
            "language": t.language,
            "animal": {"name": t.animal.name, "article": t.animal.article}
        } for t in translations
    ]

    # Prepare the payload
    payload = {
        "p_animal_name": animal.name,
        "p_animal_article": animal.article,
        "p_translations": translations_payload,
        "p_image_urls": image_urls
    }

    # If the animal exists, use `update` instead of `insert`
    if is_new:
        print(f"Inserting new animal: {animal.name}")
    else:
        print(f"Updating existing animal: {animal.name}")

    try:
        response = SUPABASE.rpc("add_or_update_animal", payload).execute()
        print(f"Transaction completed for {animal.name}")
        return response.data
    except Exception as e:
        print(f"Error updating animal: {e}")
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
