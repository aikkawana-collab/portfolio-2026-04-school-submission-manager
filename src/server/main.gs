/**
 * 教師向けAPI
 * 全関数の冒頭でロール検証を実施（セキュリティ必須）
 */
function getClassSummaryForTeacher() {
  assertTeacherRole();
  return getClassSummary();
}

function getStudentListForTeacher(filter) {
  assertTeacherRole();
  var students = getAllStudents();
  if (!filter) return students;

  if (filter.status === '再提出') {
    students = students.filter(function(s) {
      var keys = Object.keys(s.assignments);
      for (var i = 0; i < keys.length; i++) {
        if (s.assignments[keys[i]].status === '再提出') return true;
      }
      return false;
    });
  }

  if (filter.assignment) {
    var aName = filter.assignment;
    students = students.filter(function(s) {
      var a = s.assignments[aName];
      return a && a.status !== '提出済' && a.status !== '確認済';
    });
  }

  if (filter.query) {
    var q = filter.query.toLowerCase();
    students = students.filter(function(s) {
      return s.name.toLowerCase().indexOf(q) !== -1 || s.number.toString().indexOf(q) !== -1;
    });
  }

  return students;
}

function getStudentDetailForTeacher(studentNumber) {
  assertTeacherRole();
  var students = getAllStudents();
  var num = parseInt(studentNumber);
  for (var i = 0; i < students.length; i++) {
    if (students[i].number === num) return students[i];
  }
  return null;
}

function exportCsvForTeacher() {
  assertTeacherRole();
  var students = getAllStudents();
  if (students.length === 0) return '';

  var assignmentNames = Object.keys(students[0].assignments);
  var headers = ['出席番号', '氏名', 'クラス', '提出率(%)'].concat(assignmentNames);

  var rows = students.map(function(s) {
    var cols = [s.number, s.name, s.class, s.rate];
    for (var i = 0; i < assignmentNames.length; i++) {
      var a = s.assignments[assignmentNames[i]];
      cols.push(a ? a.status : '');
    }
    return cols;
  });

  var allRows = [headers].concat(rows);
  return allRows.map(function(row) {
    return row.map(function(cell) { return '"' + cell + '"'; }).join(',');
  }).join('\n');
}

function invalidateCacheForTeacher() {
  assertTeacherRole();
  invalidateAllCaches();
  return { success: true };
}

/**
 * 児童向けAPI
 * UUID検証のみ（ロールは問わない。自分のデータのみ返却する）
 */
function getStudentStatusByUuid(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    throw new Error('無効なIDです');
  }

  var student = getStudentByUuid(uuid);
  if (!student) {
    throw new Error('データが見つかりません');
  }

  // 必要最小限のデータのみ返却（全体データは含まない）
  var pending = [];
  var resubmit = [];
  var keys = Object.keys(student.assignments);

  for (var i = 0; i < keys.length; i++) {
    var name = keys[i];
    var a = student.assignments[name];
    if (!a.status) {
      pending.push({ name: name });
    } else if (a.status === '再提出') {
      resubmit.push({ name: name, comment: '' });
    }
  }

  return {
    name: student.name,
    rate: student.rate,
    submittedCount: student.submittedCount,
    totalCount: student.totalCount,
    pending: pending,
    resubmit: resubmit
  };
}
