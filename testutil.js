const optionDefinitions = [
  { name: 'payload', type: String, default: './payload.json' },
  { name: 'destination', type: String, default: './output.json'}
]

const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

const payload = ('payload' in options) ? options.payload : "./payload.json"
const destination = ('destination' in options) ? options.destination : "./destination.json"

console.log(options);
const fs = require("fs");

let policyExposurePerils = [];
let data = JSON.parse(fs.readFileSync(payload));

for (let exposure of data['exposures']) {
  for (let peril of exposure['perils']) {
    const last = (peril.characteristics.length - 1);
    policyExposurePerils.push({
      "perilCharacteristicsLocator": peril.characteristics[last].locator,
      "exposureCharacteristicsLocator": peril.characteristics[last].exposureCharacteristicsLocator,
      "policyCharacteristicsLocator": peril.characteristics[last].policyCharacteristicsLocator
    });
  }
}

const output = {
  "operation": "new_business",
  "policy": data,
  "policyExposurePerils": policyExposurePerils,
}

fs.writeFileSync(destination, JSON.stringify(output, undefined, 2));
