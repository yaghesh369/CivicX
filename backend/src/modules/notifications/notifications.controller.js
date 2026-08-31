const asyncHandler = require("express-async-handler");
const prisma = require("../../config/prisma");

// GET /api/notifications/
const listNotifications = asyncHandler(async (req, res) => {
  const { is_read } = req.query;
  const where = { userId: req.user.id };
  if (is_read !== undefined) where.isRead = is_read === "true";

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json(notifications);
});

// PATCH /api/notifications/:id/read/
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) return res.status(404).json({ error: "Notification not found." });
  if (notification.userId !== req.user.id) {
    return res.status(403).json({ error: "You do not have access to this notification." });
  }

  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.json(updated);
});

// PATCH /api/notifications/read-all/
const markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  res.json({ message: "All notifications marked as read." });
});

module.exports = { listNotifications, markAsRead, markAllAsRead };
