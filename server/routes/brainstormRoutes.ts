import { Router, Request, Response } from 'express';
import BrainstormProject from '../models/BrainstormProject';
import User from '../models/User';

const router = Router();

// POST /api/brainstorm — Save a new brainstorm project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firebaseUID, title, subject, topic, level, goal, hypothesis, blueprint } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const project = await BrainstormProject.create({
      userId: user._id,
      firebaseUID,
      title,
      subject,
      topic,
      level,
      goal,
      hypothesis,
      blueprint,
      status: blueprint ? 'generated' : 'draft'
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/brainstorm/:firebaseUID — Get all projects for a user
router.get('/:firebaseUID', async (req: Request, res: Response) => {
  try {
    const projects = await BrainstormProject.find({ firebaseUID: req.params.firebaseUID })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/brainstorm/:id — Update a project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const project = await BrainstormProject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/brainstorm/:id — Delete a project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const project = await BrainstormProject.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
