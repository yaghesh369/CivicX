const asyncHandler = require("express-async-handler");
const prisma = require("../../config/prisma");

// GET /api/admin/dashboard/
const dashboard = asyncHandler(async (req, res) => {
  const [total, submitted, inProgress, resolved, totalUsers, totalWorkers, totalDepartments] =
    await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: "SUBMITTED" } }),
      prisma.complaint.count({ where: { status: "IN_PROGRESS" } }),
      prisma.complaint.count({ where: { status: { in: ["RESOLVED", "CITIZEN_VERIFIED"] } } }),
      prisma.user.count({ where: { role: "CITIZEN" } }),
      prisma.worker.count(),
      prisma.department.count(),
    ]);

  res.json({
    totalComplaints: total,
    submitted,
    inProgress,
    resolved,
    totalCitizens: totalUsers,
    totalWorkers,
    totalDepartments,
  });
});

// GET /api/admin/complaints/  (full unscoped list, admin view)
const allComplaints = asyncHandler(async (req, res) => {
  const { page = 1, page_size = 20, status, category, ward } = req.query;
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (ward) where.ward = ward;

  const take = Math.min(parseInt(page_size), 100);
  const skip = (parseInt(page) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, assignment: true },
    }),
    prisma.complaint.count({ where }),
  ]);

  res.json({ count: total, page: parseInt(page), page_size: take, results: items });
});

// GET /api/admin/statistics/
const statistics = asyncHandler(async (req, res) => {
  const byCategory = await prisma.complaint.groupBy({ by: ["category"], _count: true });
  const byStatus = await prisma.complaint.groupBy({ by: ["status"], _count: true });
  const byPriority = await prisma.complaint.groupBy({ by: ["priority"], _count: true });

  const avgRatingResult = await prisma.feedback.aggregate({ _avg: { rating: true } });

  res.json({
    byCategory: byCategory.map((c) => ({ category: c.category, count: c._count })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
    byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count })),
    averageFeedbackRating: avgRatingResult._avg.rating || 0,
  });
});

// GET /api/admin/categories/
const categoryBreakdown = asyncHandler(async (req, res) => {
  const result = await prisma.complaint.groupBy({ by: ["category"], _count: true });
  res.json(result.map((r) => ({ category: r.category, count: r._count })));
});

// GET /api/admin/wards/
const wardBreakdown = asyncHandler(async (req, res) => {
  const result = await prisma.complaint.groupBy({ by: ["ward"], _count: true });
  res.json(result.map((r) => ({ ward: r.ward, count: r._count })));
});

// GET /api/admin/heatmap/
const heatmap = asyncHandler(async (req, res) => {
  const complaints = await prisma.complaint.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    select: { latitude: true, longitude: true, category: true, status: true, priority: true },
  });
  res.json(complaints);
});

module.exports = { dashboard, allComplaints, statistics, categoryBreakdown, wardBreakdown, heatmap };
