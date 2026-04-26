/**
 * ビルド後のHTMLをGAS用テンプレートとしてsrc/server/にコピーする
 * 児童用は STUDENT_UUID テンプレート変数を挿入する
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

function copyTeacherHtml() {
  const src = path.join(ROOT, 'dist/teacher/index.html')
  const dest = path.join(ROOT, 'src/server/teacher.html')

  if (!fs.existsSync(src)) {
    console.error('teacher/index.html not found:', src)
    process.exit(1)
  }

  let html = fs.readFileSync(src, 'utf-8')
  fs.writeFileSync(dest, html, 'utf-8')
  console.log('✅ teacher.html copied to src/server/')
}

function copyStudentHtml() {
  const src = path.join(ROOT, 'dist/student/index.html')
  const dest = path.join(ROOT, 'src/server/student.html')

  if (!fs.existsSync(src)) {
    console.error('student/index.html not found:', src)
    process.exit(1)
  }

  let html = fs.readFileSync(src, 'utf-8')

  // GAS テンプレート変数を head の最初に挿入
  html = html.replace(
    '<head>',
    '<head>\n  <script>var STUDENT_UUID = "<?= studentUuid ?>";</script>'
  )

  fs.writeFileSync(dest, html, 'utf-8')
  console.log('✅ student.html copied to src/server/ (with GAS template variable)')
}

copyTeacherHtml()
copyStudentHtml()
console.log('🎉 HTML copy complete!')
