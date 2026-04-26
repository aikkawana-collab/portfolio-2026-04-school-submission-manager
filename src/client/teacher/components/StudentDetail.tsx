import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Student } from '../App'

const STATUS_COLOR: Record<string, string> = {
  '提出済': '#4caf50',
  '確認済': '#2196f3',
  '再提出': '#ff9800',
  '': '#f44336',
}

const STATUS_LABEL: Record<string, string> = {
  '提出済': '✅ 提出済',
  '確認済': '🔵 確認済',
  '再提出': '🔄 再提出',
  '': '❌ 未提出',
}

export default function StudentDetail({ student, onClose }: { student: Student; onClose: () => void }) {
  const pieData = [
    { name: '提出済', value: Object.values(student.assignments).filter(a => a.status === '提出済' || a.status === '確認済').length, color: '#4caf50' },
    { name: '未提出', value: Object.values(student.assignments).filter(a => !a.status).length, color: '#f44336' },
    { name: '再提出', value: Object.values(student.assignments).filter(a => a.status === '再提出').length, color: '#ff9800' },
  ].filter(d => d.value > 0)

  return (
    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#999', fontSize: '0.85rem' }}>{student.number}番</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', marginLeft: '0.5rem' }}>{student.name}</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#999', minWidth: '44px', minHeight: '44px' }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={50} innerRadius={30}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: student.rate >= 80 ? '#388e3c' : '#d32f2f' }}>
              {student.rate}%
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              {student.submittedCount}/{student.totalCount} 提出
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.entries(student.assignments).map(([name, assignment]) => (
            <div
              key={name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                background: '#f9f9f9',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{name}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: STATUS_COLOR[assignment.status] ?? '#f44336' }}>
                {STATUS_LABEL[assignment.status] ?? '❌ 未提出'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
