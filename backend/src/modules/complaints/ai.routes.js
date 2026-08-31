const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middleware/auth");
const ctrl = require("./ai.controller");

router.use(requireAuth);

router.post("/:id/ai-analysis", ctrl.saveAIAnalysis);
router.get("/:id/ai-analysis", ctrl.getAIAnalysis);
router.post("/:id/duplicate-group", ctrl.createDuplicateGroup);

module.exports = router;
