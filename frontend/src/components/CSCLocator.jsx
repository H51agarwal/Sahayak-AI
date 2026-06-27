import { useState } from "react"

export default function CSCLocator({ scheme, language, onClose }) {
  const [status, setStatus] = useState("idle")
  const [coords, setCoords] = useState(null)
  const [mapUrl, setMapUrl] = useState("")

  const findCSC = () => {
    setStatus("locating")

    if (!navigator.geolocation) {
      setStatus("error")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ latitude, longitude })

        const query = encodeURIComponent("Common Service Centre CSC near me")
        const url = `https://www.google.com/maps/search/${query}/@${latitude},${longitude},14z`
        setMapUrl(url)
        setStatus("found")
      },
      (error) => {
        setStatus("error")
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const L = {
    title: language === "hi"
      ? "नजदीकी CSC केंद्र खोजें"
      : "Find Nearest CSC Centre",
    subtitle: language === "hi"
      ? "Common Service Centre (CSC) पर एक प्रशिक्षित ऑपरेटर आपके लिए मुफ्त में आवेदन करेगा।"
      : "A trained operator at a Common Service Centre (CSC) will apply on your behalf for free.",
    locating: language === "hi"
      ? "आपकी लोकेशन ढूंढी जा रही है..."
      : "Finding your location...",
    findBtn: language === "hi"
      ? "📍 मेरे नजदीकी CSC केंद्र खोजें"
      : "📍 Find CSC Centres Near Me",
    openMap: language === "hi"
      ? "🗺️ Google Maps पर खोलें"
      : "🗺️ Open in Google Maps",
    foundMsg: language === "hi"
      ? "आपके आस-पास के CSC केंद्र मिल गए। नीचे बटन दबाकर Google Maps पर देखें।"
      : "CSC centres near you found. Tap below to view on Google Maps.",
    errorMsg: language === "hi"
      ? "लोकेशन नहीं मिली। कृपया अपने फोन में लोकेशन चालू करें और दोबारा कोशिश करें।"
      : "Could not get location. Please enable location on your phone and try again.",
    altTitle: language === "hi"
      ? "या — CSC की वेबसाइट पर खोजें"
       : "Or — Search on CSC website",
    altBtn: language === "hi"
      ? "🌐 locator.csccloud.in पर जाएं"
      : "🌐 Go to locator.csccloud.in",
    whatToCarry: language === "hi"
      ? "CSC पर जाते समय ये लाएं:"
      : "What to carry to CSC:",
    close: language === "hi" ? "बंद करें" : "Close"
  }

   return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">

        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        <h3 className="text-base font-semibold text-gray-900 mb-1">{L.title}</h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{L.subtitle}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
          <p className="text-xs font-medium text-blue-800 mb-2">📁 {L.whatToCarry}</p>
          {scheme.documents_required.slice(0, 4).map(doc => (
            <p key={doc} className="text-xs text-blue-700 flex items-center gap-1">
              <span>•</span> {doc}
            </p>
          ))}
        </div>
         {status === "idle" && (
          <button
            onClick={findCSC}
            className="w-full py-3 bg-saffron text-white rounded-xl text-sm font-medium mb-3"
          >
            {L.findBtn}
          </button>
        )}
        {status === "locating" && (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">{L.locating}</p>
          </div>
        )}
         {status === "found" && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
              <p className="text-sm text-green-800">✅ {L.foundMsg}</p>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-india text-white rounded-xl text-sm font-medium text-center mb-3"
            >
              {L.openMap}
            </a>
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
            <p className="text-sm text-red-700">⚠️ {L.errorMsg}</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3 mt-2">
          <p className="text-xs text-gray-500 mb-2">{L.altTitle}</p>
          <a
            href="https://locator.csccloud.in"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm text-center mb-3"
          >
            {L.altBtn}
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-gray-400 text-sm"
        >
          {L.close}
        </button>

      </div>
    </div>
  )
}
