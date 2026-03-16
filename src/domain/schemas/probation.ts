import { z } from 'zod'

export const ProbationEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  id: z.string().min(1, 'ID is required'),
  period: z.string().min(1, 'Period is required'),
  manager: z.string().min(1, 'Manager is required'),
  selfAssess: z.number().min(0).max(10).nullable(),
  selfDate: z.string().nullable(),
  mgrAssess: z.number().min(0).max(10).nullable(),
  mgrDate: z.string().nullable(),
  notes: z.string().nullable()
})

export type ProbationEmployeeSchemaType = z.infer<typeof ProbationEmployeeSchema>

export const ProbationListSchema = z.array(ProbationEmployeeSchema)

export type ProbationListSchemaType = z.infer<typeof ProbationListSchema>
