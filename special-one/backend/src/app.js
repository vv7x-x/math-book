import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import xss from 'xss-clean'
import mongoSanitize from 'mongo-sanitize'
import hpp from 'hpp'

import authRoutes from './routes/auth.routes.js'
import studentRoutes from './routes/students.routes.js'
import attendanceRoutes from './routes/attendance.routes.js'
import schedulesRoutes from './routes/schedules.routes.js'
import announcementsRoutes from './routes/announcements.routes.js'
import paymentsRoutes from './routes/payments.routes.js'
import { notFound, errorHandler } from './middleware/security.js'
import logger from './utils/logger.js'

const app = express()

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", 'data:', 'blob:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
)
app.use(hpp())

// CORS: allow configured origins, or allow all in development
const allowedOrigins = [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean)
const corsOptions = allowedOrigins.length > 0
  ? { origin: allowedOrigins, credentials: true }
  : { origin: true, credentials: true }
app.use(cors(corsOptions))

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10)
})
app.use(limiter)

// Parsers
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// xss-clean AFTER body parsing
app.use(xss())

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }))

// Basic sanitize middleware for bodies and queries
app.use((req, _res, next) => {
  if (req.body) req.body = mongoSanitize(req.body)
  if (req.query) req.query = mongoSanitize(req.query)
  next()
})

// Routes
app.get('/health', (_req, res) => res.json({ ok: true, service: 'special-one-backend' }))
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/schedules', schedulesRoutes)
app.use('/api/announcements', announcementsRoutes)
app.use('/api/payments', paymentsRoutes)

// 404 + error handler
app.use(notFound)
app.use(errorHandler)

export default app
