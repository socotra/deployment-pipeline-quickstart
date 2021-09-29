const fs = require('fs');
let parse = require('csv-parse');
let csv = require('csv');
var neatCsv = require('neat-csv');
var async = require('async');

const optionDefinitions = [
  { name: 'project', type: String, defaultOption: './' },
  { name: 'product', type: String, defaultOption: '' },
  { name: 'branch', type: String, defaultOption: 'main' },
  { name: 'payload', type: String, defaultOption: './payload.json' }
]

const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

const project = options.project;
const product = options.product;
const branch = options.branch ? options.branch : options.product;

const raterPath = `./${project}/scripts/${branch}/rater.js`;


function parseTableData(data){
  let tableData = {};
  let lbreak = data.split("\n");
  lbreak.forEach(res => {
    let parts = res.split(",")
    tableData[parts[0]] = parts[1]
  });
  return tableData;
}

const socotraApi = {
  tableLookup: function(configVersion, tableName, key) {
    let results = {};
    let data = fs.readFileSync(`./${project}/products/${product}/policy/tables/${tableName}.csv`, 'utf8');
    results = parseTableData(data);
    console.log(`[DEBUG ${tableName}]`, `key: ${key}, value: ${results[key]}`);
    return results[key];
  }
}

const rater = require(raterPath);

console.log(options.payload);
const payload = fs.readFileSync(options.payload, 'utf8', 'r+');

// Run the payload against the rater
let result = rater.getPerilRates(JSON.parse(payload), socotraApi);
console.log(result);
