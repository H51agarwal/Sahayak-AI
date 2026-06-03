from engine import match_schemes
from models import UserProfile

ramesh = UserProfile(
    age=62,
    gender="male",
    state="Rajasthan",
    caste="SC",
    annual_income_inr=60000,
    is_bpl=True,
    occupation=["farmer"],
    owns_land=True,
    is_income_tax_payer=False,
    is_government_employee=False,
    documents_owned=["Aadhaar Card", "BPL Ration Card"]
)

result = match_schemes(ramesh)
print(f"\n👨‍🌾 PERSONA 1: Ramesh (BPL farmer, 62, Rajasthan, SC)")
print(f"Matched: {result.total_schemes_matched} schemes")
print(f"Total annual benefit: ₹{result.total_annual_benefit_inr:,}")
print("Schemes:")
for s in result.schemes:
    missing = f" | Missing docs: {s.documents_missing}" if s.documents_missing else " | Docs: ✅ all ready"
    print(f"  ✓ {s.short_name} — ₹{s.annual_benefit_inr:,}/yr{missing}")

sunita = UserProfile(
    age=28,
    gender="female",
    state="Uttar Pradesh",
    caste="OBC",
    annual_income_inr=45000,
    is_bpl=True,
    occupation=["daily_wage"],
    is_widow=True,
    is_pregnant=True,
    has_lpg_connection=False,
    owns_land=False,
    documents_owned=["Aadhaar Card"]
)

result = match_schemes(sunita)
print(f"\n👩 PERSONA 2: Sunita (BPL widow, 28, UP, pregnant)")
print(f"Matched: {result.total_schemes_matched} schemes")
print(f"Total annual benefit: ₹{result.total_annual_benefit_inr:,}")
for s in result.schemes:
    missing = f" | Missing: {s.documents_missing}" if s.documents_missing else " | Docs: ✅"
    print(f"  ✓ {s.short_name}{missing}")

arjun = UserProfile(
    age=20,
    gender="male",
    state="Maharashtra",
    caste="SC",
    annual_income_inr=180000,
    is_bpl=False,
    occupation=["student"],
    is_student=True,
    documents_owned=["Aadhaar Card", "Caste certificate"]
)

result = match_schemes(arjun)
print(f"\n🎓 PERSONA 3: Arjun (SC student, 20, Maharashtra)")
print(f"Matched: {result.total_schemes_matched} schemes")
print(f"Total annual benefit: ₹{result.total_annual_benefit_inr:,}")
for s in result.schemes:
    print(f"  ✓ {s.short_name}")

vikram = UserProfile(
    age=40,
    gender="male",
    state="Delhi",
    caste="general",
    annual_income_inr=900000,
    is_bpl=False,
    occupation=["government_employee"],
    is_government_employee=True,
    is_income_tax_payer=True,
    has_lpg_connection=True,
    documents_owned=["Aadhaar Card"]
)

result = match_schemes(vikram)
print(f"\n👔 PERSONA 4: Vikram (Govt employee, income tax payer)")
print(f"Matched: {result.total_schemes_matched} schemes (should be 0 or very few)")
for s in result.schemes:
    print(f"  ✓ {s.short_name}")

meera = UserProfile(
    age=35,
    gender="female",
    state="Gujarat",
    caste="OBC",
    annual_income_inr=150000,
    is_bpl=True,
    occupation=["entrepreneur", "artisan"],
    has_daughters=True,
    has_lpg_connection=False,
    documents_owned=["Aadhaar Card", "BPL Ration Card", "Bank passbook (with IFSC code)"]
)

result = match_schemes(meera)
print(f"\n🧑‍🎨 PERSONA 5: Meera (artisan/vendor, 35, Gujarat, OBC)")
print(f"Matched: {result.total_schemes_matched} schemes")
print(f"Total annual benefit: ₹{result.total_annual_benefit_inr:,}")
for s in result.schemes:
    missing = f" | Missing docs: {s.documents_missing}" if s.documents_missing else " | ✅"
    print(f"  ✓ {s.short_name} — ₹{s.annual_benefit_inr:,}/yr{missing}")