import SchemeCard from "./SchemeCard"

export default function SchemeResults({ results, language, onRestart, onAddMember, onCheckDocuments }) {
  if (!results) return null

  return (
    <div className="pt-4">

      <div className="bg-gradient-to-r from-saffron to-orange-400 rounded-2xl p-5 text-white mb-5 text-center shadow-md">
        <p className="text-sm opacity-90 mb-1">
          {language === "en" ? "Your total annual benefit" : "आपका कुल वार्षिक लाभ"}
        </p>
        <p className="text-4xl font-bold">
          ₹{results.total_annual_benefit_inr.toLocaleString("en-IN")}
        </p>
        <p className="text-sm opacity-90 mt-1">
          {language === "en"
            ? `Across ${results.total_schemes_matched} schemes you qualify for`
            : `${results.total_schemes_matched} योजनाओं में आप पात्र हैं`}
        </p>
      </div>

      {results.schemes.map(scheme => (
        <SchemeCard
          key={scheme.id}
          scheme={scheme}
          language={language}
        />
      ))}

      <div className="mt-4 flex flex-col gap-3">

        <button
          onClick={onAddMember}
          className="w-full py-3 bg-india text-white rounded-2xl text-sm font-medium hover:bg-green-800 transition-colors"
        >
          👨‍👩‍👧 {language === "en" ? "Add Family Member" : "परिवार का सदस्य जोड़ें"}
        </button>

        <button
          onClick={onCheckDocuments}
          className="w-full py-3 bg-navy text-white rounded-2xl text-sm font-medium hover:bg-blue-900 transition-colors"
        >
          📋 {language === "en" ? "Check Document Readiness" : "दस्तावेज़ तैयारी जांचें"}
        </button>

        <button
          onClick={onRestart}
          className="w-full py-3 border-2 border-gray-300 text-gray-500 rounded-2xl text-sm font-medium hover:border-saffron hover:text-saffron transition-colors"
        >
          🔄 {language === "en" ? "Check for someone else" : "किसी और के लिए जांचें"}
        </button>

      </div>

    </div>
  )
}