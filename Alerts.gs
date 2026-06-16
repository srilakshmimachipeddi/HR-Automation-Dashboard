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
    MailApp.sendEmail({
      to: config.EMAIL_RECIPIENTS,
      subject: 'HR Dashboard: Daily Alerts',
      htmlBody: emailBody
    });
    log('Alerts email sent.');
  } else {
    log('No active alerts.');
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
