"use strict";

let lib = require("../common/lib.js");
var parse = require('csv-parse');

function firstIfLength(list) {
  if(list instanceof Array) {
    return list.length ? list[0] : null
  }
  return null;
}

function ratePeril(pep, peril, exp_c, policyFieldValues) {
  let perilFieldGroups = peril.characteristics[0].fieldGroupsByLocator;
  let perilFieldValues = peril.characteristics[0].fieldValues;
  let exposureFieldValues = exp_c.fieldValues;

  // Setup
  let basePremium = 0;
  let totalPremium = 0;
  let technicalPremium = 0;
  let commissionRate = 0.15;

  let vehicleRate = socotraApi.tableLookup(
    0, "vehicle_rate_table_simple_auto", firstIfLength(exposureFieldValues.vehicle_type)
  )

  basePremium = (exposureFieldValues.vehicle_value * 0.037)
  basePremium = (basePremium * vehicleRate);

  if(policyFieldValues.channel == "Direct") {
    basePremium = (basePremium * 0.9);
  }

  technicalPremium = basePremium;

  let commissions = [
    {"recipient": "Broker", "amount": (basePremium * commissionRate)}
  ];

  // Return premium object
  return {
    premium: totalPremium,
    technicalPremium: technicalPremium,
    commissions: commissions
  };
}

function getPerilRates(data, socotraApiOverride=false) {
  global.socotraApi = socotraApiOverride ? socotraApiOverride : socotraApi;
  lib.polyfill();

  let policy = data.policy;
  let policy_c = policy.characteristics[0];
  let allPerils = policy.exposures.flatMap(ex => ex.perils);

  // This is the result object that we'll decorate with rating calculations
  let ret = { pricedPerilCharacteristics: {} };

  for (const pep of data.policyExposurePerils) {
    // Go through perils on quote/policy
    let peril = allPerils.find(
      p => p.characteristics.some(
        ch => ch.locator == pep.perilCharacteristicsLocator
      )
    );

    // Go through exposures on quote/policy
    let exp_c = policy.exposures.flatMap(
      ex => ex.characteristics
    ).find(ch => ch.locator = pep.exposureCharacteristicsLocator);

    // Set rate for peril
    ret.pricedPerilCharacteristics[
      pep.perilCharacteristicsLocator
    ] = ratePeril(pep, peril, exp_c, policy_c.fieldValues);
  }
  return ret;
}

exports.getPerilRates = getPerilRates;
