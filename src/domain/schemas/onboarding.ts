import { z } from 'zod'

export const OnboardingRatingSchema = z.object({
  yes: z.number().min(0),
  no: z.number().min(0)
})

export type OnboardingRatingSchemaType = z.infer<typeof OnboardingRatingSchema>

export const OnboardingResponseSchema = z.object({
  id: z.string().min(1),
  all: OnboardingRatingSchema,
  byDimension: z.record(z.string(), OnboardingRatingSchema)
})

export type OnboardingResponseSchemaType = z.infer<typeof OnboardingResponseSchema>

export const OnboardingDashboardDataSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      text: z.string()
    })
  ),
  dimensions: z.record(
    z.string(),
    z.array(
      z.object({
        value: z.string(),
        count: z.number()
      })
    )
  ),
  responses: z.array(OnboardingResponseSchema),
  visibleQuestions: z.array(z.string())
})

export type OnboardingDashboardDataSchemaType = z.infer<typeof OnboardingDashboardDataSchema>
