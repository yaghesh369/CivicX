const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middleware/auth");
const ctrl = require("./notifications.controller");

router.use(requireAuth);

router.get("/", ctrl.listNotifications);
router.patch("/read-all", ctrl.markAllAsRead);
router.patch("/:id/read", ctrl.markAsRead);

module.exports = router;
