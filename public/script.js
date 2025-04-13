const socket = io()
let currentSession = null
let isGameMaster = false

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

    // Show guess input only for players (not the Game Master)
    if (socket.id !== state.gameMaster) {
      const currentPlayer = state.players.find((p) => p.id === socket.id)
      if (currentPlayer) {
        guessInput.disabled = false
        submitGuessBtn.disabled = false
        attemptsLeft.textContent = `Attempts left: ${
          3 - currentPlayer.attempts
        }`
      }
    } else {
      guessInput.disabled = true
      submitGuessBtn.disabled = true
      attemptsLeft.textContent = 'You are the Game Master!'
    }
  } else {
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
  if (result.hasWinner) {
    addMessage(`Winner: ${result.scores[0].username}! Answer: ${result.answer}`)
  } else {
    addMessage(`Time's up! Answer: ${result.answer}`)
  }

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
  messageElement.textContent = message
  messagesDiv.appendChild(messageElement)
  messagesDiv.scrollTop = messagesDiv.scrollHeight
}
