const fs = require("fs");

const optionDefinitions = [
  { name: 'payload', type: String, default: './payload.json' },
  { name: 'destination', type: String, default: './output.json'}
]

const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

const payload = ('payload' in options) ? options.payload : "./payload.json"
const destination = ('destination' in options) ? options.destination : "./destination.json"

console.log(options);

function massagePayload(data, operation="new_business") {
  let policyExposurePerils = [];
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
  return {
    "operation": operation,
    "policy": data,
    "policyExposurePerils": policyExposurePerils,
  }
}

let data = JSON.parse(fs.readFileSync(payload));

fs.writeFileSync(destination,
  JSON.stringify(
    massagePayload(data), undefined, 2
  )
);
