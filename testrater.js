const fs = require('fs');
let csv = require('csv');
chalk = require('chalk');

const optionDefinitions = [
  { name: 'project', type: String, defaultOption: './' },
  { name: 'product', type: String, defaultOption: '' },
  { name: 'branch', type: String, defaultOption: 'main' },
  { name: 'payload', type: String, defaultOption: './payload.json' },
  { name: 'runAll', type: Boolean, defaltOption: false }
]

const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

const project = options.project;
let product = options.product;
let branch = options.branch ? options.branch : options.product;
const runAll = options.runAll ? options.runAll : false;

function parseTableData(data){
  let tableData = {};
  let lbreak = data.split("\n");
  lbreak.forEach(res => {
    let parts = res.split(",")
    tableData[parts[0]] = parts[1]
  });
  return tableData;
}

if(runAll) {
  let processSuccess = true;
  // Check with Expected Results
  const casesUrl = `./tests/expected-rates.json`;
  if (fs.existsSync(casesUrl)) {
    let perilScenarios = JSON.parse(fs.readFileSync(casesUrl, 'utf8', 'r+'));
    for(let perilScenario of perilScenarios) {
      console.log("RUNNING SCENARIO:", perilScenario.test);

      const payload = JSON.parse(fs.readFileSync(`./tests/${perilScenario.test}.json`, 'utf8', 'r+'));
      const intendedProduct = 'productName' in payload.policy ? payload.policy.productName : '';
      // Set proper product and branch
      const product = 'product' in perilScenario ? perilScenario.product : intendedProduct;
      const branch = 'branch' in perilScenario ? perilScenario.branch : product;
      const project = perilScenario.config;

      console.log("INTENDED PRODUCT:", intendedProduct);
      console.log("USING PRODUCT:", product);

      const socotraApi = {
        tableLookup: function(configVersion, tableName, key) {
          let results = {};
          let data = fs.readFileSync(`./${project}/products/${product}/policy/tables/${tableName}.csv`, 'utf8');
          results = parseTableData(data);
          console.log(`[${chalk.yellow('DEBUG')}] (${tableName})`, `key: ${key}, value: ${results[key]}`);
          return results[key];
        }
      }

      const raterPath = `./${project}/scripts/${branch}/rater.js`;
      const rater = require(raterPath);

      console.log("USING RATER:", raterPath);

      // Run the payload against the rater
      let ratingResults = rater.getPerilRates(payload, socotraApi);

      // Flatten perilScenario
      perilScenario = perilScenario['pricedPerilCharacteristics'].reduce((a,x) => (
        { ...a, [Object.keys(x)[0]]: {
          "premium": x[Object.keys(x)[0]].premium,
          "technicalPremium": x[Object.keys(x)[0]].technicalPremium,
          "commissions": x[Object.keys(x)[0]].commissions
        }
      }), {});

      for(const perilId in perilScenario) {
        if ('pricedPerilCharacteristics' in ratingResults) {
          let pricedPerilRate = ratingResults.pricedPerilCharacteristics;
          for(let aspect of Object.keys(pricedPerilRate[perilId])) {
            let statusText = chalk.green("PASS");
            if (typeof perilScenario[perilId][aspect] == "object") {
              if (JSON.stringify(perilScenario[perilId][aspect]) != JSON.stringify(pricedPerilRate[perilId][aspect])) {
                statusText = chalk.red("FAIL");
                processSuccess = false;
              }
              console.log(`[${statusText}] (${aspect}) OBJECTS RECEIVED`);
            } else {
              if (perilScenario[perilId][aspect] != pricedPerilRate[perilId][aspect]) {
                statusText = chalk.red("FAIL");
                processSuccess = false;
              }
              console.log(`[${statusText}] (${aspect}) EXPECTED: ${pricedPerilRate[perilId][aspect]} - RECEIVED: ${perilScenario[perilId][aspect]}`);
            }
          }

        } else {
          console.log("ERROR: Could not find any priced perils.");
        }
      }
    }
  }
  process.exit(!processSuccess);
} else {
  const socotraApi = {
    tableLookup: function(configVersion, tableName, key) {
      let results = {};
      let data = fs.readFileSync(`./${project}/products/${product}/policy/tables/${tableName}.csv`, 'utf8');
      results = parseTableData(data);
      console.log(`[${chalk.yellow('DEBUG')}] (${tableName})`, `key: ${key}, value: ${results[key]}`);
      return results[key];
    }
  }

  const payload = JSON.parse(fs.readFileSync(options.payload, 'utf8', 'r+'));
  const intendedProduct = 'productName' in payload.policy ? payload.policy.productName : '';

  product = product ? product : intendedProduct;
  branch = branch ? branch : product;

  const raterPath = `./${project}/scripts/${branch}/rater.js`;
  const rater = require(raterPath);

  // Run the payload against the rater
  let ratingResults = rater.getPerilRates(payload, socotraApi);
  console.log(ratingResults);
}
