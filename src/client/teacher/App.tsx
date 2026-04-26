import React, { useState, useEffect, useCallback } from 'react'
import ClassSummary from './components/ClassSummary'
import StudentList from './components/StudentList'
import StudentDetail from './components/StudentDetail'
import FilterBar from './components/FilterBar'

// GAS の google.script.run 型宣言
declare global {
  interface Window {
    google?: {
      script: {
        run: GasRunner
      }
    }
  }
}

interface GasRunner {
  withSuccessHandler<T>(fn: (data: T) => void): GasRunner
  withFailureHandler(fn: (err: { message: string }) => void): GasRunner
  getClassSummaryForTeacher(): void
  getStudentListForTeacher(filter: Filter): void
  exportCsvForTeacher(): void
}

export interface Assignment {
  status: string
  name: string
}

export interface Student {
  uuid: string
  number: number
  name: string
  class: string
  rate: number
  submittedCount: number
  totalCount: number
  assignments: Record<string, Assignment>
}

export interface Summary {
  totalStudents: number
  avgRate: number
  unsubmittedCount: number
  resubmitCount: number
  assignmentStats: { name: string; rate: number; submittedCount: number; total: number }[]
}

export interface Filter {
  status?: string
  assignment?: string
  query?: string
}

// 開発環境用モックデータ
const MOCK_SUMMARY: Summary = {
  totalStudents: 10,
  avgRate: 73,
  unsubmittedCount: 6,
  resubmitCount: 2,
  assignmentStats: [
    { name: '国語ドリル1', rate: 90, submittedCount: 9, total: 10 },
    { name: '算数プリント1', rate: 70, submittedCount: 7, total: 10 },
    { name: '理科レポート1', rate: 60, submittedCount: 6, total: 10 },
  ]
}

const MOCK_STUDENTS: Student[] = [
  { uuid: 'uuid-1', number: 1, name: '田中 太郎', class: '3年1組', rate: 100, submittedCount: 3, totalCount: 3, assignments: { '国語ドリル1': { status: '提出済', name: '国語ドリル1' }, '算数プリント1': { status: '提出済', name: '算数プリント1' }, '理科レポート1': { status: '確認済', name: '理科レポート1' } } },
  { uuid: 'uuid-2', number: 2, name: '山田 花子', class: '3年1組', rate: 67, submittedCount: 2, totalCount: 3, assignments: { '国語ドリル1': { status: '提出済', name: '国語ドリル1' }, '算数プリント1': { status: '再提出', name: '算数プリント1' }, '理科レポート1': { status: '', name: '理科レポート1' } } },
  { uuid: 'uuid-3', number: 3, name: '佐藤 健', class: '3年1組', rate: 33, submittedCount: 1, totalCount: 3, assignments: { '国語ドリル1': { status: '提出済', name: '国語ドリル1' }, '算数プリント1': { status: '', name: '算数プリント1' }, '理科レポート1': { status: '', name: '理科レポート1' } } },
]

function isGasEnv(): boolean {
  return typeof window !== 'undefined' && window.google?.script !== undefined
}

export default function App() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [filter, setFilter] = useState<Filter>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = useCallback(() => {
    if (!isGasEnv()) {
      setSummary(MOCK_SUMMARY)
      setLoading(false)
      return
    }
    window.google!.script.run
      .withSuccessHandler<Summary>(data => { setSummary(data); setLoading(false) })
      .withFailureHandler(err => { setError(err.message); setLoading(false) })
      .getClassSummaryForTeacher()
  }, [])

  const loadStudents = useCallback((f: Filter) => {
    if (!isGasEnv()) {
      setStudents(MOCK_STUDENTS)
      return
    }
    window.google!.script.run
      .withSuccessHandler<Student[]>(data => setStudents(data))
      .withFailureHandler(err => setError(err.message))
      .getStudentListForTeacher(f)
  }, [])

  useEffect(() => {
    loadSummary()
    loadStudents({})
  }, [loadSummary, loadStudents])

  function handleFilterChange(f: Filter) {
    setFilter(f)
    loadStudents(f)
  }

  function handleExportCsv() {
    if (!isGasEnv()) { alert('CSV export: GAS環境でのみ使用可能です'); return }
    window.google!.script.run
      .withSuccessHandler<string>(csvContent => {
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `提出状況_${new Date().toLocaleDateString('ja-JP')}.csv`
        link.click()
        URL.revokeObjectURL(url)
      })
      .withFailureHandler(err => alert(err.message))
      .exportCsvForTeacher()
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: '"BIZ UDGothic", sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>データを読み込んでいます...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: '"BIZ UDGothic", sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#d32f2f' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <p>{error}</p>
        <button onClick={() => { setLoading(true); setError(null); loadSummary(); loadStudents(filter) }}>再試行</button>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: '"BIZ UDGothic", "Hiragino Sans", sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
      <header style={{ background: '#1976d2', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>📚 提出物管理ダッシュボード</h1>
        <button
          onClick={handleExportCsv}
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', minHeight: '44px' }}
        >
          CSVエクスポート
        </button>
      </header>

      <main style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        {summary && <ClassSummary summary={summary} />}

        <FilterBar
          filter={filter}
          onFilterChange={handleFilterChange}
          assignmentNames={summary?.assignmentStats.map(a => a.name) ?? []}
        />

        <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 1fr' : '1fr', gap: '1.5rem', marginTop: '1rem' }}>
          <StudentList
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
          />
          {selectedStudent && (
            <StudentDetail
              student={selectedStudent}
              onClose={() => setSelectedStudent(null)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
