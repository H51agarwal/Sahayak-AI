import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"

const BASE_URL = "http://localhost:8000"

const SPEECH_LANG_MAP = {
  hi: "hi-IN", en: "en-IN", mr: "mr-IN",
  bn: "bn-IN", ta: "ta-IN", te: "te-IN",
  gu: "gu-IN", kn: "kn-IN", pa: "pa-IN", or: "or-IN"
}

const NEXT_COMMANDS = [
  "अगला", "next", "आगे", "हाँ", "han", "ok", "okay",
  "agla", "aage", "pudhe", "munde", "munne", "அடுத்து", "తర్వాత"
]
const PREV_COMMANDS = [
  "पीछे", "back", "पिछला", "wapas", "maghe", "peeche"
]
const STOP_COMMANDS = [
  "रोको", "stop", "बंद", "ruko", "band", "pause"   
]
const REPEAT_COMMANDS = [
  "दोबारा", "repeat", "फिर से", "dobara", "phir"
]

export default function VoiceGuide({ scheme, language, onClose }) {
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState("")
  const [showSubSteps, setShowSubSteps] = useState(false)
  const recognitionRef = useRef(null)
  const stepsRef = useRef(steps)
  const currentStepRef = useRef(currentStep)

  useEffect(() => { stepsRef.current = steps }, [steps])
  useEffect(() => { currentStepRef.current = currentStep }, [currentStep])

  useEffect(() => {
    fetchGuide()
    return () => {
      window.speechSynthesis.cancel()
      if (recognitionRef.current) recognitionRef.current.stop()
    }
  }, [])

  const fetchGuide = async () => {
    setLoading(true); setError(false)
    try {
      const res = await axios.post(`${BASE_URL}/guide`, {
        scheme_id: scheme.id,
        scheme_name: scheme.name,
        language,
        application_url: scheme.application_url,
        documents: scheme.documents_required
      })
      setSteps(res.data.steps)
      setLoading(false)
    
      setTimeout(() => speakStep(res.data.steps, 0), 800)
    } catch {
      setError(true); setLoading(false)
    }
  }

  const speakStep = (stepsArr, idx) => {
    window.speechSynthesis.cancel()
    const step = stepsArr[idx]
    if (!step) return
    const text = step.voice_script || step.display_text || step.title
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = SPEECH_LANG_MAP[language] || "hi-IN"
    utterance.rate = 0.85   
    utterance.pitch = 1.1  
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      startListening()  
    }
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const goToStep = useCallback((idx) => {
    const s = stepsRef.current
    if (idx < 0 || idx >= s.length) return
    setCurrentStep(idx)
    setShowSubSteps(false)
    speakStep(s, idx)
  }, [language])

  const startListening = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) return

    const rec = new SpeechRec()
    rec.lang = SPEECH_LANG_MAP[language] || "hi-IN"
    rec.continuous = false
    rec.interimResults = false
    recognitionRef.current = rec

    rec.onstart = () => {
      setIsListening(true)
      setVoiceStatus(language === "hi" ? "सुन रहा हूँ..." : "Listening...")
    }

     rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase().trim()
      setVoiceStatus(`"${transcript}"`)
      setIsListening(false)

      const cur = currentStepRef.current
      const total = stepsRef.current.length

      if (NEXT_COMMANDS.some(c => transcript.includes(c.toLowerCase()))) {
        if (cur < total - 1) goToStep(cur + 1)
      } else if (PREV_COMMANDS.some(c => transcript.includes(c.toLowerCase()))) {
        if (cur > 0) goToStep(cur - 1)
      } else if (STOP_COMMANDS.some(c => transcript.includes(c.toLowerCase()))) {
        stopSpeaking()
        setVoiceStatus(language === "hi" ? "रुक गया" : "Stopped")
      } else if (REPEAT_COMMANDS.some(c => transcript.includes(c.toLowerCase()))) {
        speakStep(stepsRef.current, cur)
      }
    }

     rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)
    rec.start()
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      stopSpeaking()
      startListening()
    }
  }

   const step = steps[currentStep]
  const pct = steps.length ? Math.round(((currentStep + 1) / steps.length) * 100) : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] flex flex-col">

        <div className="p-5 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"/>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                🤝 {language === "hi" ? "सहायक मित्र" : "Your Helper Friend"}
              </h3>
              <p className="text-xs text-gray-500">{scheme.short_name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
          </div>

          {!loading && steps.length > 0 && (
            <>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{language === "hi" ? "चरण" : "Step"} {currentStep + 1} / {steps.length}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-saffron rounded-full transition-all duration-500"
                  style={{width:`${pct}%`}}/>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
              <p className="text-sm text-gray-600">
                {language === "hi" ? "आपके लिए गाइड तैयार हो रही है..." : "Preparing your guide..."}
              </p>
            </div>
             )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">
                {language === "hi" ? "गाइड नहीं मिली। दोबारा कोशिश करें।" : "Could not load. Try again."}
              </p>
              <button onClick={fetchGuide}
                className="px-6 py-2 bg-saffron text-white rounded-xl text-sm">
                {language === "hi" ? "दोबारा कोशिश करें" : "Retry"}
              </button>
            </div>
          )}

          {!loading && !error && step && (
            <div>
              {isSpeaking && (
                <div className="flex items-center gap-2 mb-3 text-saffron">
                  <div className="flex gap-0.5 items-end h-5">
                    {[1,2,3,4,3].map((h,i) => (
                      <div key={i}
                        className="w-1 bg-saffron rounded-full animate-bounce"
                        style={{height:`${h*4}px`, animationDelay:`${i*100}ms`}}/>
                    ))}
                  </div>
                  <span className="text-xs">
                    {language === "hi" ? "बोल रहा हूँ..." : "Speaking..."}
                  </span>
                </div>
              )}
              <div className="bg-saffron-light border-2 border-saffron rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-saffron text-white flex items-center justify-center font-bold">
                    {currentStep + 1}
                  </div>
                  <p className="font-semibold text-gray-900">{step.title}</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {step.display_text || step.voice_script}
                </p>
                {step.tip && (
                  <div className="mt-3 bg-white rounded-xl p-3 border border-orange-200">
                    <p className="text-xs text-orange-700">💡 {step.tip}</p>
                  </div>
                )}
              </div>

              {step.sub_steps && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowSubSteps(!showSubSteps)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 font-medium"
                  >
                    <span>📝 {language === "hi" ? "फॉर्म भरने की पूरी जानकारी" : "Detailed form filling guide"}</span>
                    <span>{showSubSteps ? "▲" : "▼"}</span>
                  </button>
                  {showSubSteps && (
                    <div className="mt-2 space-y-2">
                      {step.sub_steps.map((sub, i) => (
                        <div key={i}
                          className="flex gap-3 bg-white border border-blue-100 rounded-xl p-3">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">
                            {i+1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{sub.label}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{sub.detail}</p>
                          </div>
                        </div>
                      ))}

                        </div>
                  )}
                </div>
              )}

              {voiceStatus && (
                <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 text-center mb-3">
                  🎤 {voiceStatus}
                </div>
              )}

              <div className="bg-india-light border border-green-200 rounded-xl p-3 mb-3">
                <p className="text-xs text-green-800 font-medium mb-1">
                  🎤 {language === "hi" ? "आवाज़ से चलाएं:" : "Voice commands:"}
                </p>
                <p className="text-xs text-green-700">
                  {language === "hi"
                    ? "\"अगला\" → आगे जाएं  •  \"पीछे\" → वापस जाएं  •  \"दोबारा\" → फिर सुनें  •  \"रोको\" → बंद करें"
                    : "\"next\" → go forward  •  \"back\" → go back  •  \"repeat\" → hear again  •  \"stop\" → pause"}
                </p>
              </div>

              <div className="space-y-1">
                {steps.map((s, i) => (
                  <button key={i} onClick={() => goToStep(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs transition-colors
                      ${i === currentStep ? "bg-saffron text-white font-medium"
                        : i < currentStep ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-500"}`}>
                    <span className="w-5 font-bold flex-shrink-0">
                      {i < currentStep ? "✓" : i + 1}
                    </span>
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!loading && !error && steps.length > 0 && (
          <div className="p-4 border-t border-gray-100">

            <div className="flex gap-2 mb-2">

              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakStep(steps, currentStep)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all
                  ${isSpeaking ? "bg-red-500 scale-110" : "bg-saffron"}`}
                title={isSpeaking ? "Stop" : "Listen"}
              >
                {isSpeaking ? "⏹" : "🔊"}
              </button>

              <button
                onClick={toggleListening}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all
                  ${isListening ? "bg-green-500 animate-pulse scale-110" : "bg-gray-500"}`}
                title={isListening ? "Listening..." : "Tap to speak"}
              >

               🎤
              </button>

              {currentStep > 0 && (
                <button
                  onClick={() => goToStep(currentStep - 1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm"
                >
                  ← {language === "hi" ? "पीछे" : "Back"}
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => goToStep(currentStep + 1)}
                  className="flex-1 py-3 bg-saffron text-white rounded-xl text-sm font-medium"
                >
                 {language === "hi" ? "अगला →" : "Next →"}
                 </button>
                  ) : (
                <a
                  href={scheme.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-india text-white rounded-xl text-sm font-medium text-center"
                >
                  🌐 {language === "hi" ? "अभी आवेदन करें" : "Apply Now"}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}