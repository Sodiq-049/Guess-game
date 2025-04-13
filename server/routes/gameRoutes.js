const express = require('express')
const router = express.Router()
const {
  validateSession,
  validateGameMaster,
} = require('../middleware/gameMiddleware')
const { handleGuess } = require('../controllers/gameController')

router.post('/:sessionId/guess', validateSession, (req, res) => {
  const { session } = req
  const { guess, socketId } = req.body

  const isCorrect = handleGuess(session, socketId, guess)
  res.json({
    isCorrect,
    attemptsLeft: MAX_ATTEMPTS - session.players.get(socketId).attempts,
  })
})

module.exports = router
