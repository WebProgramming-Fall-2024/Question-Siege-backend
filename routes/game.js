const express = require("express");
const router = express.Router();
const { startGame, submitAnswer } = require("../controllers/game-controller");
const auth = require("../middleware/auth");

// Start a new game
router.post("/start", auth, startGame);

// Submit an answer
router.post("/answer", auth, submitAnswer);

module.exports = router;
