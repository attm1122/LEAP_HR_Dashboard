/**
 * Presentation Planning Engine
 *
 * Pure functions that derive a PresentationPlan from raw domain data.
 * No React, no side-effects — fully testable.
 *
 * Each module planner produces:
 *   - Hero KPI (the single most important number)
 *   - Primary KPIs (3–4 key metrics)
 *   - Secondary KPIs (supporting context)
 *   - Hero visual (the most story-telling chart)
 *   - Supporting visuals (2–3 charts)
 *   - Narrative summary (rule-based exec insight)
 */

import type { ProbationEmployee } from '@/domain/models/probation'
import { getStatusKey, assessmentIsComplete } from '@/domain/models/probation'
import type { OnboardingDashboardData } from '@/domain/models/onboarding'
import type { OffboardingResponse } from '@/domain/models/offboarding'
import { SCORE_BG } from '@/lib/colour/score'
import type {
  PresentationPlan,
  KPIPlan,
  VisualPlan,
  FilterPlan,
  ChartDataPoint,
  DataQuality,
} from './types'

// ── Colour helpers ────────────────────────────────────────────────────────────

const CATEGORICAL_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#10B981', '#EF4444', '#6366F1', '#14B8A6',
]

function pctColor(pct: number): KPIPlan['color'] {
  if (pct >= 80) return 'success'
  if (pct >= 50) return 'warning'
  return 'danger'
}

function scoreColor5(avg: number | null): KPIPlan['color'] {
  if (avg === null) return 'default'
  if (avg >= 4.0) return 'success'
  if (avg >= 3.0) return 'warning'
  return 'danger'
}

function fmtPct(n: number): string {
  return `${Math.round(n)}%`
}

function fmtScore(n: number | null, decimals = 1): string {
  return n === null ? '—' : n.toFixed(decimals)
}

// ── Status colour map for probation donuts ────────────────────────────────────

const STATUS_CHART_COLORS: Record<string, string> = {
  Completed: SCORE_BG.excellent,
  'In Progress': SCORE_BG.caution,
  'Not Started': '#D1D5DB',
  Skipped: '#9CA3AF',
}

// ── Probation planner ─────────────────────────────────────────────────────────

export function planProbation(
  employees: ProbationEmployee[],
  filters: FilterPlan[] = []
): PresentationPlan {
  const total = employees.length

  // Status breakdowns
  const selfCounts: Record<string, number> = {}
  const mgrCounts: Record<string, number> = {}
  let bothComplete = 0
  let selfComplete = 0
  let mgrComplete = 0
  let inProgress = 0

  for (const emp of employees) {
    const sk = getStatusKey(emp.selfStatus)
    const mk = getStatusKey(emp.mgrStatus)
    selfCounts[sk] = (selfCounts[sk] ?? 0) + 1
    mgrCounts[mk] = (mgrCounts[mk] ?? 0) + 1
    if (assessmentIsComplete(emp.selfStatus)) selfComplete++
    if (assessmentIsComplete(emp.mgrStatus)) mgrComplete++
    if (assessmentIsComplete(emp.selfStatus) && assessmentIsComplete(emp.mgrStatus)) bothComplete++
    if (sk === 'In Progress' || mk === 'In Progress') inProgress++
  }

  const selfPct = total > 0 ? (selfComplete / total) * 100 : 0
  const mgrPct = total > 0 ? (mgrComplete / total) * 100 : 0
  const bothPct = total > 0 ? (bothComplete / total) * 100 : 0
  const pendingSelf = total - selfComplete
  const pendingMgr = total - mgrComplete

  // By-manager breakdown
  const managerMap: Record<string, { total: number; bothDone: number }> = {}
  for (const emp of employees) {
    if (!managerMap[emp.manager]) managerMap[emp.manager] = { total: 0, bothDone: 0 }
    managerMap[emp.manager].total++
    if (assessmentIsComplete(emp.selfStatus) && assessmentIsComplete(emp.mgrStatus)) {
      managerMap[emp.manager].bothDone++
    }
  }

  const managerData: ChartDataPoint[] = Object.entries(managerMap)
    .filter(([name]) => name && name !== 'Unknown')
    .map(([name, { total: t, bothDone }]) => ({
      label: name.length > 20 ? name.substring(0, 18) + '…' : name,
      rawLabel: name,
      value: t > 0 ? Math.round((bothDone / t) * 100) : 0,
      color: SCORE_BG.good,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Self status donut
  const selfDonutData: ChartDataPoint[] = Object.entries(selfCounts)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({
      label: status,
      value: count,
      color: STATUS_CHART_COLORS[status] ?? '#D1D5DB',
    }))

  // Manager status donut
  const mgrDonutData: ChartDataPoint[] = Object.entries(mgrCounts)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({
      label: status,
      value: count,
      color: STATUS_CHART_COLORS[status] ?? '#D1D5DB',
    }))

  // KPIs
  const kpis: KPIPlan[] = [
    {
      id: 'both-complete',
      label: 'Both Assessments Complete',
      value: fmtPct(bothPct),
      rawValue: bothPct,
      unit: '%',
      color: pctColor(bothPct),
      priority: 'hero',
      subtitle: `${bothComplete} of ${total} employees`,
    },
    {
      id: 'self-complete',
      label: 'Self-Assessment Complete',
      value: fmtPct(selfPct),
      rawValue: selfPct,
      unit: '%',
      color: pctColor(selfPct),
      priority: 'primary',
      subtitle: `${pendingSelf} pending`,
    },
    {
      id: 'mgr-complete',
      label: 'Manager Review Complete',
      value: fmtPct(mgrPct),
      rawValue: mgrPct,
      unit: '%',
      color: pctColor(mgrPct),
      priority: 'primary',
      subtitle: `${pendingMgr} pending`,
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      value: inProgress,
      rawValue: inProgress,
      color: inProgress > 0 ? 'warning' : 'default',
      priority: 'secondary',
      subtitle: 'at least one assessment started',
    },
    {
      id: 'total',
      label: 'Total Employees',
      value: total,
      rawValue: total,
      color: 'default',
      priority: 'secondary',
    },
  ]

  // Visuals
  const visuals: VisualPlan[] = [
    {
      id: 'self-status',
      chartType: 'donut',
      title: 'Self-Assessment Status',
      subtitle: `${total} employees`,
      data: selfDonutData,
      priority: 'hero',
      colorScheme: 'semantic',
      emptyMessage: 'No self-assessment data',
    },
    {
      id: 'mgr-status',
      chartType: 'donut',
      title: 'Manager Review Status',
      subtitle: `${total} employees`,
      data: mgrDonutData,
      priority: 'supporting',
      colorScheme: 'semantic',
      emptyMessage: 'No manager review data',
    },
    {
      id: 'by-manager',
      chartType: 'horizontal-bar',
      title: 'Completion Rate by Manager',
      subtitle: '% both assessments complete',
      data: managerData,
      priority: 'supporting',
      colorScheme: 'semantic',
      emptyMessage: 'No manager breakdown available',
    },
  ]

  // Narrative
  const quality: DataQuality =
    total === 0 ? 'incomplete'
    : bothPct >= 80 ? 'complete'
    : bothPct >= 40 ? 'partial'
    : 'incomplete'

  let narrativeSummary: string
  let narrativePoints: string[]

  if (total === 0) {
    narrativeSummary = 'No probation review data has been loaded yet.'
    narrativePoints = []
  } else {
    const lead =
      bothPct >= 80
        ? `Probation reviews are on track — ${fmtPct(bothPct)} of employees have completed both assessments.`
        : bothPct >= 50
        ? `Probation reviews are in progress — ${fmtPct(bothPct)} of ${total} employees have completed both assessments.`
        : `Probation reviews need attention — only ${fmtPct(bothPct)} of ${total} employees have completed both assessments.`

    narrativeSummary = lead

    narrativePoints = []
    if (pendingSelf > 0) {
      narrativePoints.push(`${pendingSelf} employee${pendingSelf > 1 ? 's' : ''} still need to complete their self-assessment.`)
    }
    if (pendingMgr > 0) {
      narrativePoints.push(`${pendingMgr} manager review${pendingMgr > 1 ? 's' : ''} remain outstanding.`)
    }
    if (inProgress > 0) {
      narrativePoints.push(`${inProgress} assessment${inProgress > 1 ? 's are' : ' is'} currently in progress.`)
    }
    if (managerData.length > 1) {
      const lowest = [...managerData].sort((a, b) => a.value - b.value)[0]
      if (lowest.value < 50) {
        narrativePoints.push(`${lowest.rawLabel ?? lowest.label} has the lowest completion rate at ${lowest.value}%.`)
      }
    }
  }

  return {
    module: 'probation',
    title: 'Probation Review Dashboard',
    subtitle: `${total} employee${total !== 1 ? 's' : ''} · ${new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}`,
    generatedAt: new Date().toISOString(),
    kpis,
    visuals,
    filters,
    detail: { visible: true, sortBy: 'name', sortDir: 'asc' },
    narrativeSummary,
    narrativePoints,
    dataQuality: quality,
    totalRecords: total,
  }
}

// ── Onboarding planner ────────────────────────────────────────────────────────

export function planOnboarding(
  data: OnboardingDashboardData,
  filters: FilterPlan[] = []
): PresentationPlan {
  const { responses, questions, dimensions, totalRespondents, visibleQuestions } = data
  const total = totalRespondents

  // Overall avg score across all responses
  const allScores = responses.map((r) => r.allScore).filter((s): s is number => s !== null)
  const overallAvg = allScores.length > 0
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : null

  // Per-question avg scores
  const questionAvgs: Record<string, number | null> = {}
  for (const q of visibleQuestions) {
    const vals = responses.map((r) => r.scores[q] ?? null).filter((v): v is number => v !== null)
    questionAvgs[q] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  // Best and worst questions
  const rankedQ = Object.entries(questionAvgs)
    .filter(([, v]) => v !== null)
    .sort(([, a], [, b]) => (b as number) - (a as number))

  const topQ = rankedQ[0]
  const bottomQ = rankedQ[rankedQ.length - 1]

  const topQText = topQ ? (questions.find((q) => q.id === topQ[0])?.text ?? topQ[0]) : null
  const bottomQText = bottomQ ? (questions.find((q) => q.id === bottomQ[0])?.text ?? bottomQ[0]) : null

  // Satisfaction rate: % of responses with allScore >= 4.0
  const satisfiedCount = allScores.filter((s) => s >= 4.0).length
  const satisfactionPct = allScores.length > 0 ? (satisfiedCount / allScores.length) * 100 : null

  // Dimension breakdown for first available dimension
  const dimKeys = Object.keys(dimensions)
  const primaryDimKey = dimKeys[0] ?? null

  const dimBarData: ChartDataPoint[] = []
  if (primaryDimKey) {
    for (const dim of dimensions[primaryDimKey] ?? []) {
      const dimResponses = responses.filter((r) => r.scores[dim.value] !== undefined)
      const dimScores = dimResponses.map((r) => r.scores[dim.value]).filter((v): v is number => v !== null)
      const dimAvg = dimScores.length > 0 ? dimScores.reduce((a, b) => a + b, 0) / dimScores.length : null
      if (dimAvg !== null) {
        dimBarData.push({
          label: dim.value.length > 20 ? dim.value.substring(0, 18) + '…' : dim.value,
          rawLabel: dim.value,
          value: Math.round(dimAvg * 10) / 10,
          color: dimAvg >= 4.0 ? SCORE_BG.excellent : dimAvg >= 3.0 ? SCORE_BG.caution : SCORE_BG.problem,
        })
      }
    }
    dimBarData.sort((a, b) => b.value - a.value)
  }

  // Question score bar
  const questionBarData: ChartDataPoint[] = rankedQ
    .slice(0, 8)
    .map(([id, avg], i) => {
      const text = questions.find((q) => q.id === id)?.text ?? id
      const shortLabel = text.length > 35 ? text.substring(0, 33) + '…' : text
      const a = avg as number
      return {
        label: shortLabel,
        rawLabel: text,
        value: Math.round(a * 10) / 10,
        color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length],
      }
    })

  // KPIs
  const kpis: KPIPlan[] = [
    {
      id: 'overall-avg',
      label: 'Overall Satisfaction Score',
      value: overallAvg !== null ? fmtScore(overallAvg) : '—',
      rawValue: overallAvg,
      unit: '/5',
      color: scoreColor5(overallAvg),
      priority: 'hero',
      subtitle: `${total} respondent${total !== 1 ? 's' : ''}`,
    },
    {
      id: 'satisfaction-rate',
      label: 'Satisfaction Rate',
      value: satisfactionPct !== null ? fmtPct(satisfactionPct) : '—',
      rawValue: satisfactionPct,
      unit: '%',
      color: satisfactionPct !== null ? pctColor(satisfactionPct) : 'default',
      priority: 'primary',
      subtitle: 'score ≥ 4.0 / 5.0',
    },
    {
      id: 'respondents',
      label: 'Total Respondents',
      value: total,
      rawValue: total,
      color: 'default',
      priority: 'primary',
    },
    {
      id: 'questions',
      label: 'Questions Tracked',
      value: visibleQuestions.length,
      rawValue: visibleQuestions.length,
      color: 'default',
      priority: 'secondary',
    },
  ]

  // Visuals
  const visuals: VisualPlan[] = [
    {
      id: 'question-scores',
      chartType: 'horizontal-bar',
      title: 'Score by Question',
      subtitle: 'avg score out of 5.0',
      data: questionBarData,
      priority: 'hero',
      colorScheme: 'categorical',
      emptyMessage: 'No question data available',
    },
    ...(dimBarData.length > 0
      ? [
          {
            id: 'dim-scores',
            chartType: 'horizontal-bar' as const,
            title: `Score by ${primaryDimKey ?? 'Dimension'}`,
            subtitle: 'avg score out of 5.0',
            data: dimBarData,
            priority: 'supporting' as const,
            colorScheme: 'semantic' as const,
            emptyMessage: 'No dimension data',
          },
        ]
      : []),
  ]

  // Narrative
  const quality: DataQuality =
    total === 0 ? 'incomplete'
    : visibleQuestions.length > 0 ? 'complete'
    : 'partial'

  let narrativeSummary: string
  let narrativePoints: string[]

  if (total === 0) {
    narrativeSummary = 'No onboarding survey data has been loaded yet.'
    narrativePoints = []
  } else {
    const scoreLabel = overallAvg !== null ? `${fmtScore(overallAvg)}/5.0` : 'no overall score'
    const sentimentWord = overallAvg !== null
      ? overallAvg >= 4.0 ? 'strong' : overallAvg >= 3.0 ? 'moderate' : 'low'
      : 'unknown'

    narrativeSummary = `Onboarding satisfaction is ${sentimentWord} with an average score of ${scoreLabel} across ${total} respondents.`
    narrativePoints = []

    if (satisfactionPct !== null) {
      narrativePoints.push(`${fmtPct(satisfactionPct)} of respondents rated their experience 4.0 or above.`)
    }
    if (topQText && topQ) {
      narrativePoints.push(`Highest rated area: "${topQText}" (avg ${fmtScore(topQ[1] as number)}/5.0).`)
    }
    if (bottomQText && bottomQ && (bottomQ[1] as number) < (topQ?.[1] as number ?? 5)) {
      narrativePoints.push(`Lowest rated area: "${bottomQText}" (avg ${fmtScore(bottomQ[1] as number)}/5.0) — consider follow-up.`)
    }
  }

  return {
    module: 'onboarding',
    title: 'Onboarding Survey Dashboard',
    subtitle: `${total} respondent${total !== 1 ? 's' : ''} · ${new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}`,
    generatedAt: new Date().toISOString(),
    kpis,
    visuals,
    filters,
    detail: { visible: true },
    narrativeSummary,
    narrativePoints,
    dataQuality: quality,
    totalRecords: total,
  }
}

// ── Offboarding planner ───────────────────────────────────────────────────────

export function planOffboarding(
  responses: OffboardingResponse[],
  filters: FilterPlan[] = []
): PresentationPlan {
  const total = responses.length

  // Overall avg rating
  const ratings = responses.map((r) => r.ratingValue).filter((v): v is number => v !== null)
  const overallAvg = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : null

  // Satisfaction rate: ratingValue >= 4
  const satisfiedCount = ratings.filter((r) => r >= 4).length
  const satisfactionPct = ratings.length > 0 ? (satisfiedCount / ratings.length) * 100 : null

  // Exit drivers
  const driverCounts: Record<string, number> = {}
  for (const r of responses) {
    if (r.driver) {
      driverCounts[r.driver] = (driverCounts[r.driver] ?? 0) + 1
    }
  }
  const driverData: ChartDataPoint[] = Object.entries(driverCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([label, count], i) => ({
      label: label.length > 25 ? label.substring(0, 23) + '…' : label,
      rawLabel: label,
      value: count,
      color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length],
    }))

  const topDriver = driverData[0] ?? null

  // BU breakdown
  const buCounts: Record<string, { total: number; sumRating: number; countRating: number }> = {}
  for (const r of responses) {
    if (r.bu) {
      if (!buCounts[r.bu]) buCounts[r.bu] = { total: 0, sumRating: 0, countRating: 0 }
      buCounts[r.bu].total++
      if (r.ratingValue !== null) {
        buCounts[r.bu].sumRating += r.ratingValue
        buCounts[r.bu].countRating++
      }
    }
  }

  const buBarData: ChartDataPoint[] = Object.entries(buCounts)
    .map(([bu, { sumRating, countRating }]) => {
      const avg = countRating > 0 ? sumRating / countRating : null
      return {
        label: bu.length > 20 ? bu.substring(0, 18) + '…' : bu,
        rawLabel: bu,
        value: avg !== null ? Math.round(avg * 10) / 10 : 0,
        color: avg !== null
          ? avg >= 4.0 ? SCORE_BG.excellent
          : avg >= 3.0 ? SCORE_BG.caution
          : SCORE_BG.problem
          : '#D1D5DB',
      }
    })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  // Tenure breakdown
  const tenureCounts: Record<string, number> = {}
  for (const r of responses) {
    if (r.tenure) tenureCounts[r.tenure] = (tenureCounts[r.tenure] ?? 0) + 1
  }
  const tenureData: ChartDataPoint[] = Object.entries(tenureCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([label, count], i) => ({
      label,
      value: count,
      color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length],
    }))

  // KPIs
  const kpis: KPIPlan[] = [
    {
      id: 'avg-rating',
      label: 'Average Exit Rating',
      value: overallAvg !== null ? fmtScore(overallAvg) : '—',
      rawValue: overallAvg,
      unit: '/5',
      color: scoreColor5(overallAvg),
      priority: 'hero',
      subtitle: `${total} respondent${total !== 1 ? 's' : ''}`,
    },
    {
      id: 'satisfaction-rate',
      label: 'Satisfaction Rate',
      value: satisfactionPct !== null ? fmtPct(satisfactionPct) : '—',
      rawValue: satisfactionPct,
      unit: '%',
      color: satisfactionPct !== null ? pctColor(satisfactionPct) : 'default',
      priority: 'primary',
      subtitle: 'rating ≥ 4 / 5',
    },
    {
      id: 'top-driver',
      label: 'Top Exit Driver',
      value: topDriver ? topDriver.rawLabel ?? topDriver.label : '—',
      rawValue: topDriver ? topDriver.value : null,
      color: topDriver ? 'warning' : 'default',
      priority: 'primary',
      subtitle: topDriver ? `${topDriver.value} respondent${topDriver.value !== 1 ? 's' : ''}` : undefined,
    },
    {
      id: 'respondents',
      label: 'Total Respondents',
      value: total,
      rawValue: total,
      color: 'default',
      priority: 'secondary',
    },
    {
      id: 'bus',
      label: 'Business Units',
      value: Object.keys(buCounts).length,
      rawValue: Object.keys(buCounts).length,
      color: 'default',
      priority: 'secondary',
    },
  ]

  // Visuals
  const visuals: VisualPlan[] = [
    {
      id: 'exit-drivers',
      chartType: 'donut',
      title: 'Exit Drivers',
      subtitle: `${total} respondents`,
      data: driverData,
      priority: 'hero',
      colorScheme: 'categorical',
      emptyMessage: 'No exit driver data available',
    },
    ...(buBarData.length > 0
      ? [
          {
            id: 'bu-rating',
            chartType: 'horizontal-bar' as const,
            title: 'Avg Rating by Business Unit',
            subtitle: 'out of 5.0',
            data: buBarData,
            priority: 'supporting' as const,
            colorScheme: 'semantic' as const,
            emptyMessage: 'No BU data',
          },
        ]
      : []),
    ...(tenureData.length > 0
      ? [
          {
            id: 'tenure-dist',
            chartType: 'donut' as const,
            title: 'Respondents by Tenure',
            data: tenureData,
            priority: 'supporting' as const,
            colorScheme: 'categorical' as const,
            emptyMessage: 'No tenure data',
          },
        ]
      : []),
  ]

  // Narrative
  const quality: DataQuality = total === 0 ? 'incomplete' : 'complete'

  let narrativeSummary: string
  let narrativePoints: string[]

  if (total === 0) {
    narrativeSummary = 'No offboarding survey data has been loaded yet.'
    narrativePoints = []
  } else {
    const sentimentWord = overallAvg !== null
      ? overallAvg >= 4.0 ? 'positive' : overallAvg >= 3.0 ? 'mixed' : 'concerning'
      : 'uncertain'

    narrativeSummary = `Overall exit sentiment is ${sentimentWord}${overallAvg !== null ? ` with an average rating of ${fmtScore(overallAvg)}/5.0` : ''} across ${total} respondents.`
    narrativePoints = []

    if (topDriver) {
      const pct = total > 0 ? Math.round((topDriver.value / total) * 100) : 0
      narrativePoints.push(`Primary exit driver is "${topDriver.rawLabel ?? topDriver.label}" cited by ${pct}% of respondents.`)
    }
    if (satisfactionPct !== null) {
      const dissatisfiedPct = 100 - satisfactionPct
      if (dissatisfiedPct > 30) {
        narrativePoints.push(`${fmtPct(dissatisfiedPct)} of respondents rated their exit experience below 4.0 — warrants investigation.`)
      } else {
        narrativePoints.push(`${fmtPct(satisfactionPct)} of respondents reported a satisfactory exit experience.`)
      }
    }
    if (buBarData.length > 1) {
      const lowest = [...buBarData].sort((a, b) => a.value - b.value)[0]
      if (lowest.value < 3.0) {
        narrativePoints.push(`${lowest.rawLabel ?? lowest.label} has the lowest exit satisfaction at ${fmtScore(lowest.value)}/5.0.`)
      }
    }
  }

  return {
    module: 'offboarding',
    title: 'Offboarding Survey Dashboard',
    subtitle: `${total} respondent${total !== 1 ? 's' : ''} · ${new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}`,
    generatedAt: new Date().toISOString(),
    kpis,
    visuals,
    filters,
    detail: { visible: true },
    narrativeSummary,
    narrativePoints,
    dataQuality: quality,
    totalRecords: total,
  }
}
