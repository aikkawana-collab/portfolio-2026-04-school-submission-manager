import React from 'react'

export default function ProgressBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? '#4caf50' : rate >= 60 ? '#ff9800' : '#f44336'

  return (
    <div style={{ background: '#e0e0e0', borderRadius: '999px', height: '24px', overflow: 'hidden' }}>
      <div
        style={{
          width: `${Math.min(rate, 100)}%`,
          height: '100%',
          background: color,
          borderRadius: '999px',
          transition: 'width 1s ease-out',
        }}
      />
    </div>
  )
}
