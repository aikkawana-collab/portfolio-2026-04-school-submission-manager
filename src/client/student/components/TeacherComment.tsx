import React from 'react'

export default function TeacherComment({ comment }: { comment: string }) {
  if (!comment) return null
  return (
    <div style={{ background: '#E3F2FD', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '0.5rem', borderLeft: '3px solid #1976d2' }}>
      <span style={{ fontSize: '0.875rem', color: '#1565c0' }}>💬 先生から: {comment}</span>
    </div>
  )
}
