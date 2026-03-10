import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  ckbAddress: text("ckb_address").notNull().unique(),
  fiberNodeRpcUrl: text("fiber_node_rpc_url"),
  nostrPubkey: text("nostr_pubkey"),
  userType: text("user_type").notNull().default("member"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const CREATOR_CATEGORIES = [
  "art",
  "music",
  "podcasts",
  "gaming",
  "writing",
  "tech",
  "education",
  "health",
  "lifestyle",
  "comedy",
  "photography",
  "video",
] as const;

export type CreatorCategory = (typeof CREATOR_CATEGORIES)[number];

export const creators = pgTable("creators", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creatortopics = pgTable(
  "creator_topics",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.creatorId, t.slug)]
);

export const tiers = pgTable("tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  amount: text("amount").notNull(),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_AUDIENCES = ["free", "paid"] as const;
export type PostAudience = (typeof POST_AUDIENCES)[number];

export const posts = pgTable("posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  status: text("status")
    .notNull()
    .$type<PostStatus>()
    .default("draft"),
  nostrEventId: text("nostr_event_id"),
  audience: text("audience").$type<PostAudience>(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const postPaidAudienceTiers = pgTable(
  "post_paid_audience_tiers",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tierId: uuid("tier_id")
      .notNull()
      .references(() => tiers.id, { onDelete: "cascade" }),
  },
  (t) => [unique().on(t.postId, t.tierId)]
);

export const CHAT_TYPES = ["group", "direct"] as const;
export type ChatType = (typeof CHAT_TYPES)[number];

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull().$type<ChatType>(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  patronUserId: uuid("patron_user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chatParticipants = pgTable("chat_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const NOTIFICATION_TYPES = ["new_post", "new_message"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull().$type<NotificationType>(),
  entityId: text("entity_id").notNull(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  platformFeeAmount: text("platform_fee_amount"),
  platformFeeFiberTxRef: text("platform_fee_fiber_tx_ref"),
  status: text("status").notNull().default("active"),
  nextDueAt: timestamp("next_due_at"),
  lastPaymentAt: timestamp("last_payment_at"),
  fiberTxRef: text("fiber_tx_ref"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  creator: one(creators),
  notifications: many(notifications),
}));

export const creatorsRelations = relations(creators, ({ one, many }) => ({
  user: one(users, { fields: [creators.userId], references: [users.id] }),
  topics: many(creatortopics),
  tiers: many(tiers),
  patronage: many(patronage),
  posts: many(posts),
  chats: many(chats),
  notifications: many(notifications),
}));

export const creatortopicsRelations = relations(creatortopics, ({ one }) => ({
  creator: one(creators, {
    fields: [creatortopics.creatorId],
    references: [creators.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  creator: one(creators, {
    fields: [notifications.creatorId],
    references: [creators.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  creator: one(creators, {
    fields: [chats.creatorId],
    references: [creators.id],
  }),
  participants: many(chatParticipants),
  messages: many(messages),
}));

export const chatParticipantsRelations = relations(
  chatParticipants,
  ({ one }) => ({
    chat: one(chats, {
      fields: [chatParticipants.chatId],
      references: [chats.id],
    }),
    user: one(users, {
      fields: [chatParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const postPaidAudienceTiersRelations = relations(
  postPaidAudienceTiers,
  ({ one }) => ({
    post: one(posts, {
      fields: [postPaidAudienceTiers.postId],
      references: [posts.id],
    }),
    tier: one(tiers, {
      fields: [postPaidAudienceTiers.tierId],
      references: [tiers.id],
    }),
  })
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  creator: one(creators, {
    fields: [posts.creatorId],
    references: [creators.id],
  }),
  paidAudienceTiers: many(postPaidAudienceTiers),
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
  creator: one(creators, {
    fields: [tiers.creatorId],
    references: [creators.id],
  }),
  patronage: many(patronage),
  postPaidAudienceTiers: many(postPaidAudienceTiers),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Creator = typeof creators.$inferSelect;
export type NewCreator = typeof creators.$inferInsert;
export type Tier = typeof tiers.$inferSelect;
export type NewTier = typeof tiers.$inferInsert;
/** @deprecated Perks table was removed in migration 0012. Use for type compatibility only. */
export type Perk = {
  id: string;
  tierId: string;
  description: string;
  type: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Patronage = typeof patronage.$inferSelect;
export type NewPatronage = typeof patronage.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type NewChatParticipant = typeof chatParticipants.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
