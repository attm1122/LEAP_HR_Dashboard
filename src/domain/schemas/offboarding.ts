import { z } from 'zod'

export const OffboardingResponseSchema = z.object({
  id: z.string().min(1),
  ratingValue: z.number().min(1).max(5).nullable(),
  bu: z.string().nullable(),
  tenure: z.string().nullable(),
  driver: z.string().nullable(),
  ratings: z.record(z.string(), z.number())
})

export type OffboardingResponseSchemaType = z.infer<typeof OffboardingResponseSchema>

export const OffboardingListSchema = z.array(OffboardingResponseSchema)

export type OffboardingListSchemaType = z.infer<typeof OffboardingListSchema>
