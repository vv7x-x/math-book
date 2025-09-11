import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import Student from '../models/Student.js'
import { signAccessToken, signRefreshToken, authRequired } from '../middleware/auth.js'
import { ok, created, badRequest } from '../utils/response.js'
import jwt from 'jsonwebtoken'

const router = Router()

// Register student
router.post(
  '/register-student',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').notEmpty(),
    body('nationalId').isLength({ min: 10 }),
    body('studentPhone').notEmpty(),
    body('parentPhone').notEmpty(),
    body('stage').notEmpty(),
    body('age').isInt({ min: 5 }),
    body('center').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)

    const { email, password, fullName, nationalId, studentPhone, parentPhone, stage, age, center } = req.body

    const exists = await User.findOne({ email })
    if (exists) return badRequest(res, 'Email already in use')
    const nationalExists = await Student.findOne({ nationalId })
    if (nationalExists) return badRequest(res, 'National ID already registered')

    try {
      const user = await User.create({ email, password, role: 'student' })
      await Student.create({ user: user._id, fullName, nationalId, studentPhone, parentPhone, stage, age, center })
      return created(res, { message: 'Registration submitted. Awaiting approval.' })
    } catch (e) {
      return badRequest(res, 'Registration failed')
    }
  }
)

// Login (student, moderator, admin)
router.post(
  '/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)

    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return badRequest(res, 'Invalid credentials')

    const okPassword = await user.comparePassword(password)
    if (!okPassword) return badRequest(res, 'Invalid credentials')

    // student must be approved to login to student panel
    if (user.role === 'student') {
      const s = await Student.findOne({ user: user._id })
      if (!s?.approved) return badRequest(res, 'Awaiting approval')
    }

    const payload = { sub: user._id.toString(), role: user.role, v: user.tokenVersion }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    return ok(res, { accessToken, refreshToken, role: user.role })
  }
)

router.get('/me', authRequired, async (req, res) => {
  const userId = req.user.sub
  const user = await User.findById(userId).select('-password')
  return ok(res, { user })
})

// Refresh access/refresh tokens
router.post(
  '/refresh',
  [body('refreshToken').isString()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg)
    const { refreshToken } = req.body
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      const user = await User.findById(decoded.sub)
      if (!user) return badRequest(res, 'Invalid token')
      // Check tokenVersion
      if (typeof decoded.v !== 'number' || decoded.v !== user.tokenVersion) {
        return badRequest(res, 'Invalid token version')
      }
      const payload = { sub: user._id.toString(), role: user.role, v: user.tokenVersion }
      const newAccess = signAccessToken(payload)
      const newRefresh = signRefreshToken(payload)
      return ok(res, { accessToken: newAccess, refreshToken: newRefresh, role: user.role })
    } catch (e) {
      return badRequest(res, 'Invalid or expired refresh token')
    }
  }
)

// Logout: invalidate refresh tokens by bumping tokenVersion
router.post('/logout', authRequired, async (req, res) => {
  const userId = req.user.sub
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } })
  return ok(res, { message: 'Logged out' })
})

export default router
