import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const upsertMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  async handler(ctx, args) {
    const existingData = await ctx.db
      .query("contacts")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    // If the user has sent a message before, update their data
    if (existingData) {
      existingData.data.push({
        name: args.name,
        message: args.message,
        time: Date.now(),
      });
      await ctx.db.patch(existingData._id, {
        data: existingData.data,
      });

      console.log(`Updated tansmission for ${args.email}`);

      return {
        success: true,
      };
    } else {
      await ctx.db.insert("contacts", {
        email: args.email,
        data: [
          {
            name: args.name,
            message: args.message,
            time: Date.now(),
          },
        ],
      });

      console.log(`New transmission recived from ${args.email}`);

      return {
        success: true,
      };
    }
  },
});
