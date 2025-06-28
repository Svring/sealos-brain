import os
from typing import Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()


def get_sealos_model(
    model_name: str, base_url: Optional[str] = None, api_key: Optional[str] = None
):
    return ChatOpenAI(
        model=model_name,
        base_url=base_url or os.getenv("SEALOS_BASE_URL"),
        api_key=api_key,
    )


def get_vercel_model(model_name: str):
    return ChatOpenAI(
        model=model_name,
        base_url=os.getenv("VERCEL_BASE_URL"),
        api_key=os.getenv("VERCEL_API_KEY"),
    )
