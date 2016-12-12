function logService(bugout, errorService) {
  const logService = this;
  //Available methods
  logService.setBulk = setBulk;
  logService.addOne = addOne;
  logService.getLog = getLog;
  logService.consoleLog = consoleLog;

  //Service-scoped variables
  logService.UILog = [];

  //method functions
  function setBulk(arr) {
    logService.UILog = arr;
  }

  function addOne(str, err, errorLevel = 'critical') {
    bugout.bugout.log('adding to UI log: '+str);
    if (logService.UILog.length === 0) {
      logService.UILog.unshift(str);
    }
    // If message is same as previous message AND previous message already has (n), increment (n) 
    else if (logService.UILog[0].indexOf('(') > -1 && logService.UILog[0].indexOf(')') !== -1) {
      const numStr = logService.UILog[0].slice(logService.UILog[0].indexOf('(')+1, logService.UILog[0].indexOf(')'));
      let num = Number(numStr);
      
      //indexOf(')')+2 because of the space after (n)
      var cleanStr = logService.UILog[0].slice(logService.UILog[0].indexOf(')')+2);
      if (str === cleanStr) {
        num += 1;
        logService.UILog[0] = '('+num+') '+cleanStr;
      }
        
      // New log message != old log message  
      else {
        logService.UILog.unshift(str);
      }
    }
      
    // Message same as previous message, previous message does not yet have (n)  
    else if (logService.UILog[0] === str) {
      logService.UILog[0] = '(2) '+str;
    }
    
    //  Message is not same as prev message
    else {
      if (logService.UILog.length >= 200) {
        logService.UILog.pop();
        logService.UILog.unshift(str);
      }
      else {
        logService.UILog.unshift(str);
      }
    }
    
    //Show error message if needed
    if (err === true) {
      errorService.addError({
        level: errorLevel,
        message: str
      })
    }
  }
  
  function getLog() {
    return logService.UILog;
  }

  function consoleLog(str) {
    bugout.bugout.log(str);
  }

}

export default logService
