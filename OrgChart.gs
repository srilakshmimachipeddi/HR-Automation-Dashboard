/**
 * Functions for generating the org chart using a different method.
 * This approach writes the data to the sheet first, then builds the chart from the data range.
 */
function renderOrgChart() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let orgChartSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ORG_CHART);
  if (!orgChartSheet) {
    orgChartSheet = ss.insertSheet(CONFIG.SHEET_NAMES.ORG_CHART);
  }
  
  orgChartSheet.clear(); // Clear the sheet of old data and charts
  
  const allEmployees = getIndiaEmployees().concat(getUsEmployees());

  if (allEmployees.length === 0) {
    orgChartSheet.getRange('A1').setValue('No employee data to build Org Chart.');
    return;
  }

  // Prepare the data in a 2D array format suitable for writing to a sheet
  const chartData = [['Name', 'Manager', 'ToolTip']];
  const employeeMap = new Map(allEmployees.map(e => [e['Employee Name'], e]));

  allEmployees.forEach(emp => {
    const empName = emp['Employee Name'];
    const managerName = emp['Reporting Manager'];
    const designation = emp['Designation'];

    const managerId = (managerName && employeeMap.has(managerName)) ? managerName : '';
    const nodeName = `${empName} (${designation})`;

    chartData.push([nodeName, managerId, designation]);
  });

  // Write the data to the sheet
  const dataRange = orgChartSheet.getRange(1, 1, chartData.length, 3);
  dataRange.setValues(chartData);
  
  // Now, build the chart directly from the sheet data
  const chartBuilder = orgChartSheet.newChart()
    .setChartType(Charts.ChartType.ORG)
    .addRange(dataRange)
    .setOption('allowCollapse', true)
    .setOption('size', 'large')
    .setPosition(1, 5, 0, 0); // Position it away from the data
    
  orgChartSheet.insertChart(chartBuilder.build());
  
  log('Org Chart rendered using sheet data method.');
}
