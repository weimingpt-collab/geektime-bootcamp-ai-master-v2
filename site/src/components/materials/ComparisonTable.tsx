import { useState } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'string' | 'number';
  align?: 'left' | 'center' | 'right';
  highlightBest?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ComparisonTableProps {
  data: Record<string, any>[];
  columns: Column[];
  interactive?: boolean;
  highlightBest?: boolean;
}

export default function ComparisonTable({
  data = [],
  columns = [],
  interactive = true,
  highlightBest = false,
}: ComparisonTableProps) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [highlightedRow, setHighlightedRow] = useState(null)

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
    }

    return sortConfig.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })

  const handleSort = (key) => {
    if (!interactive) return

    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getCellValue = (row, column) => {
    const value = row[column.key]

    if (column.render) {
      return column.render(value, row)
    }

    if (typeof value === 'boolean') {
      return value ? '✓' : '✗'
    }

    return value
  }

  const getBestValue = (key, type = 'string') => {
    if (!highlightBest) return null

    const values = data.map(row => row[key])

    if (type === 'number') {
      return Math.max(...values.filter(v => typeof v === 'number'))
    }

    return null
  }

  const isBestValue = (row, column) => {
    if (!highlightBest || !column.highlightBest) return false

    const bestValue = getBestValue(column.key, column.type)
    return bestValue !== null && row[column.key] === bestValue
  }

  return (
    <div className="comparison-table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                className={`
                  ${interactive && column.sortable !== false ? 'sortable' : ''}
                  ${sortConfig.key === column.key ? 'sorted' : ''}
                `}
              >
                <div className="th-content">
                  <span>{column.label}</span>
                  {interactive && column.sortable !== false && (
                    <span className="sort-icon">
                      {sortConfig.key === column.key
                        ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                        : '⇅'
                      }
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`
                ${highlightedRow === rowIdx ? 'highlighted' : ''}
                ${interactive ? 'interactive-row' : ''}
              `}
              onMouseEnter={() => interactive && setHighlightedRow(rowIdx)}
              onMouseLeave={() => interactive && setHighlightedRow(null)}
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className={`
                    ${column.align || 'left'}
                    ${isBestValue(row, column) ? 'best-value' : ''}
                  `}
                >
                  {getCellValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
