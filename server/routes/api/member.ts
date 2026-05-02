import express, { type Request, type Response } from 'express';
import { getMembers, getMemberDetail, getMemberAgreement, getMemberSharedVotes } from '../../services/memberService';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { members, source } = await getMembers();
    res.json({ source, count: members.length, members });
  } catch (err) {
    console.error('GET /api/member error:', err);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
});

router.get('/:bioguideId/agreement', async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const result = await getMemberAgreement(req.user.id, req.params.bioguideId);
    res.json(result);
  } catch (err) {
    console.error('GET /api/member/:bioguideId/agreement error:', err);
    res.status(500).json({ error: 'Failed to compute agreement' });
  }
});

router.get('/:bioguideId/shared-votes', async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const votes = await getMemberSharedVotes(req.user.id, req.params.bioguideId);
    res.json({ votes });
  } catch (err) {
    console.error('GET /api/member/:bioguideId/shared-votes error:', err);
    res.status(500).json({ error: 'Failed to retrieve shared votes' });
  }
});

router.get('/:bioguideId', async (req: Request, res: Response) => {
  try {
    const member = await getMemberDetail(req.params.bioguideId);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json({ member });
  } catch (err) {
    console.error('GET /api/member/:bioguideId error:', err);
    res.status(500).json({ error: 'Failed to retrieve member detail' });
  }
});

export default router;
