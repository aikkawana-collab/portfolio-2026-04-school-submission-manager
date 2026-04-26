import React from 'react'
import { Student } from '../App'

const STATUS_COLOR: Record<string, string> = {
  '提出済': '#c8e6c9',
  '確認済': '#bbdefb',
  '再提出': '#ffe0b2',
  '': '#ffcdd2',
}

export default function StudentList({
  students,
  selectedStudent,
  onSelectStudent,
}: {
  students: Student[]
  selectedStudent: Student | null
  onSelectStudent: (s: Student) => void
}) {
  return (
    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold', color: '#333' }}>
        児童一覧 ({students.length}名)
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
        {students.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
            該当する児童が見つかりません
          </div>
        ) : (
          students.map(student => (
            <div
              key={student.uuid}
              onClick={() => onSelectStudent(student)}
              style={{
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                background: selectedStudent?.uuid === student.uuid ? '#e3f2fd' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span style={{ color: '#999', fontSize: '0.85rem', minWidth: '2rem' }}>{student.number}</span>
              <span style={{ fontWeight: 500, flex: 1 }}>{student.name}</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Object.values(student.assignments).map((a, i) => (
                  <span
                    key={i}
                    title={`${a.name}: ${a.status || '未提出'}`}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '3px',
                      background: STATUS_COLOR[a.status] ?? '#ffcdd2',
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
              <span style={{
                fontWeight: 'bold',
                color: student.rate >= 80 ? '#388e3c' : student.rate >= 60 ? '#f57c00' : '#d32f2f',
                minWidth: '40px',
                textAlign: 'right',
              }}>
                {student.rate}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
