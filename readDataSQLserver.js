const mssql = require('mssql');
const fs = require('fs');
const path = require('path');

const database = 'reza_analytic';

var config = {
    user: 'sa',
    server: 'localhost',
    password: 'Hb1400f?',
    database: database
};

mssql.connect(config, (err)=>{
    if (err) console.log(err);

    let request = new mssql.Request();


    request.query('Select * from SalesData', (err, result)=>{
        if (err) console.log(err);

        let outputFile = fs.createWriteStream(path.join(__dirname, '../', 'dataoutput/reza_export.json'));
        outputFile.write(JSON.stringify(result.recordset));
        outputFile.end();
        outputFile.on('finish', ()=>{
            console.log('Finished Writing...');
            process.exit();
        })
    })
})