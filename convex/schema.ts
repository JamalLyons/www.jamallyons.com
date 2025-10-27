import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	contacts: defineTable({
		email: v.string(),
		data: v.array(
			v.object({
				name: v.string(),
				message: v.string(),
				time: v.number(),
			}),
		),
	}).index("email", ["email"]),
});
