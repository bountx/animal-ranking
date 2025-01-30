import random
from fetch_wiki_page import fetch_wiki_page, fetch_wiki_content
import google.generativeai as genai
import dotenv
from animal import Animal
import os
dotenv.load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

def get_random_animal_name():
    with open('ai-scraper/animals.txt') as f:
        animals = f.read().splitlines()
    return random.choice(animals)

def generate_random_animal_article(prompt):
    if not API_KEY:
            raise ValueError("Please set GEMINI_API_KEY in .env file")
    genai.configure(api_key=API_KEY)
    print("Generating article...")
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    response = model.generate_content(prompt)
    print("Article generated.")
    return response.candidates[0].content.parts[0].text

def get_random_animal():
    animal_name = get_random_animal_name()
    animal_wiki_name = fetch_wiki_page(animal_name)
    animal_fact = fetch_wiki_content(animal_wiki_name)

    prompt1 = f"""
Create a comprehensive article about {animal_name} for an animal ranking website. Structure the article to help users rate the animal in these specific categories while keeping them engaged with fascinating facts:

Physical Capabilities
- Detail strength relative to size
- Compare speed and agility to similar animals
- Include measurable data (e.g., "can lift 50x their body weight")

Curosity
- Any curious facts or behaviors
- Mention any unique abilities
- Include any surprising or counterintuitive information


Historical Significance
- Discuss cultural importance across civilizations
- Mention any major historical events involving this species
- Include traditional beliefs and symbolism

Survival Adaptations
- Explain unique defense mechanisms
- Describe hunting/foraging strategies
- Detail evolutionary advantages

Integrate measurable data when possible (speeds, weights, population numbers) but present them alongside engaging stories and examples. Aim to make each section both informative and entertaining.

Add any additional scientifically accurate information you know about this animal that would help readers make informed ratings.

Note: Focus on verifiable facts rather than subjective descriptions, allowing readers to form their own opinions for rating purposes.</userStyle>

Do not include title or introduction. Start directly with the first category.

Write in language that is engaging and informative, avoiding overly complex terminology or jargon. Aim for a reading level suitable for a general audience interested in animals.

Do not include numbers (1. 2. etc.) or bullet points in the article.

Bold the category titles (e.g., Physical Capabilities) to make the structure clear.

Use new lines between categories to improve readability.

Do not force good ratings or use promotional language. The goal is to provide a balanced and informative article that will help users rate the animal accurately. If animal is bad at something, mention it. If it's good at something, mention it. If it's average at something, mention it.

Use european metric system for measurements (meters, kilograms, etc.).

Write as much as you can!

Base information: {animal_fact}
    """

    prompt2 = f"""
Create a comprehensive article about {animal_name} for an animal ranking website. Structure the article to help users rate the animal in these specific categories while keeping them engaged with fascinating facts:

    Physical Structure
- Highlight unique anatomical features
- Describe specialized body parts
- Explain how their shape aids survival

Cognitive Abilities
- Detail memory capabilities
- Describe social intelligence
- Mention any documented learning behaviors

Movement & Agility
- Explain movement patterns
- Compare speed to other species
- Describe unique locomotion abilities

Environmental Impact
- Discuss role in ecosystem
- Detail interactions with other species
- Explain environmental contributions

Overall Appeal
- Include surprising or counterintuitive facts
- Mention any viral or popular media appearances
- Describe unique behaviors that make this animal special

Integrate measurable data when possible (speeds, weights, population numbers) but present them alongside engaging stories and examples. Aim to make each section both informative and entertaining.

Add any additional scientifically accurate information you know about this animal that would help readers make informed ratings.

Note: Focus on verifiable facts rather than subjective descriptions, allowing readers to form their own opinions for rating purposes.</userStyle>

Do not include title or introduction. Start directly with the first category.

Write in language that is engaging and informative, avoiding overly complex terminology or jargon. Aim for a reading level suitable for a general audience interested in animals.

Do not include numbers (1. 2. etc.) or bullet points in the article.

Bold the category titles (e.g., Physical Capabilities) to make the structure clear.

Use new lines between categories to improve readability.

Do not force good ratings or use promotional language. The goal is to provide a balanced and informative article that will help users rate the animal accurately. If animal is bad at something, mention it. If it's good at something, mention it. If it's average at something, mention it.

Use european metric system for measurements (meters, kilograms, etc.).

Write as much as you can!

Base information: {animal_fact}
    """
    article = generate_random_animal_article(prompt1)
    article = article + '\n\n' + generate_random_animal_article(prompt2)

    return Animal(animal_name, article)

if __name__ == "__main__":
    print(generate_random_animal_article())