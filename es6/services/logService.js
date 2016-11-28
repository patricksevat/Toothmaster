function logService(bugout) {
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

  function addOne(str) {
    bugout.bugout.log('adding to UI log: '+str);
    if (logService.UILog.length === 0) {
      logService.UILog.unshift(str);
    }
    else if (logService.UILog[0].indexOf(String.fromCharCode(40)) !== -1 && logService.UILog[0].indexOf(String.fromCharCode(41)) !== -1) {
      var numStr = logService.UILog[0].slice(logService.UILog[0].indexOf('(')+1, logService.UILog[0].indexOf(')'));
      var num = Number(numStr);
      //indexOf(')')+2 because of the extra space
      var cleanStr = logService.UILog[0].slice(logService.UILog[0].indexOf(')')+2);
      if (str === cleanStr) {
        num += 1;
        logService.UILog[0] = '('+num+') '+cleanStr;
      }
      else {
        logService.UILog.unshift(str);
      }
    }
    else if (logService.UILog[0] === str) {
      logService.UILog[0] = '(2) '+str;
    }
    else {
      if (logService.UILog.length >= 200) {
        logService.UILog.pop();
        logService.UILog.unshift(str);
      }
      else {
        logService.UILog.unshift(str);
      }
    }
  }

  function getLog(cb) {
    if (cb) cb(logService.UILog);
    return logService.UILog;
  }

  function consoleLog(str) {
    bugout.bugout.log(str);
  }

}

export default logService
