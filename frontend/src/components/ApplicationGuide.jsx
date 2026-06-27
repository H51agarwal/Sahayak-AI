import { useState, useEffect } from "react"
import axios from "axios"

const BASE_URL = "http://localhost:8000"

export default function ApplicationGuide({ scheme, language, onClose }) {
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    fetchGuide()
  }, [])

  const fetchGuide = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await axios.post(`${BASE_URL}/guide`, {
        scheme_id: scheme.id,
        scheme_name: scheme.name,
        language: language,
        application_url: scheme.application_url,
        documents: scheme.documents_required
      })
      setSteps(res.data.steps)
    } catch (e) {
      setError(true)
    }
    setLoading(false)
  }

   const L = {
    title: language === "hi"
      ? `${scheme.short_name} के लिए आवेदन कैसे करें`
      : `How to apply for ${scheme.short_name}`,
    loading: language === "hi"
      ? "आपके लिए गाइड तैयार की जा रही है..."
      : "Preparing your personalised guide...",
    error: language === "hi"
      ? "गाइड लोड नहीं हुई। दोबारा कोशिश करें।"
      : "Could not load guide. Please try again.",
    retry: language === "hi" ? "दोबारा कोशिश करें" : "Try again",
    prev: language === "hi" ? "← पिछला" : "← Previous",
    next: language === "hi" ? "अगला →" : "Next →",
    done: language === "hi" ? "✓ समाप्त" : "✓ Done",
    step: language === "hi" ? "चरण" : "Step",
    of: language === "hi" ? "में से" : "of",
    applyNow: language === "hi" ? "🌐 अभी आवेदन करें" : "🌐 Apply Now",
    close: language === "hi" ? "बंद करें" : "Close"
  }

   return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] flex flex-col">
         <div className="p-5 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex-1 pr-4">{L.title}</h3>
            <button onClick={onClose} className="text-gray-400 text-xl leading-none">×</button>
          </div>
          {!loading && steps.length > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{L.step} {currentStep + 1} {L.of} {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div
                  className="h-1.5 bg-saffron rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {loading && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">{L.loading}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 mb-4">{L.error}</p>
              <button
                onClick={fetchGuide}
                className="px-6 py-2 bg-saffron text-white rounded-xl text-sm"
              >
                {L.retry}
              </button>
            </div>
          )}

           {!loading && !error && steps.length > 0 && (
            <div>
              <div className="bg-saffron-light border border-orange-200 rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-saffron text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {currentStep + 1}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {steps[currentStep]?.title}
                  </p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {steps[currentStep]?.instruction}
                </p>
                {steps[currentStep]?.tip && (
                  <div className="mt-3 bg-white rounded-xl p-3 border border-orange-200">
                    <p className="text-xs text-orange-700">
                      💡 {steps[currentStep].tip}
                    </p>
                  </div>
                )}
            </div>

            <div className="space-y-1">
                {steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors
                      ${i === currentStep
                        ? "bg-saffron text-white"
                        : i < currentStep
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-50 text-gray-600"
                      }`}
                  >
                    <span className="text-xs font-bold w-5 flex-shrink-0">
                      {i < currentStep ? "✓" : i + 1}
                    </span>
                    <span className="text-xs">{step.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!loading && !error && steps.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm"
              >
                {L.prev}
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 py-2.5 bg-saffron text-white rounded-xl text-sm font-medium"
              >
                {L.next}
              </button>
            ) : (
                 <a
                href={scheme.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-india text-white rounded-xl text-sm font-medium text-center"
              >
                {L.applyNow}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

