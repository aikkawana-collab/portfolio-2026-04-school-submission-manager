/**
 * フォーム送信トリガーハンドラー（インストーラブルトリガー）
 * 提出物名はチェックボックスで複数選択可能。
 * カンマ区切りで届くため、全件ループして更新する。
 */
function onFormSubmitHandler(e) {
  try {
    var values = e.namedValues;
    var studentNumber = getFormValue(values, '出席番号');
    var status = getFormValue(values, 'ステータス');
    var comment = getFormValue(values, 'コメント') || '';
    var teacherEmail = getCurrentUserEmail();

    // チェックボックスの回答は「提出物A, 提出物B」形式で1つの文字列として届く
    var rawAssignments = getFormValue(values, '提出物名');

    if (!studentNumber || !rawAssignments || !status) {
      console.error('必須フィールドが不足しています', JSON.stringify(values));
      return;
    }

    // カンマ区切りで分割して各提出物を処理
    var assignmentNames = rawAssignments.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; });

    for (var i = 0; i < assignmentNames.length; i++) {
      updateStudentStatus(studentNumber, assignmentNames[i], status, comment, teacherEmail);
      console.log('更新完了: ' + studentNumber + ' / ' + assignmentNames[i] + ' / ' + status);
    }

    applyConditionalFormatting();

  } catch (error) {
    console.error('フォーム処理エラー: ' + error.message);
  }
}

function getFormValue(namedValues, fieldName) {
  var value = namedValues[fieldName];
  if (!value || value.length === 0) return '';
  return value[0].toString().trim();
}

/**
 * トリガーをプログラム的に作成
 */
function setupFormTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmitHandler') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onFormSubmitHandler')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  console.log('フォームトリガーを設定しました');
}
