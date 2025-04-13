const { MAX_ATTEMPTS, GAME_DURATION } = require('../config/gameConfig')

class GameSession {
  constructor(id) {
    this.id = id
    this.players = new Map() // { socketId: { id, username, attempts, score } }
    this.gameMaster = null
    this.question = null
    this.answer = null
    this.isActive = false
    this.timer = null
    this.startTime = null
  }

  addPlayer(socketId, username) {
    this.players.set(socketId, {
      id: socketId,
      username,
      attempts: 0,
      score: 0,
    })
  }

  removePlayer(socketId) {
    this.players.delete(socketId)
  }

  startGame(io) {
    this.isActive = true
    this.startTime = Date.now()
    this.timer = setTimeout(() => this.endGame(io, false), GAME_DURATION)
  }

  endGame(io, hasWinner) {
    clearTimeout(this.timer)
    this.isActive = false

    io.to(this.id).emit('game-ended', {
      hasWinner,
      answer: this.answer,
      scores: this.getScores(),
    })

    this.rotateGameMaster(io)
  }

  getScores() {
    return Array.from(this.players.values()).map((p) => ({
      username: p.username,
      score: p.score,
    }))
  }

  rotateGameMaster(io) {
    const players = Array.from(this.players.keys())
    const currentIndex = players.indexOf(this.gameMaster)
    this.gameMaster = players[(currentIndex + 1) % players.length]

    io.to(this.gameMaster).emit('set-game-master')
  }
}

module.exports = GameSession
