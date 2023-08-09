const express = require("express");
const router = express.Router();

const questionaireController = require("../controllers/questionaireController");

router.post("/subject", questionaireController.initial);
router.post("/asking", questionaireController.asking);
router.post("/getDescription", questionaireController.getDescription);
router.post("/insertresult", questionaireController.insertResult);

module.exports = router;
