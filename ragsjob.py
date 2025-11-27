import os
import pandas as pd
from dotenv import load_dotenv
from glob import glob

from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

DATA_FOLDER = "./datasets"
csv_files = glob(os.path.join(DATA_FOLDER, "*.csv"))

dfs = [pd.read_csv(f) for f in csv_files]
combined_df = pd.concat(dfs, ignore_index=True)

def row_to_text(row):
    return " | ".join([str(v) for v in row if pd.notna(v)])

# Embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

CHROMA_PATH = "./embeddings/jobs_chroma"

db = Chroma(
    collection_name="job_data",
    embedding_function=embeddings,
    persist_directory=CHROMA_PATH
)

def rag_search(query: str, k: int = 4) -> str:
    """Returns top K relevant job docs as plain text."""
    results = db.similarity_search(query, k=k)
    return "\n\n".join([doc.page_content for doc in results])
