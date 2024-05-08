import path from "path";

const cleanInput = (input: string) => {
  // Remove everything before the first '{' character
  const firstCurlyBracketIndex = input.indexOf("{");
  const lastCurlyBracketIndex = input.lastIndexOf("}");

  if (firstCurlyBracketIndex === -1 || lastCurlyBracketIndex === -1) {
    throw new Error("No curly bracket found");
  }

  return input.substring(firstCurlyBracketIndex, lastCurlyBracketIndex + 1);
};

/**
 * This function cleans the output of Vitest by removing unnecessary properties.
 * It also sorts the test results by the test name.
 */
export const cleanVitestOutput = (
  result: string,
  context: {
    rootFolder: string;
  },
) => {
  const asJson: {
    startTime?: number;
    // endTime?: number;
    // duration?: number;
    numFailedTestSuites?: number;
    numFailedTests?: number;
    numPassedTestSuites?: number;
    numPassedTests?: number;
    numPendingTestSuites?: number;
    numPendingTests?: number;
    numTodoTests?: number;
    numTotalTestSuites?: number;
    numTotalTests?: number;
    testResults: {
      name: string;
      startTime?: number;
      endTime?: number;
      // duration?: number;
      assertionResults: {
        duration?: number;
      }[];
    }[];
  } = JSON.parse(cleanInput(result));

  delete asJson.startTime;
  // delete asJson.endTime;
  // delete asJson.duration;
  delete asJson.numFailedTestSuites;
  delete asJson.numFailedTests;
  delete asJson.numPassedTestSuites;
  delete asJson.numPassedTests;
  delete asJson.numPendingTestSuites;
  delete asJson.numPendingTests;
  delete asJson.numTodoTests;
  delete asJson.numTotalTestSuites;
  delete asJson.numTotalTests;

  asJson.testResults.forEach((testResult) => {
    delete testResult.startTime;
    delete testResult.endTime;

    testResult.name = path.relative(context.rootFolder, testResult.name);

    testResult.assertionResults.forEach((assertionResult) => {
      delete assertionResult.duration;
    });
  });

  asJson.testResults.sort((a, b) => a.name.localeCompare(b.name));

  return asJson;
};
