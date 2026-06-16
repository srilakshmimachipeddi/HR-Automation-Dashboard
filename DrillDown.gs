/**
 * This file contains the logic for the interactive Drill-Down tab.
 */

/**
 * Sets up the initial state of the Drill-Down tab, including filter controls.
 */
function renderDrillDown() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DRILL_DOWN);
    if (!sheet) {
        sheet = ss.insertSheet(CONFIG.SHEET_NAMES.DRILL_DOWN);
    }
    sheet.clear();
    sheet.setFrozenRows(2);

    const allEmployees = getIndiaEmployees().concat(getUsEmployees());

    // --- Create Filter Controls ---
    sheet.getRange('A1').setValue('Region:').setFontWeight('bold');
    const regions = ['All', 'India', 'US'];
    const regionRule = SpreadsheetApp.newDataValidation().requireValueInList(regions).build();
    sheet.getRange('B1').setDataValidation(regionRule).setValue('All');

    sheet.getRange('C1').setValue('Department:').setFontWeight('bold');
    const departments = ['All', ...new Set(allEmployees.map(e => e['Department']).filter(Boolean))];
    const deptRule = SpreadsheetApp.newDataValidation().requireValueInList(departments).build();
    sheet.getRange('D1').setDataValidation(deptRule).setValue('All');

    sheet.getRange('E1').setValue('Reporting Manager:').setFontWeight('bold');
    const managers = ['All', ...new Set(allEmployees.map(e => e['Reporting Manager']).filter(Boolean))];
    const managerRule = SpreadsheetApp.newDataValidation().requireValueInList(managers).build();
    sheet.getRange('F1').setDataValidation(managerRule).setValue('All');

    sheet.getRange('G1').setValue('Status:').setFontWeight('bold');
    const statuses = ['All', ...new Set(allEmployees.map(e => e['Employment Status']).filter(Boolean))];
    const statusRule = SpreadsheetApp.newDataValidation().requireValueInList(statuses).build();
    sheet.getRange('H1').setDataValidation(statusRule).setValue('All');
    
    sheet.getRange('A1:H1').setBackground('#e0e0e0');

    // --- Set up Headers for Results ---
    const headers = Object.keys(allEmployees[0] || {});
    sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#f3f3f3');

    log('Drill-Down tab rendered.');
    applyDrillDownFilters(); // Apply default 'All' filters on initial render
}

/**
 * Applies the currently selected filters to the employee data and displays the results.
 */
function applyDrillDownFilters() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.DRILL_DOWN);
    if (!sheet) return;

    log('Applying drill-down filters...');

    // --- Read Filter Values ---
    const region = sheet.getRange('B1').getValue();
    const department = sheet.getRange('D1').getValue();
    const manager = sheet.getRange('F1').getValue();
    const status = sheet.getRange('H1').getValue();

    // --- Filter Data ---
    let employees = [];
    if (region === 'All') {
        employees = getIndiaEmployees().concat(getUsEmployees());
    } else if (region === 'India') {
        employees = getIndiaEmployees();
    } else {
        employees = getUsEmployees();
    }

    const filteredData = employees.filter(emp => {
        const deptMatch = (department === 'All') || (emp['Department'] === department);
        const managerMatch = (manager === 'All') || (emp['Reporting Manager'] === manager);
        const statusMatch = (status === 'All') || (emp['Employment Status'] === status);
        return deptMatch && managerMatch && statusMatch;
    });

    // --- Display Results ---
    sheet.getRange(4, 1, sheet.getMaxRows() - 3, sheet.getMaxColumns()).clearContent();

    if (filteredData.length > 0) {
        const headers = Object.keys(filteredData[0]);
        // Convert objects to a 2D array, ensuring dates are formatted as strings
        const values = filteredData.map(emp => {
            return headers.map(header => {
                const value = emp[header];
                // Check if the value is a valid Date object
                if (value instanceof Date && !isNaN(value)) {
                    return Utilities.formatDate(value, Session.getScriptTimeZone(), "MM/dd/yyyy");
                }
                return value;
            });
        });
        sheet.getRange(4, 1, values.length, values[0].length).setValues(values);
    } else {
        sheet.getRange(4, 1).setValue('No employees match the selected criteria.');
    }
}
