/**
 * Webアプリのルーティング
 */
function doGet(e) {
  var params = e.parameter;
  var view = params.view || '';

  try {
    if (view === 'teacher') {
      if (!isTeacher()) {
        return createErrorPage('アクセス権限がありません。教師アカウントでログインしてください。');
      }
      return serveTeacherDashboard();
    }
    if (view === 'student') {
      var uuid = params.id || '';
      return serveStudentPage(uuid);
    }
    // デフォルト
    if (isTeacher()) return serveTeacherDashboard();
    return createErrorPage('URLにアクセス方法が指定されていません。');
  } catch (error) {
    return createErrorPage('システムエラーが発生しました: ' + error.message);
  }
}

function serveTeacherDashboard() {
  var template = HtmlService.createTemplateFromFile('teacher');
  var html = template.evaluate();
  html.setTitle('提出物管理 - 教師ダッシュボード');
  html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function serveStudentPage(uuid) {
  if (!uuid) return createErrorPage('学習者IDが指定されていません。');
  var template = HtmlService.createTemplateFromFile('student');
  template.studentUuid = uuid;
  var html = template.evaluate();
  html.setTitle('提出物確認');
  html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function createErrorPage(message) {
  var escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  var html = '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1.0">' +
    '<title>エラー</title>' +
    '<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f0}' +
    '.box{background:white;padding:2rem;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);max-width:400px;text-align:center}' +
    'h1{color:#d32f2f}p{color:#555}' +
    'button{background:#1976d2;color:white;border:none;padding:.75rem 1.5rem;border-radius:4px;cursor:pointer;font-size:1rem;margin-top:1rem;min-height:44px}' +
    '</style></head><body>' +
    '<div class="box"><h1>⚠️ エラー</h1><p>' + escaped + '</p>' +
    '<button onclick="location.reload()">再試行</button></div>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html);
}
