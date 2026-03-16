import type { ColumnProfile, SemanticField, SemanticFieldType } from './types'

const HEADER_KEYWORDS: Record<SemanticFieldType, RegExp> = {
  'identifier': /\b(id|employee\s*id|emp\s*id|staff\s*id|uid)\b/i,
  'person-name': /\b(name|employee\s*name|staff\s*name|full\s*name|first\s*name|last\s*name)\b/i,
  'manager-name': /\b(manager|supervisor|line\s*manager|mgr|manager\s*name)\b/i,
  'business-unit': /\b(business\s*unit|division|function|team|department|bu|dept)\b/i,
  'location': /\b(location|office|site|region|city|branch)\b/i,
  'tenure-band': /\b(tenure|length\s*of\s*service|years\s*service|seniority|service\s*years)\b/i,
  'probation-period': /\b(period|probation\s*period|month|3\s*month|6\s*month|12\s*month)\b/i,
  'assessment-status': /\b(self\s*assessment|self\s*review|self\s*evaluation|self|assessment|review|evaluation|status)\b/i,
  'assessment-score': /\b(self\s*score|mgr\s*score|manager\s*score|score|rating|assessment|review)\b/i,
  'survey-score': /\b(score|rating|avg|average|mean|value)\b/i,
  'survey-question-text': /\b(question|q\d+|item|prompt|text|description)\b/i,
  'respondent-count': /\b(count|respondents|responses|n|sample\s*size)\b/i,
  'date': /\b(date|completed\s*on|review\s*date|assessment\s*date|started|ended|submission)\b/i,
  'yes-no': /\b(yes|no|flag|indicator|yn)\b/i,
  'exit-reason': /\b(reason|driver|leaving|departure\s*reason|exit\s*reason|resignation)\b/i,
  'comment-text': /\b(comments?|feedback|notes?|remarks|notes|observations)\b/i,
  'category': /\b(category|group|type|class)\b/i,
  'metric': /\b(metric|measure|kpi|indicator)\b/i,
  'unknown': /(?!)/
}

function scoreHeaderMatch(normalizedHeader: string): SemanticFieldType[] {
  const matches: Array<{ type: SemanticFieldType; score: number }> = []

  for (const [type, regex] of Object.entries(HEADER_KEYWORDS)) {
    if (type === 'unknown') continue
    if (regex.test(normalizedHeader)) {
      matches.push({ type: type as SemanticFieldType, score: 1 })
    }
  }

  return matches.sort((a, b) => b.score - a.score).map((m) => m.type)
}

function scoreValueDistribution(profile: ColumnProfile): SemanticFieldType[] {
  const matches: Array<{ type: SemanticFieldType; score: number }> = []

  if (profile.numericLikeRatio > 0.8) {
    // Calculate average of numeric values
    const nums = profile.cells
      .filter((c) => c.parsedNumber !== undefined)
      .map((c) => c.parsedNumber!)

    if (nums.length > 0) {
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length

      if (avg >= 1 && avg <= 5) {
        matches.push({ type: 'survey-score', score: 0.9 })
      } else if (avg >= 0 && avg <= 10) {
        matches.push({ type: 'assessment-score', score: 0.8 })
      }
    }
  }

  if (profile.statusLikeRatio > 0.7) {
    matches.push({ type: 'assessment-status', score: 0.85 })
  }

  if (profile.booleanLikeRatio > 0.8) {
    matches.push({ type: 'yes-no', score: 0.9 })
  }

  if (profile.dateLikeRatio > 0.7) {
    matches.push({ type: 'date', score: 0.85 })
  }

  if (profile.uniqueRatio > 0.9 && profile.avgTextLength > 20) {
    const types: SemanticFieldType[] = ['comment-text', 'survey-question-text']
    matches.push(...types.map((t) => ({ type: t, score: 0.7 })))
  }

  if (profile.uniqueCount <= 10 && profile.avgTextLength < 20) {
    matches.push({ type: 'category', score: 0.6 })
  }

  return matches.sort((a, b) => b.score - a.score).map((m) => m.type)
}

function deduplicateAlternatives(
  primary: SemanticFieldType,
  alternatives: SemanticFieldType[]
): SemanticFieldType[] {
  return alternatives.filter((a) => a !== primary).slice(0, 2)
}

export function classifyFields(profiles: ColumnProfile[]): SemanticField[] {
  return profiles.map((profile) => {
    const headerMatches = scoreHeaderMatch(profile.normalizedHeader)
    const valueMatches = scoreValueDistribution(profile)

    // Determine primary type and confidence
    let primaryType: SemanticFieldType = 'unknown'
    let confidence = 0
    let isAmbiguous = false

    if (headerMatches.length > 0 && valueMatches.length > 0) {
      // Both signals agree
      if (headerMatches[0] === valueMatches[0]) {
        primaryType = headerMatches[0]
        confidence = 0.9
      } else {
        // Signals conflict
        primaryType = headerMatches[0] || valueMatches[0]
        confidence = 0.6
        isAmbiguous = true
      }
    } else if (headerMatches.length > 0) {
      primaryType = headerMatches[0]
      confidence = 0.5
    } else if (valueMatches.length > 0) {
      primaryType = valueMatches[0]
      confidence = 0.4
    } else {
      primaryType = 'unknown'
      confidence = 0.2
    }

    // Collect alternatives
    const alternatives = deduplicateAlternatives(
      primaryType,
      [...headerMatches.slice(1), ...valueMatches.slice(1)]
    )

    // Warnings
    const warnings: string[] = []
    if (profile.blankRatio > 0.5) {
      warnings.push(`Column is ${Math.round(profile.blankRatio * 100)}% blank`)
    }
    if (isAmbiguous) {
      warnings.push('Header and value distribution suggest different types')
    }

    return {
      columnIndex: profile.index,
      header: profile.header,
      semanticType: primaryType,
      confidence,
      primitiveKind: profile.dominantKind,
      isAmbiguous,
      alternativeTypes: alternatives,
      warnings
    }
  })
}
