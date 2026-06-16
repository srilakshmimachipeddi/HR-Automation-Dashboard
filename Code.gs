/**
 * @OnlyCurrentDoc
 *
 * The main file for the HR Automation Dashboard.
 * This file will contain the onOpen and other primary functions.
 */

function onOpen(e) {
  SpreadsheetApp.getUi()
      .createMenu('HR Dashboard')
      .addItem('Show Dashboard', 'showDashboard')
      .addItem('Show Org Chart', 'showOrgChart')
      .addItem('Show Drill-Down', 'showDrillDown')
      .addToUi();
}

function showDashboard() {
  // This function will be responsible for rendering the dashboard sheet.
  // We will call the rendering functions from Dashboard.gs here.
  log('Rendering Dashboard...');
  renderDashboard();
}

function showOrgChart() {
  log('Rendering Org Chart...');
  renderOrgChart();
}

function showDrillDown() {
  log('Rendering Drill-Down...');
  renderDrillDown();
}
