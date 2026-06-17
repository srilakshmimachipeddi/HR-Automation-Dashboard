/**
 * Configuration for the HR Automation Dashboard.
 * All constants and settings should be stored here.
 */

const CONFIG = {
  SHEET_NAMES: {
    INDIA_EMPLOYEES: 'India Employee Database',
    US_EMPLOYEES: 'US Employee Database',
    RM_DATA: 'RM Data',

    FINANCE: 'Finance',

    RISK: 'Risk Report',
    OFFBOARDED: 'Offboarded Resources',
    DASHBOARD: 'Dashboard',
    ORG_CHART: 'Org Chart',
    DRILL_DOWN: 'Drill-Down',
    CONFIG: '_Config',
    LOGS: 'Logs'
  },

  ALERTS: {
    LWD_DAYS: 45,
    PROBATION_DAYS: 180,
    PROBATION_NOTICE_DAYS: 30,
    EMAIL_RECIPIENTS:
      'srilakshmimachipeddi@gmail.com'
  }
};
function testConfig() {
  const config = getConfig();

  Logger.log(
    config.EMAIL_RECIPIENTS
  );
}