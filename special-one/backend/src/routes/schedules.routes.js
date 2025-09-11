import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { authRequired, permitRoles } from '../middleware/auth.js'
import Schedule from '../models/Schedule.js'
import { ok, badRequest, created } from '../utils/response.js'

const router = Router()

// Admin: upload weekly schedules (bulk upsert)
router.post('/', authRequired, permitRoles('admin', 'moderator'), [
  body('items').isArray({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)
  const { items } = req.body
  const ops = items.map(it => ({ updateOne: { filter: { dayOfWeek: it.dayOfWeek, stage: it.stage, center: it.center, title: it.title }, update: { $set: it }, upsert: true } }))
  const result = await Schedule.bulkWrite(ops)
  return created(res, { result })
})

// Public/Student: get schedules by stage/center
router.get('/', authRequired, permitRoles('student', 'admin', 'moderator'), async (req, res) => {
  const stage = req.query.stage
  const center = req.query.center
  const filter = {}
  if (stage) filter.stage = stage
  if (center) filter.center = center
  const items = await Schedule.find(filter).sort({ dayOfWeek: 1, startTime: 1 })
  return ok(res, { items })
})

export default router
