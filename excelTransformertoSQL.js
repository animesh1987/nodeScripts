const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const _ = require('underscore');
const async = require('async');
const database = 'Grocery';
const mssql = require('mssql');
const uuid = require('node-uuid');
const filePath = path.join(__dirname, '../', 'data/products_1.xlsx');
var config = {
    user: 'sa',
    server: 'localhost',
    password: 'Hb1400f?',
    database: database,
    parseJSON: true
};

var result = [];

mssql.connect(config, (err) => {
    if(err) {
        console.log(err);
        return;
    }

    let startTime = new Date();

    console.log('Reading workbook: ', startTime);
    var workbook = XLSX.readFile(filePath);
    let end = new Date();
    console.log('Workbook processed', (end.getTime() - startTime.getTime())/(60*1000));

    const sheetName = workbook.SheetNames[0];
    const first_worksheet = workbook.Sheets[sheetName];

    console.log('Going to parse to JSON');

    let data = XLSX.utils.sheet_to_json(first_worksheet, {header: 1});
    console.log('Parsed to JSON');
    console.log('going to end');
    const headers = data[0];
    headers.splice(0,1);
    let columns = "(";
    _.each(headers, (h)=>{
        columns = columns + ` [${h}],`
    });
    columns = columns.substring(columns.length - 1, 0 );
    columns = `${columns} )`

    let queryArr = [];
    let request = new mssql.Request();

    data.splice(0,1);
    _.each(data, (row)=>{
        let rowString = "(";

        if(row.length > 0){
            row.splice(0,1);
            _.each(row, (d, i)=>{
                rowString = rowString + ` "${d}",`
            });
            rowString = rowString.substring(rowString.length - 1, 0 );
            rowString = `${rowString} )`;
            queryArr.push(
                (callback)=>{
                   request.query(`insert into Products ${columns} values ${rowString}`, (err, res)=>{
                       if(err) {
                           console.log(`insert into Products ${columns} values ${rowString}`);
                           callback(err);
                       }

                       callback(null, res);
                   })
                }
            )

        }
    });

    console.log('Processed :', (new Date() - startTime)/(1000 * 60));

    async.parallelLimit(queryArr, 1000, (err, results)=>{
        if (err){console.log(err); return;}

        console.log(results);
        console.log('Inserted :', (new Date() - startTime) / (1000 * 60));
        process.exit();
    })
});
/*

var workbook = XLSX.readFile(filePath);
console.log('Workbook processed');

const sheetName = workbook.SheetNames[1];
const first_worksheet = workbook.Sheets[sheetName];

console.log('Going to parse to JSON');

const data = XLSX.utils.sheet_to_json(first_worksheet, {header: 1})

console.log('Parsed to JSON');

console.log('going to end');

const headers = data[0];

data.splice(0, 1);

_.each(data, (row)=>{
    let rowObject = {};
    _.each(row, (d, i)=>{
        rowObject[headers[i]] = d[i];
        console.log(rowObject)
    });
});


process.exit();
 uuid1 = uuid.v1();
*/

