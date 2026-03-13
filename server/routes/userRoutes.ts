import { Router, Request, Response } from 'express';
import User from '../models/User';

const router = Router();

// POST /api/users — Create or sync user from Firebase
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firebaseUID, name, email, role, grade, institution } = req.body;

    // Upsert: create if not exists, update if exists
    const user = await User.findOneAndUpdate(
      { firebaseUID },
      { 
        firebaseUID, name, email, role, grade, institution,
        lastActive: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:firebaseUID — Get user profile
router.get('/:firebaseUID', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUID: req.params.firebaseUID });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:firebaseUID — Update user profile
router.put('/:firebaseUID', async (req: Request, res: Response) => {
  try {
    const user = await User.findOneAndUpdate(
      { firebaseUID: req.params.firebaseUID },
      { ...req.body, lastActive: new Date() },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:firebaseUID/stats — Get user dashboard stats
router.get('/:firebaseUID/stats', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUID: req.params.firebaseUID });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        labsCompleted: user.labsCompleted,
        totalScore: user.totalScore,
        streak: user.streak,
        lastActive: user.lastActive,
        memberSince: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
