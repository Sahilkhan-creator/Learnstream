from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT & Password
SECRET_KEY = os.environ.get('JWT_SECRET', 'findhub-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    role: str = "student"  # student or creator
    interests: List[str] = []
    skill_level: str = "beginner"  # beginner, intermediate, advanced
    onboarded: bool = False
    created_at: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    interests: Optional[List[str]] = None
    skill_level: Optional[str] = None
    onboarded: Optional[bool] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class TutorialCreate(BaseModel):
    title: str
    description: str
    youtube_url: str
    category: str  # Tech, Education, Creative, Science, etc.
    preview_image: Optional[str] = None

class TutorialUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    youtube_url: Optional[str] = None
    category: Optional[str] = None
    preview_image: Optional[str] = None

class Tutorial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    youtube_url: str
    category: str
    preview_image: Optional[str] = None
    creator_id: str
    creator_name: str
    created_at: str

class BookmarkCreate(BaseModel):
    tutorial_id: str

class Bookmark(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    tutorial_id: str
    created_at: str

# ============= UTILS =============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def extract_youtube_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    elif "youtube.com/watch?v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtube.com/embed/" in url:
        return url.split("embed/")[1].split("?")[0]
    return url

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_pw,
        "role": "student",
        "interests": [],
        "skill_level": "beginner",
        "onboarded": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token({"sub": user_id})
    
    user_doc.pop("password")
    user_doc.pop("_id", None)
    
    return Token(access_token=access_token, user=User(**user_doc))

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token({"sub": user["id"]})
    
    user.pop("password")
    user.pop("_id", None)
    
    return Token(access_token=access_token, user=User(**user))

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

@api_router.put("/auth/profile", response_model=User)
async def update_profile(profile_data: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_dict = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": update_dict}
        )
        
        updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password": 0})
        return User(**updated_user)
    
    return User(**current_user)

# ============= TUTORIAL ROUTES =============

@api_router.post("/tutorials", response_model=Tutorial)
async def create_tutorial(tutorial_data: TutorialCreate, current_user: dict = Depends(get_current_user)):
    tutorial_id = str(uuid.uuid4())
    
    tutorial_doc = {
        "id": tutorial_id,
        "title": tutorial_data.title,
        "description": tutorial_data.description,
        "youtube_url": tutorial_data.youtube_url,
        "category": tutorial_data.category,
        "preview_image": tutorial_data.preview_image,
        "creator_id": current_user["id"],
        "creator_name": current_user["name"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.tutorials.insert_one(tutorial_doc)
    tutorial_doc.pop("_id", None)
    
    return Tutorial(**tutorial_doc)

@api_router.get("/tutorials", response_model=List[Tutorial])
async def get_tutorials(
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if category:
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    tutorials = await db.tutorials.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Tutorial(**t) for t in tutorials]

@api_router.get("/tutorials/my", response_model=List[Tutorial])
async def get_my_tutorials(current_user: dict = Depends(get_current_user)):
    tutorials = await db.tutorials.find(
        {"creator_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return [Tutorial(**t) for t in tutorials]

@api_router.get("/tutorials/{tutorial_id}", response_model=Tutorial)
async def get_tutorial(tutorial_id: str, current_user: dict = Depends(get_current_user)):
    tutorial = await db.tutorials.find_one({"id": tutorial_id}, {"_id": 0})
    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")
    return Tutorial(**tutorial)

@api_router.put("/tutorials/{tutorial_id}", response_model=Tutorial)
async def update_tutorial(
    tutorial_id: str,
    tutorial_data: TutorialUpdate,
    current_user: dict = Depends(get_current_user)
):
    tutorial = await db.tutorials.find_one({"id": tutorial_id})
    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")
    
    if tutorial["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this tutorial")
    
    update_dict = {k: v for k, v in tutorial_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.tutorials.update_one(
            {"id": tutorial_id},
            {"$set": update_dict}
        )
    
    updated = await db.tutorials.find_one({"id": tutorial_id}, {"_id": 0})
    return Tutorial(**updated)

@api_router.delete("/tutorials/{tutorial_id}")
async def delete_tutorial(tutorial_id: str, current_user: dict = Depends(get_current_user)):
    tutorial = await db.tutorials.find_one({"id": tutorial_id})
    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")
    
    if tutorial["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this tutorial")
    
    await db.tutorials.delete_one({"id": tutorial_id})
    await db.bookmarks.delete_many({"tutorial_id": tutorial_id})
    
    return {"message": "Tutorial deleted successfully"}

# ============= BOOKMARK ROUTES =============

@api_router.post("/bookmarks", response_model=Bookmark)
async def create_bookmark(bookmark_data: BookmarkCreate, current_user: dict = Depends(get_current_user)):
    # Check if already bookmarked
    existing = await db.bookmarks.find_one({
        "user_id": current_user["id"],
        "tutorial_id": bookmark_data.tutorial_id
    })
    
    if existing:
        existing.pop("_id", None)
        return Bookmark(**existing)
    
    bookmark_id = str(uuid.uuid4())
    bookmark_doc = {
        "id": bookmark_id,
        "user_id": current_user["id"],
        "tutorial_id": bookmark_data.tutorial_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookmarks.insert_one(bookmark_doc)
    bookmark_doc.pop("_id", None)
    
    return Bookmark(**bookmark_doc)

@api_router.get("/bookmarks", response_model=List[Tutorial])
async def get_bookmarks(current_user: dict = Depends(get_current_user)):
    bookmarks = await db.bookmarks.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    tutorial_ids = [b["tutorial_id"] for b in bookmarks]
    
    if not tutorial_ids:
        return []
    
    tutorials = await db.tutorials.find(
        {"id": {"$in": tutorial_ids}},
        {"_id": 0}
    ).to_list(1000)
    
    return [Tutorial(**t) for t in tutorials]

@api_router.delete("/bookmarks/{tutorial_id}")
async def delete_bookmark(tutorial_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.bookmarks.delete_one({
        "user_id": current_user["id"],
        "tutorial_id": tutorial_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    return {"message": "Bookmark removed successfully"}

@api_router.get("/bookmarks/check/{tutorial_id}")
async def check_bookmark(tutorial_id: str, current_user: dict = Depends(get_current_user)):
    bookmark = await db.bookmarks.find_one({
        "user_id": current_user["id"],
        "tutorial_id": tutorial_id
    })
    return {"bookmarked": bookmark is not None}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()