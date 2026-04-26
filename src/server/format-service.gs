/**
 * 条件付き書式をプログラム的に制御
 */
function applyConditionalFormatting() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ROSTER_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;

  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var rateColIndex = -1;
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === '提出率') { rateColIndex = i + 1; break; }
  }

  var startCol = 5; // E列
  var endCol = rateColIndex > 0 ? rateColIndex - 1 : sheet.getLastColumn();
  if (endCol < startCol) return;

  var range = sheet.getRange(2, startCol, lastRow - 1, endCol - startCol + 1);
  sheet.clearConditionalFormatRules();
  var rules = [];

  // 未提出（空白）→ 赤
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenCellEmpty()
    .setBackground('#FFCDD2')
    .setFontColor('#B71C1C')
    .setRanges([range])
    .build());

  // 再提出 → 橙
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('再提出')
    .setBackground('#FFE0B2')
    .setFontColor('#E65100')
    .setBold(true)
    .setRanges([range])
    .build());

  // 提出済 → 緑
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('提出済')
    .setBackground('#C8E6C9')
    .setFontColor('#1B5E20')
    .setRanges([range])
    .build());

  // 確認済 → 青
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('確認済')
    .setBackground('#BBDEFB')
    .setFontColor('#0D47A1')
    .setRanges([range])
    .build());

  // 提出率のグラデーション
  if (rateColIndex > 0) {
    var rateRange = sheet.getRange(2, rateColIndex, lastRow - 1, 1);
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .setGradientMinpointWithValue('#FF5252', SpreadsheetApp.InterpolationType.NUMBER, '0')
      .setGradientMidpointWithValue('#FFEB3B', SpreadsheetApp.InterpolationType.NUMBER, '50')
      .setGradientMaxpointWithValue('#4CAF50', SpreadsheetApp.InterpolationType.NUMBER, '100')
      .setRanges([rateRange])
      .build());
  }

  sheet.setConditionalFormatRules(rules);
}
