const server = process.env.WAVEFRONT_URL;
const authToken = process.env.WAVEFRONT_API_TOKEN;
const isReportStandardMetrics = process.env.REPORT_STANDARD_METRICS !== 'False' && process.env.REPORT_STANDARD_METRICS  !== 'false'

// Validate Environment variables.
if (!server || !server.length) {
  throw new Error('Environment variable WAVEFRONT_URL is not set.');
}
if (!authToken || !authToken.length) {
  throw new Error('Environment variable WAVEFRONT_API_TOKEN is not set.');
}

// Metric prefix for all standard lambda metrics reported by wrapper.
const metricPrefix = "aws.lambda.wf.";

// Standard Lambda Metrics reported by wrapper.
const standardLambdaMetrics = {
  invocationsCounter : metricPrefix + 'invocations.count',
  invocationEventCounter : metricPrefix + 'invocation_event.count',
  coldStartsCounter : metricPrefix + 'coldstarts.count',
  coldStartEventCounter : metricPrefix + 'coldstart_event.count',
  errorsCounter : metricPrefix + 'errors.count',
  errorEventCounter : metricPrefix + 'error_event.count',
  durationValue : metricPrefix + 'duration.value'
};
let isColdStart = true;

module.exports = {
  server,
  authToken,
  isReportStandardMetrics,
  standardLambdaMetrics,
  isColdStart
};
