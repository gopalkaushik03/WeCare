import logging
from typing import Any
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from datetime import timedelta

from models import UserCreate, UserLogin, Token
from services.auth_service import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from db import safe_insert, safe_find

log = logging.getLogger("wecare.auth")
router = APIRouter()

@router.post("/signup", response_model=Token, status_code=201)
async def signup(user: UserCreate) -> Any:
    # Check if email exists
    existing = await safe_find("users", {"email": user.email}, limit=1)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_pwd = get_password_hash(user.password)
    
    # Create user document
    import uuid
    from datetime import datetime, timezone
    new_user = {
        "user_id": str(uuid.uuid4()),
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_pwd,
        "created_at": datetime.now(timezone.utc)
    }
    
    await safe_insert("users", new_user)
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user["user_id"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": new_user["user_id"],
        "name": new_user["name"]
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin) -> Any:
    users = await safe_find("users", {"email": credentials.email}, limit=1)
    if not users:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = users[0]
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["user_id"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user["user_id"],
        "name": user["name"]
    }

@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)) -> Any:
    users = await safe_find("users", {"user_id": user_id}, limit=1)
    if not users:
        raise HTTPException(status_code=404, detail="User not found")
    user = users[0]
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"]
    }
