const config = require('./config')
let wrapper;
//Check if functions is async for nodejs runtimes greater than 8.0
if (parseInt(process.version.substring(1,2)) >= 8){
    console.log("In lib/index.js")
    wrapper = require('./asyncWrapper')
  } else {
    wrapper = require('./wrapper');
  }

module.exports = wrapper
