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
function getFinanceData() {

const sheet =
SpreadsheetApp
.getActive()
.getSheetByName(
CONFIG.SHEET_NAMES.FINANCE
);

if (!sheet) {

throw new Error(
'Finance sheet not found'
);

}

const data =
sheet
.getDataRange()
.getValues();

const headers =
data[0];

const rows =
data
.slice(1)
.map(r => {

const obj = {};

headers.forEach(
(h,i)=>
obj[h]=r[i]
);

return obj;

});

const finance = {

departmentSummary:{},

regionSummary:{},

employees:rows

};

rows.forEach(emp=>{

const dept =
emp['Department'];

const region =
emp['Region'];

const ctc =
Number(
String(
emp[
'Annual CTC (INR)'
]||0
)
.replace(
/[^0-9.]/g,
''
)
);

finance
.departmentSummary[
dept
]
=
(
finance
.departmentSummary[
dept
]
||
0
)
+
ctc;

finance
.regionSummary[
region
]
=
(
finance
.regionSummary[
region
]
||
0
)
+
ctc;

});

return finance;

}
function testFinance() {

  const result = getFinanceData();

  Logger.log(
    'Departments: ' +
    Object.keys(
      result.departmentSummary
    ).length
  );

  Logger.log(
    'Regions: ' +
    JSON.stringify(
      result.regionSummary
    )
  );

  Logger.log(
    'Employees: ' +
    result.employees.length
  );

}
function listSheets() {

const sheets =
SpreadsheetApp
.getActiveSpreadsheet()
.getSheets();

sheets.forEach(
s =>
Logger.log(
s.getName()
)
);

}

function getProductivityData() {

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName('Productivity');

  if (!sheet) {
    throw new Error(
      'Productivity sheet not found'
    );
  }

  const values =
    sheet
      .getDataRange()
      .getValues();

  const headers =
    values[0];

  const rows =
    values
      .slice(1)
      .map(r => {

        const obj = {};

        headers.forEach(
          (h, i) =>
            obj[h] = r[i]
        );

        return obj;

      });

  let total = 0;

  let low = 0;

  const departments = {};

  rows.forEach(emp => {

    const hours =
      Number(
        emp[
          'Overall Avg Hrs/Day'
        ] || 0
      );

   const score =
      Math.min(
      100,
      Math.round(
      (hours / 8) * 100
      )
    );

    const dept =
      emp[
        'Department'
      ] || 'Unknown';

    total += score;

    if (
      emp[
        'Below 8 Hrs Flag'
      ]
    ) {
      low++;
    }

    if (!departments[dept]) {

      departments[dept] = {
        sum: 0,
        count: 0
      };

    }

    departments[dept].sum += score;

    departments[dept].count++;

  });

  const averages = {};

  Object
    .keys(
      departments
    )
    .forEach(d => {

      averages[d] =
        Math.round(
          departments[d].sum /
          departments[d].count
        );

    });

  const best =
    Object
      .entries(
        averages
      )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )[0];

  return {

    average:
      Math.round(
        total /
        rows.length
      ),

    topDepartment:
      best
        ? best[0]
        : '-',

    topScore:
      best
        ? best[1]
        : 0,

    lowPerformers:
      low,

    departmentScores:
      averages

  };

}