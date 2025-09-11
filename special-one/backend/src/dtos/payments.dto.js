import { z } from 'zod'

export const CreatePaymentDto = z.object({
  studentId: z.string().min(1),
  amount: z.number().nonnegative(),
  method: z.enum(['cash', 'card', 'wallet', 'online']).optional().default('cash'),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  notes: z.string().optional(),
})
