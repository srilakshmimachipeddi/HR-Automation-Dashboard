/**
 * Functions for rendering the Sheet dashboard.
 */

function renderDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboardSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DASHBOARD);
  if (!dashboardSheet) {
    dashboardSheet = ss.insertSheet(CONFIG.SHEET_NAMES.DASHBOARD);
  }
  
  dashboardSheet.clear();
  const config = getConfig();
  
  let currentRow = 1;
  
  // Render KPI Strip
  currentRow = renderKpiStrip(dashboardSheet, currentRow);
  
  // Render LWD Alerts
  currentRow = renderLwdAlerts(dashboardSheet, currentRow + 2, config);

  // Render Probation Alerts
  currentRow = renderProbationAlerts(dashboardSheet, currentRow + 2, config);

  // Render Department Breakdown
  currentRow = renderDepartmentBreakdown(dashboardSheet, currentRow + 2);

  // Render Quarterly Attrition
  currentRow = renderQuarterlyAttrition(dashboardSheet, currentRow + 2);
  
  // renderRiskRegister(dashboardSheet);
  
  log('Dashboard sheet rendered.');
}

function renderKpiStrip(sheet, startRow) {
  const indiaEmployees = getIndiaEmployees();
  const usEmployees = getUsEmployees();
  const allEmployees = indiaEmployees.concat(usEmployees);

  const totalHeadcount = allEmployees.length;
  const indiaHeadcount = indiaEmployees.length;
  const usHeadcount = usEmployees.length;

  const statusCounts = allEmployees.reduce((acc, emp) => {
    const status = emp['Employment Status'] || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const riskCount = getRiskData().length;

  const kpis = [
    ['Total Headcount', totalHeadcount],
    ['India Headcount', indiaHeadcount],
    ['US Headcount', usHeadcount],
    ['Confirmed', statusCounts['Confirmed'] || 0],
    ['Under Probation', statusCounts['Under Probation'] || 0],
    ['Interns', statusCounts['Intern'] || 0],
    ['Active Risks', riskCount]
  ];

  const range = sheet.getRange(startRow, 1, kpis.length, 2);
  range.setValues(kpis).setFontWeight('bold');
  sheet.getRange(startRow, 1, kpis.length, 1).setBackground('#f3f3f3');
  range.setBorder(true, true, true, true, true, true);
  sheet.autoResizeColumns(1, 2);
  return range.getLastRow();
}

function renderLwdAlerts(sheet, startRow, config) {
    const alerts = getLwdAlerts(config);
    
    sheet.getRange(startRow, 1).setValue('LWD Alerts').setFontWeight('bold').setFontSize(14);
    
    if (alerts.length === 0) {
        sheet.getRange(startRow + 1, 1).setValue('No upcoming LWDs.');
        return startRow + 1;
    }
    
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Last Working Day'];
    const data = alerts.map(e => [e['Employee ID'], e['Employee Name'], e['Department'], e['Last Working Day (Interns Only)']]);
    
    const range = sheet.getRange(startRow + 2, 1, data.length, headers.length);
    sheet.getRange(startRow, 1, 1, headers.length).merge().setBackground('#fde2e2');
    sheet.getRange(startRow + 1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#f3f3f3');
    range.setValues(data);
    range.setBorder(true, true, true, true, true, true);
    sheet.autoResizeColumns(1, headers.length);
    return range.getLastRow();
}

function renderProbationAlerts(sheet, startRow, config) {
    const alerts = getProbationAlerts(config);

    sheet.getRange(startRow, 1).setValue('Probation Alerts').setFontWeight('bold').setFontSize(14);

    if (alerts.length === 0) {
        sheet.getRange(startRow + 1, 1).setValue('No employees nearing confirmation.');
        return startRow + 1;
    }

    const headers = ['Employee ID', 'Employee Name', 'Department', 'Confirmation Date'];
    const data = alerts.map(e => [e['Employee ID'], e['Employee Name'], e['Department'], e.confirmationDate]);

    const range = sheet.getRange(startRow + 2, 1, data.length, headers.length);
    sheet.getRange(startRow, 1, 1, headers.length).merge().setBackground('#e2f0fd');
    sheet.getRange(startRow + 1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#f3f3f3');
    range.setValues(data);
    range.setBorder(true, true, true, true, true, true);
    sheet.autoResizeColumns(1, headers.length);
    return range.getLastRow();
}

function renderDepartmentBreakdown(sheet, startRow) {
    const breakdown = getDepartmentBreakdown();
    sheet.getRange(startRow, 1).setValue('Department Headcount').setFontWeight('bold').setFontSize(14);

    if (Object.keys(breakdown).length === 0) {
        sheet.getRange(startRow + 1, 1).setValue('No department data available.');
        return startRow + 1;
    }

    const headers = ['Department', 'Headcount'];
    const data = Object.entries(breakdown);

    const range = sheet.getRange(startRow + 2, 1, data.length, 2);
    sheet.getRange(startRow, 1, 1, 2).merge().setBackground('#d9ead3');
    sheet.getRange(startRow + 1, 1, 1, 2).setValues([headers]).setFontWeight('bold').setBackground('#f3f3f3');
    range.setValues(data);
    range.setBorder(true, true, true, true, true, true);
    sheet.autoResizeColumns(1, 2);

    // Add a chart
    const chart = sheet.newChart()
        .setChartType(Charts.ChartType.PIE)
        .addRange(sheet.getRange(startRow + 1, 1, data.length + 1, 2))
        .setOption('title', 'Department Headcount Distribution')
        .setPosition(startRow, 4, 0, 0)
        .build();
    sheet.insertChart(chart);

    return range.getLastRow();
}

function renderQuarterlyAttrition(sheet, startRow) {
    const attrition = getQuarterlyAttrition();
    sheet.getRange(startRow, 1).setValue('Quarterly Attrition Trend').setFontWeight('bold').setFontSize(14);

    if (Object.keys(attrition).length === 0) {
        sheet.getRange(startRow + 1, 1).setValue('No attrition data available.');
        return startRow + 1;
    }

    const headers = ['Quarter', 'Leavers'];
    // Sort quarters chronologically
    const data = Object.entries(attrition).sort((a, b) => a[0].localeCompare(b[0]));

    const range = sheet.getRange(startRow + 2, 1, data.length, 2);
    sheet.getRange(startRow, 1, 1, 2).merge().setBackground('#fff2cc');
    sheet.getRange(startRow + 1, 1, 1, 2).setValues([headers]).setFontWeight('bold').setBackground('#f3f3f3');
    range.setValues(data);
    range.setBorder(true, true, true, true, true, true);
    sheet.autoResizeColumns(1, 2);

    // Add a chart
    const chart = sheet.newChart()
        .setChartType(Charts.ChartType.LINE)
        .addRange(sheet.getRange(startRow + 1, 1, data.length + 1, 2))
        .setOption('title', 'Quarterly Attrition Trend')
        .setOption('hAxis', { title: 'Quarter' })
        .setOption('vAxis', { title: 'Number of Leavers' })
        .setPosition(startRow, 4, 0, 0)
        .build();
    sheet.insertChart(chart);

    return range.getLastRow();
}
