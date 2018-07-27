const metrics = require('wavefrontmetrics');
const config = require('./config');

var registry;
let invocationsCounter;
let invocationEventCounter;
let coldStartsCounter;
let coldStartEventCounter;
let errorsCounter;
let errorEventCounter;
let durationValue;


const registerStandardLambdaMetrics = () => {
  // Initiate Registry
  registry = new metrics.Registry();
  // Return if reportStandardLambdaMetrics is disabled.
  if(!config.isReportStandardMetrics){
    return;
  }

  // Register Invocation counter
  invocationEventCounter = new metrics.Counter();
  registry.addTaggedMetric(config.standardLambdaMetrics.invocationEventCounter, invocationEventCounter);

  invocationsCounter = new metrics.Counter();
  let invocationsCounterName = metrics.deltaCounterName(config.standardLambdaMetrics.invocationsCounter);
  registry.addTaggedMetric(invocationsCounterName, invocationsCounter);

  // Register Error Counter
  errorEventCounter = new metrics.Counter();
  registry.addTaggedMetric(config.standardLambdaMetrics.errorEventCounter, errorEventCounter);

  errorsCounter = new metrics.Counter();
  let errorsCounterName = metrics.deltaCounterName(config.standardLambdaMetrics.errorsCounter);
  registry.addTaggedMetric(errorsCounterName, errorsCounter);

	// Register cold start counter.
  coldStartEventCounter = new metrics.Counter();
  registry.addTaggedMetric(config.standardLambdaMetrics.coldStartEventCounter, coldStartEventCounter);

  coldStartsCounter = new metrics.Counter();
  let coldStartsCounterName = metrics.deltaCounterName(config.standardLambdaMetrics.coldStartsCounter);
  registry.addTaggedMetric(coldStartsCounterName, coldStartsCounter);

  // Register duration as Counter.
  durationValue = new metrics.Counter();
  registry.addTaggedMetric(config.standardLambdaMetrics.durationValue, durationValue);

  if(config.isColdStart){
    //Update cold start counter.
    incrementColdStarts()
    config.isColdStart = false;
  }
}

// Function to increment or update the given metric with the given value.
// This method should only be used to handle updating values of standardLambdaMetrics
// defined in ./config.js
const incrementMetric = function (metricName, value) {
  if (!config.isReportStandardMetrics) {
    return;
  }
  switch (metricName) {
    case config.standardLambdaMetrics.invocationsCounter:
        invocationsCounter.inc(value);
        break;
    case config.standardLambdaMetrics.invocationEventCounter:
        invocationEventCounter.inc(value);
        break;
    case config.standardLambdaMetrics.errorsCounter:
        errorsCounter.inc(value);
        break;
    case config.standardLambdaMetrics.errorEventCounter:
        errorEventCounter.inc(value);
        break;
    case config.standardLambdaMetrics.coldStartsCounter:
        coldStartsCounter.inc(value);
        break;
    case config.standardLambdaMetrics.coldStartEventCounter:
        coldStartEventCounter.inc(value);
        break;
    case config.standardLambdaMetrics.durationValue:
        durationValue.inc(value);
        break;
    default:
         console.warn("No standard lambda metric matched.");
  }
}

const incrementInvocations = function(){
  incrementMetric(config.standardLambdaMetrics.invocationEventCounter, 1)
  incrementMetric(config.standardLambdaMetrics.invocationsCounter, 1)
}

const incrementErrors = function(){
  incrementMetric(config.standardLambdaMetrics.errorEventCounter, 1)
  incrementMetric(config.standardLambdaMetrics.errorsCounter, 1)
}

const incrementColdStarts = function(){
  incrementMetric(config.standardLambdaMetrics.coldStartEventCounter, 1)
  incrementMetric(config.standardLambdaMetrics.coldStartsCounter, 1)
}

const updateDuration = function(value){
  incrementMetric(config.standardLambdaMetrics.durationValue, value)
}

const getRegistry = () => {
  return registry;
}

const reportMetrics = (context) =>  {
  if(context != null){
    let invokedFunctionArn = context.invokedFunctionArn;
    let splitArn = invokedFunctionArn.split(":");
    let [prefixArn, prefixAws, prefixLambda, region, accountId, functionOrEventSource, functionNameOrEventSourceId, versionOrAlias] = splitArn;

    // Expected formats for Lambda ARN are:
    // https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html#arn-syntax-lambda
    let tags = {
      "LambdaArn":       invokedFunctionArn,
      "source":          context.functionName,
      "FunctionName":    context.functionName,
      "ExecutedVersion": context.functionVersion,
      "Region":          region,
      "accountId":       accountId
    }
    if (functionOrEventSource === "function") {
      tags["Resource"] = functionNameOrEventSourceId
      if (splitArn.length === 8) {
        tags["Resource"] += ":" + versionOrAlias
      }
    } else if (functionOrEventSource === "event-source-mappings") {
      tags["EventSourceMappings"] = functionNameOrEventSourceId
    }

    try{
      let directReporter = new metrics.WavefrontDirectReporter(registry, "", config.server, config.authToken, tags);
      directReporter.report()
    }catch(exception){
      console.warn('Failed to report metrics to wavefront.');
    }
  }else{
    console.warn('Failed to report metrics to wavefront as retrieving lambdaContext from AWS failed.');
  }
}

module.exports = {
  registerStandardLambdaMetrics,
  incrementInvocations,
  incrementErrors,
  incrementColdStarts,
  updateDuration,
  reportMetrics,
  getRegistry
};
