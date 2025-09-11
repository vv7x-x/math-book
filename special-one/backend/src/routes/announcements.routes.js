import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { authRequired, permitRoles } from '../middleware/auth.js'
import Announcement from '../models/Announcement.js'
import { ok, badRequest, created } from '../utils/response.js'

const router = Router()

// Admin: create announcement
router.post('/', authRequired, permitRoles('admin', 'moderator'), [
  body('title').notEmpty(),
  body('body').notEmpty(),
  body('audience').optional().isIn(['all', 'stage', 'center'])
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)
  const payload = { ...req.body, createdBy: req.user.sub }
  const ann = await Announcement.create(payload)
  return created(res, { announcement: ann })
})

// Student: list announcements (basic filter)
router.get('/', authRequired, permitRoles('student', 'admin', 'moderator'), async (req, res) => {
  const filter = {}
  if (req.query.stage) filter.stage = req.query.stage
  if (req.query.center) filter.center = req.query.center
  const list = await Announcement.find(filter).sort({ createdAt: -1 })
  return ok(res, { announcements: list })
})

export default router
