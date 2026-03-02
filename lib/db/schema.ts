import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  ckbAddress: text("ckb_address").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creators = pgTable("creators", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tiers = pgTable("tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  priceAmount: text("price_amount").notNull(),
  priceCurrency: text("price_currency").notNull().default("CKB"),
  billingInterval: text("billing_interval").notNull().default("monthly"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const perks = pgTable("perks", {
  id: uuid("id").primaryKey().defaultRandom(),
  tierId: uuid("tier_id")
    .notNull()
    .references(() => tiers.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  type: text("type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const patronage = pgTable("patronage", {
  id: uuid("id").primaryKey().defaultRandom(),
  patronUserId: uuid("patron_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  tierId: uuid("tier_id")
    .notNull()
    .references(() => tiers.id, { onDelete: "cascade" }),
  amount: text("amount").notNull(),
  currency: text("currency").notNull().default("CKB"),
  status: text("status").notNull().default("active"),
  nextDueAt: timestamp("next_due_at"),
  lastPaymentAt: timestamp("last_payment_at"),
  ckbTxHash: text("ckb_tx_hash"),
  fiberTxRef: text("fiber_tx_ref"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  creator: one(creators),
}));

export const creatorsRelations = relations(creators, ({ one, many }) => ({
  user: one(users, { fields: [creators.userId], references: [users.id] }),
  tiers: many(tiers),
  patronage: many(patronage),
}));

export const patronageRelations = relations(patronage, ({ one }) => ({
  patronUser: one(users, {
    fields: [patronage.patronUserId],
    references: [users.id],
  }),
  creator: one(creators, {
    fields: [patronage.creatorId],
    references: [creators.id],
  }),
  tier: one(tiers, {
    fields: [patronage.tierId],
    references: [tiers.id],
  }),
}));

export const tiersRelations = relations(tiers, ({ one, many }) => ({
  creator: one(creators, { fields: [tiers.creatorId], references: [creators.id] }),
  perks: many(perks),
  patronage: many(patronage),
}));

export const perksRelations = relations(perks, ({ one }) => ({
  tier: one(tiers, { fields: [perks.tierId], references: [tiers.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Creator = typeof creators.$inferSelect;
export type NewCreator = typeof creators.$inferInsert;
export type Tier = typeof tiers.$inferSelect;
export type NewTier = typeof tiers.$inferInsert;
export type Perk = typeof perks.$inferSelect;
export type NewPerk = typeof perks.$inferInsert;
export type Patronage = typeof patronage.$inferSelect;
export type NewPatronage = typeof patronage.$inferInsert;
