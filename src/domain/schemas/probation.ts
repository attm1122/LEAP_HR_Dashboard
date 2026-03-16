import { z } from 'zod'

export const ProbationEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  id: z.string(),
  period: z.string(),
  manager: z.string(),
  selfStatus: z.string().nullable(),
  selfScore: z.number().min(0).max(10).nullable(),
  selfDate: z.string().nullable(),
  mgrStatus: z.string().nullable(),
  mgrScore: z.number().min(0).max(10).nullable(),
  mgrDate: z.string().nullable(),
  notes: z.string().nullable()
})

export type ProbationEmployeeSchemaType = z.infer<typeof ProbationEmployeeSchema>

export const ProbationListSchema = z.array(ProbationEmployeeSchema)

export type ProbationListSchemaType = z.infer<typeof ProbationListSchema>
