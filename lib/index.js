const config = require('./config')
let wrapper;
// Check if nodejs runtime is greater than v8.0.
// If so return wrapper which can handle async functions.
if (parseInt(process.version.substring(1,2)) >= 8){
    wrapper = require('./asyncWrapper')
  } else {
    wrapper = require('./wrapper');
  }

module.exports = wrapper
