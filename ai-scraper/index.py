import db_service
import random_animal
from translation import Translation
from fetch_animal_images import download_images_serpapi

def main():
    animal = random_animal.get_random_animal()
    polish_translation = Translation(animal, "pl").translate()
    download_images_serpapi(animal.name)

    db_service.add_animal_transactionally(animal, [polish_translation])

if __name__ == "__main__":
    main()