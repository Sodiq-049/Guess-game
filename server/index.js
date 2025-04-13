const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const { sessions } = require('./middleware/gameMiddleware')
const {
  createSession,
  joinSession,
  handleGuess,
} = require('./controllers/gameController')
const gameRoutes = require('./routes/gameRoutes')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

// Middleware
app.use(express.json())
app.use('/api/game', gameRoutes)
app.use(express.static('public'))

// Socket.IO Logic
io.on('connection', (socket) => {
  let currentSession = null

  // Helper function to update the session state for all players
  const updateSessionState = (session) => {
    if (!session) return

    io.to(session.id).emit('session-update', {
      players: Array.from(session.players.values()),
      question: session.question,
      isActive: session.isActive,
      timeRemaining: session.isActive
        ? Math.max(0, 60000 - (Date.now() - session.startTime))
        : null,
      gameMaster: session.gameMaster, // Send the Game Master's socket ID
    })
  }

  // Create a new session
  socket.on('create-session', (username) => {
    const session = createSession(socket.id, username)
    currentSession = session.id
    sessions.set(session.id, session) // Add session to the sessions map
    socket.join(currentSession)
    socket.emit('session-created', session.id)
    socket.emit('set-game-master') // Notify the player they are the Game Master
    updateSessionState(session) // Update the session state for all players
  })

  // Join an existing session
  socket.on('join-session', ({ sessionId, username }) => {
    const session = joinSession(sessionId, socket.id, username)
    if (!session) return socket.emit('join-error')

    currentSession = sessionId
    socket.join(sessionId)
    updateSessionState(session) // Update the session state for all players
  })

  // Start the game (Game Master only)
  socket.on('start-game', ({ question, answer }) => {
    const session = sessions.get(currentSession)
    if (!session || socket.id !== session.gameMaster) return

    session.question = question
    session.answer = answer
    session.startGame(io)
    updateSessionState(session) // Update the session state for all players
  })

  // Handle player guesses
  socket.on('submit-guess', async (guess, callback) => {
    const session = sessions.get(currentSession)
    if (!session?.isActive || socket.id === session.gameMaster) return // Prevent Game Master from guessing

    const isCorrect = handleGuess(session, socket.id, guess)
    if (isCorrect) session.endGame(io, true)

    callback({
      isCorrect,
      attemptsLeft: 3 - session.players.get(socket.id).attempts,
    })

    updateSessionState(session) // Update the session state for all players
  })

  // Handle time-up event
  socket.on('time-up', () => {
    const session = sessions.get(currentSession)
    if (!session?.isActive) return

    session.endGame(io, false)
    updateSessionState(session)
  })

  // Handle player disconnection
  socket.on('disconnect', () => {
    const session = sessions.get(currentSession)
    if (!session) return

    session.removePlayer(socket.id)
    if (session.players.size === 0) sessions.delete(currentSession)
    updateSessionState(session) // Update the session state for all players
  })
})

// Start the server
const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
