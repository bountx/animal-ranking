import dotenv
import os
import google.generativeai as genai
from copy import deepcopy
import time

dotenv.load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SLEEP_TIME = 20  # Global sleep time in seconds

class Translation:
    def __init__(self, animal, language):
        self.animal = deepcopy(animal)
        self.language = language
        print(f"Initialized Translation with animal: {self.animal.name}, language: {self.language}")

    def __str__(self):
        return f"{self.animal.name}\n\n{self.animal.article}"
    
    def __repr__(self):
        return f"Translation({self.animal_name}, {self.article}, {self.language})"
    
    def translate(self):
        if not GEMINI_API_KEY:
            raise ValueError("Please set GEMINI_API_KEY in .env file")
        
        print("Configuring genai with API key")
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        
        prompt = f"""
        Translate the following name of an animal and its article into {self.language}: {self.animal.name}.
        DO NOT WRITE ANYTHING ELSE EXCEPT THE TRANSLATION.

        for context:
        {self.animal.article}
        """
        
        for attempt in range(3):
            try:
                response = model.generate_content(prompt)
                self.animal.name = response.candidates[0].content.parts[0].text.strip()
                print(f"Translated animal name: {self.animal.name}")
                break
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt < 2:
                    print(f"Retrying in {SLEEP_TIME} seconds...")
                    time.sleep(SLEEP_TIME)
                else:
                    raise e

        print(f"Translating article into {self.language}...")
        prompt = f"""
        Translate the following article about {self.animal.name} into {self.language}:
        {self.animal.article}

        DO NOT WRITE ANYTHING ELSE EXCEPT THE TRANSLATION.
        The translation should be natural and you may need to adjust the wording or sentence structure to make it sound more fluent in {self.language}.
        """
        
        for attempt in range(3):
            try:
                response = model.generate_content(prompt)
                self.animal.article = response.candidates[0].content.parts[0].text
                print(f"Translated article into {self.language}")
                break
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt < 2:
                    print(f"Retrying in {SLEEP_TIME} seconds...")
                    time.sleep(SLEEP_TIME)
                else:
                    raise e

        return self
    
if __name__ == "__main__":
    from animal import Animal
    animal = Animal("Penguin", "Penguins are flightless birds that live in the Southern Hemisphere. They are known for their distinctive black and white coloration and their waddling gait. Penguins are highly adapted for life in the water, with their wings modified into flippers that allow them to swim at high speeds. They are excellent divers and can stay underwater for several minutes while hunting for fish, squid, and other marine animals. Penguins are social animals that live in large colonies, and they communicate with each other using a variety of vocalizations and body language. They are also known for their elaborate courtship rituals, which involve singing and dancing. Penguins are threatened by climate change, pollution, and overfishing, and several species are considered endangered.")

    translation = Translation(animal, "French")
    translation.translate()
    print(translation)
