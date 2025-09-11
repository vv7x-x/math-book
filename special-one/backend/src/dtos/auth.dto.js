import { z } from 'zod'

export const RegisterStudentDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  nationalId: z.string().min(10),
  studentPhone: z.string().min(5),
  parentPhone: z.string().min(5),
  stage: z.string().min(1),
  age: z.number().int().min(5),
  center: z.string().min(1)
})

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})
