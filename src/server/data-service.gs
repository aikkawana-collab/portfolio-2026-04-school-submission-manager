var STATUS_SUBMITTED = '提出済';
var STATUS_RESUBMIT = '再提出';
var STATUS_CONFIRMED = '確認済';

/**
 * 全児童データを取得（CacheService対応）
 */
function getAllStudents() {
  var cached = getCachedData(CACHE_KEY_ALL_STUDENTS);
  if (cached) return cached;
  var data = fetchAllStudentsFromSheet();
  setCachedData(CACHE_KEY_ALL_STUDENTS, data);
  return data;
}

function fetchAllStudentsFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ROSTER_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

  var rateColIdx = -1;
  for (var hi = 0; hi < headers.length; hi++) {
    if (headers[hi] === '提出率') { rateColIdx = hi; break; }
  }
  var endIdx = rateColIdx > 0 ? rateColIdx : headers.length;
  var assignmentHeaders = headers.slice(4, endIdx).filter(function(h) { return h; });

  return rows.map(function(row) {
    var assignments = {};
    assignmentHeaders.forEach(function(name, i) {
      assignments[name] = { status: row[4 + i] ? row[4 + i].toString() : '', name: name };
    });

    var submittedCount = 0;
    var keys = Object.keys(assignments);
    for (var ki = 0; ki < keys.length; ki++) {
      var s = assignments[keys[ki]].status;
      if (s === STATUS_SUBMITTED || s === STATUS_CONFIRMED) submittedCount++;
    }
    var totalCount = assignmentHeaders.length;
    var rate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

    return {
      uuid: row[0] ? row[0].toString() : '',
      number: parseInt(row[1]) || 0,
      name: row[2] ? row[2].toString() : '',
      class: row[3] ? row[3].toString() : '',
      assignments: assignments,
      rate: rate,
      submittedCount: submittedCount,
      totalCount: totalCount
    };
  }).filter(function(s) { return s.uuid && s.name; });
}

/**
 * UUIDで特定の児童データを取得
 */
function getStudentByUuid(uuid) {
  if (!validateUuid(uuid)) return null;
  var students = getAllStudents();
  for (var i = 0; i < students.length; i++) {
    if (students[i].uuid === uuid) return students[i];
  }
  return null;
}

/**
 * フォーム送信によるステータス更新
 */
function updateStudentStatus(studentNumber, assignmentName, status, teacherComment, teacherEmail) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ROSTER_SHEET_NAME);
  if (!sheet) throw new Error('名簿シートが見つかりません');

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var assignmentCol = -1;
  for (var i = 4; i < headers.length; i++) {
    if (headers[i] === assignmentName) { assignmentCol = i + 1; break; }
  }
  if (assignmentCol === -1) throw new Error('提出物「' + assignmentName + '」が見つかりません');

  var lastRow = sheet.getLastRow();
  var numbers = sheet.getRange(2, 2, lastRow - 1, 1).getValues().map(function(r) { return r[0]; });
  var rowIndex = numbers.indexOf(parseInt(studentNumber));
  if (rowIndex === -1) throw new Error('出席番号「' + studentNumber + '」が見つかりません');

  var targetRow = rowIndex + 2;
  sheet.getRange(targetRow, assignmentCol).setValue(status);
  updateStudentRate(sheet, targetRow, headers);
  appendHistory(studentNumber, assignmentName, status, teacherComment, teacherEmail);
  invalidateAllCaches();

  return { success: true };
}

function updateStudentRate(sheet, row, headers) {
  var rateColIndex = -1;
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === '提出率') { rateColIndex = i + 1; break; }
  }
  if (rateColIndex < 0) return;

  var startCol = 5;
  var endCol = rateColIndex - 1;
  if (endCol < startCol) return;

  var statuses = sheet.getRange(row, startCol, 1, endCol - startCol + 1).getValues()[0];
  var total = statuses.length;
  var submitted = 0;
  for (var i = 0; i < statuses.length; i++) {
    if (statuses[i] === STATUS_SUBMITTED || statuses[i] === STATUS_CONFIRMED) submitted++;
  }
  sheet.getRange(row, rateColIndex).setValue(total > 0 ? Math.round((submitted / total) * 100) : 0);
}

function appendHistory(studentNumber, assignmentName, status, comment, teacherEmail) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var histSheet = ss.getSheetByName(HISTORY_SHEET_NAME);
  if (!histSheet) return;
  histSheet.appendRow([new Date(), teacherEmail || '', studentNumber, assignmentName, status, comment || '']);
}

/**
 * クラスサマリーを取得（CacheService対応）
 */
function getClassSummary() {
  var cached = getCachedData(CACHE_KEY_CLASS_SUMMARY);
  if (cached) return cached;

  var students = getAllStudents();
  if (students.length === 0) {
    return { totalStudents: 0, avgRate: 0, unsubmittedCount: 0, resubmitCount: 0, assignmentStats: [] };
  }

  var totalRate = 0;
  for (var i = 0; i < students.length; i++) totalRate += students[i].rate;
  var avgRate = Math.round(totalRate / students.length);

  var unsubmittedCount = 0;
  for (var i = 0; i < students.length; i++) {
    if (students[i].rate < 100) unsubmittedCount++;
  }

  var resubmitCount = 0;
  for (var i = 0; i < students.length; i++) {
    var keys = Object.keys(students[i].assignments);
    for (var ki = 0; ki < keys.length; ki++) {
      if (students[i].assignments[keys[ki]].status === STATUS_RESUBMIT) {
        resubmitCount++;
        break;
      }
    }
  }

  var assignmentNames = students.length > 0 ? Object.keys(students[0].assignments) : [];
  var assignmentStats = assignmentNames.map(function(name) {
    var count = 0;
    for (var si = 0; si < students.length; si++) {
      var a = students[si].assignments[name];
      if (a && (a.status === STATUS_SUBMITTED || a.status === STATUS_CONFIRMED)) count++;
    }
    return {
      name: name,
      rate: Math.round((count / students.length) * 100),
      submittedCount: count,
      total: students.length
    };
  });

  var summary = {
    totalStudents: students.length,
    avgRate: avgRate,
    unsubmittedCount: unsubmittedCount,
    resubmitCount: resubmitCount,
    assignmentStats: assignmentStats
  };

  setCachedData(CACHE_KEY_CLASS_SUMMARY, summary);
  return summary;
}
