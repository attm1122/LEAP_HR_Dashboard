import { z } from 'zod'

export const OnboardingResponseSchema = z.object({
  id: z.string().min(1),
  allScore: z.number().nullable(),
  scores: z.record(z.string(), z.number().nullable())
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
  totalRespondents: z.number(),
  visibleQuestions: z.array(z.string())
})

export type OnboardingDashboardDataSchemaType = z.infer<typeof OnboardingDashboardDataSchema>
