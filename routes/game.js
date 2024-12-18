const express = require("express");
const router = express.Router();
const { startGame, submitAnswer, endGame } = require("../controllers/game-controller");
const auth = require("../middleware/auth");

// Start a new game
router.post("/start", auth, startGame);

// Submit an answer
router.post("/answer", auth, submitAnswer);

router.post("/end", auth, endGame);

module.exports = router;
