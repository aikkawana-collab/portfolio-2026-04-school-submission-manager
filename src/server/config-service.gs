var CONFIG_SHEET_NAME = '設定';
var ROSTER_SHEET_NAME = '名簿';
var HISTORY_SHEET_NAME = '提出履歴';

function getConfig(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

function getTeacherEmails() {
  var emails = getConfig('teacher_emails');
  if (!emails) return [];
  return emails.toString().split(',').map(function(e) { return e.trim(); });
}

function getAssignmentNames() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ROSTER_SHEET_NAME);
  if (!sheet) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.slice(4).filter(function(h) { return h && h !== '提出率'; });
}
