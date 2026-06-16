/**
 * Functions for managing triggers.
 */

function setupTriggers() {
  // Delete existing triggers to avoid duplicates
  const allTriggers = ScriptApp.getProjectTriggers();
  for (const trigger of allTriggers) {
    ScriptApp.deleteTrigger(trigger);
  }
  
  // Create an onEdit trigger for real-time updates
  ScriptApp.newTrigger('handleEdit')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onEdit()
      .create();
      
  // Create a time-based trigger for daily runs
  ScriptApp.newTrigger('dailyPipeline')
      .timeBased()
      .atHour(1) // Runs every day at 1 AM
      .everyDays(1)
      .create();
      
  log('Triggers have been set up.');
}

function handleEdit(e) {
  // This function will be the entry point for real-time updates.
  // It will check which sheet was edited and trigger the appropriate actions.
  const sheetName = e.source.getSheetName();
  log(`Edit detected in sheet: ${sheetName}`);
  
  // Example: if a source data sheet is edited, re-render dashboards
  const sourceSheets = [
    CONFIG.SHEET_NAMES.INDIA_EMPLOYEES,
    CONFIG.SHEET_NAMES.US_EMPLOYEES,
    CONFIG.SHEET_NAMES.RM_DATA,
    CONFIG.SHEET_NAMES.FINANCE,
    CONFIG.SHEET_NAMES.RISK,
    CONFIG.SHEET_NAMES.OFFBOARDED,
  ];
  
  if (sourceSheets.includes(sheetName)) {
    showDashboard();
    renderOrgChart();
  }

  // If a filter on the Drill-Down sheet is changed
  if (sheetName === CONFIG.SHEET_NAMES.DRILL_DOWN && e.range.getRow() === 1) {
      applyDrillDownFilters();
  }
}

function dailyPipeline() {
  log('Starting daily pipeline run...');
  showDashboard();
  renderOrgChart();
  checkAlerts();
  log('Daily pipeline run finished.');
}
