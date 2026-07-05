from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import UserProfile, MatchResult
from engine import match_schemes, ALL_SCHEMES
from conversation_flow import ConversationState, QUESTIONS
import uuid
from pydantic import BaseModel
from typing import Union, Any, List

class AnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: Any

app = FastAPI(
    title="SahayakAI Backend",
    description="Government scheme eligibility engine",
    version="1.0.0"
)

class GuideRequest(BaseModel):
    scheme_id: str
    scheme_name: str
    language: str
    application_url: str
    documents: List[str]

LANGUAGE_NAMES = {
    "hi": "Hindi (Devanagari script)",
    "en": "simple conversational English",
    "mr": "Marathi (Devanagari script)",
    "bn": "Bengali (Bengali script)",
    "ta": "Tamil (Tamil script)",
    "te": "Telugu (Telugu script)",
    "gu": "Gujarati (Gujarati script)",
    "kn": "Kannada (Kannada script)",
    "pa": "Punjabi (Gurmukhi script)",
    "or": "Odia (Odia script)",
}

@app.post("/guide")
def get_application_guide(req: GuideRequest):
    from google import genai
    import json, os

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    lang = LANGUAGE_NAMES.get(req.language, "Hindi")

    prompt = f"""
You are a warm, friendly helper named "Sahayak" helping a rural Indian citizen apply for a government scheme.
You speak like a trusted friend, not a government officer. Use simple, warm, encouraging language.

Generate a step-by-step VOICE SCRIPT for applying to: {req.scheme_name}
Portal: {req.application_url}
Documents needed: {', '.join(req.documents[:5])}

Write ENTIRELY in {lang}. Sound like a friend talking, not a robot reading.

Return ONLY a JSON array of 6-8 steps. Each step:
- "title": very short step name (for display only, 4-5 words)
- "voice_script": what the AI will SPEAK ALOUD — warm, conversational, 2-4 sentences. 
  Start step 1 with a warm greeting. Include encouragement. End each step with "जब आप तैयार हों तो 'अगला' बोलें या नीचे का बटन दबाएं" (or equivalent in the language).
- "display_text": the same information but as short bullet points for the screen (for those who prefer reading)
- "sub_steps": if this step involves filling a form, provide an array of sub-steps [{{"label": "...", "detail": "..."}}], else null
- "tip": a helpful warning or tip the AI will mention (null if not needed)

IMPORTANT for voice_script style:
- Step 1: Start with "नमस्ते! मैं आपका सहायक हूँ। आज हम [scheme name] के लिए आवेदन करेंगे। घबराइए नहीं, मैं आपके साथ हर कदम पर हूँ।"
- Use words like "बढ़िया!", "शाबाश!", "अच्छा किया!" at the start of steps 2+ to encourage
- For form filling step: be very specific — "यहाँ आपको अपना 12 अंकों का आधार नंबर डालना है। यह वही नंबर है जो आपके आधार कार्ड पर छपा है।"
- End the last step with: "बधाई हो! आपने सफलतापूर्वक आवेदन कर लिया है। आपका Application Number संभालकर रखें।"

Return ONLY the JSON array. No explanation. No markdown backticks.
"""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        steps = json.loads(text)
        return {"steps": steps, "scheme_name": req.scheme_name, "language": req.language}
    except Exception as e:
        print(f"Guide error: {e}")

        fallback = [
          {"title": "शुरुआत करें",
           "voice_script": f"नमस्ते! मैं आपका सहायक हूँ। आज हम {req.scheme_name} के लिए आवेदन करेंगे। घबराइए नहीं, मैं हर कदम पर आपके साथ हूँ। सबसे पहले अपने फोन में Chrome ब्राउज़र खोलें। जब खुल जाए तो 'अगला' बोलें।",
           "display_text": "Chrome browser खोलें",
           "sub_steps": None, "tip": None},
          {"title": "वेबसाइट खोलें",
           "voice_script": f"बढ़िया! अब ऊपर के address bar में यह पता टाइप करें: {req.application_url} — और Enter दबाएं। वेबसाइट खुलने में थोड़ा समय लगेगा, धैर्य रखें।",
           "display_text": f"{req.application_url} खोलें",
           "sub_steps": None, "tip": "अगर वेबसाइट नहीं खुली तो internet connection जांचें"},
          {"title": "पंजीकरण करें",
           "voice_script": "शाबाश! अब आपको एक लॉगिन कार्ड दिखाई दे रहा होगा। सबसे पहले दाईं तरफ जैसा कैप्चा लिखा है, उसे बिल्कुल वैसा ही भरें। इसके बाद दूसरे बॉक्स में अपना मोबाइल नंबर दर्ज करें।",
           "display_text": "Login card पर captcha और mobile number डालें और 'वेरिफाई' पर क्लिक करें।",
           "sub_steps": None, "tip": "वही मोबाइल नंबर डालें जो आधार से जुड़ा हो"},
          {"title": "OTP डालें",
           "voice_script": "अच्छा! अब आपके मोबाइल पर 6 अंकों का एक नंबर आएगा, उसे OTP कहते हैं। वह नंबर वेबसाइट पर डालें और Submit करें। यह नंबर 10 मिनट तक काम करता है।",
           "display_text": "मोबाइल पर आया 6 अंकों का OTP डालें",
           "sub_steps": None, "tip": "OTP किसी को न बताएं"},
          {"title": "फॉर्म भरें",
           "voice_script": f"बहुत अच्छे! अब एक फॉर्म आएगा। इसमें आपकी जानकारी भरनी है। ध्यान से भरें — अपना नाम, पता, और बैंक खाते की जानकारी। ये दस्तावेज़ पास रखें: {', '.join(req.documents[:3])}",
           "display_text": "नाम, पता, बैंक account number और IFSC code भरें",
           "sub_steps": [
               {"label": "नाम", "detail": "आधार कार्ड पर जैसा नाम है वैसा ही लिखें"},
               {"label": "पता", "detail": "गांव, तहसील, जिला और पिनकोड भरें"},
               {"label": "बैंक खाता", "detail": "पासबुक देखकर 11-16 अंकों का account number भरें"},
               {"label": "IFSC Code", "detail": "पासबुक पर IFSC code लिखा होता है — 11 अक्षरों का"}
            ],
            "tip": "बैंक पासबुक सामने रखकर भरें"},
           {"title": "Submit करें",
           "voice_script": "बधाई हो! सब भर लिया। अब नीचे 'Submit' बटन दबाएं। एक Application Number मिलेगा — इसे कागज़ पर लिख लें या screenshot लें। यही नंबर बाद में काम आएगा। आपने बहुत अच्छा किया!",
           "display_text": "Submit करें और Application Number नोट करें",
           "sub_steps": None, "tip": "Application Number का photo ज़रूर लें"}
        ]
        return {"steps": fallback, "scheme_name": req.scheme_name, "language": req.language}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
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
    base_lang = language if language in ["en", "hi"] else "hi"

    session_id = str(uuid.uuid4())
    state = ConversationState(language=language)
    sessions[session_id] = state
    first_q = state.get_next_question()
    q_data = QUESTIONS[first_q]

    return {
        "session_id": session_id,
        "question_id": first_q,
        "question": q_data[base_lang],
        "type": q_data["type"],
        "options": q_data.get("options_hi"),
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
    options = q_data.get("options" if lang == "en" else "options_hi")
    if next_q == "documents":
        age_answer = state.answers.get("age", "")
        if "under 18" in str(age_answer).lower() or "18 से कम" in str(age_answer):
            options = [o for o in options if "voter" not in o.lower()]
    return {
        "status": "in_progress",
        "question_id": next_q,
        "question": q_data[lang],
        "type": q_data["type"],
        "options": options,
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

@app.post("/guide")
def get_application_guide(req: GuideRequest):
    from google import genai
    import json, os

    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

    lang_instruction = "Hindi (Devanagari script)" if req.language == "hi" else "simple English"

    prompt = f"""
You are a helpful government scheme assistant in India helping rural citizens apply for welfare schemes.

Generate a step-by-step application guide for: {req.scheme_name}
Application portal: {req.application_url}
Documents needed: {', '.join(req.documents[:5])}
Language: Write ENTIRELY in {lang_instruction}. Use very simple words. Class 5 reading level.

Return ONLY a JSON array of 6-8 steps. Each step must have:
- "title": short step name (5-7 words max)
- "instruction": clear explanation of exactly what to do (2-3 sentences, very simple)
- "tip": optional helpful tip or warning (null if not needed)

Example format:
[
  {{
    "title": "वेबसाइट खोलें",
    "instruction": "अपने फोन में Google Chrome खोलें। ऊपर के खाली बॉक्स में pmkisan.gov.in टाइप करें और Enter दबाएं।",
    "tip": "अगर वेबसाइट नहीं खुल रही तो WiFi या मोबाइल डेटा चालू करें।"
  }},
  ...
]

Return ONLY the JSON array. No explanation. No markdown.
"""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        steps = json.loads(text)
        return {"steps": steps, "scheme_name": req.scheme_name}
    except Exception as e:
        print(f"Guide generation error: {e}")
        
        fallback_hi = [
            {"title": "वेबसाइट खोलें", "instruction": f"अपने फोन में {req.application_url} खोलें।", "tip": None},
            {"title": "रजिस्ट्रेशन करें", "instruction": "'New Registration' या 'नया पंजीकरण' बटन दबाएं। अपना आधार नंबर और मोबाइल नंबर डालें।", "tip": "मोबाइल नंबर वही डालें जो आधार से जुड़ा हो।"},
            {"title": "OTP डालें", "instruction": "आपके मोबाइल पर एक 6 अंकों का नंबर आएगा। उसे वेबसाइट पर डालें।", "tip": None},
            {"title": "फॉर्म भरें", "instruction": "अपना नाम, पता, बैंक खाता नंबर और IFSC कोड भरें। सभी जानकारी सही-सही भरें।", "tip": "बैंक पासबुक देखकर खाता नंबर और IFSC कोड भरें।"},
            {"title": "दस्तावेज़ अपलोड करें", "instruction": f"मांगे गए दस्तावेज़ की फोटो लें और अपलोड करें: {', '.join(req.documents[:3])}", "tip": "फोटो साफ और पूरी होनी चाहिए।"},
            {"title": "Submit करें", "instruction": "सब भरने के बाद 'Submit' बटन दबाएं। आपको एक Application Number मिलेगा — इसे सुरक्षित रखें।", "tip": "Application Number का screenshot लें या कागज़ पर लिख लें।"}
        ]

        fallback_en = [
            {"title": "Open the website", "instruction": f"Open {req.application_url} on your phone browser.", "tip": None},
            {"title": "Register yourself", "instruction": "Click 'New Registration'. Enter your Aadhaar number and mobile number.", "tip": "Use the mobile number linked to your Aadhaar."},
            {"title": "Enter OTP", "instruction": "You will receive a 6-digit OTP on your mobile. Enter it on the website.", "tip": None},
            {"title": "Fill the form", "instruction": "Enter your name, address, bank account number and IFSC code carefully.", "tip": "Check your bank passbook for account number and IFSC."},
            {"title": "Upload documents", "instruction": f"Take clear photos and upload: {', '.join(req.documents[:3])}", "tip": "Photos must be clear and complete."},
            {"title": "Submit application", "instruction": "Click Submit. You will receive an Application Number. Keep it safe.", "tip": "Take a screenshot of the Application Number."}
        ]
        return {"steps": fallback_hi if req.language == "hi" else fallback_en}

@app.get("/schemes/live/{category}")
def get_live_schemes(category: str):
    """
    Fetches live scheme data from MyScheme API.
    Falls back to local schemes.json if API unavailable.
    """
    import httpx
    try:
        res = httpx.get(
            f"https://api.myscheme.gov.in/search/v4/schemes",
            params={"q": category, "lang": "en"},
            timeout=5.0
        )
        if res.status_code == 200:
            return res.json()
    except:
        pass
    return {"schemes": [s for s in ALL_SCHEMES 
                        if s.get("category") == category]}

 


    
