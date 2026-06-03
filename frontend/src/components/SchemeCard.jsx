const CATEGORY_COLORS = {
  agriculture: "bg-green-50 text-green-700 border-green-200",
  health: "bg-red-50 text-red-700 border-red-200",
  education: "bg-blue-50 text-blue-700 border-blue-200",
  housing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  women_child: "bg-pink-50 text-pink-700 border-pink-200",
  elderly: "bg-purple-50 text-purple-700 border-purple-200",
  financial_inclusion: "bg-indigo-50 text-indigo-700 border-indigo-200",
  employment: "bg-orange-50 text-orange-700 border-orange-200",
  entrepreneur: "bg-teal-50 text-teal-700 border-teal-200",
  disability: "bg-gray-50 text-gray-700 border-gray-200",
}

const CATEGORY_EMOJI = {
  agriculture: "🌾", health: "🏥", education: "🎓",
  housing: "🏠", women_child: "👩", elderly: "👴",
  financial_inclusion: "🏦", employment: "💼",
  entrepreneur: "🔧", disability: "♿",
}

export default function SchemeCard({ scheme, language }) {
  const colorClass = CATEGORY_COLORS[scheme.category] || "bg-gray-50 text-gray-700 border-gray-200"
  const emoji = CATEGORY_EMOJI[scheme.category] || "📋"
  const hasMissingDocs = scheme.documents_missing?.length > 0

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-3">

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{scheme.short_name}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{scheme.name}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-india font-bold text-base">
            ₹{scheme.annual_benefit_inr.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-400">{language === "en" ? "per year" : "प्रति वर्ष"}</p>
        </div>
      </div>
       
      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
        {language === "hi" ? scheme.benefit_summary_hi : scheme.benefit_summary}
      </p>

      {hasMissingDocs ? (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3">
          <p className="text-xs font-medium text-orange-700 mb-1">
            ⚠️ {language === "en" ? "Documents still needed:" : "ये दस्तावेज़ अभी चाहिए:"}
          </p>
          {scheme.documents_missing.map(doc => (
            <p key={doc} className="text-xs text-orange-600 flex items-center gap-1">
              <span>•</span> {doc}
            </p>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 mb-3">
          <p className="text-xs text-green-700 font-medium">
            ✅ {language === "en" ? "You have all required documents!" : "सभी दस्तावेज़ मौजूद हैं!"}
          </p>
        </div>
      )}

      <a
        href={scheme.application_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center py-2.5 bg-saffron text-white rounded-xl text-sm font-medium hover:bg-orange-500 transition-colors"
      >
        {language === "en" ? "Apply Now →" : "अभी आवेदन करें →"}
      </a>

    </div>
  )
}