function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma unique constraint violation
  if (err.code === "P2002") {
    return res.status(409).json({
      error: `Duplicate value for field: ${err.meta?.target || "unknown"}`,
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Internal server error.",
  });
}

module.exports = { errorHandler };
