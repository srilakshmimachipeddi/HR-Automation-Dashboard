/**
 * Data.gs
 * Reads spreadsheet data safely for Web App
 */

function getSpreadsheet() {

return SpreadsheetApp.openById(
SpreadsheetApp.getActive().getId()
);

}


/* Generic reader */

function getData(sheetName) {

const ss =
getSpreadsheet();

const sheet =
ss.getSheetByName(
sheetName
);

if(!sheet){

return [];

}

const values =
sheet
.getDataRange()
.getValues();

if(values.length<=1){

return [];

}

const headers =
values[0];

return values
.slice(1)
.map(row=>{

let obj={};

headers.forEach(
(h,i)=>{

obj[h]=row[i];

});

return obj;

});

}


/* Employee Data */

function getIndiaEmployees(){

return getData(
CONFIG.SHEET_NAMES
.INDIA_EMPLOYEES
);

}

function getUsEmployees(){

return getData(
CONFIG.SHEET_NAMES
.US_EMPLOYEES
);

}

function getRiskData(){

return getData(
CONFIG.SHEET_NAMES
.RISK
);

}

function getOffboardedData(){

return getData(
CONFIG.SHEET_NAMES
.OFFBOARDED
);

}


/* Config */

function getConfig(){

const ss =
getSpreadsheet();

const sheet =
ss.getSheetByName(
"_Config"
);

if(!sheet){

return {

LWD_DAYS:45,

PROBATION_NOTICE_DAYS:30

};

}

const rows =
sheet
.getDataRange()
.getValues();

let config={};

rows.forEach(r=>{

if(r[0]){

config[r[0]]=r[1];

}

});

return config;

}

function updateEmployee(
employeeId,
updatedData
){

const sheets = [

CONFIG.SHEET_NAMES
.INDIA_EMPLOYEES,

CONFIG.SHEET_NAMES
.US_EMPLOYEES

];

const ss =
SpreadsheetApp
.getActive();

for(
const sheetName
of sheets
){

const sheet =
ss.getSheetByName(
sheetName
);

if(
!sheet
)
continue;

const values =
sheet
.getDataRange()
.getValues();

const headers =
values[0];

const idCol =
headers.indexOf(
'Employee ID'
);

const row =
values.findIndex(
(r,i)=>

i>0 &&

r[idCol]
=== employeeId

);

if(
row===-1
)
continue;

Object.keys(
updatedData
).forEach(
field=>{

const col =
headers.indexOf(
field
);

if(
col>-1
){

sheet
.getRange(
row+1,
col+1
)

.setValue(
updatedData[
field
]
);

}

});

return {
success:true
};

}

throw new Error(
'Employee not found'
);

}