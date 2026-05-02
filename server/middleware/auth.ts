import type { Request, Response, NextFunction } from 'express';
// eslint-disable-next-line n/no-missing-import
import pool from '../db';

const DEV_USER_EMAIL = 'dev@local.dev';
const COOKIE_NAME = 'votr_user_id';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cookieValue = req.cookies[COOKIE_NAME];
    let userId: number | undefined = typeof cookieValue === 'string' ? Number.parseInt(cookieValue, 10) : undefined;
    if (Number.isNaN(userId)) {
      userId = undefined;
    }

    if (!userId && process.env.NODE_ENV !== 'production') {
      const { rows } = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [DEV_USER_EMAIL]
      );
      if (rows.length === 0) {
        next();
        return;
      }
      userId = rows[0].id as number;
      res.cookie(COOKIE_NAME, userId, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
      });
    }

    if (userId) {
      const { rows } = await pool.query(
        'SELECT id, name, email, address, preferences, senator_ids, congress_member_ids FROM users WHERE id = $1',
        [userId]
      );
      if (rows.length > 0) {
        req.user = rows[0] as Express.Request['user'];
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export default authMiddleware;
