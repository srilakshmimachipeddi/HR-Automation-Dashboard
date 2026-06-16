/**
 * Logging functions.
 */

function log(message, level = 'INFO') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.LOGS);
  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.SHEET_NAMES.LOGS);
    logSheet.appendRow(['Timestamp', 'Level', 'Message']);
  }
  
  logSheet.appendRow([new Date(), level, message]);
}
