class Animal:
    def __init__(self, name, article):
        self.name = name
        self.article = article
        self.translations = []

    def __str__(self):
        return f"{self.name}\n\n{self.article}"

    def __repr__(self):
        return f"Animal({self.name}, {self.article})"