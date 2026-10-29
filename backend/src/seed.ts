import mongoose from "mongoose";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { User } from "./models/user.model";
async function seed(): Promise<void> {
  try {
    await connectDatabase(env.mongoUri);

    const users = [
      { name: "Helpdesk Admin", email: "admin@helpdesk.local", role: "admin" },
      { name: "Support Agent", email: "agent@helpdesk.local", role: "agent" },
      { name: "Employee One", email: "employee1@helpdesk.local", role: "employee" },
      { name: "Employee Two", email: "employee2@helpdesk.local", role: "employee" },
    ];
    
    for (const item of users) {
      const user = await User.findOne({ email: item.email });
      if (!user) await User.create({ ...item, password: env.seedPassword });
      else if (user.role !== item.role) {
        user.role = item.role;
        await user.save();
      }
    }
    console.info("Seeded four demo users. Their shared password is configured by SEED_PASSWORD.");
  } finally {
    await mongoose.disconnect();
  }
}
seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});
