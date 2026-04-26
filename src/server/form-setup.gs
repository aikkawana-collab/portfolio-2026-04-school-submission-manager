/**
 * Googleフォームを自動作成してスプレッドシートに連携する
 * スプレッドシートのメニュー「提出物管理」→「④ フォームを自動作成」から実行
 */
function createAndLinkForm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 既存フォームIDが設定シートにあればスキップ
  var existingFormUrl = getConfig('form_url');
  if (existingFormUrl) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(
      '既存フォームが見つかりました',
      '既存のフォーム:\n' + existingFormUrl + '\n\n新しく作り直しますか？',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
  }

  // --- 名簿から課題名と出席番号一覧を取得 ---
  var rosterSheet = ss.getSheetByName(ROSTER_SHEET_NAME);
  if (!rosterSheet) {
    SpreadsheetApp.getUi().alert('名簿シートが見つかりません。先に初期セットアップを実行してください。');
    return;
  }

  var headers = rosterSheet.getRange(1, 1, 1, rosterSheet.getLastColumn()).getValues()[0];
  var rateColIdx = headers.indexOf('提出率');
  var endIdx = rateColIdx > 0 ? rateColIdx : headers.length;
  var assignmentNames = headers.slice(4, endIdx).filter(function(h) { return h; });

  if (assignmentNames.length === 0) {
    SpreadsheetApp.getUi().alert('提出物が見つかりません。名簿シートに提出物列を追加してください。');
    return;
  }

  var lastRow = rosterSheet.getLastRow();
  var studentNumbers = [];
  if (lastRow >= 2) {
    var numValues = rosterSheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var ni = 0; ni < numValues.length; ni++) {
      if (numValues[ni][0]) studentNumbers.push(numValues[ni][0].toString());
    }
  }

  // --- フォームを作成 ---
  var form = FormApp.create('提出物ステータス入力フォーム');
  form.setTitle('提出物ステータス入力フォーム');
  form.setDescription('教師専用フォームです。提出物のステータスを入力してください。');
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);

  // 質問1: 出席番号（プルダウン or テキスト）
  if (studentNumbers.length > 0) {
    var numberItem = form.addListItem();
    numberItem.setTitle('出席番号');
    numberItem.setRequired(true);
    numberItem.setChoiceValues(studentNumbers);
  } else {
    var numberItem2 = form.addTextItem();
    numberItem2.setTitle('出席番号');
    numberItem2.setRequired(true);
  }

  // 質問2: 提出物名（チェックボックス：複数選択可）
  var assignmentItem = form.addCheckboxItem();
  assignmentItem.setTitle('提出物名');
  assignmentItem.setRequired(true);
  assignmentItem.setHelpText('複数選択できます。同じステータスをまとめて登録できます。');
  assignmentItem.setChoiceValues(assignmentNames);

  // 質問3: ステータス（ラジオボタン）
  var statusItem = form.addMultipleChoiceItem();
  statusItem.setTitle('ステータス');
  statusItem.setRequired(true);
  statusItem.setChoices([
    statusItem.createChoice('提出済'),
    statusItem.createChoice('再提出'),
    statusItem.createChoice('確認済')
  ]);

  // 質問4: コメント（任意）
  var commentItem = form.addTextItem();
  commentItem.setTitle('コメント');
  commentItem.setRequired(false);
  commentItem.setHelpText('任意。児童への一言を入力できます（100文字以内）。前向きな表現を心がけてください。');

  // --- フォームをスプレッドシートの回答先に設定 ---
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // --- 設定シートにフォームURLを保存 ---
  saveConfig('form_url', form.getPublishedUrl());
  saveConfig('form_edit_url', form.getEditUrl());

  // --- フォーム送信トリガーを再設定 ---
  setupFormTrigger();

  // --- 完了メッセージ ---
  SpreadsheetApp.getUi().alert(
    '✅ フォーム作成・連携が完了しました！\n\n' +
    '【教師が使うURL（回答用）】\n' +
    form.getPublishedUrl() + '\n\n' +
    '【フォーム編集URL】\n' +
    form.getEditUrl() + '\n\n' +
    'このURLは設定シートにも保存されています。'
  );

  Logger.log('フォーム作成完了: ' + form.getPublishedUrl());
}

/**
 * 設定シートにキーバリューを保存（なければ追記、あれば更新）
 */
function saveConfig(key, value) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  // 見つからなければ追記
  sheet.appendRow([key, value, '自動生成']);
}

/**
 * フォームの選択肢を名簿の最新状態に同期する
 * 新しい提出物や児童を追加した後に実行する
 */
function syncFormChoices() {
  var formUrl = getConfig('form_url');
  if (!formUrl) {
    SpreadsheetApp.getUi().alert('フォームが作成されていません。先に「④ フォームを自動作成」を実行してください。');
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rosterSheet = ss.getSheetByName(ROSTER_SHEET_NAME);
  if (!rosterSheet) return;

  // 名簿から最新データ取得
  var headers = rosterSheet.getRange(1, 1, 1, rosterSheet.getLastColumn()).getValues()[0];
  var rateColIdx = headers.indexOf('提出率');
  var endIdx = rateColIdx > 0 ? rateColIdx : headers.length;
  var assignmentNames = headers.slice(4, endIdx).filter(function(h) { return h; });

  var lastRow = rosterSheet.getLastRow();
  var studentNumbers = [];
  if (lastRow >= 2) {
    var numValues = rosterSheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var ni = 0; ni < numValues.length; ni++) {
      if (numValues[ni][0]) studentNumbers.push(numValues[ni][0].toString());
    }
  }

  // フォームIDを取得して更新
  var formEditUrl = getConfig('form_edit_url');
  if (!formEditUrl) {
    SpreadsheetApp.getUi().alert('フォーム編集URLが見つかりません。');
    return;
  }

  // EditURLからフォームIDを抽出
  var match = formEditUrl.match(/\/d\/([^\/]+)\//);
  if (!match) {
    SpreadsheetApp.getUi().alert('フォームIDの取得に失敗しました。');
    return;
  }

  var form = FormApp.openById(match[1]);
  var items = form.getItems();

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var title = item.getTitle();

    if (title === '出席番号' && item.getType() === FormApp.ItemType.LIST && studentNumbers.length > 0) {
      item.asListItem().setChoiceValues(studentNumbers);
    }
    if (title === '提出物名' && item.getType() === FormApp.ItemType.CHECKBOX) {
      item.asCheckboxItem().setChoiceValues(assignmentNames);
    }
  }

  SpreadsheetApp.getUi().alert('✅ フォームの選択肢を最新の名簿に同期しました！');
}
