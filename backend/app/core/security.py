import secrets
from typing import Optional
from fastapi import Header, HTTPException, status
from app.core.config import settings


def verify_agent_token(x_agent_token: Optional[str] = Header(None, alias="X-Agent-Token")) -> str:
    """
    Validates the agent authentication token provided in the HTTP header.
    
    All monitoring agents (Ubuntu, Windows) must include:
        `X-Agent-Token: <AGENT_SECRET_TOKEN>`
        
    Uses `secrets.compare_digest` to prevent timing attacks when verifying tokens.
    """
    if not x_agent_token or not secrets.compare_digest(x_agent_token, settings.AGENT_SECRET_TOKEN):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing agent authentication token. Please provide valid X-Agent-Token header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return x_agent_token
