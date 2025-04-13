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
    this.winner = null
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
    this.winner = null // Reset winner

    // Reset attempts for all players
    for (const player of this.players.values()) {
      player.attempts = 0
    }

    this.timer = setTimeout(() => this.endGame(io, false), GAME_DURATION)
  }

  endGame(io, hasWinner) {
    clearTimeout(this.timer)
    this.isActive = false

    // Find the winner if there is one
    if (hasWinner) {
      // Find the player who just scored points (the one who guessed correctly)
      this.winner = Array.from(this.players.values()).find(
        (player) => player.score > 0 && player.attempts > 0
      )
    }

    io.to(this.id).emit('game-ended', {
      hasWinner: !!this.winner,
      winner: this.winner,
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
