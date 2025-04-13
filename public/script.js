const socket = io()
let currentSession = null
let isGameMaster = false
let gameTimer = null

// DOM Elements
const sessionSetup = document.getElementById('session-setup')
const gameInterface = document.getElementById('game-interface')
const playersList = document.getElementById('players')
const gameMasterControls = document.getElementById('game-master-controls')
const questionDisplay = document.getElementById('question-display')
const guessInput = document.getElementById('guess-input')
const submitGuessBtn = document.getElementById('submit-guess')
const attemptsLeft = document.getElementById('attempts-left')
const messagesDiv = document.getElementById('messages')
const joinSessionIdInput = document.getElementById('join-session-id')
const gamePlay = document.getElementById('game-play')
const timeLeftDisplay = document.getElementById('time-left')
const timerDisplay = document.getElementById('timer-display')

// Helper function to start the game timer
function startGameTimer(duration = 60) {
  clearInterval(gameTimer)
  let timeLeft = duration
  timeLeftDisplay.textContent = timeLeft
  timerDisplay.style.display = 'block'

  gameTimer = setInterval(() => {
    timeLeft--
    timeLeftDisplay.textContent = timeLeft

    if (timeLeft <= 0) {
      clearInterval(gameTimer)
      gameTimer = null
      timerDisplay.style.display = 'none'
      socket.emit('time-up')
    }
  }, 1000)
}

// Helper function to stop the game timer
function stopGameTimer() {
  clearInterval(gameTimer)
  gameTimer = null
  timerDisplay.style.display = 'none'
}

// Event Listeners
document.getElementById('create-session').addEventListener('click', () => {
  const username = prompt('Enter your username:')
  if (username) {
    socket.emit('create-session', username)
  }
})

document.getElementById('join-session').addEventListener('click', () => {
  const sessionId = joinSessionIdInput.value.trim()
  const username = prompt('Enter your username:')
  if (sessionId && username) {
    socket.emit('join-session', { sessionId, username })
    sessionSetup.style.display = 'none'
    gameInterface.style.display = 'block'
  }
})

document.getElementById('start-game').addEventListener('click', () => {
  const question = document.getElementById('question-input').value.trim()
  const answer = document.getElementById('answer-input').value.trim()
  if (question && answer) {
    socket.emit('start-game', { question, answer })
  }
})

submitGuessBtn.addEventListener('click', () => {
  const guess = guessInput.value.trim()
  if (guess) {
    socket.emit('submit-guess', guess, (response) => {
      if (response.isCorrect) {
        addMessage('You guessed correctly!')
      } else {
        addMessage(`Wrong guess! Attempts left: ${response.attemptsLeft}`)
        if (response.attemptsLeft <= 0) {
          guessInput.disabled = true
          submitGuessBtn.disabled = true
        }
      }
      guessInput.value = ''
    })
  }
})

// Socket.IO Listeners
socket.on('session-created', (sessionId) => {
  currentSession = sessionId
  sessionSetup.style.display = 'none'
  gameInterface.style.display = 'block'
  addMessage(`Session created: ${sessionId}`)
})

socket.on('set-game-master', () => {
  isGameMaster = true
  gameMasterControls.style.display = 'block'
  gamePlay.style.display = 'none'
  addMessage('You are now the Game Master!')
})

socket.on('session-update', (state) => {
  // Update players list
  playersList.innerHTML = state.players
    .map((player) => `<li>${player.username} - Score: ${player.score}</li>`)
    .join('')

  // Update game state
  if (state.isActive) {
    questionDisplay.textContent = `Question: ${state.question}`
    gamePlay.style.display = 'block'
    gameMasterControls.style.display = 'none'

    // Only start timer if it's not already running
    if (!gameTimer) {
      startGameTimer()
    }

    // Show guess input only for players (not the Game Master)
    if (socket.id !== state.gameMaster) {
      const currentPlayer = state.players.find((p) => p.id === socket.id)
      if (currentPlayer) {
        const attemptsRemaining = 3 - currentPlayer.attempts
        guessInput.disabled = false // Enable input at start of game
        submitGuessBtn.disabled = false // Enable button at start of game
        attemptsLeft.textContent = `Attempts left: ${attemptsRemaining}`
      }
    } else {
      guessInput.disabled = true
      submitGuessBtn.disabled = true
      attemptsLeft.textContent = 'You are the Game Master!'
    }
  } else {
    stopGameTimer()
    // When game is not active, show appropriate UI based on game master status
    if (socket.id === state.gameMaster) {
      gameMasterControls.style.display = 'block'
      gamePlay.style.display = 'none'
    } else {
      gameMasterControls.style.display = 'none'
      gamePlay.style.display = 'block'
    }
    questionDisplay.textContent = ''
    guessInput.disabled = true
    submitGuessBtn.disabled = true
    attemptsLeft.textContent = ''
  }
})

socket.on('game-ended', (result) => {
  stopGameTimer()

  // Create a more prominent message for the winner
  const winnerMessage = document.createElement('div')
  winnerMessage.className = 'game-log-message winner'

  if (result.winner) {
    winnerMessage.innerHTML = `
      <strong>🎉 Game Over! 🎉</strong><br>
      Winner: <span class="winner-name">${result.winner.username}</span><br>
      Correct Answer: <span class="answer">${result.answer}</span><br>
      Score: <span class="score">${result.winner.score}</span>
    `
  } else {
    winnerMessage.innerHTML = `
      <strong>⏰ Time's Up! ⏰</strong><br>
      No winner this round.<br>
      Correct Answer: <span class="answer">${result.answer}</span>
    `
  }

  messagesDiv.appendChild(winnerMessage)
  messagesDiv.scrollTop = messagesDiv.scrollHeight

  // Reset game interface for all players
  questionDisplay.textContent = ''
  guessInput.disabled = true
  submitGuessBtn.disabled = true
  attemptsLeft.textContent = ''

  // Show game master controls only for the new game master
  if (isGameMaster) {
    gameMasterControls.style.display = 'block'
    gamePlay.style.display = 'none'
  } else {
    gameMasterControls.style.display = 'none'
    gamePlay.style.display = 'block'
  }
})

socket.on('join-error', () => {
  alert('Could not join session. It may already be in progress or invalid.')
})

// Helper Functions
function addMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.className = 'game-log-message'
  messageElement.textContent = message
  messagesDiv.appendChild(messageElement)
  messagesDiv.scrollTop = messagesDiv.scrollHeight
}
