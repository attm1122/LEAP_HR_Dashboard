import type { SemanticField, ColumnProfile, DatasetDetectionResult, DatasetType } from './types'

interface ModuleScore {
  type: DatasetType
  score: number
  maxScore: number
  reasoning: string[]
}

export function detectDataset(
  fields: SemanticField[],
  profiles: ColumnProfile[]
): DatasetDetectionResult {
  const results: ModuleScore[] = [
    scoreProbationReview(fields, profiles),
    scoreOnboardingSurvey(fields, profiles),
    scoreOffboardingSurvey(fields, profiles)
  ]

  // Find best match
  const sorted = results.sort((a, b) => {
    const ratioA = a.score / a.maxScore
    const ratioB = b.score / b.maxScore
    return ratioB - ratioA
  })

  const winner = sorted[0]
  const threshold = winner.maxScore * 0.5 // 50% threshold

  let detectedType: DatasetType = 'unknown'
  let confidence = 0

  if (winner.score >= threshold) {
    detectedType = winner.type
    confidence = Math.min(1, winner.score / winner.maxScore)
  } else {
    // Fallback to generic-hr if we have some data
    if (fields.length > 0 && fields.some((f) => f.semanticType !== 'unknown')) {
      detectedType = 'generic-hr'
      confidence = 0.3
    }
  }

  const warnings: string[] = []
  if (confidence < 0.7) {
    warnings.push('Low confidence in module detection. Manual review recommended.')
  }

  const requiresMappingReview = confidence < 0.8 || fields.some((f) => f.isAmbiguous)

  return {
    type: detectedType,
    confidence,
    reasoning: winner.reasoning,
    fields,
    warnings,
    requiresMappingReview
  }
}

function scoreProbationReview(fields: SemanticField[], profiles: ColumnProfile[]): ModuleScore {
  let score = 0
  const reasoning: string[] = []

  const nameField = fields.find((f) => f.semanticType === 'person-name')
  if (nameField) {
    score += 2
    reasoning.push('Found person-name field')
  }

  const assessmentFields = fields.filter((f) => f.semanticType === 'assessment-status')
  if (assessmentFields.length >= 1) {
    score += 3
    reasoning.push(`Found ${assessmentFields.length} assessment-status field(s)`)
  }
  if (assessmentFields.length >= 2) {
    score += 1
    reasoning.push('Multiple assessment-status fields suggest self/manager review')
  }

  const dateField = fields.find((f) => f.semanticType === 'date')
  if (dateField) {
    score += 1
    reasoning.push('Found date field')
  }

  const probationField = fields.find((f) => f.semanticType === 'probation-period')
  if (probationField) {
    score += 2
    reasoning.push('Found probation-period field')
  }

  const managerField = fields.find((f) => f.semanticType === 'manager-name')
  if (managerField) {
    score += 1
    reasoning.push('Found manager-name field')
  }

  // Check for alternating row pattern (name / data rows)
  if (profiles.length > 0) {
    const oddRowsNameLike = profiles.filter((p) => p.avgTextLength < 30).length > 0
    if (oddRowsNameLike) {
      score += 1
      reasoning.push('Column distribution suggests alternating row pattern')
    }
  }

  return { type: 'probation-review', score, maxScore: 11, reasoning }
}

function scoreOnboardingSurvey(fields: SemanticField[], profiles: ColumnProfile[]): ModuleScore {
  let score = 0
  const reasoning: string[] = []

  const questionField = fields.find((f) => f.semanticType === 'survey-question-text')
  if (questionField) {
    score += 3
    reasoning.push('Found survey-question-text field')
  }

  const scoreFields = fields.filter((f) => f.semanticType === 'survey-score')
  if (scoreFields.length > 0) {
    score += 3
    reasoning.push(`Found ${scoreFields.length} survey-score field(s)`)
  }

  const dimensionFields = fields.filter(
    (f) =>
      f.semanticType === 'business-unit' ||
      f.semanticType === 'location' ||
      f.semanticType === 'tenure-band'
  )
  if (dimensionFields.length > 0) {
    score += 2
    reasoning.push(`Found ${dimensionFields.length} dimension field(s)`)
  }

  // Check for repeated column headers (category structure)
  const repeatedHeaders = new Map<string, number>()
  profiles.forEach((p) => {
    repeatedHeaders.set(p.normalizedHeader, (repeatedHeaders.get(p.normalizedHeader) ?? 0) + 1)
  })

  const hasRepeatedHeaders = Array.from(repeatedHeaders.values()).some((c) => c > 2)
  if (hasRepeatedHeaders) {
    score += 2
    reasoning.push('Found repeated column headers (category structure)')
  }

  return { type: 'onboarding-survey', score, maxScore: 10, reasoning }
}

function scoreOffboardingSurvey(fields: SemanticField[], profiles: ColumnProfile[]): ModuleScore {
  let score = 0
  const reasoning: string[] = []

  const exitReasonField = fields.find((f) => f.semanticType === 'exit-reason')
  if (exitReasonField) {
    score += 3
    reasoning.push('Found exit-reason field')
  }

  const scoreFields = fields.filter((f) => f.semanticType === 'survey-score')
  if (scoreFields.length > 0) {
    score += 2
    reasoning.push(`Found ${scoreFields.length} survey-score field(s)`)
  }

  const buField = fields.find((f) => f.semanticType === 'business-unit')
  if (buField) {
    score += 1
    reasoning.push('Found business-unit field')
  }

  const tenureField = fields.find((f) => f.semanticType === 'tenure-band')
  if (tenureField) {
    score += 1
    reasoning.push('Found tenure-band field')
  }

  // Multiple rows (each = respondent)
  if (profiles.length > 0) {
    const avgRowCount = profiles.reduce((sum, p) => sum + p.totalRows, 0) / profiles.length
    if (avgRowCount > 5) {
      score += 2
      reasoning.push('Multiple rows suggest survey respondent data')
    }
  }

  return { type: 'offboarding-survey', score, maxScore: 9, reasoning }
}
