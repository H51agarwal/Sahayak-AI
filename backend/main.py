from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import UserProfile, MatchResult
from engine import match_schemes, ALL_SCHEMES
from conversation_flow import ConversationState, QUESTIONS
import uuid
from pydantic import BaseModel
from typing import Union, Any

class AnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: Any

app = FastAPI(
    title="SahayakAI Backend",
    description="Government scheme eligibility engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all origins (fine for dev)
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "SahayakAI is running",
        "total_schemes": len(ALL_SCHEMES)
    }

@app.post("/match", response_model=MatchResult)
def match(user: UserProfile):
    return match_schemes(user)

@app.get("/schemes")
def get_all_schemes():
    return {
        "total": len(ALL_SCHEMES),
        "schemes": ALL_SCHEMES
    }

@app.get("/schemes/{scheme_id}")
def get_scheme(scheme_id: str):
    for s in ALL_SCHEMES:
        if s["id"] == scheme_id:
            return s
    return {"error": "Scheme not found"}

@app.get("/search")
def search_by_life_event(query: str):
    query_lower = query.lower()
    results = []
    for s in ALL_SCHEMES:
        for event in s.get("life_events", []):
            if query_lower in event.lower():
                results.append(s)
                break
        for tag in s.get("tags", []):
            if query_lower in tag.lower() and s not in results:
                results.append(s)
    return {"query": query, "results": results}

sessions: dict = {}

@app.post("/conversation/start")
def start_conversation(language: str = "en"):
    session_id = str(uuid.uuid4())
    state = ConversationState(language=language)
    sessions[session_id] = state
    first_q = state.get_next_question()
    q_data = QUESTIONS[first_q]
    return {
        "session_id": session_id,
        "question_id": first_q,
        "question": q_data[language],
        "type": q_data["type"],
        "options": q_data.get("options" if language == "en" else "options_hi"),
        "progress": "1/10"
    }

@app.post("/conversation/answer")
def submit_answer(req: AnswerRequest):
    if req.session_id not in sessions:
        return {"error": "Session not found. Call /conversation/start first."}
    
    state = sessions[req.session_id]
    state.process_answer(req.question_id, req.answer)
    next_q = state.get_next_question()

    if state.is_complete:
        from engine import match_schemes
        profile = state.build_user_profile()
        result = match_schemes(profile)
        del sessions[req.session_id]  # clean up session
        return {
            "status": "complete",
            "result": result
        }
    
    q_data = QUESTIONS[next_q]
    lang = state.language
    answered = len(state.answers)
    total = len([q for q in ["state","age","gender","occupation","land","income",
              "women_situations","special_situations","caste","documents"]
              if q not in state.questions_to_skip])
    return {
        "status": "in_progress",
        "question_id": next_q,
        "question": q_data[lang],
        "type": q_data["type"],
        "options": q_data.get("options" if lang == "en" else "options_hi"),
        "progress": f"{answered}/{total}"
    }

@app.post("/conversation/freetext")
async def freetext_input(session_id: str, message: str):
    from gemini_extractor import extract_profile_from_text

    if session_id not in sessions:
        return {"error": "Session not found"}

    state = sessions[session_id]
    extracted = extract_profile_from_text(message)

    print(f"=== FREETEXT DEBUG ===")
    print(f"Extracted: {extracted}")
    print(f"Answers before: {state.answers}")
    print(f"Questions to skip: {state.questions_to_skip}")

    if "language_detected" in extracted:
        state.language = extracted.pop("language_detected")

    if "state" in extracted:
        state.answers["state"] = extracted["state"]

    if "age" in extracted:
        state.answers["age"] = extracted["age"]

    if "gender" in extracted:
        state.answers["gender"] = extracted["gender"]
    
        if str(extracted["gender"]).lower() in ["male", "m"]:
            if "women_situations" not in state.questions_to_skip:
                state.questions_to_skip.append("women_situations")

    if "occupation" in extracted:
        state.answers["occupation"] = extracted["occupation"]

        occ = extracted["occupation"]
        occ_list = occ if isinstance(occ, list) else [occ]
        if not any("farmer" in str(o).lower() for o in occ_list):
            if "land" not in state.questions_to_skip:
                state.questions_to_skip.append("land")

    if "caste" in extracted:
        state.answers["caste"] = extracted["caste"]
    
    for field in ["annual_income_inr","is_bpl","owns_land","is_widow",
                  "is_pregnant","has_daughters","is_disabled",
                  "has_lpg_connection","is_government_employee","is_income_tax_payer"]:
        if field in extracted:
            state.answers[field] = extracted[field]

    if "owns_land" in extracted:
        state.answers["land"] = "yes" if extracted["owns_land"] else "no"

    if "annual_income_inr" in extracted:
        state.answers["income"] = extracted["annual_income_inr"]

    if extracted.get("is_government_employee"):
        state.answers["occupation"] = ["Government employee"]

    next_q = state.get_next_question()

    if state.is_complete:
        from engine import match_schemes
        profile = state.build_user_profile()
        result = match_schemes(profile)
        return {"status": "complete", "result": result}
    
    q_data = QUESTIONS[next_q]
    lang = state.language
    return {
        "status": "need_more_info",
        "fields_extracted": list(extracted.keys()),
        "question_id": next_q,
        "question": q_data[lang],
        "type": q_data["type"],
        "options": q_data.get("options" if lang == "en" else "options_hi")
    }

@app.post("/match/direct", response_model=MatchResult)
def match_direct(user: UserProfile):
    return match_schemes(user)

    
