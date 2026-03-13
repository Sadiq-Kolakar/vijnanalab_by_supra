import { Router, Request, Response } from 'express';
import LabProgress from '../models/LabProgress';
import User from '../models/User';

const router = Router();

// POST /api/labs/progress — Save or update lab progress
router.post('/progress', async (req: Request, res: Response) => {
  try {
    const { firebaseUID, subjectId, labId, status, score, timeSpent, quizAnswers, observations } = req.body;
    
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const updateData: any = {
      userId: user._id,
      firebaseUID,
      subjectId,
      labId,
      status,
      $inc: { attempts: 1 }
    };

    if (score !== undefined) updateData.score = score;
    if (timeSpent !== undefined) updateData.$inc = { ...updateData.$inc, timeSpent };
    if (quizAnswers) updateData.quizAnswers = quizAnswers;
    if (observations) updateData.observations = observations;
    if (status === 'completed') updateData.completedAt = new Date();

    const progress = await LabProgress.findOneAndUpdate(
      { firebaseUID, subjectId, labId },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update user stats if completed
    if (status === 'completed') {
      await User.findOneAndUpdate(
        { firebaseUID },
        { 
          $inc: { labsCompleted: 1, totalScore: score || 0 },
          lastActive: new Date()
        }
      );
    }

    res.status(200).json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/labs/progress/:firebaseUID — Get all lab progress for a user
router.get('/progress/:firebaseUID', async (req: Request, res: Response) => {
  try {
    const progress = await LabProgress.find({ firebaseUID: req.params.firebaseUID })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/labs/progress/:firebaseUID/:subjectId — Get progress for a specific subject
router.get('/progress/:firebaseUID/:subjectId', async (req: Request, res: Response) => {
  try {
    const progress = await LabProgress.find({ 
      firebaseUID: req.params.firebaseUID,
      subjectId: req.params.subjectId
    }).sort({ labId: 1 });

    res.status(200).json({ success: true, data: progress });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/labs/leaderboard — Get top students 
router.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const topStudents = await User.find({ role: 'Student' })
      .select('name avatar labsCompleted totalScore institution')
      .sort({ totalScore: -1 })
      .limit(20);

    res.status(200).json({ success: true, data: topStudents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
