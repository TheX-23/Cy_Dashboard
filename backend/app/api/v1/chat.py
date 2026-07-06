from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging

from app.services.ai_chatbot import ai_chatbot_service

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[Dict] = None

class ChatResponse(BaseModel):
    response: str
    status: str = "success"

@router.post("", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Interact with the SentinelX AI Chatbot.
    Expects a list of messages (history) and optional context.
    """
    try:
        messages_dict = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Get response from AI service
        ai_response = await ai_chatbot_service.generate_response(
            messages=messages_dict,
            context=request.context
        )
        
        return ChatResponse(response=ai_response)
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat request")
