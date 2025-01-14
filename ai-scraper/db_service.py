from animal import Animal
from translation import Translation
from supabase import create_client, Client # type: ignore
import dotenv
import os
import random

dotenv.load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
SUPABASE: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_existing_animals():
    # Execute the query
    response = SUPABASE.table('animals').select('*').filter('article', 'neq', None).execute()
    
    # Check for errors in the response
    if not response.data:
        raise Exception("Error: No data returned or query failed.")
    
    return response.data

def add_animal(animal: Animal):
    # Execute the query
    response = SUPABASE.table('animals').insert({'name': animal.name, 'article': animal.article}).execute()
    
    return response.data

def add_translation(animal: Animal, translation: Translation):
    # Execute the query

    print(animal.name)
    print(translation.animal.name)
    response = SUPABASE.table('animal_translations').insert({
        'original_name': animal.name, 
        'language': translation.language, 
        'translated_name': translation.animal.name, 'translated_article': translation.animal.article
        }).execute()
    
    return response.data

if __name__ == "__main__":
    try:
        animals = get_existing_animals()
        if animals:
            print(random.choice(animals))
        else:
            print("No animals found")
    except Exception as e:
        print(f"An error occurred: {e}")
