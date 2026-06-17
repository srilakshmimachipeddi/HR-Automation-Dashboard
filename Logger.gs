function log(
  message,
  level = 'INFO',
  metadata = ''
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  let logSheet =
    ss.getSheetByName(
      CONFIG.SHEET_NAMES.LOGS
    );

  if (!logSheet) {

    logSheet =
      ss.insertSheet(
        CONFIG.SHEET_NAMES.LOGS
      );

    logSheet.appendRow([
      'Timestamp',
      'Level',
      'Message',
      'Metadata'
    ]);
  }

  logSheet.appendRow([
    new Date(),
    level,
    message,
    metadata
  ]);
}