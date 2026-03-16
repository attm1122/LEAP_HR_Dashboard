import { describe, it, expect } from 'vitest' // @ts-ignore
import { normalizeCell } from '../cell-normalizer'

describe('cell-normalizer', () => {
  describe('empty cells', () => {
    it('should recognize null as empty', () => {
      const result = normalizeCell(null)
      expect(result.kind).toBe('empty')
      expect(result.isEmptyLike).toBe(true)
    })

    it('should recognize undefined as empty', () => {
      const result = normalizeCell(undefined)
      expect(result.kind).toBe('empty')
      expect(result.isEmptyLike).toBe(true)
    })

    it('should recognize empty string as empty', () => {
      const result = normalizeCell('')
      expect(result.kind).toBe('empty')
      expect(result.isEmptyLike).toBe(true)
    })

    it('should recognize "-" as empty-like', () => {
      const result = normalizeCell('-')
      expect(result.isEmptyLike).toBe(true)
    })

    it('should recognize "N/A" as empty-like', () => {
      const result = normalizeCell('N/A')
      expect(result.isEmptyLike).toBe(true)
    })

    it('should recognize "na" as empty-like', () => {
      const result = normalizeCell('na')
      expect(result.isEmptyLike).toBe(true)
    })

    it('should recognize "n/a" as empty-like', () => {
      const result = normalizeCell('n/a')
      expect(result.isEmptyLike).toBe(true)
    })

    it('should recognize "nil" as empty-like', () => {
      const result = normalizeCell('nil')
      expect(result.isEmptyLike).toBe(true)
    })
  })

  describe('numbers', () => {
    it('should recognize JS number', () => {
      const result = normalizeCell(4)
      expect(result.kind).toBe('number')
      expect(result.parsedNumber).toBe(4)
      expect(result.isEmptyLike).toBe(false)
    })

    it('should recognize numeric string "4"', () => {
      const result = normalizeCell('4')
      expect(result.kind).toBe('numeric-string')
      expect(result.parsedNumber).toBe(4)
      expect(result.isEmptyLike).toBe(false)
    })

    it('should recognize numeric string with spaces " 4 "', () => {
      const result = normalizeCell(' 4 ')
      expect(result.kind).toBe('numeric-string')
      expect(result.parsedNumber).toBe(4)
    })

    it('should recognize decimal "4.75"', () => {
      const result = normalizeCell('4.75')
      expect(result.kind).toBe('numeric-string')
      expect(result.parsedNumber).toBe(4.75)
    })

    it('should recognize decimal with spaces " 4.75 "', () => {
      const result = normalizeCell(' 4.75 ')
      expect(result.kind).toBe('numeric-string')
      expect(result.parsedNumber).toBe(4.75)
    })
  })

  describe('booleans', () => {
    it('should recognize JS true', () => {
      const result = normalizeCell(true)
      expect(result.kind).toBe('boolean')
      expect(result.parsedBoolean).toBe(true)
    })

    it('should recognize JS false', () => {
      const result = normalizeCell(false)
      expect(result.kind).toBe('boolean')
      expect(result.parsedBoolean).toBe(false)
    })

    it('should recognize "Yes" as boolean-string', () => {
      const result = normalizeCell('Yes')
      expect(result.kind).toBe('boolean-string')
      expect(result.parsedBoolean).toBe(true)
    })

    it('should recognize "No" as boolean-string', () => {
      const result = normalizeCell('No')
      expect(result.kind).toBe('boolean-string')
      expect(result.parsedBoolean).toBe(false)
    })

    it('should recognize "Y" as boolean-string', () => {
      const result = normalizeCell('Y')
      expect(result.kind).toBe('boolean-string')
      expect(result.parsedBoolean).toBe(true)
    })

    it('should recognize "N" as boolean-string', () => {
      const result = normalizeCell('N')
      expect(result.kind).toBe('boolean-string')
      expect(result.parsedBoolean).toBe(false)
    })

    it('should recognize "TRUE" as boolean-string', () => {
      const result = normalizeCell('TRUE')
      expect(result.kind).toBe('boolean-string')
      expect(result.parsedBoolean).toBe(true)
    })

    it('should recognize "FALSE" as boolean-string', () => {
      const result = normalizeCell('FALSE')
      expect(result.kind).toBe('boolean-string')
      expect(result.parsedBoolean).toBe(false)
    })
  })

  describe('status strings', () => {
    it('should recognize "Completed" and normalize it', () => {
      const result = normalizeCell('Completed')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('Completed')
    })

    it('should normalize "completed" to "Completed"', () => {
      const result = normalizeCell('completed')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('Completed')
    })

    it('should normalize "complete" to "Completed"', () => {
      const result = normalizeCell('complete')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('Completed')
    })

    it('should recognize "Not Started"', () => {
      const result = normalizeCell('Not Started')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('Not Started')
    })

    it('should normalize "not started" to "Not Started"', () => {
      const result = normalizeCell('not started')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('Not Started')
    })

    it('should normalize "not-started" to "Not Started"', () => {
      const result = normalizeCell('not-started')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('Not Started')
    })

    it('should recognize "In Progress"', () => {
      const result = normalizeCell('In Progress')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('In Progress')
    })

    it('should normalize "in progress" to "In Progress"', () => {
      const result = normalizeCell('in progress')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('In Progress')
    })

    it('should normalize "in-progress" to "In Progress"', () => {
      const result = normalizeCell('in-progress')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('In Progress')
    })

    it('should recognize "Pending"', () => {
      const result = normalizeCell('Pending')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('Pending')
    })

    it('should recognize "Skipped"', () => {
      const result = normalizeCell('Skipped')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('Skipped')
    })

    it('should normalize "done" to "Completed"', () => {
      const result = normalizeCell('done')
      expect(result.kind).toBe('status-string')
      expect(result.normalizedStatus).toBe('Completed')
    })
  })

  describe('percentages', () => {
    it('should recognize "85%"', () => {
      const result = normalizeCell('85%')
      expect(result.kind).toBe('percentage-string')
      expect(result.parsedNumber).toBe(0.85)
    })

    it('should recognize "85.5%"', () => {
      const result = normalizeCell('85.5%')
      expect(result.kind).toBe('percentage-string')
      expect(result.parsedNumber).toBe(0.855)
    })
  })

  describe('currency', () => {
    it('should recognize "$120,000"', () => {
      const result = normalizeCell('$120,000')
      expect(result.kind).toBe('currency-string')
      expect(result.parsedNumber).toBe(120000)
    })

    it('should recognize "120,000" (with comma)', () => {
      const result = normalizeCell('120,000')
      expect(result.kind).toBe('currency-string')
      expect(result.parsedNumber).toBe(120000)
    })

    it('should recognize "AUD 95,000"', () => {
      const result = normalizeCell('AUD 95,000')
      expect(result.kind).toBe('currency-string')
      expect(result.parsedNumber).toBe(95000)
    })
  })

  describe('dates', () => {
    it('should recognize ISO date "2026-03-16"', () => {
      const result = normalizeCell('2026-03-16')
      expect(result.kind).toBe('date-string')
      expect(result.parsedDate).toBe('2026-03-16')
    })

    it('should recognize DD/MM/YYYY format', () => {
      const result = normalizeCell('16/03/2026')
      expect(result.kind).toBe('date-string')
      expect(result.parsedDate).toBe('2026-03-16')
    })

    it('should recognize JS Date', () => {
      const date = new Date('2026-03-16')
      const result = normalizeCell(date)
      expect(result.kind).toBe('date')
      expect(result.parsedDate).toBe('2026-03-16')
    })

    it('should recognize "March 2026" format', () => {
      const result = normalizeCell('March 2026')
      expect(result.kind).toBe('date-string')
      expect(result.parsedDate).toBe('2026-03-01')
    })

    it('should recognize "Mar 2026" format', () => {
      const result = normalizeCell('Mar 2026')
      expect(result.kind).toBe('date-string')
      expect(result.parsedDate).toBe('2026-03-01')
    })
  })

  describe('strings', () => {
    it('should recognize "John Smith" as string', () => {
      const result = normalizeCell('John Smith')
      expect(result.kind).toBe('string')
      expect(result.isEmptyLike).toBe(false)
    })

    it('should recognize long text as string', () => {
      const result = normalizeCell('This is a long comment about something important')
      expect(result.kind).toBe('string')
    })
  })
})
