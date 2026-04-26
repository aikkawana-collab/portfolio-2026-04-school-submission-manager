import React from 'react'

interface Task {
  name: string
  comment?: string
}

export default function TaskList({
  title,
  tasks,
  color,
  bgColor,
  emptyMessage,
}: {
  title: string
  tasks: Task[]
  color: string
  bgColor: string
  emptyMessage: string
}) {
  if (tasks.length === 0) {
    return (
      <div style={{ background: '#E8F5E9', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', textAlign: 'center', color: '#388e3c', fontSize: '1rem' }}>
        ✅ {emptyMessage}
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ margin: '0 0 0.875rem', fontSize: '1rem', color }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tasks.map((task, i) => (
          <div
            key={i}
            style={{
              background: bgColor,
              borderRadius: '8px',
              padding: '0.875rem 1rem',
              minHeight: '44px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 500, color: '#333' }}>{task.name}</span>
            {task.comment && (
              <span style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                💬 {task.comment}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
