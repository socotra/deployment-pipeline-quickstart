const fs = require('fs');
var parse = require('csv-parse');

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
const branch = options.branch;

const raterPath = `./${project}/scripts/${branch}/rater.js`;

const SocotraApi = {
  tableLookup(configVersion, tableName, key) {
    let parser = parse({columns: true}, function (err, records) {
      console.log(records);
    });
    let data = fs.createReadStream(`./${project}/products/${product}/policy/tables/${tableName}.csv`).pipe(parser);
    // do mock lookup here
    return "Dummy";
  }
}

console.log(raterPath);
const rater = require(raterPath);

console.log(options.payload);
const payload = fs.readFileSync(options.payload, 'utf8', 'r+');

// Run the payload against the rater
rater.getPerilRates(JSON.parse(payload));
