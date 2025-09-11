import mongoose from 'mongoose'

const AttendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], default: 'present' },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // who recorded
  },
  { timestamps: true }
)

AttendanceSchema.index({ student: 1, date: 1 }, { unique: true })

export default mongoose.model('Attendance', AttendanceSchema)
