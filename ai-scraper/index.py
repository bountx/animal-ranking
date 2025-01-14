import db_service
import random_animal
from translation import Translation

def main():
    animal = random_animal.get_random_animal()
    db_service.add_animal(animal)
    print(f"Added {animal.name} to the database")

    polish_translation = Translation(animal, "pl").translate()
    db_service.add_translation(animal, polish_translation)
    print(f"Added pl translation for {animal.name} as {polish_translation.animal.name} to the database")

if __name__ == "__main__":
    main()