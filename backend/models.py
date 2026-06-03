from pydantic import BaseModel
from typing import List

class UserProfile(BaseModel):
    age: int
    gender: str
    state: str
    caste: str
    annual_income_inr: int
    is_bpl: bool
    occupation: List[str]
    is_student: bool = False
    is_disabled: bool = False
    is_widow: bool = False
    is_pregnant: bool = False
    has_daughters: bool = False
    owns_land: bool = False
    has_lpg_connection: bool = False
    is_income_tax_payer: bool = False
    is_government_employee: bool = False
    documents_owned: List[str] = []

class MatchedScheme(BaseModel):
    id: str
    name: str
    short_name: str
    category: str
    benefit_summary: str
    benefit_summary_hi: str
    annual_benefit_inr: int
    documents_required: List[str]
    documents_missing: List[str]
    application_url: str
    how_to_apply: dict
    tags: List[str]
    life_events: List[str]

class MatchResult(BaseModel):
    total_schemes_matched: int
    total_annual_benefit_inr: int
    schemes: List[MatchedScheme]