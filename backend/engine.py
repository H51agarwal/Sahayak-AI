import json
import os
from typing import List
from models import UserProfile, MatchedScheme,MatchResult

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMES_FILE = os.path.join(BASE_DIR, "data", "schemes.json")

with open(SCHEMES_FILE, "r", encoding="utf-8") as f:
    ALL_SCHEMES = json.load(f)["schemes"]

print(f"Loaded {len(ALL_SCHEMES)} schemes from database")

def get_missing_documents(
        required: List[str],
        owned: List[str]
) -> List[str]:
    
    owned_lower = [d.lower().strip() for d in owned]

    missing = []
    for doc in required:
        if doc.lower().strip() not in owned_lower:
            missing.append(doc)
    return missing

def is_eligible(scheme: dict, user: UserProfile) -> bool:
    e = scheme["eligibility"]

    if e["min_age"] is not None and e["min_age"] != "":
        if user.age < int(e["min_age"]):
            return False
        
    if e["max_age"] is not None and e["max_age"] != "":
        if user.age > int(e["max_age"]):
            return False
        
    if e["gender"] != "any":
        if user.gender != e["gender"]:
            return False
        
    if e["caste"] and "all" not in e["caste"]:
        if user.caste not in e["caste"]:
            return False
        
    if e["occupation"] and "all" not in e["occupation"]:
        user_occ_set = set(user.occupation)
        scheme_occ_set = set(e["occupation"])
        if not user_occ_set.intersection(scheme_occ_set):
            return False
        
    if e["max_annual_income_inr"] is not None and e["max_annual_income_inr"] != "":
        if user.annual_income_inr > int(e["max_annual_income_inr"]):
            return False
        
    if e["bpl_required"] == True:
        if not user.is_bpl:
            return False
        
    if e["state_specific"] == True:
        if e["states"] is not None:
            if user.state not in e["states"]:
                return False
            
    exclusions = e.get("exclusions", [])
    for excl in exclusions:
        excl_lower = excl.lower()

        if "government employee" in excl_lower:
            if user.is_government_employee:
                return False

        if "income tax" in excl_lower:
            if user.is_income_tax_payer:
                return False

        if "lpg connection" in excl_lower:
            if user.has_lpg_connection:
                return False
    
    scheme_id =  scheme["id"]
            
    if scheme_id == "IGNWPS":
        if not user.is_widow:
            return False
        
    if scheme_id == "IGNDPS":
        if not user.is_disabled:
            return False
        
    if scheme_id in ["PMMVY", "JSY", "NHM_REPRODUCTIVE_HEALTH"]:
        if not user.is_pregnant:
            return False
        
    if scheme_id == "SUKANYA_SMARIDDHI":
        if not user.has_daughters:
            return False
        
    if scheme_id == "PM_KISAN":
        if not user.owns_land:
            return False
        
    return True

def match_schemes(user: UserProfile) -> MatchResult:
    matched = []
    total_benefit = 0

    for scheme in ALL_SCHEMES:
        if is_eligible(scheme, user):
            raw_benefit = scheme.get("annual_benefit_inr", 0)
            if raw_benefit is None or raw_benefit == "":
                benefit = 0
            elif isinstance(raw_benefit, str):
                try:
                    benefit = int(raw_benefit.split("-")[0].strip())
                except:
                    benefit = 0
            else:
                benefit = int(raw_benefit)

            missing_docs = get_missing_documents(
                scheme["documents_required"],
                user.documents_owned
            )

            matched_scheme = MatchedScheme(
                id=scheme["id"],
                name=scheme["name"],
                short_name=scheme["short_name"],
                category=scheme["category"],
                benefit_summary=scheme["benefit_summary"],
                benefit_summary_hi=scheme["benefit_summary_hi"],
                annual_benefit_inr=benefit,
                documents_required=scheme["documents_required"],
                documents_missing=missing_docs,
                application_url=scheme["application_url"],
                how_to_apply=scheme["how_to_apply"],
                tags=scheme["tags"],
                life_events=scheme["life_events"]
            )

            matched.append(matched_scheme)
            total_benefit += benefit

    matched.sort(key=lambda x: x.annual_benefit_inr, reverse=True)

    return MatchResult(
        total_schemes_matched=len(matched),
        total_annual_benefit_inr=total_benefit,
        schemes=matched
    )
