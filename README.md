# Guessing Game - Real-time Multiplayer Game

A real-time multiplayer guessing game built with Node.js, Express, and Socket.IO. Players can create game sessions, join existing ones, and compete to guess the correct answer within a time limit.

## Features

- 🎮 Real-time multiplayer gameplay
- 👥 Multiple players can join a game session
- 🎯 Game master can create questions and answers
- ⏱️ 60-second timer for each round
- 🎲 3 attempts per player per round
- 📊 Score tracking and leaderboard
- 💬 Real-time game chat and notifications
- 🏆 Winner announcement and game master rotation
- 📱 Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Juddyblazzy06/Guess-game.git
cd guessing-game
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:4000`

## Game Rules

1. **Game Setup**:

   - One player creates a game session (becomes the Game Master)
   - Other players can join using the session ID
   - Game requires at least 2 players to start

2. **Gameplay**:

   - Game Master sets a question and answer
   - Players have 60 seconds to guess the answer
   - Each player gets 3 attempts
   - First correct guess wins the round
   - 10 points awarded to the winner

3. **Round End Conditions**:

   - A player guesses correctly
   - Time runs out (60 seconds)
   - All players use their attempts

4. **Game Master Rotation**:
   - After each round, the Game Master role rotates
   - New Game Master can set the next question

## Project Structure

```
guessing-game/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── index.js
├── package.json
└── README.md
```

## Technologies Used

- **Frontend**:

  - HTML5
  - CSS3 (with CSS Variables)
  - JavaScript (ES6+)
  - Socket.IO Client

- **Backend**:
  - Node.js
  - Express.js
  - Socket.IO
  - ES6+ JavaScript

## API Endpoints

### Game Session Management

- `POST /api/game/create` - Create a new game session
- `POST /api/game/join` - Join an existing game session
- `POST /api/game/start` - Start the game (Game Master only)

### Socket.IO Events

#### Client to Server

- `create-session` - Create a new game session
- `join-session` - Join an existing session
- `start-game` - Start the game with question and answer
- `submit-guess` - Submit a guess
- `time-up` - Handle time expiration

#### Server to Client

- `session-created` - Confirm session creation
- `session-update` - Update game state
- `game-ended` - Announce game end
- `set-game-master` - Assign new game master

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Socket.IO for real-time communication
- Express.js for the server framework
- All contributors and testers

## Support

For support, email amiensjude364gmail.com or open an issue in the GitHub repository.

## Future Improvements

- [ ] User authentication
- [ ] Persistent game history
- [ ] Custom game settings
- [ ] Chat functionality
- [ ] Emoji reactions
- [ ] Sound effects
- [ ] Themes customization
