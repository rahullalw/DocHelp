import { db } from './index.js';
import { users, guestSessions, projects, messages } from './schema.js';
import { eq, and, desc, sql, count } from 'drizzle-orm';

// User types
export const USER_TYPE = {
  GUEST: 'guest',
  USER: 'user',
  SUPER_USER: 'super_user',
};

// Limits by user type
export const LIMITS = {
  [USER_TYPE.GUEST]: {
    maxProjects: 1,
    maxChatsPerProject: 2,
  },
  [USER_TYPE.USER]: {
    maxProjects: 5,
    maxChatsPerProject: Infinity,
  },
  [USER_TYPE.SUPER_USER]: {
    maxProjects: Infinity,
    maxChatsPerProject: Infinity,
  },
};

// Super user email
export const SUPER_USER_EMAIL = process.env.SUPER_USER_EMAIL || 'superuser@dochelp.com';

/**
 * Get or create user from Clerk data
 */
export const getOrCreateUser = async (clerkUserId, email, name) => {
  try {
    // Check if user exists by clerkId
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    });

    if (existingUser) {
      return existingUser;
    }

    // Determine user type
    const userType = email === SUPER_USER_EMAIL ? USER_TYPE.SUPER_USER : USER_TYPE.USER;

    // Create new user (id will be auto-generated)
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUserId,
        email,
        name: name || email.split('@')[0],
        type: userType,
      })
      .returning();

    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUser = async (userId) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    return user || null;
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
};

/**
 * Create guest session
 */
export const createGuestSession = async (sessionId) => {
  try {
    // First create a guest user
    const [guestUser] = await db
      .insert(users)
      .values({
        email: `${sessionId}@guest.local`,
        name: 'Guest User',
        type: USER_TYPE.GUEST,
        clerkId: null, // Guest users don't have Clerk IDs
      })
      .returning();

    // Then create the guest session linked to the user
    const [guest] = await db
      .insert(guestSessions)
      .values({ 
        sessionId,
        userId: guestUser.id,
      })
      .returning();

    // Return the user object (with the guest session info attached)
    return {
      ...guestUser,
      sessionId: guest.sessionId,
    };
  } catch (error) {
    console.error('Error in createGuestSession:', error);
    throw error;
  }
};

/**
 * Get guest session
 */
export const getGuestSession = async (sessionId) => {
  try {
    const guest = await db.query.guestSessions.findFirst({
      where: eq(guestSessions.sessionId, sessionId),
      with: {
        user: true,
      },
    });
    
    if (!guest) return null;

    // Return the user object with session info
    return {
      ...guest.user,
      sessionId: guest.sessionId,
    };
  } catch (error) {
    console.error('Error in getGuestSession:', error);
    return null;
  }
};

/**
 * Get or create guest session
 */
export const getOrCreateGuestSession = async (sessionId) => {
  const existing = await getGuestSession(sessionId);
  if (existing) return existing;
  return await createGuestSession(sessionId);
};

/**
 * Check if user can create more projects
 */
export const canCreateProject = async (user) => {
  try {
    const limits = LIMITS[user.type];
    if (limits.maxProjects === Infinity) return true;

    const [result] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.userId, user.id));

    return result.count < limits.maxProjects;
  } catch (error) {
    console.error('Error in canCreateProject:', error);
    return false;
  }
};

/**
 * Check if user can send more chats in a project
 */
export const canSendChat = async (user, projectId) => {
  try {
    const limits = LIMITS[user.type];
    if (limits.maxChatsPerProject === Infinity) return true;

    // Count user messages only (not assistant messages)
    const [result] = await db
      .select({ count: count() })
      .from(messages)
      .where(and(eq(messages.projectId, projectId), eq(messages.role, 'user')));

    return result.count < limits.maxChatsPerProject;
  } catch (error) {
    console.error('Error in canSendChat:', error);
    return false;
  }
};

/**
 * Get remaining limits for user
 */
export const getRemainingLimits = async (user) => {
  try {
    const limits = LIMITS[user.type];

    if (limits.maxProjects === Infinity) {
      return {
        projectsRemaining: 'unlimited',
        maxProjects: 'unlimited',
        maxChatsPerProject: limits.maxChatsPerProject === Infinity ? 'unlimited' : limits.maxChatsPerProject,
      };
    }

    const [result] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.userId, user.id));

    return {
      projectsRemaining: limits.maxProjects - result.count,
      maxProjects: limits.maxProjects,
      maxChatsPerProject: limits.maxChatsPerProject === Infinity ? 'unlimited' : limits.maxChatsPerProject,
    };
  } catch (error) {
    console.error('Error in getRemainingLimits:', error);
    return null;
  }
};

/**
 * Add project to user
 */
export const addProject = async (user, projectId, reportAnalysis, persona) => {
  try {
    // Note: projectId parameter is ignored, database auto-generates the ID
    const [project] = await db
      .insert(projects)
      .values({
        userId: user.id,
        name: `${persona?.reportType || 'Medical Report'} - ${new Date().toLocaleDateString()}`,
        reportAnalysis,
        persona,
      })
      .returning();

    return project;
  } catch (error) {
    console.error('Error in addProject:', error);
    return null;
  }
};

/**
 * Get project with messages
 */
export const getProject = async (user, projectId) => {
  try {
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
      with: {
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 40,
        },
      },
    });

    if (!project) return null;

    // Reverse messages to get chronological order and format
    const conversationHistory = project.messages
      .reverse()
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // Count user messages for chatCount
    const [chatCountResult] = await db
      .select({ count: count() })
      .from(messages)
      .where(and(eq(messages.projectId, projectId), eq(messages.role, 'user')));

    return {
      id: project.id,
      name: project.name,
      reportAnalysis: project.reportAnalysis,
      persona: project.persona,
      conversationHistory,
      chatCount: chatCountResult.count,
      createdAt: project.createdAt,
    };
  } catch (error) {
    console.error('Error in getProject:', error);
    return null;
  }
};

/**
 * Get all projects for user
 */
export const getAllProjects = async (user) => {
  try {
    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, user.id),
      orderBy: [desc(projects.createdAt)],
    });

    // Get message counts for each project
    const projectsWithCounts = await Promise.all(
      userProjects.map(async (project) => {
        const [chatCountResult] = await db
          .select({ count: count() })
          .from(messages)
          .where(and(eq(messages.projectId, project.id), eq(messages.role, 'user')));

        return {
          id: project.id,
          name: project.name,
          persona: project.persona,
          chatCount: chatCountResult.count,
          createdAt: project.createdAt,
        };
      })
    );

    return projectsWithCounts;
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    return [];
  }
};

/**
 * Add chat message to project
 */
export const addChatToProject = async (user, projectId, userMessage, aiResponse) => {
  try {
    // Verify project belongs to user
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
    });

    if (!project) return false;

    // Insert both messages (neon-http driver doesn't support transactions)
    await db.insert(messages).values([
      {
        projectId,
        role: 'user',
        content: userMessage,
      },
      {
        projectId,
        role: 'assistant',
        content: aiResponse,
      },
    ]);

    return true;
  } catch (error) {
    console.error('Error in addChatToProject:', error);
    return false;
  }
};

/**
 * Get conversation history
 */
export const getConversationHistory = async (user, projectId) => {
  try {
    // Verify project belongs to user
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
    });

    if (!project) return [];

    const projectMessages = await db.query.messages.findMany({
      where: eq(messages.projectId, projectId),
      orderBy: [desc(messages.createdAt)],
      limit: 40,
    });

    return projectMessages.reverse().map((m) => ({
      role: m.role,
      content: m.content,
    }));
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    return [];
  }
};

/**
 * Clear conversation history
 */
export const clearConversationHistory = async (user, projectId) => {
  try {
    // Verify project belongs to user
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.userId, user.id)),
    });

    if (!project) return false;

    await db.delete(messages).where(eq(messages.projectId, projectId));
    return true;
  } catch (error) {
    console.error('Error in clearConversationHistory:', error);
    return false;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (user, projectId) => {
  try {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
      .returning();

    return result.length > 0;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    return false;
  }
};

/**
 * Super user: Get all data
 */
export const getAllData = async () => {
  try {
    // Get all users with their projects
    const allUsers = await db.query.users.findMany({
      with: {
        projects: {
          orderBy: [desc(projects.createdAt)],
        },
      },
    });

    // Get all guest sessions with their users
    const allGuestSessions = await db.query.guestSessions.findMany({
      with: {
        user: {
          with: {
            projects: {
              orderBy: [desc(projects.createdAt)],
            },
          },
        },
      },
    });

    // Format users data
    const usersData = await Promise.all(
      allUsers.map(async (user) => {
        const userProjectsData = await Promise.all(
          user.projects.map(async (project) => {
            const [chatCountResult] = await db
              .select({ count: count() })
              .from(messages)
              .where(and(eq(messages.projectId, project.id), eq(messages.role, 'user')));

            return {
              id: project.id,
              name: project.name,
              chatCount: chatCountResult.count,
              createdAt: project.createdAt,
            };
          })
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
          projectCount: user.projects.length,
          projects: userProjectsData,
          createdAt: user.createdAt,
        };
      })
    );

    // Format guest data
    const guestsData = await Promise.all(
      allGuestSessions.map(async (guestSession) => {
        const guestUser = guestSession.user;
        const guestProjectsList = guestUser.projects || [];

        const guestProjectsData = await Promise.all(
          guestProjectsList.map(async (project) => {
            const [chatCountResult] = await db
              .select({ count: count() })
              .from(messages)
              .where(and(eq(messages.projectId, project.id), eq(messages.role, 'user')));

            return {
              id: project.id,
              name: project.name,
              chatCount: chatCountResult.count,
              createdAt: project.createdAt,
            };
          })
        );

        return {
          id: guestSession.sessionId,
          userId: guestUser.id,
          type: USER_TYPE.GUEST,
          projectCount: guestProjectsList.length,
          projects: guestProjectsData,
          createdAt: guestSession.createdAt,
        };
      })
    );

    return {
      users: usersData,
      guests: guestsData,
      stats: {
        totalUsers: usersData.length,
        totalGuests: guestsData.length,
        totalProjects: usersData.reduce((sum, u) => sum + u.projectCount, 0) + 
                       guestsData.reduce((sum, g) => sum + g.projectCount, 0),
      },
    };
  } catch (error) {
    console.error('Error in getAllData:', error);
    throw error;
  }
};

