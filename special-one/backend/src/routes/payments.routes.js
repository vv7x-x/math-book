import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { authRequired, permitRoles } from '../middleware/auth.js'
import Payment from '../models/Payment.js'
import Student from '../models/Student.js'
import { ok, badRequest, created } from '../utils/response.js'

const router = Router()

// Admin: record payment
router.post('/', authRequired, permitRoles('admin', 'moderator'), [
  body('studentId').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('method').optional().isIn(['cash', 'card', 'wallet', 'online']),
  body('month').matches(/^\d{4}-\d{2}$/)
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)
  const { studentId, amount, method = 'cash', month, notes } = req.body
  const student = await Student.findById(studentId)
  if (!student) return badRequest(res, 'Student not found')
  try {
    const payment = await Payment.create({ student: studentId, amount, method, month, notes, recordedBy: req.user.sub })
    return created(res, { payment })
  } catch (e) {
    return badRequest(res, 'Payment for this month already exists')
  }
})

// Student: my payments
router.get('/me', authRequired, permitRoles('student'), async (req, res) => {
  const userId = req.user.sub
  const student = await Student.findOne({ user: userId })
  if (!student) return badRequest(res, 'Student not found')
  const list = await Payment.find({ student: student._id }).sort({ createdAt: -1 })
  return ok(res, { payments: list })
})

export default router
