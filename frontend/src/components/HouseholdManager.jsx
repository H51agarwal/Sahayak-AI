import { useState } from "react"
import MemberForm from "./MemberForm"

export default function HouseholdManager({ language, members, onAddMember, onBack }) {
  const [showForm, setShowForm] = useState(false)

  // Get base profile from primary member for inheritance
  const baseProfile = {
    state: "Unknown", caste: "general",
    annual_income_inr: 100000, is_bpl: true,
    is_income_tax_payer: false, has_lpg_connection: false,
    documents_owned: []
  }

  const handleDone = (name, result) => {
    onAddMember(name, result)
    setShowForm(false)
  }

   return (
    <div className="pt-4">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-saffron text-sm">← Back</button>
        <h2 className="text-base font-semibold text-gray-900">
          {language === "en" ? "Your Household" : "आपका परिवार"}
        </h2>
      </div>

      {members.map((m, i) => (
        <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-saffron-light text-saffron flex items-center justify-center text-sm font-semibold">
              {m.name[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{m.name}</p>
              <p className="text-xs text-gray-500">
                {m.result.total_schemes_matched} schemes •
                ₹{m.result.total_annual_benefit_inr.toLocaleString("en-IN")}/yr
              </p>
            </div>
          </div>
            <span className="text-india text-xs font-medium">✓ Added</span>
        </div>
      ))}

       {showForm ? (
        <MemberForm
          language={language}
          baseProfile={baseProfile}
          onDone={handleDone}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mt-3 py-3 border-2 border-dashed border-saffron text-saffron rounded-2xl text-sm font-medium hover:bg-saffron-light transition-colors"
        >
          + {language === "en" ? "Add Family Member" : "परिवार का सदस्य जोड़ें"}
        </button>
      )}

      <button
        onClick={onBack}
        className="w-full mt-3 py-3 bg-india text-white rounded-2xl text-sm font-medium"
      >
        {language === "en" ? "View Combined Results →" : "संयुक्त परिणाम देखें →"}
      </button>
    </div>
  )
}