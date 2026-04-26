import React from 'react'
import { Filter } from '../App'

export default function FilterBar({
  filter,
  onFilterChange,
  assignmentNames,
}: {
  filter: Filter
  onFilterChange: (f: Filter) => void
  assignmentNames: string[]
}) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', background: 'white', padding: '0.875rem 1.25rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
      <input
        type="text"
        placeholder="氏名・出席番号で検索..."
        value={filter.query ?? ''}
        onChange={e => onFilterChange({ ...filter, query: e.target.value || undefined })}
        style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', flex: 1, minWidth: '200px' }}
      />
      <select
        value={filter.status ?? ''}
        onChange={e => onFilterChange({ ...filter, status: e.target.value || undefined })}
        style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem', fontSize: '0.9rem' }}
      >
        <option value="">全ステータス</option>
        <option value="再提出">再提出あり</option>
      </select>
      <select
        value={filter.assignment ?? ''}
        onChange={e => onFilterChange({ ...filter, assignment: e.target.value || undefined })}
        style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem', fontSize: '0.9rem' }}
      >
        <option value="">全課題</option>
        {assignmentNames.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
      {(filter.query || filter.status || filter.assignment) && (
        <button
          onClick={() => onFilterChange({})}
          style={{ background: '#e0e0e0', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          クリア
        </button>
      )}
    </div>
  )
}
