const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/signin", userController.signin);
router.post("/signup", userController.signup);
router.post("/history", userController.history);
router.post("/checkavailable", userController.checkAvailable);
router.post("/insertdiceval", userController.insertDiceVal);
router.post("/checkdiceAvailable", userController.checkDiceAvailable);

module.exports = router;
