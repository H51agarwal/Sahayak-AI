import LanguageSelector from "./LanguageSelector";

export default function Header({ language, onLanguageChange }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-saffron flex items-center justify-center text-white font-semibold text-sm">
            स
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">SahayakAI</p>
            <p className="text-xs text-india">
              {language === "en" ? "Government Scheme Navigator" : "सरकारी योजना सहायक"}
            </p>
          </div>
        </div>

        <button>
          <LanguageSelector selected={language} onChange={onLanguageChange} />
        </button>
        </div>
    </header>
  )
}