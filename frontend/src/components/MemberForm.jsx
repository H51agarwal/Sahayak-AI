import { useState } from "react"
import { matchDirect } from "../api"

const MEMBER_QUESTIONS = [
  {
    id: "name",
    en: "What is this person's name or relationship?",
    hi: "इस व्यक्ति का नाम या रिश्ता क्या है?",
    type: "text",
    placeholder_en: "e.g. Mother, Wife, Son...",
    placeholder_hi: "जैसे: माँ, पत्नी, बेटा..."
  },
  {
    id: "age",
    en: "How old are they?",
    hi: "उनकी उम्र कितनी है?",
    type: "choice",
    options: ["Under 18", "18–30", "31–45", "46–60", "Above 60"]
  },
  {
    id: "gender",
    en: "What is their gender?",
    hi: "उनका लिंग क्या है?",
    type: "choice",
    options: ["Male", "Female", "Other"]
  },
  {
    id: "occupation",
    en: "What is their occupation?",
    hi: "उनका काम क्या है?",
    type: "choice",
    options: ["Farmer", "Student", "Daily wage worker",
              "Homemaker", "Government employee", "Unemployed"]
  },
  {
    id: "special",
    en: "Any special situation?",
    hi: "कोई विशेष स्थिति?",
    type: "choice",
    options: ["None", "Pregnant", "Widow", "Disabled (80%+)", "Has daughter under 10"]
  }
]

const AGE_MAP = {
  "under 18": 15, "18–30": 24, "31–45": 38,
  "46–60": 53, "above 60": 65
}

export default function MemberForm({ language, baseProfile, onDone, onCancel }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [textInput, setTextInput] = useState("")

  const currentQ = MEMBER_QUESTIONS[step]

  const handleAnswer = async (answer) => {
    const newAnswers = { ...answers, [currentQ.id]: answer }
    setAnswers(newAnswers)

     if (step < MEMBER_QUESTIONS.length - 1) {
      setStep(step + 1)
      setTextInput("")
      return
    }

    setLoading(true)
    const special = (answer || "").toLowerCase()
    const profile = {
      ...baseProfile,  // inherit state, caste, income, is_bpl from primary user
      age: AGE_MAP[newAnswers.age?.toLowerCase()] || 30,
      gender: (newAnswers.gender || "male").toLowerCase(),
      occupation: [newAnswers.occupation?.toLowerCase().replace(" worker", "_wage"
        ).replace("daily wage_wage", "daily_wage") || "daily_wage"],
      is_pregnant: special.includes("pregnant"),
      is_widow: special.includes("widow"),
      is_disabled: special.includes("disabled"),
      has_daughters: special.includes("daughter"),
      is_student: newAnswers.occupation?.toLowerCase() === "student",
      is_government_employee: newAnswers.occupation?.toLowerCase() === "government employee",
      owns_land: newAnswers.occupation?.toLowerCase() === "farmer",
      documents_owned: baseProfile.documents_owned || []
    }

     try {
      const result = await matchDirect(profile)
      onDone(newAnswers.name || "Family Member", result)
    } catch (e) {
      alert("Could not fetch schemes. Please try again.")
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="text-center py-12 text-gray-500">
      Finding schemes for this member...
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mt-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-medium text-gray-700">
          {language === "en" ? "Add Family Member" : "परिवार का सदस्य जोड़ें"}
        </p>
        <span className="text-xs text-gray-400">{step + 1}/{MEMBER_QUESTIONS.length}</span>
      </div>

       <p className="text-sm text-gray-800 mb-4">
        {language === "hi" ? currentQ.hi : currentQ.en}
      </p>

      {currentQ.type === "text" ? (
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-saffron"
            placeholder={language === "hi" ? currentQ.placeholder_hi : currentQ.placeholder_en}
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && textInput.trim() && handleAnswer(textInput.trim())}
          />
          <button
            onClick={() => textInput.trim() && handleAnswer(textInput.trim())}
            className="px-4 py-2 bg-saffron text-white rounded-xl text-sm"
          >→</button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {currentQ.options.map(opt => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="px-4 py-2 rounded-full text-sm border border-gray-300 bg-white hover:border-saffron hover:text-saffron transition-colors"
            >{opt}</button>
          ))}
        </div>
      )}

       <button onClick={onCancel} className="mt-4 text-xs text-gray-400 underline">
        Cancel
      </button>
    </div>
  )
}