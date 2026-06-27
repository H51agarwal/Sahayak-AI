const LANGUAGES = [
  { code: "hi", label: "हिंदी", english: "Hindi" },
  { code: "en", label: "English", english: "English" },
  { code: "mr", label: "मराठी", english: "Marathi" },
  { code: "bn", label: "বাংলা", english: "Bengali" },
  { code: "ta", label: "தமிழ்", english: "Tamil" },
  { code: "te", label: "తెలుగు", english: "Telugu" },
  { code: "gu", label: "ગુજરાતી", english: "Gujarati" },
  { code: "kn", label: "ಕನ್ನಡ", english: "Kannada" },
  { code: "pa", label: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "or", label: "ଓଡ଼ିଆ", english: "Odia" },
]

function LanguageSelector({ selected, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="lang-select"
        className="text-xs text-gray-500 whitespace-nowrap font-medium"
      >
        🌐 {selected === "hi" ? "भाषा चुनें:" : "Select Language:"}
      </label>
      <select
        id="lang-select"
        value={selected}
        onChange={e => onChange(e.target.value)}
        className="text-sm border border-saffron rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-saffron"
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>
            {l.label} ({l.english})
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSelector;