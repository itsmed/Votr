import express, { type Request, type Response } from 'express';
import { findLegislators } from '../../services/geocodioService';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const { address } = req.query;

  if (!address || typeof address !== 'string' || address.trim() === '') {
    return res.status(400).json({ error: 'address query parameter is required' });
  }

  try {
    const result = await findLegislators(address.trim());
    res.json(result);
  } catch (error) {
    const message = (error as Error).message;
    if (
      message === 'Address not found' ||
      message === 'No congressional district found for this address'
    ) {
      return res.status(404).json({ error: message });
    }
    console.error('GET /find-representative-and-senator error:', error);
    res.status(500).json({ error: 'Failed to find representatives' });
  }
});

export default router;
