const wavefrontReporter = require('./reporter');

const wrapper = (lambdaHandlerFunction) => function (event, context, callback){
    console.log("INSIDE:: wavefrontWrapper")
    // Register standard lambda metrics with the registry.
    wavefrontReporter.registerStandardLambdaMetrics();
    let isWrapperCallbackExecuted = false;
    const wrappercallback = (error, successmesssage) =>{
      // Increment error counter as required.
      if(error !== undefined && error !==null){
          console.log("INCREMENT:: Error counter from callback")
          wavefrontReporter.incrementErrors();
      }
      console.log('CALCULATE::  duration from callback');
      wavefrontReporter.updateDuration(process.hrtime(startTime)[1] / 1000000)
      isWrapperCallbackExecuted = true;
      // Report metrics.
      wavefrontReporter.reportMetrics(context);
      callback(error, successmesssage);
    }

    // Increment invocation counter.
    wavefrontReporter.incrementInvocations();
    const startTime = process.hrtime();
    try {
      lambdaHandlerFunction(event, context, wrappercallback)
      // Handle the case when function completed with success but didn't call the wrappedCallback().
      process.on('beforeExit', function() {
        if(!isWrapperCallbackExecuted){
          console.log("CALCULATE:: Duration from process.beforeExit")
          wavefrontReporter.updateDuration(process.hrtime(startTime)[1] / 1000000);
          wavefrontReporter.reportMetrics(context);
        }
      });
      console.log("SamplePrintStatement");
    }catch(err){
      // wrappercallback(err, null)
      //increment error counters and rpeort points.
      console.log("INCREMENT:: Error counter and calculate duration from catch")
      wavefrontReporter.incrementErrors();
      wavefrontReporter.updateDuration(process.hrtime(startTime)[1] / 1000000)
      wavefrontReporter.reportMetrics(context);
      throw err;
    }
}

const getRegistry = () => {
  return wavefrontReporter.getRegistry();
}

module.exports = {wrapper, getRegistry};
