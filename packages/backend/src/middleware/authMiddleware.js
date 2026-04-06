import { clerkClient, getAuth } from '@clerk/express';
import { 
  getOrCreateUser, 
  getOrCreateGuestSession, 
  USER_TYPE
} from '../db/operations.js';

/**
 * Authentication middleware that handles both authenticated users and guests
 * Uses Clerk's getAuth() to check authentication status
 * Attaches user data to req.user
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const guestSessionId = req.headers['x-guest-session'];

    // Try to get auth from Clerk (works after clerkMiddleware runs)
    try {
      const auth = getAuth(req);
      
      if (auth && auth.userId) {
        // User is authenticated via Clerk
        const clerkUser = await clerkClient.users.getUser(auth.userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
        
        // Get or create user in database
        const user = await getOrCreateUser(auth.userId, email, name);
        req.user = user;
        req.isAuthenticated = true;
        req.isGuest = false;
        
        return next();
      }
    } catch (authError) {
      // Auth not available, continue to guest flow
      console.log('Auth check:', authError.message);
    }

    // Guest flow
    if (guestSessionId) {
      const guest = await getOrCreateGuestSession(guestSessionId);
      req.user = guest;
      req.isAuthenticated = false;
      req.isGuest = true;
      return next();
    }

    // No auth and no guest session - create new guest
    const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guest = await getOrCreateGuestSession(newGuestId);
    req.user = guest;
    req.isAuthenticated = false;
    req.isGuest = true;
    req.newGuestSessionId = newGuestId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Middleware to require authentication (no guests allowed)
 */
export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({ 
      message: 'Authentication required. Please sign in.',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
};

/**
 * Middleware to require super user access
 */
export const requireSuperUser = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (req.user?.type !== USER_TYPE.SUPER_USER) {
    return res.status(403).json({ 
      message: 'Super user access required',
      code: 'FORBIDDEN'
    });
  }
  
  next();
};

/**
 * Simple middleware to attach user/guest to request without blocking
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const guestSessionId = req.headers['x-guest-session'];

    try {
      const auth = getAuth(req);
      
      if (auth && auth.userId) {
        const clerkUser = await clerkClient.users.getUser(auth.userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
        
        req.user = await getOrCreateUser(auth.userId, email, name);
        req.isAuthenticated = true;
        req.isGuest = false;
        return next();
      }
    } catch (e) {
      // Auth not available
    }

    if (guestSessionId) {
      req.user = await getOrCreateGuestSession(guestSessionId);
      req.isAuthenticated = false;
      req.isGuest = true;
    } else {
      req.user = null;
      req.isAuthenticated = false;
      req.isGuest = false;
    }
    
    next();
  } catch (error) {
    next();
  }
};
