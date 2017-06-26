const fs = require("fs");
const path = require("path");
const readline = require('readline');
const _ = require('underscore');
var headerkeys = [];
var result = [];

const filePath = path.join(__dirname, '../', 'data/CSCPQuestions_7upd.txt');

const line = readline.createInterface({
    input: fs.createReadStream(filePath),

});

line.on('line', (line)=>{
    line = line.replace(/{|}/g, "").substr(0, line.replace(/{|}/g, "").length - 2);
    if (line.split(',')[0].replace(/"| /g, "").toLowerCase() == 'id') {
        headerkeys = line.split(",");
        headerkeys = _.map(headerkeys, (key)=>{return key.replace(/ /g, "")});
    }
    else{
        let linearray = line.match(/"(.*?)"/g);
        let question = {};
        _.each(linearray, (el, i)=>{
            question[headerkeys[i].replace(/"| /g, "")] = el.replace(/"/g, "");
        })
        result.push(question);
    }
});


line.on('close', ()=>{
    var resultFile = fs.createWriteStream(path.join(__dirname, '../', 'dataoutput/CSCPQuestions_7upd.json'));
    resultFile.write(JSON.stringify(result));
    resultFile.end();
});