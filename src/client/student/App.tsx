import React, { useState, useEffect } from 'react'
import ProgressBar from './components/ProgressBar'
import TaskList from './components/TaskList'
import AchievementBadge from './components/AchievementBadge'

// GAS の google.script.run 型宣言
declare global {
  interface Window {
    google?: {
      script: {
        run: GasRunner
      }
    }
    STUDENT_UUID?: string
  }
}

interface GasRunner {
  withSuccessHandler<T>(fn: (data: T) => void): GasRunner
  withFailureHandler(fn: (err: { message: string }) => void): GasRunner
  getStudentStatusByUuid(uuid: string): void
}

interface PendingTask {
  name: string
}

interface ResubmitTask {
  name: string
  comment: string
}

interface StudentStatus {
  name: string
  rate: number
  submittedCount: number
  totalCount: number
  pending: PendingTask[]
  resubmit: ResubmitTask[]
}

// 開発環境用モックデータ
const MOCK_STATUS: StudentStatus = {
  name: '田中 太郎',
  rate: 67,
  submittedCount: 2,
  totalCount: 3,
  pending: [{ name: '理科レポート1' }],
  resubmit: [{ name: '算数プリント1', comment: 'もう一度確認してね' }],
}

function isGasEnv(): boolean {
  return typeof window !== 'undefined' && window.google?.script !== undefined
}

function getUuid(): string {
  if (typeof window !== 'undefined' && window.STUDENT_UUID) {
    return window.STUDENT_UUID
  }
  return new URLSearchParams(window.location.search).get('id') ?? ''
}

export default function App() {
  const [status, setStatus] = useState<StudentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    loadStatus()
  }, [])

  function loadStatus() {
    setLoading(true)
    setError(null)

    if (!isGasEnv()) {
      // 開発環境: モックデータを使用
      setTimeout(() => { setStatus(MOCK_STATUS); setLoading(false) }, 800)
      return
    }

    const uuid = getUuid()
    if (!uuid) {
      setError('学習者IDが指定されていません。')
      setLoading(false)
      return
    }

    window.google!.script.run
      .withSuccessHandler<StudentStatus>(data => {
        setStatus(data)
        setLoading(false)
      })
      .withFailureHandler(err => {
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount(c => c + 1)
            loadStatus()
          }, 5000)
        } else {
          setError(err.message ?? 'データの読み込みに失敗しました。')
          setLoading(false)
        }
      })
      .getStudentStatusByUuid(uuid)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F5F5F0', fontFamily: '"BIZ UDGothic", sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
        <p style={{ fontSize: '1.125rem', color: '#555' }}>よみこんでいます...</p>
        {retryCount > 0 && <p style={{ fontSize: '0.875rem', color: '#999' }}>再読み込み中... ({retryCount}/3)</p>}
      </div>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F5F5F0', fontFamily: '"BIZ UDGothic", sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '320px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😟</div>
        <p style={{ fontSize: '1rem', color: '#d32f2f' }}>{error}</p>
        <button
          onClick={() => { setRetryCount(0); loadStatus() }}
          style={{ background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', padding: '0.875rem 1.75rem', fontSize: '1rem', cursor: 'pointer', minHeight: '44px', marginTop: '1rem' }}
        >
          もういちどためす
        </button>
      </div>
    </div>
  )

  if (!status) return null

  const isAllComplete = status.pending.length === 0 && status.resubmit.length === 0

  return (
    <div style={{ background: '#F5F5F0', minHeight: '100vh', fontFamily: '"BIZ UDGothic", "Hiragino Sans", sans-serif' }}>
      <header style={{ background: '#1565C0', color: 'white', padding: '1rem 1.25rem', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
          📚 {status.name}さんのていしゅつもの
        </h1>
      </header>

      <main style={{ padding: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
        {isAllComplete && <AchievementBadge name={status.name} />}

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#333', lineHeight: 1.6 }}>
            ぜんぶで <strong>{status.totalCount}こ</strong> のしゅくだいのうち、
            <strong style={{ color: '#388e3c' }}>{status.submittedCount}こ</strong> だしました！
          </p>
          <ProgressBar rate={status.rate} />
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#666', textAlign: 'right' }}>
            {status.rate}% かんりょう
          </p>
        </div>

        <TaskList
          title="❌ まだていしゅつしていないもの"
          tasks={status.pending}
          color="#d32f2f"
          bgColor="#FFEBEE"
          emptyMessage="ていしゅつしていないものはありません！"
        />

        <TaskList
          title="🔄 もういちだしてください"
          tasks={status.resubmit}
          color="#e65100"
          bgColor="#FFF3E0"
          emptyMessage="さいていしゅつのものはありません！"
        />
      </main>
    </div>
  )
}
