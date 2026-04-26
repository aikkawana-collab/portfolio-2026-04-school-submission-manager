/**
 * 初期セットアップスクリプト
 * GASエディタから手動で一度だけ実行する
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('提出物管理')
    .addItem('① 初期セットアップ', 'setupSpreadsheet')
    .addItem('② 条件付き書式を更新', 'applyConditionalFormatting')
    .addItem('③ トリガーを設定', 'setupFormTrigger')
    .addItem('④ フォームを自動作成・連携', 'createAndLinkForm')
    .addItem('⑤ フォームの選択肢を最新に同期', 'syncFormChoices')
    .addItem('キャッシュをクリア', 'invalidateAllCachesMenu')
    .addToUi();
}

function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- 設定シート ---
  var configSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!configSheet) {
    configSheet = ss.insertSheet(CONFIG_SHEET_NAME);
    configSheet.appendRow(['キー', '値', '説明']);
    configSheet.appendRow(['teacher_emails', '<email>', '教師メールアドレス（カンマ区切りで複数可）']);
    configSheet.appendRow(['class_name', '3年1組', 'クラス名']);
    configSheet.appendRow(['school_year', '2026', '年度']);
    configSheet.getRange(1, 1, 1, 3)
      .setBackground('#37474F')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    configSheet.setColumnWidth(1, 180);
    configSheet.setColumnWidth(2, 300);
    configSheet.setColumnWidth(3, 300);
  }

  // --- 名簿シート ---
  var rosterSheet = ss.getSheetByName(ROSTER_SHEET_NAME);
  if (!rosterSheet) {
    rosterSheet = ss.insertSheet(ROSTER_SHEET_NAME);
    var headers = ['uuid', '出席番号', '氏名', 'クラス', '国語ドリル1', '算数プリント1', '理科レポート1', '提出率'];
    rosterSheet.appendRow(headers);

    var sampleNames = [
      '田中 太郎', '山田 花子', '佐藤 健', '鈴木 美咲', '高橋 翔',
      '伊藤 あかり', '渡辺 大輔', '中村 さくら', '小林 雄太', '加藤 ひなた'
    ];

    for (var i = 0; i < sampleNames.length; i++) {
      var uuid = Utilities.getUuid();
      rosterSheet.appendRow([uuid, i + 1, sampleNames[i], '3年1組', '', '', '', 0]);
    }

    rosterSheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1976D2')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');

    // uuid列を非表示（A列）
    rosterSheet.hideColumns(1);
    rosterSheet.setColumnWidth(2, 80);
    rosterSheet.setColumnWidth(3, 150);
    rosterSheet.setColumnWidth(4, 100);
    rosterSheet.setFrozenRows(1);
  }

  // --- 提出履歴シート ---
  var histSheet = ss.getSheetByName(HISTORY_SHEET_NAME);
  if (!histSheet) {
    histSheet = ss.insertSheet(HISTORY_SHEET_NAME);
    histSheet.appendRow(['タイムスタンプ', '教師メール', '出席番号', '提出物名', 'ステータス', 'コメント']);
    histSheet.getRange(1, 1, 1, 6)
      .setBackground('#37474F')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    histSheet.setFrozenRows(1);
  }

  // 条件付き書式を適用
  applyConditionalFormatting();

  // トリガーを設定
  setupFormTrigger();

  SpreadsheetApp.getUi().alert(
    '✅ セットアップ完了！\n\n' +
    '次のステップ:\n' +
    '1. 「設定」シートで教師メールアドレスを変更してください\n' +
    '2. 「名簿」シートに実際の児童データを入力してください\n' +
    '3. GoogleフォームをこのSSに連携してください\n' +
    '4. Webアプリをデプロイしてください'
  );
}

function invalidateAllCachesMenu() {
  invalidateAllCaches();
  SpreadsheetApp.getUi().alert('✅ キャッシュをクリアしました');
}
