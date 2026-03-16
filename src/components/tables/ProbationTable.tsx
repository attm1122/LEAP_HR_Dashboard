import React, { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table'
import { ProbationEmployee } from '@/domain/models/probation'
import { formatDate } from '@/lib/dates/parsing'
import { scoreColor } from '@/lib/colour/score'

interface ProbationTableProps {
  data: ProbationEmployee[]
}

const ProbationTable: React.FC<ProbationTableProps> = ({ data }) => {
  const columns = useMemo<ColumnDef<ProbationEmployee>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Employee Name',
        cell: (info) => <span className="font-medium">{info.getValue() as string}</span>
      },
      {
        accessorKey: 'id',
        header: 'ID'
      },
      {
        accessorKey: 'manager',
        header: 'Manager'
      },
      {
        accessorKey: 'selfAssess',
        header: 'Self Assessment',
        cell: (info) => {
          const value = info.getValue() as number | null
          if (value === null) return '—'
          const { bg, fg } = scoreColor(value)
          return (
            <span
              className="score-badge"
              style={{ backgroundColor: bg, color: fg }}
            >
              {value.toFixed(1)}/10
            </span>
          )
        }
      },
      {
        accessorKey: 'selfDate',
        header: 'Self Assessment Date',
        cell: (info) => formatDate(info.getValue() as string | null)
      },
      {
        accessorKey: 'mgrAssess',
        header: 'Manager Assessment',
        cell: (info) => {
          const value = info.getValue() as number | null
          if (value === null) return '—'
          const { bg, fg } = scoreColor(value)
          return (
            <span
              className="score-badge"
              style={{ backgroundColor: bg, color: fg }}
            >
              {value.toFixed(1)}/10
            </span>
          )
        }
      },
      {
        accessorKey: 'mgrDate',
        header: 'Manager Assessment Date',
        cell: (info) => formatDate(info.getValue() as string | null)
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: (info) => {
          const value = info.getValue() as string | null
          return value ? <span className="truncate">{value}</span> : '—'
        }
      }
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full">
        <thead className="border-b border-border bg-accent">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-4 text-left font-semibold text-white"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border hover:bg-surface-muted">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {table.getRowModel().rows.length === 0 && (
        <div className="py-8 text-center text-text-muted">No records found</div>
      )}
    </div>
  )
}

export default ProbationTable
