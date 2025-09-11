import { z } from 'zod'

export const AttendanceCheckDto = z.object({
  studentId: z.string().min(1),
})
