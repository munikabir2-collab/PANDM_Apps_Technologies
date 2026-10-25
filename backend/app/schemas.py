from pydantic import BaseModel, EmailStr, Field, ConfigDict

class BookingCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    project_type: str = Field(min_length=2, max_length=100)
    details: str = Field(default="", max_length=5000)

class BookingOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    project_type: str
    details: str
    status: str
    model_config = ConfigDict(from_attributes=True)

class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    message: str = Field(min_length=5, max_length=5000)

class ContactOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    model_config = ConfigDict(from_attributes=True)
