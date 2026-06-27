import { useState } from "react"
import CSCLocator from "./CSCLocator"
import VoiceGuide from "./VoiceGuide"

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

const getImpactLine = (schemeId, language) => {
  const lines = {
    "PM_KISAN": {
      en: "💰 ₹2,000 deposited in your bank — 3 times a year. No office visit needed.",
      hi: "💰 साल में 3 बार ₹2,000 सीधे बैंक में। कोई दफ्तर जाने की जरूरत नहीं।"
    },
    "AYUSHMAN_BHARAT": {
      en: "🏥 Your entire family is covered for ₹5 lakh in hospital bills — completely free.",
      hi: "🏥 पूरे परिवार का ₹5 लाख तक का इलाज मुफ्त। एक भी पैसा नहीं लगेगा।"
    },
    "UJJWALA": {
      en: "🔥 Free LPG connection — saves you approximately ₹1,800/year vs firewood.",
      hi: "🔥 मुफ्त गैस कनेक्शन — लकड़ी की तुलना में सालाना ₹1,800 की बचत।"
    },
    "MGNREGA": {
      en: "👷 100 days of guaranteed work = ₹22,100+ directly in your bank this year.",
      hi: "👷 100 दिन काम की गारंटी = इस साल ₹22,100+ सीधे बैंक में।"
    },
    "PM_AWAS_GRAMIN": {
      en: "🏠 ₹1.2 lakh grant to build your permanent home — paid in instalments.",
      hi: "🏠 पक्का घर बनाने के लिए ₹1.2 लाख की सहायता — किश्तों में मिलती है।"
    },
    "PMJJBY": {
      en: "🛡️ Just ₹436/year gives your family ₹2 lakh if something happens to you.",
      hi: "🛡️ सिर्फ ₹436/साल में परिवार को ₹2 लाख की सुरक्षा।"
    },
    "PMSBY": {
      en: "⚡ ₹20/year — the cheapest accident insurance in India. ₹2 lakh coverage.",
      hi: "⚡ मात्र ₹20/साल — ₹2 लाख का दुर्घटना बीमा। भारत का सबसे सस्ता बीमा।"
    },
    "PM_MUDRA": {
      en: "🏪 Loan up to ₹10 lakh with zero collateral to start or grow your business.",
      hi: "🏪 बिना किसी जमानत के ₹10 लाख तक का लोन। व्यवसाय शुरू करें।"
    },
    "NSP_SCHOLARSHIP": {
      en: "🎓 Scholarship money goes directly to your bank — no middleman, no delay.",
      hi: "🎓 छात्रवृत्ति सीधे बैंक में — कोई बिचौलिया नहीं, कोई देरी नहीं।"
    },
    "SUKANYA_SAMRIDDHI": {
      en: "👧 ₹1,000/month saved now = ₹5+ lakh for your daughter at age 21. Tax free.",
      hi: "👧 अभी ₹1,000/माह बचाएं = बेटी के 21 साल पर ₹5+ लाख। टैक्स फ्री।"
    },
  }

  const line = lines[schemeId]
  if (!line) return null
  return language === "hi" ? line.hi : line.en
}

export default function SchemeCard({ scheme, language }) {
  const colorClass = CATEGORY_COLORS[scheme.category] || "bg-gray-50 text-gray-700 border-gray-200"
  const emoji = CATEGORY_EMOJI[scheme.category] || "📋"
  const hasMissingDocs = scheme.documents_missing?.length > 0
  const [showCSC, setShowCSC] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

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

      {getImpactLine(scheme.id, language) && (
        <div className="bg-saffron-light border border-orange-200 rounded-xl px-3 py-2 mb-3">
          <p className="text-xs text-orange-800 font-medium leading-relaxed">
            {getImpactLine(scheme.id, language)}
          </p>
        </div>
      )}

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

      <button
        onClick={() => setShowGuide(true)}
        className="w-full py-2.5 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors mb-2"
      >
        🤝 {language === "en"
          ? "Voice Helper - How to apply step by step"
          : "आवाज़ सहायक — पूरी जानकारी सुनें"}
      </button>

      <button
        onClick={() => setShowCSC(true)}
        className="w-full py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:border-saffron hover:text-saffron transition-colors"
      >
       📍 {language === "en"
          ? "Can't apply online? Find nearest help centre"
          : "ऑनलाइन नहीं कर सकते? नजदीकी सहायता केंद्र खोजें"}
      </button>

      {showCSC && (
        <CSCLocator
          scheme={scheme}
          language={language}
          onClose={() => setShowCSC(false)}
        />
      )}
      {showGuide && (
        <VoiceGuide
          scheme={scheme}
          language={language}
          onClose={() => setShowGuide(false)}
        />
      )}
    </div>
  )
}