const express = require('express');
const router = express.Router();

const questionaireController = require('../controllers/questionaireController')

router.post('/subject', questionaireController.getSubject);
router.post('/asking', questionaireController.asking);
router.post('/getDescription', questionaireController.getDescription);

module.exports = router