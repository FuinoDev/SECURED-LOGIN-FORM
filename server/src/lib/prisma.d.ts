import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
export declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("../generated/prisma/runtime/client.js").DefaultArgs>;
//# sourceMappingURL=prisma.d.ts.map