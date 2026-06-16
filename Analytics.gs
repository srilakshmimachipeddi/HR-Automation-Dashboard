/**
 * This file contains functions for performing analytics and calculations
 * for the dashboard, such as breakdowns and trends.
 */

/**
 * Calculates the number of employees per department.
 * @returns {Object} An object with department names as keys and employee counts as values.
 */
function getDepartmentBreakdown() {
  const allEmployees = getIndiaEmployees().concat(getUsEmployees());
  
  const breakdown = allEmployees.reduce((acc, emp) => {
    const dept = emp['Department'] || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  
  return breakdown;
}

/**
 * Calculates quarterly attrition based on the offboarded resources data.
 * @returns {Object} An object with quarters (e.g., "2023-Q1") as keys and attrition counts as values.
 */
function getQuarterlyAttrition() {
    const offboarded = getOffboardedData();
    const today = new Date();

    const attrition = offboarded.reduce((acc, emp) => {
        const exitDate = emp['Date of Exit'];
        if (!exitDate || !(exitDate instanceof Date)) {
            return acc;
        }

        // Look back 4 quarters from the current quarter
        const year = exitDate.getFullYear();
        const month = exitDate.getMonth();
        const quarter = `Y${year}-Q${Math.floor(month / 3) + 1}`;
        
        acc[quarter] = (acc[quarter] || 0) + 1;
        return acc;
    }, {});

    return attrition;
}
