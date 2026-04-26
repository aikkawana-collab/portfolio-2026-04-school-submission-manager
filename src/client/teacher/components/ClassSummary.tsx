import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Summary } from '../App'

export default function ClassSummary({ summary }: { summary: Summary }) {
  const cards = [
    { label: '総児童数', value: `${summary.totalStudents}名`, color: '#1976d2', icon: '👥' },
    { label: 'クラス平均提出率', value: `${summary.avgRate}%`, color: '#388e3c', icon: '📊' },
    { label: '未完了の児童', value: `${summary.unsubmittedCount}名`, color: '#f57c00', icon: '⚠️' },
    { label: '再提出対象', value: `${summary.resubmitCount}名`, color: '#d32f2f', icon: '🔄' },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {cards.map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', borderLeft: `4px solid ${card.color}` }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {summary.assignmentStats.length > 0 && (
        <div style={{ background: 'white', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#333' }}>課題別提出率</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={summary.assignmentStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {summary.assignmentStats.map((entry, i) => (
                  <Cell key={i} fill={entry.rate >= 80 ? '#4caf50' : entry.rate >= 60 ? '#ff9800' : '#f44336'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
