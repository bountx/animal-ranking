import random
from fetch_wiki_page import fetch_wiki_page
import google.generativeai as genai
import dotenv
from animal import Animal
API_KEY = dotenv.get_key('.env', 'GEMINI_API_KEY')

def get_random_animal_name():
    with open('ai-scraper/animals.txt') as f:
        animals = f.read().splitlines()
    return random.choice(animals)

def get_random_animal_prompt(animal_name):
    animal_fact = fetch_wiki_page(animal_name)
    return f"""
    Create an article (without title) about most interesting facts about {animal_name}.
    It's for animal ranking website so try to include raw data AND interesting facts.
    Use the following information to write the article and your own knowledge.

    Content: {animal_fact}
    """

def generate_random_animal_article(prompt):
    if not API_KEY:
            raise ValueError("Please set GEMINI_API_KEY in .env file")
        
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.candidates[0].content.parts[0].text

def get_random_animal():
    animal_name = get_random_animal_name()
    prompt = get_random_animal_prompt(animal_name)
    article = generate_random_animal_article(prompt)
    return Animal(animal_name, article)

if __name__ == "__main__":
    print(generate_random_animal_article())
    