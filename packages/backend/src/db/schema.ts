import { pgTable, text, timestamp, uuid, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userTypeEnum = pgEnum('user_type', ['guest', 'user', 'super_user']);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  name: text('name'),
  type: userTypeEnum('type').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Guest sessions table
export const guestSessions = pgTable('guest_sessions', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  reportAnalysis: jsonb('report_analysis').notNull(),
  persona: jsonb('persona'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type GuestSession = typeof guestSessions.$inferSelect;
export type NewGuestSession = typeof guestSessions.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;






