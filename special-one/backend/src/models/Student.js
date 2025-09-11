import mongoose from 'mongoose'

const StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    nationalId: { type: String, required: true, trim: true, index: true, unique: true },
    studentPhone: { type: String, required: true, trim: true },
    parentPhone: { type: String, required: true, trim: true },
    stage: { type: String, required: true },
    age: { type: Number, required: true },
    center: { type: String, required: true },
    approved: { type: Boolean, default: false }
  },
  { timestamps: true }
)

// Indexes
StudentSchema.index({ fullName: 'text' })

export default mongoose.model('Student', StudentSchema)
