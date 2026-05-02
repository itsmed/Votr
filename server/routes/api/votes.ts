import express, { type Request, type Response, type NextFunction } from 'express';
import { getVotes, getVoteDetail } from '../../services/voteService';
import { upsertUserCongressionalVote, getUserCongressionalVote } from '../../services/userCongressionalVoteService';

const VALID_POSITIONS = new Set(['Yea', 'Nay', 'Abstain']);

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const limit   = Math.min(Number(req.query.limit)  || 50, 200);
    const offset  = Math.max(Number(req.query.offset) || 0,  0);
    const chamber = ['h', 's'].includes(req.query.chamber as string) ? (req.query.chamber as string) : undefined;

    const { votes, total } = await getVotes({ limit, offset, chamber });
    res.json({ total, limit, offset, chamber: chamber ?? null, votes });
  } catch (error) {
    console.error('GET /api/votes error:', error);
    res.status(500).json({ error: 'Failed to retrieve votes' });
  }
});

router.get('/:voteId', async (req: Request, res: Response) => {
  try {
    const chamber = ['h', 's'].includes(req.query.chamber as string) ? (req.query.chamber as string) : undefined;
    const result = await getVoteDetail(req.params.voteId, chamber);
    if (!result) return res.status(404).json({ error: 'Vote not found' });
    res.json(result);
  } catch (error) {
    console.error('GET /api/votes/:voteId error:', error);
    res.status(500).json({ error: 'Failed to retrieve vote detail' });
  }
});

router.get('/:voteId/user-vote', async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const vote = await getUserCongressionalVote(req.user.id, req.params.voteId);
    res.json({ vote });
  } catch (error) {
    console.error('GET /api/votes/:voteId/user-vote error:', error);
    res.status(500).json({ error: 'Failed to retrieve user vote' });
  }
});

router.post('/:voteId/user-vote', async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { position } = req.body as { position?: string };
  if (!position || !VALID_POSITIONS.has(position)) {
    return res.status(400).json({ error: 'position must be one of: Yea, Nay, Abstain' });
  }
  try {
    const vote = await upsertUserCongressionalVote(req.user.id, req.params.voteId, position);
    res.json({ vote });
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return res.status(404).json({ error: 'Vote not found' });
    }
    console.error('POST /api/votes/:voteId/user-vote error:', error);
    next(error);
  }
});

export default router;
