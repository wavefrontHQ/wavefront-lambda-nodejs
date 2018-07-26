const wavefrontReporter = require('./reporter');
const AsyncFunction = (async () => {}).constructor;

const handleSuccess =(context, startTime)=> {
  // Update Duration
  wavefrontReporter.updateDuration(process.hrtime(startTime)[1] / 1000000)
  console.log("CALCULATE:: duration from then() ")
  wavefrontReporter.reportMetrics(context);
}

const handleError = (context, startTime) => {
  // Increment error counter.
  wavefrontReporter.incrementErrors();
  // Update Duration
  wavefrontReporter.updateDuration(process.hrtime(startTime)[1] / 1000000)
  console.log("INCREMENT:: Error counter and calculate duration from catch")
  wavefrontReporter.reportMetrics(context);
}

const generateAsyncWrapper = ((lambdaHandlerFunction) => async function (event, context) {
        // Register standard lambda metrics with the registry.
        wavefrontReporter.registerStandardLambdaMetrics();
        // Increment invocation counter.
        wavefrontReporter.incrementInvocations();
        let startTime = process.hrtime();
        return lambdaHandlerFunction(event, context)
        .then((data) => {
          handleSuccess(context, startTime);
          return data;
        })
        .catch((error) => {
          handleError(context, startTime);
          throw error;
        });
});

const wrapper = lambdaHandlerFunction => {
  if(lambdaHandlerFunction instanceof AsyncFunction === true){
    return generateAsyncWrapper(lambdaHandlerFunction);
  } else {
    let generateWrapper = require('./wrapper');
    return generateWrapper.wrapper(lambdaHandlerFunction);
  }
};

const getRegistry = function(){
  return wavefrontReporter.getRegistry();
}

module.exports = {wrapper, getRegistry};
