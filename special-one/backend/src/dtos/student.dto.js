import { z } from 'zod'

export const UpdateStudentDto = z.object({
  studentPhone: z.string().min(5).optional(),
  parentPhone: z.string().min(5).optional(),
})
