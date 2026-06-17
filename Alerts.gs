/**
 * Functions for handling alerts (LWD, Probation).
 */

function checkAlerts() {
  const config = getConfig();
  const lwdAlerts = getLwdAlerts(config);
  const probationAlerts = getProbationAlerts(config);
  
  // Logic to summarize and email alerts
  let emailBody = '';
  if (lwdAlerts.length > 0) {
    emailBody += `<h2>LWD Alerts (within ${config.LWD_DAYS} days)</h2>`;
    lwdAlerts.forEach(alert => {
        emailBody += `<p>${alert['Employee Name']} (ID: ${alert['Employee ID']}) - LWD: ${alert['Last Working Day (Interns Only)'].toLocaleDateString()}</p>`;
    });
  }
  
  if (probationAlerts.length > 0) {
    emailBody += `<h2>Probation Alerts (confirmation within ${config.PROBATION_NOTICE_DAYS} days)</h2>`;
     probationAlerts.forEach(alert => {
        emailBody += `<p>${alert['Employee Name']} (ID: ${alert['Employee ID']}) - Confirmation Date: ${alert.confirmationDate.toLocaleDateString()}</p>`;
    });
  }
  
  if (emailBody) {

  const recipient =
  CONFIG.ALERTS.EMAIL_RECIPIENTS;

  MailApp.sendEmail({
    to: recipient,
    subject:
      `HR Dashboard: Alert Engine Report`,
    htmlBody: emailBody
  });

  log(
    'Alerts email sent',
    'INFO',
    JSON.stringify({
      recipient,
      lwdAlerts:
        lwdAlerts.length,
      probationAlerts:
        probationAlerts.length
    })
  );

} else {

  log(
    'No active alerts',
    'INFO',
    JSON.stringify({
      lwdAlerts:0,
      probationAlerts:0
    })
  );

}
}


function getLwdAlerts(config) {
  const allEmployees = getIndiaEmployees().concat(getUsEmployees());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lwdDays = config.LWD_DAYS || 45;

  const alerts = allEmployees.filter(emp => {
    const status = emp['Employment Status'];
    const lwd = emp['Last Working Day (Interns Only)'];
    
    if (status !== 'Intern' || !lwd || !(lwd instanceof Date)) {
      return false;
    }
    
    const timeDiff = lwd.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return dayDiff >= 0 && dayDiff <= lwdDays;
  });
  
  return alerts;
}

function getProbationAlerts(config) {
  const allEmployees = getIndiaEmployees().concat(getUsEmployees());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const probationDays = config.PROBATION_DAYS || 180;
  const noticeDays = config.PROBATION_NOTICE_DAYS || 30;

  const alerts = allEmployees.filter(emp => {
    const status = emp['Employment Status'];
    const doj = emp['Date of Joining'];

    if (status !== 'Under Probation' || !doj || !(doj instanceof Date)) {
      return false;
    }

    const confirmationDate = new Date(doj.getTime());
    confirmationDate.setDate(doj.getDate() + probationDays);
    
    const timeDiff = confirmationDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff >= 0 && dayDiff <= noticeDays) {
      emp.confirmationDate = confirmationDate; // Attach for use in email/dashboard
      return true;
    }
    return false;
  });

  return alerts;
}

function getAlertRecommendations(){

const dashboard = {

allEmployees: [

...getData(
CONFIG.SHEET_NAMES.INDIA_EMPLOYEES
),

...getData(
CONFIG.SHEET_NAMES.US_EMPLOYEES
)

],

quarterlyAttrition:{
current:0,
previous:0
}

};

Logger.log(
dashboard.allEmployees[0]
);

const employees =
dashboard.allEmployees;

Logger.log(employees[0]);

const recommendations = [];

const today =
new Date();

let exitingInterns = [];

employees.forEach(e=>{

const empId =
e["Employee ID"] || "Unknown";

const status =
String(
e["Employment Status"] ||
e["Employment Type"] ||
e["Status"] ||
''
).toLowerCase();

Logger.log(
"STATUS=" + status
);

Logger.log(
"LWD=" +
e["Last Working Day (Interns Only)"]
);

const probation =
e["Probation End Date"] ||
e["Probation Date"];

if(probation){

const p =
new Date(probation);

const days =
Math.floor(
(p-today)/86400000
);

if(days>=0 && days<=5){

recommendations.push({
priority:'high',
text:
`${empId} probation confirmation due in ${days} days`
});

}

}

const lwd =
e["Last Working Day (Interns Only)"];

if(
lwd &&
status.includes("intern")
){

const d =
new Date(
String(lwd)
.replace(
/-/g,
'/'
)
);

const days =
Math.ceil(
(
d.getTime()
-
today.getTime()
)
/86400000
);

Logger.log(
"DATE=" + d
);

Logger.log(
"DAYS=" + days
);

Logger.log(
"Intern Days="+days
);

if(
days>=0 &&
days<=30
){

exitingInterns.push({

id:
empId,

name:
e["Employee Name"],

days:
days

});

}

}

});

if(
exitingInterns.length>=1
){

recommendations.push({

priority:'medium',

text:
`${exitingInterns.length} interns exiting within 30 days — consider backfill`,

employees:
exitingInterns

});

}

if(
recommendations.length===0
){

recommendations.push({

priority:'low',

text:
'No critical HR actions required today'

});

}
Logger.log(
employees.filter(
e =>
String(
e["Employment Status"]
).toLowerCase()
.includes("intern")
)
);

return recommendations;

}

function testRecommendations(){

Logger.log(
JSON.stringify(
getAlertRecommendations()
)
);

}