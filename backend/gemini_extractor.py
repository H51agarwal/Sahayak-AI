from google import genai
import json
import os

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

EXTRACT_PROMPT = """
You are a helpful assistant for a government scheme eligibility chatbot in India.

Extract structured information from the user's message and return ONLY a JSON object.
The user may write in Hindi, English, or a mix of both (Hinglish).

Return this exact JSON structure (use null for anything not mentioned):
{
  "age": <number or null>,
  "gender": <"male"/"female"/"other" or null>,
  "state": <Indian state name in English or null>,
  "occupation": <list from: "farmer","student","daily_wage","entrepreneur","government_employee","artisan","unemployed" or null>,
  "annual_income_inr": <number or null>,
  "is_bpl": <true/false or null>,
  "owns_land": <true/false or null>,
  "is_widow": <true/false or null>,
  "is_pregnant": <true/false or null>,
  "has_daughters": <true/false or null>,
  "is_disabled": <true/false or null>,
  "caste": <"SC"/"ST"/"OBC"/"general"/"minority" or null>,
  "has_lpg_connection": <true/false or null>,
  "is_government_employee": <true/false or null>,
  "is_income_tax_payer": <true/false or null>,
  "language_detected": <"hi" or "en">
}

Examples:
User: "main 62 saal ka kisan hoon rajasthan se, mere paas zameen hai"
Output: {"age": 62, "occupation": ["farmer"], "state": "Rajasthan", "owns_land": true, "language_detected": "hi"}

User: "I am a 28-year-old BPL widow from UP, I am pregnant"
Output: {"age": 28, "is_bpl": true, "is_widow": true, "is_pregnant": true, "state": "Uttar Pradesh", "language_detected": "en"}

User: "I am a 62 year old farmer from Rajasthan"
Output: {"age": 62, "occupation": ["farmer"], "state": "Rajasthan", "language_detected": "en"}

User message: {USER_MESSAGE}
Return ONLY the JSON object. No explanation. No markdown backticks.
"""

def extract_profile_from_text(user_message: str) -> dict:
    prompt = EXTRACT_PROMPT.replace("{USER_MESSAGE}", user_message)
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        extracted = json.loads(text)
        return {k: v for k, v in extracted.items() if v is not None}
    except Exception as e:
        print(f"Gemini extraction error: {e}")
        return {}


def generate_scheme_explanation(scheme: dict, language: str = "en") -> str:
    prompt = f"""
Explain this government scheme in {'Hindi' if language == 'hi' else 'English'}.
Simple language, Class 5 reading level. Under 4 sentences.
What they get, key documents, first step to apply.

Scheme: {scheme['name']}
Benefit: {scheme['benefit_summary']}
Documents: {', '.join(scheme['documents_required'][:3])}
Apply at: {scheme['application_url']}
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text.strip()
    except:
        return scheme['benefit_summary_hi'] if language == 'hi' else scheme['benefit_summary']