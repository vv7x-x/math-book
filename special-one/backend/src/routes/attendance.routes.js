import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { authRequired, permitRoles } from '../middleware/auth.js'
import Student from '../models/Student.js'
import Attendance from '../models/Attendance.js'
import { ok, badRequest } from '../utils/response.js'
import { generateQRDataURL } from '../utils/qr.js'

const router = Router()

// Student: generate QR for today (to be scanned by admin/moderator)
router.get('/my-qr', authRequired, permitRoles('student'), async (req, res) => {
  const userId = req.user.sub
  const student = await Student.findOne({ user: userId })
  if (!student) return badRequest(res, 'Student not found')
  const payload = JSON.stringify({ studentId: student._id, d: new Date().toISOString().slice(0, 10) })
  const dataURL = await generateQRDataURL(payload)
  return ok(res, { qr: dataURL })
})

// Admin/Moderator: record attendance for a student for today
router.post('/check', authRequired, permitRoles('admin', 'moderator'), [body('studentId').isString()], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)
  const { studentId } = req.body
  const date = new Date()
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  try {
    const record = await Attendance.create({ student: studentId, date: day, status: 'present', by: req.user.sub })
    return ok(res, { attendance: record })
  } catch (e) {
    return badRequest(res, 'Already recorded for today or invalid student')
  }
})

// Student: my attendance
router.get('/me', authRequired, permitRoles('student'), async (req, res) => {
  const userId = req.user.sub
  const student = await Student.findOne({ user: userId })
  if (!student) return badRequest(res, 'Student not found')
  const list = await Attendance.find({ student: student._id }).sort({ date: -1 })
  return ok(res, { attendance: list })
})

export default router
