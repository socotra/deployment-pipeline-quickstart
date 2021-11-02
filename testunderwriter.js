const fs = require("fs");
let csv = require("csv");
const chalk = require("chalk");
const util = require("util");

const optionDefinitions = [
  { name: "project", type: String, defaultOption: "./" },
  { name: "product", type: String, defaultOption: "" },
  { name: "branch", type: String, defaultOption: "main" },
  { name: "payload", type: String, defaultOption: "./payload.json" },
  { name: "runAll", type: Boolean, defaltOption: false },
];

const commandLineArgs = require("command-line-args");
const options = commandLineArgs(optionDefinitions);

const project = options.project;
let product = options.product;
let branch = options.branch ? options.branch : options.product;
const runAll = options.runAll ? options.runAll : false;

// Insert Util Processing There

// Build out Socotra API
function socotraApiBuilder(project, product) {}

if (runAll) {
  let processSuccess = true;
  // Check with Expected Results
  const casesUrl = `./tests/expected-rates.json`;
  if (fs.existsSync(casesUrl)) {
    let policyScenarios = JSON.parse(fs.readFileSync(casesUrl, "utf8", "r+"));
    for (let policyScenario of policyScenarios) {
      console.log("RUNNING UNDERWRITING SCENARIO:", policyScenario.test);

      const payload = JSON.parse(
        fs.readFileSync(`./tests/${policyScenario.test}.json`, "utf8", "r+")
      );
      const intendedProduct =
        "productName" in payload.policy ? payload.policy.productName : "";
      // Set proper product and branch
      const product =
        "product" in policyScenario ? policyScenario.product : intendedProduct;
      const branch =
        "branch" in policyScenario ? policyScenario.branch : product;
      const project = policyScenario.config;

      console.log("INTENDED PRODUCT:", intendedProduct);
      console.log("USING PRODUCT:", product);

      const underwriterPath = `./${project}/scripts/${branch}/underwriter.js`;
      const underwriter = require(underwriterPath);

      console.log("USING UNDERWRITER:", underwriterPath);

      // Run the payload against the rater
      let underwritingResults = underwriter.getUnderwritingResult(payload);

      // Flatten policyScenario
      policyScenario = policyScenario["policy_underwriting"][0];

      if (underwritingResults) {
        for (let aspect of Object.keys(underwritingResults)) {
          let statusText = chalk.green("PASS");
          if (typeof policyScenario[aspect] == "object") {
            if (
              JSON.stringify(perilScenario["policy_scenario"][aspect]) !=
              JSON.stringify(underwritingResult[saspect])
            ) {
              statusText = chalk.red("FAIL");
              processSuccess = false;
            }
            console.log(`[${statusText}] (${aspect}) OBJECTS RECEIVED`);
          } else {
            if (policyScenario[aspect] != underwritingResults[aspect]) {
              statusText = chalk.red("FAIL");
              processSuccess = false;
            }
            console.log(
              `[${statusText}] (${aspect}) EXPECTED: ${policyScenario[aspect]} - RECEIVED: ${underwritingResults[aspect]}`
            );
          }
        }
      } else {
        console.log("ERROR: Could not find any priced perils.");
      }
    }
  }
  process.exit(!processSuccess);
} else {
  const payload = JSON.parse(fs.readFileSync(options.payload, "utf8", "r+"));
  const intendedProduct =
    "productName" in payload.policy ? payload.policy.productName : "";

  product = product ? product : intendedProduct;
  branch = branch ? branch : product;

  const raterPath = `./${project}/scripts/${branch}/underwriter.js`;
  const rater = require(raterPath);

  // Run the payload against the rater
  let underwritingResults = rater.getUnderwritingResult(payload);
  console.log(
    util.inspect(underwritingResults, {
      showHidden: false,
      depth: null,
      colors: true,
    })
  );
}
