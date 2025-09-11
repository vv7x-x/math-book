import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import { authRequired, permitRoles } from '../middleware/auth.js'
import Student from '../models/Student.js'
import { ok, badRequest } from '../utils/response.js'

const router = Router()

// Admin: list/search students
router.get('/', authRequired, permitRoles('admin', 'moderator'), [query('q').optional().isString()], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)
  const q = (req.query.q || '').trim()
  const filter = q
    ? { $or: [{ fullName: { $regex: q, $options: 'i' } }, { nationalId: { $regex: q, $options: 'i' } }] }
    : {}
  const students = await Student.find(filter).populate('user', 'email role isActive')
  return ok(res, { students })
})

// Admin: approve/reject student
router.post('/:id/approve', authRequired, permitRoles('admin', 'moderator'), [body('approved').isBoolean()], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)
  const { id } = req.params
  const { approved } = req.body
  const student = await Student.findByIdAndUpdate(id, { approved }, { new: true })
  return ok(res, { student })
})

// Student: my profile
router.get('/me', authRequired, permitRoles('student'), async (req, res) => {
  const userId = req.user.sub
  const student = await Student.findOne({ user: userId }).populate('user', 'email role')
  return ok(res, { student })
})

// Student: update some editable fields
router.patch('/me', authRequired, permitRoles('student'), [
  body('studentPhone').optional().isString(),
  body('parentPhone').optional().isString()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)
  const userId = req.user.sub
  const updates = {}
  if (req.body.studentPhone) updates.studentPhone = req.body.studentPhone
  if (req.body.parentPhone) updates.parentPhone = req.body.parentPhone
  const student = await Student.findOneAndUpdate({ user: userId }, updates, { new: true })
  return ok(res, { student })
})

export default router
