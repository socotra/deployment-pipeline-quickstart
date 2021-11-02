function getUnderwritingResult(data) {
  console.log("Get ready for some really crazy underwriting!");

  // Default Decisions
  let decision = "accept";
  let notes = ["Everyone wins!"];

  // Is vehicle too new?
  for (index in data.policy.exposures) {
    let last = data.policy.exposures[index].characteristics.length - 1;
    let exposureFields =
      data.policy.exposures[index].characteristics[last].fieldValues;
    if (exposureFields.year > new Date().getFullYear() - 10) {
      console.log(`Found Vehicle with Year ${exposureFields.year}`);
      decision = "deny";
      notes = ["This vehicle is too new"];
    }
  }

  return {
    decision: decision,
    notes: notes,
  };
}

exports.getUnderwritingResult = getUnderwritingResult;
