const { MAX_ATTEMPTS } = require('../config/gameConfig')
const GameSession = require('../models/GameSession')
const { sessions } = require('../middleware/gameMiddleware')

const createSession = (socketId, username) => {
  const session = new GameSession(`session-${Date.now()}`)
  session.addPlayer(socketId, username)
  session.gameMaster = socketId
  sessions.set(session.id, session)
  return session
}

const joinSession = (sessionId, socketId, username) => {
  const session = sessions.get(sessionId)
  if (!session || session.isActive) return null

  // Check if player already exists in the session
  if (!session.players.has(socketId)) {
    session.addPlayer(socketId, username)
  }
  return session
}

const handleGuess = (session, socketId, guess) => {
  const player = session.players.get(socketId)
  if (!player || player.attempts >= MAX_ATTEMPTS) return false

  player.attempts++

  if (guess.toLowerCase() === session.answer.toLowerCase()) {
    player.score += 10
    return true
  }

  return false
}

module.exports = {
  createSession,
  joinSession,
  handleGuess,
}
