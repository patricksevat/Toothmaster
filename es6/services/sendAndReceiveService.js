/**
 * Created by Patrick on 22/11/2016.
 */
module.exports = sendAndReceiveService;

  function sendAndReceiveService(statusService, emergencyService, $window, logService, $rootScope,
                                 buttonService, crcService, shareSettings, $timeout, $async, bugout) {
    const sendAndReceive = this;
    //Available methods
    sendAndReceive.subscribe = subscribe;
    sendAndReceive.subscribeRawData = subscribeRawData;
    sendAndReceive.unsubscribe = unsubscribe;
    sendAndReceive.write = write;
    sendAndReceive.expectedResponse = expectedResponse;
    sendAndReceive.emitResponse = emitResponse;
    sendAndReceive.sendEmergency = sendEmergency;
    sendAndReceive.createResetListener = createResetListener;
    sendAndReceive.subscribeEmergency = subscribeEmergency;
    sendAndReceive.clearBuffer = clearBuffer;

    //emergency listener
    $rootScope.$on('emergencyOn', function () {
      bugout.bugout.log('emergencyOn received in sendAndReceiveService');
      sendAndReceive.sendEmergency();
    });

    //service-scoped variables
    let stepMotorNum = shareSettings.getObj().stepMotorNum;
    let command;
    let response;
    let lastCommandTime;
    let lastReceivedTime;
    let subscribed = statusService.getSubscribed();

    //method functions
    function subscribe() {
      logService.consoleLog('subscribed');
      statusService.setSubscribed(true);

      //The responses from are based on delimiter '#',
      // however the full response can contain multiple '#'s
      // so temp holds command till they are complete
      let tempStr = '';
      $window.bluetoothSerial.subscribe('#', function (receivedStr) {
        lastReceivedTime = Date.now();
        tempStr += receivedStr;
        if (tempStr.search(';') > -1 && tempStr.search('#') > -1) {
          bugout.bugout.log('\ntemp in subscribe: \n'+tempStr);
          $rootScope.$emit('response', tempStr);
          sendAndReceive.emitResponse(tempStr);
          tempStr = '';
        }
      });
    }

    function subscribeEmergency() {
      logService.consoleLog('subscribed emergency');
      $window.bluetoothSerial.subscribe('>', function (data) {
        lastReceivedTime = Date.now();
        if (data.search('<8:y>') > -1) {
          $rootScope.$emit('emergencyReset', data);
        }
      });
    }

    function subscribeRawData() {
      $window.bluetoothSerial.subscribeRawData(function (data) {
        var bytes = String.fromCharCode.apply(null, new Uint8Array(data));
        bugout.bugout.log('Rawdata: '+bytes);
      })
    }

    function unsubscribe() {
      $window.bluetoothSerial.unsubscribe(function () {
        logService.consoleLog('Succesfully unsubscribed');
        statusService.setSubscribed(false);
      }, function () {
        logService.consoleLog('ERROR: could not unsubscribe');
      })
    }

    function responseListener(searchStr) {
      return new Promise((resolve, reject) => {
        let resReceived = false;
        let responseCount = 0;

        //If no reply within 3s, reject
        $timeout(() => {
          if (!resReceived)
            reject('Response not in time');
        }, 3000);

        //response received
        let listener = $rootScope.$on('response', function (event, res) {
          resReceived = true;
          responseCount += 1;
          let searchBool = checkResponse(res, searchStr);
          if (searchBool) {
            bugout.bugout.log('resolving OK');
            responseCount = 0;
            resolve('OK');
            listener();
          }
          else if (res.indexOf('667:') > -1) {
            resolve('RETRY');
          }
          else if (responseCount >= 3)
            reject('Too many wrong responses');
        })
      })
    }

    function checkResponse(res, searchValues) {
      let returnBool = false;
      if (typeof searchValues === 'string') {
        bugout.bugout.log('res: '+res+', searchValueStr: '+searchValues);
        returnBool = (res.search(searchValues) > -1);
        bugout.bugout.log('returnBool: '+returnBool);
      }
      else if (Array.isArray(searchValues)) {
        bugout.bugout.log('res: '+res+'searchValuesArr');
        bugout.bugout.log(searchValues);
        searchValues.map((value) => {
          if (res.search(value) > -1) {
            returnBool = true;
          }
        });
        bugout.bugout.log('returnBool: '+returnBool);
      }
      return returnBool
    }

    sendAndReceive.writeAsync = $async(function* (str) {
      try {
        yield sendAndReceive.write(str);
        let expectedResponseShouldContain = sendAndReceive.expectedResponse(str[1]);
        bugout.bugout.log('expectedResponseShouldContain: ');
        bugout.bugout.log(expectedResponseShouldContain);
        let resolveValue = yield responseListener(expectedResponseShouldContain);
        expectedResponseShouldContain = null;

        return new Promise((resolve, reject) => {
          bugout.bugout.log('resolve with resolveValue: '+resolveValue);
          resolve(resolveValue);
        });
      }
      catch (err) {
        bugout.bugout.log('ERR: '+err);
        return new Promise((resolve, reject) => reject(err));
      }
    });

    function write(str) {
      return new Promise((resolve, reject) => {
        if (statusService.getEmergency() === false) {

          //append string with cyclic redundancy check
          const commandWithCRC = crcService.appendCRC(str);

          $window.bluetoothSerial.write(commandWithCRC, function () {
            bugout.bugout.log('sent: '+commandWithCRC);
            lastCommandTime = Date.now();
            resolve();
          }, function () {
            bugout.bugout.log('ERROR: could not send command '+str);
            reject('Could not send command');
          })
        }
      })
    }

    function expectedResponse(str) {
      stepMotorNum = shareSettings.getObj().stepMotorNum;
      switch (str) {
        case 'y':
          return '8:y';
          break;
        case 'd':
          return '12:';
          break;
        case 'b':
          return '13:';
          break;
        case 'x':
          return '14:';
          break;
        case 'v':
          return '9:';
          break;
        case 's':
          return '6:';
          break;
        case 'p':
          return '5:';
          break;
        case 'r':
          return '3:';
          break;
        case 'o':
          return '2:';
          break;
        case 'f':
          return '11:';
          break;
        case 'k':
          return ['0:rdy', 'FAULT'];
          break;
        case 'q':
          buttonService.setValues({'showSpinner':true});
          return ['rdy','wydone','q'];
          break;
        case 'h':
          return '6:';
          break;
        case 'z':
          return '14:';
          break;
        case 'w':
          return ['wydone','w'+stepMotorNum] ;
          break;
      }
    }

    function emitResponse(res) {
      console.log('res in emitResponse: '+res);

      const settings = shareSettings.getObj();
      //handle stopswitch hit
      if (res.search('wydone:') > -1 && res.search('wydone:0') === -1) {
        stopSwitchHit(res);
      }

      //handle encoder missed steps
      //splice result from '@' till end
      // in splicedStr, splice again from pos[2] ([0] = @, [1] is status code), till indexOf(';')
      else if (res.search('wydone:') > -1 && res.search('@5') > -1 && settings.encoder.enable === true) {
        exceededMaximumNumberOfStepsToMiss(res);
      }
      else if (res.search('2:') > -1) {
        $rootScope.$emit('sendKfault', res);
      }
      else if (res.indexOf('$') > -1 && res.search('10:') === -1) {
        faultyResponse(res);
      }
      else if (res.search('wydone:') > -1) {
        $rootScope.$emit('wydone', res);
      }
      else {
        $rootScope.$emit('bluetoothResponse', res);
      }
    }

    function sendEmergency() {
      logService.consoleLog('sendAndReceiveService.sendEmergency called');
      sendAndReceive.subscribeEmergency();
      createResetListener();
      stepMotorNum = shareSettings.getObj().stepMotorNum;
      const resetCommand = crcService.appendCRC('<y8:y'+stepMotorNum+'>');
      $window.bluetoothSerial.write(resetCommand, function () {
        logService.addOne('Program reset command sent: '+resetCommand);
      }, function (err) {
        logService.addOne('Error: Program reset command could not be sent. '+err, true);
      });
    }

    function createResetListener() {
      let emergencyResponse = $rootScope.$on('emergencyReset', function (event, res) {
        bugout.bugout.log('res in emergencyListener: '+res);
        if (res.search('8:y') > -1) {
          logService.addOne('Program succesfully reset');
          sendAndReceive.unsubscribe();
          emergencyResponse();
        }
      });
      bugout.bugout.log('resetListener created');
    }

    function clearBuffer() {
      $window.bluetoothSerial.clear(function () {
        logService.consoleLog('Received buffer cleared');
      }, function () {
        logService.consoleLog('Error: could not clear receive buffer');
      })
    }
  //
  //  Helper functions
  //

    function stopSwitchHit(res) {
      const posStopswitch = res.lastIndexOf('@')-3;
      logService.addOne('Stopswitch '+res.charAt(posStopswitch)+' has been hit. Aborting task and resetting program.', true);
      logService.consoleLog('Error: hit stopswitch '+res.charAt(posStopswitch));
      //emergencyService.on sets correct buttons and sends resetcommand
      emergencyService.on();
      $rootScope.$emit('stopswitchHit', res, res.charAt(posStopswitch));
    }

    function exceededMaximumNumberOfStepsToMiss(res) {
      const splicedStr = res.slice(res.lastIndexOf('@'));
      const missedSteps = splicedStr.slice(2, splicedStr.indexOf(';'));
      const maxAllowedMiss = settings.encoder.stepsToMiss ? settings.encoder.stepsToMiss : 'unknown';

      logService.addOne('You have exceeded the maximum number of allowed steps ('+maxAllowedMiss+'). If your machine did not move at all, make sure you set the correct stepmotor number in Settings', true);
      logService.consoleLog('ERROR: hit max number of allowed steps');
      emergencyService.on();
      $rootScope.$emit('maxSteps', res, missedSteps)
    }
  }


