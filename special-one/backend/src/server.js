import dotenv from 'dotenv'
import app from './app.js'
import { connectDB } from './config/db.js'

dotenv.config()

const PORT = process.env.PORT || 4000

async function start() {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`[server] running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('[server] failed to start', err)
    process.exit(1)
  }
}

start()
