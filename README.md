# 🛍️ AI-powered Amazon Product Recommendation System

An intelligent, AI-driven product recommendation backend built using **FastAPI**, **LangChain**, **AstraDB Vector Store**, and **Hugging Face embeddings**. This system mimics Amazon-like recommendation behavior based on user input.

---

## 🚀 Features

- ✅ FastAPI-powered backend with RESTful endpoint
- ✅ LangChain-powered reasoning with memory-based context
- ✅ HuggingFace BGE embeddings for semantic understanding
- ✅ AstraDB vector store for long-term memory retrieval
- ✅ CORS-enabled and frontend-ready
- ✅ Deployable on Render (free-tier)

---

<img width="1894" height="983" alt="Screenshot 2025-08-07 161346" src="https://github.com/user-attachments/assets/a2a489a0-3f06-4470-92b3-7c811c11822b" />


## 🧠 Tech Stack

| Layer       | Tool/Library                        |
|-------------|-------------------------------------|
| Framework   | FastAPI                             |
| AI Engine   | LangChain + ChatGroq                |
| Embeddings  | HuggingFaceBgeEmbeddings            |
| Vector DB   | AstraDB (Cassandra-based)           |
| Model       | Groq LLM                            |
| Deployment  | Render (Free-tier)                  |

---

## 📁 Project Structure

├── main.py # FastAPI app with LangChain logic
├── requirements.txt # Python dependencies
└── ...


### ✅ Request Body (JSON)
```json
{
  "input": "I need a smartphone under 30k",
  "session_id": "default"
}

{
  "recommendation": "Here are some top smartphones under ₹30,000..."
}

##🔧 How to Run Locally
## 1. Clone the Repo

git clone https://github.com/Jaikumar2406/AI-powered-amazone-Product-Recommendation-System.git
cd AI-powered-amazone-Product-Recommendation-System

## 2. Install Dependencies

pip install -r requirements.txt

## 3.Create .env file
ASTRA_DB_APPLICATION_TOKEN=your_token_here
ASTRA_DB_API_ENDPOINT=your_endpoint_here
HUGGINGFACEHUB_API_TOKEN=your_hf_token

## 4. Run the App

uvicorn main:app --reload


## 🌐 Live Demo (Render)
https://ai-product-recommendation-api.onrender.com/recommend
