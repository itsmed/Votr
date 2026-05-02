import express, { type Request, type Response } from 'express';
import { getBills, getBillDetail, getBillText } from '../../services/billService';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { bills, source } = await getBills();
    res.json({ source, count: bills.length, bills });
  } catch (error) {
    console.error('GET /api/bill error:', error);
    res.status(500).json({ error: 'Failed to retrieve bills' });
  }
});

router.get('/:congress/:type/:number', async (req: Request, res: Response) => {
  const { congress, type, number } = req.params;
  try {
    const detail = await getBillDetail(congress, type.toLowerCase(), number);
    res.json(detail);
  } catch (error) {
    console.error(`GET /api/bill/${congress}/${type}/${number} error:`, error);
    res.status(500).json({ error: 'Failed to retrieve bill detail' });
  }
});

router.get('/:congress/:type/:number/text', async (req: Request, res: Response) => {
  const { congress, type, number } = req.params;
  try {
    const textVersions = await getBillText(congress, type.toLowerCase(), number);
    res.json({ textVersions });
  } catch (error) {
    console.error(`GET /api/bill/${congress}/${type}/${number}/text error:`, error);
    res.status(500).json({ error: 'Failed to retrieve bill text' });
  }
});

export default router;
