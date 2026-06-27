from models import UserProfile
from typing import List, Optional, Dict
from dataclasses import dataclass, field

INCOME_MAP = {
    "below ₹1 lakh": 60000,
    "₹1–2.5 lakh": 175000,
    "₹2.5–5 lakh": 375000,
    "₹5–8 lakh": 650000,
    "above ₹8 lakh": 1000000,
}

AGE_MAP = {
    "under 18": 15,
    "18–30": 24,
    "31–45": 38,
    "46–60": 53,
    "above 60": 65,
}

ALL_QUESTIONS = [
    "state", "age", "gender", "occupation",
    "land", "income", "women_situations",
    "special_situations", "caste", "documents"
]

QUESTIONS = {
    "state": {
        "en": "Which state do you live in?",
        "hi": "आप किस राज्य में रहते हैं?",
        "type": "text"
    },
    "age": {
        "en": "How old are you?",
        "hi": "आपकी उम्र कितनी है?",
        "type": "choice",
        "options": ["Under 18", "18–30", "31–45", "46–60", "Above 60"],
        "options_hi": ["18 से कम", "18–30", "31–45", "46–60", "60 से ज़्यादा"]
    },
    "gender": {
        "en": "What is your gender?",
        "hi": "आपका लिंग क्या है?",
        "type": "choice",
        "options": ["Male", "Female", "Other"],
        "options_hi": ["पुरुष", "महिला", "अन्य"]
    },
    "occupation": {
        "en": "What is your main occupation? (Select all that apply)",
        "hi": "आपका मुख्य काम क्या है? (सभी जो लागू हों चुनें)",
        "type": "multi_choice",
        "options": ["Farmer", "Student", "Daily wage worker", 
                    "Small business owner", "Government employee",
                    "Artisan/craftsperson", "Homemaker", "Unemployed"],
        "options_hi": ["किसान", "छात्र", "दिहाड़ी मजदूर",
                       "छोटा व्यवसायी", "सरकारी कर्मचारी",
                       "कारीगर", "गृहिणी", "बेरोजगार"]
    },
    "land": {
        "en": "Do you own agricultural land in your name?",
        "hi": "क्या आपके नाम पर खेती की ज़मीन है?",
        "type": "choice",
        "options": ["Yes", "No, I lease land", "No land at all"],
        "options_hi": ["हाँ", "नहीं, पट्टे पर है", "ज़मीन नहीं है"]
    },
     "income": {
        "en": "What is your approximate annual family income?",
        "hi": "आपके परिवार की सालाना आमदनी लगभग कितनी है?",
        "type": "choice",
        "options": ["Below ₹1 lakh", "₹1–2.5 lakh", "₹2.5–5 lakh",
                    "₹5–8 lakh", "Above ₹8 lakh"],
        "options_hi": ["₹1 लाख से कम", "₹1–2.5 लाख", "₹2.5–5 लाख",
                       "₹5–8 लाख", "₹8 लाख से ज़्यादा"]
    },
    "women_situations": {
        "en": "Do any of these apply to you? (Select all that apply)",
        "hi": "क्या इनमें से कोई बात आप पर लागू होती है?",
        "type": "multi_choice",
        "options": ["I am pregnant", "I am a widow",
                    "I have a daughter under 10", "None of these"],
        "options_hi": ["मैं गर्भवती हूँ", "मैं विधवा हूँ",
                       "10 साल से छोटी बेटी है", "इनमें से कोई नहीं"]
    },
     "special_situations": {
        "en": "Do any of these apply to you or your family?",
        "hi": "क्या आप या परिवार में कोई ऐसी स्थिति है?",
        "type": "multi_choice",
        "options": ["I have a disability (80%+)", "No pucca house",
                    "No LPG gas connection", "Parent was in CRPF/BSF/CISF/RPF",
                    "Want to start a business", "None"],
        "options_hi": ["विकलांगता 80%+ है", "पक्का मकान नहीं है",
                       "घर में गैस नहीं है", "माता-पिता CAPF/RPF में थे",
                       "व्यवसाय शुरू करना है", "कोई नहीं"]
    },
    "caste": {
        "en": "What is your caste category?",
        "hi": "आप किस जाति वर्ग से हैं?",
        "type": "choice",
        "options": ["SC", "ST", "OBC", "General", "Minority"],
        "options_hi": ["SC", "ST", "OBC", "सामान्य", "अल्पसंख्यक"]
    },
     "documents": {
        "en": "Which documents do you currently have? (Select all that apply)",
        "hi": "इनमें से कौन से दस्तावेज़ अभी आपके पास हैं?",
        "type": "multi_choice",
        "options": ["Aadhaar Card", "BPL Ration Card", "Bank passbook (with IFSC code)",
                    "Caste certificate", "Income certificate",
                    "Voter ID Card", "Land ownership records (Khasra / Khatauni)",
                    "Disability certificate (UDID card)"],
        "options_hi": ["आधार कार्ड", "BPL राशन कार्ड", "बैंक पासबुक",
                       "जाति प्रमाण पत्र", "आय प्रमाण पत्र",
                       "मतदाता पहचान पत्र", "ज़मीन के कागज़", "विकलांगता प्रमाण पत्र"]
    }
}

@dataclass
class ConversationState:
    answers: Dict = field(default_factory=dict)
    questions_to_skip: List[str] = field(default_factory=list)
    language: str = "en"
    base_lang: str= "en"
    is_complete: bool = False

    def get_next_question(self) -> Optional[str]:
        """Returns the ID of the next unanswered, non-skipped question."""
        for q in ALL_QUESTIONS:
            if q not in self.answers and q not in self.questions_to_skip:
                return q
        self.is_complete = True
        return None

    def process_answer(self, question_id: str, answer) -> None:
        """Save answer and update skip list based on branching rules."""
        self.answers[question_id] = answer

        if question_id == "gender":
            if answer.lower() in ["male", "पुरुष", "m"]:
                self.questions_to_skip.append("women_situations")

        if question_id == "occupation":
            occ_lower = [o.lower() for o in answer] if isinstance(answer, list) else [answer.lower()]
            if not any("farmer" in o or "किसान" in o for o in occ_lower):
                self.questions_to_skip.append("land")

        if question_id == "income":
            if "above ₹8" in answer.lower() or "8 लाख से" in answer:
                self.answers["is_income_tax_payer"] = True

    def build_user_profile(self) -> UserProfile:
        """Convert collected answers into a UserProfile for the engine."""
        a = self.answers

        occ_map = {
            "farmer": "farmer", "किसान": "farmer",
            "student": "student", "छात्र": "student",
            "daily wage worker": "daily_wage", "दिहाड़ी मजदूर": "daily_wage",
            "small business owner": "entrepreneur", "छोटा व्यवसायी": "entrepreneur",
            "government employee": "government_employee", "सरकारी कर्मचारी": "government_employee",
            "artisan/craftsperson": "artisan", "कारीगर": "artisan",
            "homemaker": "daily_wage", "गृहिणी": "daily_wage",
            "unemployed": "unemployed", "बेरोजगार": "unemployed",
        }
        raw_occ = a.get("occupation", ["daily_wage"])
        if isinstance(raw_occ, str): raw_occ = [raw_occ]
        occupation = [occ_map.get(o.lower(), "daily_wage") for o in raw_occ]

        raw_age = a.get("age", "31–45")
        age = AGE_MAP.get(raw_age.lower(), 38) if isinstance(raw_age, str) else raw_age

        raw_income = a.get("income", "₹1–2.5 lakh")
        income = INCOME_MAP.get(raw_income.lower(), 175000)

        women = a.get("women_situations", [])
        if isinstance(women, str): women = [women]

        special = a.get("special_situations", [])
        if isinstance(special, str): special = [special]

        caste_map = {"sc": "SC", "st": "ST", "obc": "OBC",
                     "general": "general", "सामान्य": "general",
                     "minority": "minority", "अल्पसंख्यक": "minority"}
        caste = caste_map.get(a.get("caste", "general").lower(), "general")

        return UserProfile(
            age=age,
            gender=a.get("gender", "male").lower(),
            state=a.get("state", "Unknown"),
            caste=caste,
            annual_income_inr=income,
            is_bpl=a.get("is_bpl", income < 100000),
            occupation=occupation,
            is_student="student" in occupation,
            is_disabled="disability" in " ".join(special).lower(),
            is_widow="widow" in " ".join(women).lower() or "विधवा" in " ".join(women),
            is_pregnant="pregnant" in " ".join(women).lower() or "गर्भवती" in " ".join(women),
            has_daughters="daughter" in " ".join(women).lower() or "बेटी" in " ".join(women),
            owns_land=a.get("land", "no").lower() == "yes" or "हाँ" in a.get("land", ""),
            has_lpg_connection="no lpg" not in " ".join(special).lower() and "गैस नहीं" not in " ".join(special),
            is_income_tax_payer=a.get("is_income_tax_payer", False),
            is_government_employee="government_employee" in occupation,
            documents_owned=a.get("documents", []) if isinstance(a.get("documents", []), list) else [a.get("documents", "")]
        )