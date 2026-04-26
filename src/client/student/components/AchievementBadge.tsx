import React, { useEffect, useState } from 'react'

export default function AchievementBadge({ name }: { name: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1rem',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(255,165,0,0.3)',
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
        よくがんばりました！
      </div>
      <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.25rem' }}>
        {name}さん、ていしゅつものをぜんぶだしました！
      </div>
    </div>
  )
}
