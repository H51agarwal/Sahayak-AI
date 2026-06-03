import { useState, useMemo } from "react"

const DOC_INFO = {
  "Aadhaar Card": { where: "Nearest Aadhaar Enrolment Centre or uidai.gov.in", days: "7–10 days" },
  "BPL Ration Card": { where: "Food & Civil Supplies office or tehsil", days: "15–30 days" },
  "Bank passbook (with IFSC code)": { where: "Any bank branch — free Jan Dhan account", days: "Same day" },
  "Caste certificate": { where: "Nearest tehsil or SDM office", days: "7–15 days" },
  "Income certificate": { where: "Nearest tehsil or Jansuvidha Kendra", days: "7–15 days" },
  "Land ownership records (Khasra / Khatauni)": { where: "Tehsil/patwari or state Bhulekh portal", days: "Same day online" },
  "Disability certificate (UDID card)": { where: "swavlambancard.gov.in or DDRC", days: "15–30 days" },
  "Voter ID Card": { where: "nvsp.in or nearest ERO office", days: "15–30 days" },
  "PAN Card": { where: "incometax.gov.in or NSDL centre", days: "7–15 days" },
  "Death certificate of husband": { where: "Municipal office or gram panchayat", days: "3–7 days" },
  "Birth certificate of child": { where: "Municipal office or gram panchayat", days: "3–7 days" },
  "Passport-size photo": { where: "Any photo studio", days: "Same day" },
  "Mobile number linked to Aadhaar": { where: "Aadhaar centre or uidai.gov.in", days: "Same day" },
}

export default function DocumentChecker({ language, combinedResult, onBack }) {
  
  const allDocs = useMemo(() => {
    const docSet = new Set()
    combinedResult.schemes.forEach(s => {
      s.documents_required.forEach(d => docSet.add(d))
    })
    return [...docSet]
  }, [combinedResult])

  const [checked, setChecked] = useState(new Set())

  const toggle = (doc) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(doc) ? next.delete(doc) : next.add(doc)
      return next
    })
  }

  const missing = allDocs.filter(d => !checked.has(d))
  const ready = allDocs.filter(d => checked.has(d))
  const pct = Math.round((ready.length / allDocs.length) * 100)

  const readySchemes = combinedResult.schemes.filter(s =>
    s.documents_required.every(d => checked.has(d))
  )

  return (
    <div className="pt-4">

      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-saffron text-sm">← Back</button>
        <h2 className="text-base font-semibold text-gray-900">
          {language === "en" ? "Document Readiness" : "दस्तावेज़ तैयारी"}
        </h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">
            {language === "en" ? "Documents ready" : "दस्तावेज़ तैयार"}
          </span>
          <span className="font-semibold text-india">{ready.length}/{allDocs.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-india rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>

        {readySchemes.length > 0 && (
          <p className="text-xs text-india mt-2">
            ✅ {readySchemes.length} {language === "en"
              ? "schemes you can apply for RIGHT NOW"
              : "योजनाएं जिनके लिए आप अभी आवेदन कर सकते हैं"}
          </p>
        )}
      </div>

       <p className="text-xs text-gray-500 mb-3">
        {language === "en"
          ? "Tick the documents you already have:"
          : "जो दस्तावेज़ आपके पास हैं उन पर टिक करें:"}
      </p>

      {allDocs.map(doc => {
        const isChecked = checked.has(doc)
        const info = DOC_INFO[doc]
        return (
          <div
            key={doc}
            onClick={() => toggle(doc)}
            className={`flex items-start gap-3 p-3 rounded-xl mb-2 cursor-pointer border transition-all
              ${isChecked
                ? "bg-india-light border-india"
                : "bg-white border-gray-200 hover:border-saffron"
              }`}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5
              ${isChecked ? "bg-india" : "border-2 border-gray-300"}`}>
              {isChecked && <span className="text-white text-xs">✓</span>}
            </div>

             <div className="flex-1">
              <p className="text-sm text-gray-800">{doc}</p>
              {!isChecked && info && (
                <p className="text-xs text-orange-600 mt-0.5">
                  📍 {info.where} — {info.days}
                </p>
              )}
            </div>
          </div>
        )
      })}

      {missing.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mt-4">
          <p className="text-sm font-medium text-orange-800 mb-2">
            ⚠️ {language === "en"
              ? `${missing.length} documents still needed:`
              : `${missing.length} दस्तावेज़ अभी चाहिए:`}
          </p>
          {missing.map(doc => (
            <p key={doc} className="text-xs text-orange-700 mb-1">• {doc}</p>
          ))}
        </div>
      )}

      {missing.length === 0 && allDocs.length > 0 && (
        <div className="bg-india-light border border-india rounded-2xl p-4 mt-4 text-center">
          <p className="text-sm font-medium text-india">
            🎉 {language === "en"
              ? "You have all documents! You can apply for all schemes right now."
              : "सभी दस्तावेज़ मौजूद हैं! आप अभी सभी योजनाओं के लिए आवेदन कर सकते हैं।"}
          </p>
        </div>
      )}

    </div>
  )
}


