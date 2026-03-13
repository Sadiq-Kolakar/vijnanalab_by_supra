import { Router, Request, Response } from 'express';
import Feedback from '../models/Feedback';
import User from '../models/User';

const router = Router();

// POST /api/feedback — Submit feedback
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firebaseUID, name, email, message, type } = req.body;

    let userId;
    if (firebaseUID) {
      const user = await User.findOne({ firebaseUID });
      userId = user?._id;
    }

    const feedback = await Feedback.create({
      userId,
      firebaseUID,
      name,
      email,
      message,
      type: type || 'feedback'
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/feedback — Get all feedback (teacher/admin only)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.status(200).json({ success: true, data: feedbacks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
