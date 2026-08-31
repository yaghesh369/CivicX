const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");

// GET /api/departments/
const listDepartments = asyncHandler(async (req, res) => {
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  res.json(departments);
});

// POST /api/departments/  (Admin only)
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, contactEmail, ward } = req.body;
  if (!name) return res.status(400).json({ error: "name is required." });

  const dept = await prisma.department.create({
    data: { name, description, contactEmail, ward },
  });
  res.status(201).json(dept);
});

// PATCH /api/departments/:id/  (Admin only)
const updateDepartment = asyncHandler(async (req, res) => {
  const { name, description, contactEmail, ward, isActive } = req.body;
  const dept = await prisma.department.update({
    where: { id: req.params.id },
    data: { name, description, contactEmail, ward, isActive },
  });
  res.json(dept);
});

// GET /api/departments/:id/workers/
const listDepartmentWorkers = asyncHandler(async (req, res) => {
  const workers = await prisma.worker.findMany({
    where: { departmentId: req.params.id },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
  });
  res.json(workers);
});

// POST /api/workers/  (Admin/Officer only — creates a WORKER user + worker profile)
const createWorker = asyncHandler(async (req, res) => {
  const { name, email, password, phone, departmentId, employeeId, ward } = req.body;
  if (!name || !email || !password || !departmentId || !employeeId) {
    return res.status(400).json({ error: "name, email, password, departmentId, employeeId are required." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already registered." });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone, role: "WORKER", ward },
  });

  const worker = await prisma.worker.create({
    data: { userId: user.id, departmentId, employeeId, ward },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  res.status(201).json(worker);
});

// PATCH /api/workers/:id/  (activate/deactivate, reassign department)
const updateWorker = asyncHandler(async (req, res) => {
  const { departmentId, ward, isActive } = req.body;
  const worker = await prisma.worker.update({
    where: { id: req.params.id },
    data: { departmentId, ward, isActive },
  });
  res.json(worker);
});

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  listDepartmentWorkers,
  createWorker,
  updateWorker,
};
