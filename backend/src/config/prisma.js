const { PrismaClient } = require("@prisma/client");

// Reuse a single Prisma client instance across the app (avoids connection
// exhaustion during dev hot-reloads with nodemon).
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

module.exports = prisma;
