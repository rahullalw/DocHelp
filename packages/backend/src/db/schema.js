import { pgTable, text, timestamp, serial, jsonb, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userTypeEnum = pgEnum('user_type', ['guest', 'user', 'super_user']);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique(), // Clerk user ID (nullable for guests)
  email: text('email').notNull().unique(),
  name: text('name'),
  type: userTypeEnum('type').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Guest sessions table (merged into users with null clerkId)
export const guestSessions = pgTable('guest_sessions', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  reportAnalysis: jsonb('report_analysis').notNull(),
  persona: jsonb('persona'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  guestSessions: many(guestSessions),
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

export const guestSessionsRelations = relations(guestSessions, ({ one }) => ({
  user: one(users, {
    fields: [guestSessions.userId],
    references: [users.id],
  }),
}));

