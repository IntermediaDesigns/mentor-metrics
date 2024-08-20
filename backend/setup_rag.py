from dotenv import load_dotenv

load_dotenv()
from pinecone import Pinecone
from openai import OpenAI
import os
import json
import unicodedata
import re


def clean_name(name):
    # Remove accents and convert to ASCII
    name = "".join(
        c for c in unicodedata.normalize("NFD", name) if unicodedata.category(c) != "Mn"
    )
    # Remove any non-ASCII characters
    name = re.sub(r"[^\x00-\x7F]+", "", name)
    # Replace spaces with underscores and remove any other non-alphanumeric characters
    name = re.sub(r"\W+", "_", name)
    return name


# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Use the existing index
index = pc.Index("rag")

# Load the review data
data = json.load(open("reviews.json"))

processed_data = []
client = OpenAI()

# Create embeddings for each review
for review in data["reviews"]:
    response = client.embeddings.create(
        input=review["review"], model="text-embedding-3-small"
    )
    embedding = response.data[0].embedding
    processed_data.append(
        {
            "id": clean_name(review["professor"]),
            "values": embedding,
            "metadata": {
                "professor": review["professor"],
                "review": review["review"],
                "subject": review["subject"],
                "stars": review["stars"],
            },
        }
    )

# Insert the embeddings into the Pinecone index
upsert_response = index.upsert(
    vectors=processed_data,
    namespace="ns1",
)
print(f"Upserted count: {upsert_response['upserted_count']}")

# Print index statistics
print(index.describe_index_stats())
