import { useState, useEffect, useRef } from "react"
import { startConversation, submitAnswer, sendFreeText } from "../api"
import MessageBubble from "./MessageBubble"
import QuickReplies from "./QuickReplies"

export default function ChatWindow({ language, onComplete }) {
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [currentQ, setCurrentQ] = useState(null)  
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState("0/10")
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    initConversation()
  }, [])

  const initConversation = async () => {
    setMessages([])
    setLoading(true)
    try {
      const data = await startConversation(language)
      setSessionId(data.session_id)
      setCurrentQ(data)
      addBotMessage(
        language === "en"
          ? "👋 Hello! I am SahayakAI. I will help you find government schemes you qualify for. Let's start with a few questions."
          : "👋 नमस्ते! मैं सहायकAI हूँ। मैं आपको सरकारी योजनाएं खोजने में मदद करूंगा। चलिए कुछ सवाल पूछते हैं।"
      )
      addBotMessage(data.question)
      setProgress(data.progress || "1/10")
    } catch (e) {
      addBotMessage("⚠️ Could not connect to server. Make sure your backend is running.")
    }
    setLoading(false)
  }

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { text, isBot: true, id: Date.now() + Math.random() }])
  }

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { text, isBot: false, id: Date.now() + Math.random() }])
  }

   const handleQuickReply = async (selectedOptions) => {
    const displayText = selectedOptions.join(", ")
    const answerValue = selectedOptions.length === 1 ? selectedOptions[0] : selectedOptions
    addUserMessage(displayText)
    setCurrentQ(null)   // hide options while loading
    setLoading(true)
    try {
      const data = await submitAnswer(sessionId, currentQ.question_id, answerValue)
      handleResponse(data)
    } catch (e) {
      addBotMessage("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  const handleSend = async () => {
  if (!input.trim() || !sessionId) return
  const text = input.trim()
  setInput("")
  addUserMessage(text)
  
  // Save currentQ before clearing it
  const activeQuestion = currentQ
  setCurrentQ(null)
  setLoading(true)
  
  try {
    const data = await submitAnswer(sessionId, activeQuestion?.question_id || "state", text)
    handleResponse(data)
  } catch (e) {
    addBotMessage("Something went wrong. Please try again.")
  }
  setLoading(false)
}

  
  const handleResponse = (data) => {
    if (data.status === "complete") {
      addBotMessage(
         language === "en"
          ? `🎉 Done! I found ${data.result.total_schemes_matched} schemes for you worth ₹${data.result.total_annual_benefit_inr.toLocaleString("en-IN")}/year!`
          : `🎉 बढ़िया! आपके लिए ${data.result.total_schemes_matched} योजनाएं मिलीं — कुल ₹${data.result.total_annual_benefit_inr.toLocaleString("en-IN")}/साल!`
      )
      setTimeout(() => onComplete(data.result), 1500)
      return
    }
    if (data.fields_extracted?.length > 0) {
      addBotMessage(
        language === "en"
          ? `✓ Got it! (${data.fields_extracted.join(", ")})`
          : `✓ समझ गया! (${data.fields_extracted.join(", ")})`
      )
    }
    addBotMessage(data.question)
    setCurrentQ(data)
    if (data.progress) setProgress(data.progress)
  }

  // Progress bar percentage
  const [done, total] = progress.split("/").map(Number)
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="px-4 pt-3 pb-1">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{language === "en" ? "Progress" : "प्रगति"}</span>
          <span>{progress}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full">
          <div
            className="h-1.5 bg-saffron rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg.text} isBot={msg.isBot} />
        ))}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center text-white text-xs mr-2">स</div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}}/>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}}/>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}}/>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {currentQ?.options && !loading && (
        <div className="px-4 pb-2">
          <QuickReplies
            options={currentQ.options}
            onSelect={handleQuickReply}
            multiSelect={currentQ.type === "multi_choice"}
          />
        </div>
      )}

       <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={language === "en" ? "Type your message..." : "अपना संदेश लिखें..."}
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-saffron"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-saffron text-white flex items-center justify-center disabled:opacity-40 hover:bg-orange-500 transition-colors"
          >
            ➤
          </button>
        </div>

        </div>
    </div>
  )
}

