import dotenv
import os
import google.generativeai as genai
from copy import deepcopy

dotenv.load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class Translation:
    def __init__(self, animal, language):
        self.animal = deepcopy(animal)
        self.language = language
        print(f"Initialized Translation with animal: {self.animal.name}, language: {self.language}")

    def __str__(self):
        return f"{self.animal_name}\n\n{self.article}"
    
    def __repr__(self):
        return f"Translation({self.animal_name}, {self.article}, {self.language})"
    
    def translate(self):
        if not GEMINI_API_KEY:
            raise ValueError("Please set GEMINI_API_KEY in .env file")
        
        print("Configuring genai with API key")
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        print(f"Translating animal name: {self.animal.name}")
        prompt = f"""
        Translate the following name of an animal and its article into {self.language}: {self.animal.name}.
        DO NOT WRITE ANYTHING ELSE EXCEPT THE TRANSLATION.
        """
        response = model.generate_content(prompt)
        self.animal.name = response.candidates[0].content.parts[0].text
        print(f"Translated animal name: {self.animal.name}")

        print(f"Translating animal article: {self.animal.name}")
        prompt = f"""
        Translate the following article about an {self.animal.name} into {self.language}:
        {self.animal.article}

        DO NOT WRITE ANYTHING ELSE EXCEPT THE TRANSLATION.
        """
        response = model.generate_content(prompt)
        self.animal.article = response.candidates[0].content.parts[0].text
        print(f"Translated animal article: {self.animal.name}")

        return self
