function getUnderwritingResult(data) {
  console.log("Hello underwriting world!");

  return {
    decision: "accept",
    notes: ["Everyone wins!"],
  };
}

exports.getUnderwritingResult = getUnderwritingResult;
