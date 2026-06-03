import { useState } from "react"
import Header from "./components/Header"
import ChatWindow from "./components/ChatWindow"
import SchemeResults from "./components/SchemeResults"
import HouseholdManager from "./components/HouseholdManager"
import DocumentChecker from "./components/DocumentChecker"

export default function App() {
  const [screen, setScreen] = useState("chat")
  const [results, setResults] = useState(null)
  const [language, setLanguage] = useState("en")

  const [primaryResult, setPrimaryResult] = useState(null)
  const [householdMembers, setHouseholdMembers] = useState([])

  const handlePrimaryResults = (result) => {
    setPrimaryResult(result)
    setHouseholdMembers([{ name: "You", result }])
    setScreen("results")
  }

  const handleAddMember = (name, result) => {
    setHouseholdMembers(prev => [...prev, { name, result }])
  }


  // Called by ChatWindow when conversation is complete
  const handleResults = (matchResult) => {
    setResults(matchResult)
    setScreen("results")
  }

  const getCombinedResult = () => {
    const allSchemes = []
    const seenIds = new Set()
    householdMembers.forEach(m => {
      m.result.schemes.forEach(s => {
        if (!seenIds.has(s.id)) {
          seenIds.add(s.id)
          allSchemes.push(s)
        }
      })
    })
    const total = allSchemes.reduce((sum, s) => sum + s.annual_benefit_inr, 0)
    return {
      total_schemes_matched: allSchemes.length,
      total_annual_benefit_inr: total,
      schemes: allSchemes.sort((a, b) => b.annual_benefit_inr - a.annual_benefit_inr)
    }
  }

   const handleRestart = () => {
    setPrimaryResult(null)
    setHouseholdMembers([])
    setScreen("chat")
  }


   return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="max-w-lg mx-auto px-4 pb-6">
        {screen === "chat" && (
          <ChatWindow
            language={language}
            onComplete={handlePrimaryResults}
          />
        )}
        { screen === "results" && (
          <SchemeResults
            results={getCombinedResult()}
            householdMembers={householdMembers}
            language={language}
            onRestart={handleRestart}
            onAddMember={() => setScreen("household")}
            onCheckDocuments={() => setScreen("documents")}
          />
        )} 
        {screen === "household" && (
          <HouseholdManager
            language={language}
            members={householdMembers}
            onAddMember={handleAddMember}
            onBack={() => setScreen("results")}
          />
        )}
         {screen === "documents" && (
          <DocumentChecker
            language={language}
            combinedResult={getCombinedResult()}
            onBack={() => setScreen("results")}
          />
        )}
      </main>
    </div>
  )
}