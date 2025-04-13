const { MIN_PLAYERS } = require('../config/gameConfig')
const sessions = new Map()

const getSession = (sessionId) => sessions.get(sessionId)

const validateSession = (req, res, next) => {
  const sessionId = req.params.sessionId
  const session = getSession(sessionId)

  if (!session) return res.status(404).json({ error: 'Session not found' })

  req.session = session
  next()
}

const validateGameMaster = (req, res, next) => {
  const { session } = req
  const socketId = req.headers['x-socket-id']

  if (session.gameMaster !== socketId) {
    return res
      .status(403)
      .json({ error: 'Only game master can perform this action' })
  }
  next()
}

module.exports = {
  sessions,
  getSession,
  validateSession,
  validateGameMaster,
}
