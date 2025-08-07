import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException , Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from langchain_astradb import AstraDBVectorStore
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_groq import ChatGroq 
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import MessagesPlaceholder
from langchain.chains import create_history_aware_retriever
from langchain.chains import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate

app = FastAPI()
load_dotenv()

class InputText(BaseModel):
    input: str

class UserInput(BaseModel):
    input: str
    session_id: str = "default"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


astra_db_endpoint = os.getenv("astra_db_endpoint")
astra_db_token = os.getenv("astra_db_token")
astra_db_keyspace = os.getenv("astra_db_keyspace")
groq = os.getenv("groq")
hf_token = os.getenv("hf_token")

embedding = HuggingFaceBgeEmbeddings(model_name="BAAI/bge-base-en-v1.5",
                                    model_kwargs={"token" : hf_token})


vstore = AstraDBVectorStore(
    embedding = embedding,
    collection_name='amazone',
    api_endpoint=astra_db_endpoint,
    token=astra_db_token,
    namespace= astra_db_keyspace)
retriver = vstore.as_retriever(search_kwargs = {"k":3})

model = ChatGroq(api_key=groq , model= "llama-3.3-70b-versatile" , temperature= 0.5)

retriver_prompt = ("Given a chat history and the latest user question which might reference context in the chat history,"
    "formulate a standalone question which can be understood without the chat history."
    "Do NOT answer the question, just reformulate it if needed and otherwise return it as is.")


contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
    ("system", retriver_prompt),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    ]
)
history_aware_retriever = create_history_aware_retriever(model, retriver, contextualize_q_prompt)

PRODUCT_BOT_TEMPLATE = """
    You are an AI-powered eCommerce assistant specialized in product recommendations and customer support.
You analyze product titles, specifications, and reviews to suggest relevant products based on user input.
Always keep responses concise, factual, and focused on the product context.
You must:

Recommend product names when possible.

Only answer queries related to the provided product data.

Never go off-topic or provide generic advice.

Be helpful, precise, and avoid hallucinations.
    CONTEXT:
    {context}

    QUESTION: {input}

    YOUR ANSWER:

    """


qa_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", PRODUCT_BOT_TEMPLATE),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ]
)
question_answer_chain = create_stuff_documents_chain(model, qa_prompt)
chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

chat_history = []
store = {}

from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables import RunnableWithMessageHistory

def get_session_history(session_id: str)-> BaseChatMessageHistory:
  if session_id not in store:
    store[session_id]= ChatMessageHistory()
  return store[session_id]

chain_with_memmory = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer",
)
@app.get("/")
def home():
    return {"message": "Hello from system starts!"}

@app.post("/recommend")
def recommend(user_input: UserInput):
    try:
        response = chain_with_memmory.invoke(
            {"input": user_input.input},
            config={"configurable": {"session_id": user_input.session_id}}
        )
        return {"recommendation": response["answer"]}
    
    except Exception as e:
        return {"error": str(e)}

