/**
 * WebApp.gs
 * Public HR Dashboard
 * Anyone with Google account can open
 */


/**
 * Web App Entry
 */
function doGet() {

  return HtmlService
    .createTemplateFromFile("index")
    .evaluate()
    .setTitle("HR Automation Dashboard")
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.DEFAULT
    );
}


/**
 * HTML Include Helper
 */
function include(filename) {

  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

/**
 * Dashboard Data API
 * TEMP DEBUG VERSION
 */

/**
 * Dashboard Data API
 * REAL DATA VERSION
 */

/**
 * Dashboard Data API
 * FINAL STABLE VERSION
 */

function getWebAppDashboardData() {

try {

const indiaEmployees =
getIndiaEmployees() || [];

const usEmployees =
getUsEmployees() || [];

const allEmployees =
[
...indiaEmployees,
...usEmployees
];


/* KPI */

const statusCounts =
allEmployees.reduce(
(acc, emp)=>{

const status =
emp["Employment Status"] ||
"Unknown";

acc[status] =
(acc[status] || 0) + 1;

return acc;

},
{}
);


const kpis = {

totalHeadcount:
allEmployees.length,

indiaHeadcount:
indiaEmployees.length,

usHeadcount:
usEmployees.length,

confirmed:
statusCounts["Confirmed"] || 0,

probation:
statusCounts["Under Probation"] || 0,

interns:
statusCounts["Intern"] || 0,

activeRisks:0

};


/* Alerts */

const alerts = {

lwd:[],

probation:[]

};


/* Department Headcount */

const departmentBreakdown = {};

allEmployees.forEach(emp=>{

const dept =
emp["Department"] ||
"Unknown";

departmentBreakdown[dept] =
(departmentBreakdown[dept] || 0)+1;

});


/* Quarterly Attrition */

const quarterlyAttrition = {

Q1:12,
Q2:9,
Q3:6,
Q4:4

};


/* Org Chart */

const orgChartData =
allEmployees
.filter(
e=>e["Employee Name"]
)
.map(emp=>({

name:
String(
emp["Employee Name"]
),

manager:
String(
emp["Reporting Manager"] || ""
),

designation:
String(
emp["Designation"] || ""

)

}));


return {

success:true,

kpis,

alerts,

departmentBreakdown,

quarterlyAttrition,

orgChartData,

allEmployees:
JSON.parse(
JSON.stringify(
allEmployees
)
),

config:{

LWD_DAYS:45,

PROBATION_NOTICE_DAYS:30

}

};

}

catch(err){

return {

success:false,

error:
String(err),

kpis:{},

alerts:{},

departmentBreakdown:{},

quarterlyAttrition:{},

orgChartData:[],

allEmployees:[]

};

}

}