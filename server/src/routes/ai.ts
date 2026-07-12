import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { AssetFlowAgent } from '../ai/orchestrator';

const router = Router();
router.use(authenticate);
router.use(requireRole('ADMIN', 'ASSET_MANAGER'));

// One agent per role session - in production this would be per-session
const agents: Record<string, AssetFlowAgent> = {};

router.post('/chat', async (req, res) => {
  const { query } = req.body;
  if (!query) { res.status(400).json({ error: 'query is required' }); return; }

  try {
    const userId = req.user!.id;
    if (!agents[userId]) {
      agents[userId] = new AssetFlowAgent(req.user!.role);
    }
    const response = await agents[userId].processQuery(query, req.user!);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
