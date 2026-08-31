const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middleware/auth");
const ctrl = require("./feedback.controller");

router.use(requireAuth);

router.post("/:id/feedback", ctrl.createFeedback);
router.get("/:id/feedback", ctrl.getFeedback);

module.exports = router;
