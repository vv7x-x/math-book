import mongoose from 'mongoose'

const ScheduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    center: { type: String, required: true },
    stage: { type: String, required: true }
  },
  { timestamps: true }
)

export default mongoose.model('Schedule', ScheduleSchema)
