// import { PrismaClient } from "@prisma/client";



// export const db =globalThis.prisma || new PrismaClient();

// if(process.env.NODE_ENV!=="production"){
//     globalThis.prisma = db;
// }


// chatgpt
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // helpful for debugging
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
