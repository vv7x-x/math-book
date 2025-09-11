import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'card', 'wallet', 'online'], default: 'cash' },
    month: { type: String, required: true }, // e.g., 2025-09
    notes: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

PaymentSchema.index({ student: 1, month: 1 }, { unique: true })

export default mongoose.model('Payment', PaymentSchema)
