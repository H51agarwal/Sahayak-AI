import axios from "axios"

const BASE_URL = "http://localhost:8000"

export const startConversation = async (language = "en") => {
  const res = await axios.post(`${BASE_URL}/conversation/start?language=${language}`)
  return res.data
}

export const submitAnswer = async (sessionId, questionId, answer) => {
  const res = await axios.post(`${BASE_URL}/conversation/answer`, {
    session_id: sessionId,
    question_id: questionId,
    answer: answer
  })
  return res.data
}

export const sendFreeText = async (sessionId, message) => {
  const res = await axios.post(
    `${BASE_URL}/conversation/freetext`,
    null,
    { params: { session_id: sessionId, message } }
  )
  return res.data
}

export const getScheme = async (schemeId) => {
  const res = await axios.get(`${BASE_URL}/schemes/${schemeId}`)
  return res.data
}

export const matchDirect = async (profile) => {
  const res = await axios.post(`${BASE_URL}/match/direct`, profile)
  return res.data
}