'use strict';

var fs = require('fs');
var path = require('path');
var XLSX = require('xlsx');
var _ = require('underscore');
var async = require('async');
var database = 'Grocery';
var mssql = require('mssql');
var uuid = require('node-uuid');
var filePath = path.join(__dirname, '../', 'data/products_1.xlsx');
var config = {
    user: 'sa',
    server: 'localhost',
    password: 'Hb1400f?',
    database: database,
    parseJSON: true
};

var result = [];

mssql.connect(config, function (err) {
    if (err) {
        console.log(err);
        return;
    }

    var startTime = new Date();

    console.log('Reading workbook: ', startTime);
    var workbook = XLSX.readFile(filePath);
    var end = new Date();
    console.log('Workbook processed', (end.getTime() - startTime.getTime()) / (60 * 1000));

    var sheetName = workbook.SheetNames[0];
    var first_worksheet = workbook.Sheets[sheetName];

    console.log('Going to parse to JSON');

    var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
    console.log('Parsed to JSON');
    console.log('going to end');
    var headers = data[0];
    headers.splice(0, 1);
    var columns = "(";
    _.each(headers, function (h) {
        columns = columns + (' [' + h + '],');
    });
    columns = columns.substring(columns.length - 1, 0);
    columns = columns + ' )';

    var queryArr = [];
    var request = new mssql.Request();

    data.splice(0, 1);
    _.each(data, function (row) {
        var rowString = "(";

        if (row.length > 0) {
            row.splice(0, 1);
            _.each(row, function (d, i) {
                rowString = rowString + (' "' + d + '",');
            });
            rowString = rowString.substring(rowString.length - 1, 0);
            rowString = rowString + ' )';
            queryArr.push(function (callback) {
                request.query('insert into Products ' + columns + ' values ' + rowString, function (err, res) {
                    if (err) {
                        console.log('insert into Products ' + columns + ' values ' + rowString);
                        callback(err);
                    }

                    callback(null, res);
                });
            });
        }
    });

    console.log('Processed :', (new Date() - startTime) / (1000 * 60));

    async.parallelLimit(queryArr, 1000, function (err, results) {
        if (err) {
            console.log(err);return;
        }

        console.log(results);
        console.log('Inserted :', (new Date() - startTime) / (1000 * 60));
        process.exit();
    });
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

//# sourceMappingURL=excelTransformertoSQL-compiled.js.map