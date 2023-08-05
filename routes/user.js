const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController')

router.post('/signin', userController.signin);
router.post('/signup', userController.signup);

module.exports = router