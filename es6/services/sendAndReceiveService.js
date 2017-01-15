/**
 * Created by Patrick on 22/11/2016.
 */
module.exports = sendAndReceiveService;

  function sendAndReceiveService(statusService, emergencyService, $window, logService, $rootScope,
                                 buttonService, crcService, shareSettings, $timeout, $async, bugout,
                                  bluetoothService, $interval) {
    const sendAndReceive = this;
    //Available methods
    sendAndReceive.subscribe = subscribe;
    sendAndReceive.subscribeRawData = subscribeRawData;
    sendAndReceive.unsubscribe = unsubscribe;
    //Also available: sendAndReceive.writeAsync
    sendAndReceive.write = write;
    sendAndReceive.expectedResponse = expectedResponse;
    sendAndReceive.emitResponse = emitResponse;
    sendAndReceive.createResetListener = createResetListener1;
    sendAndReceive.clearBuffer = clearBuffer;

    //Immediately after emergency is on
    $rootScope.$on("emergencyOn", function () {

      let connectionAvailable = $interval(function () {
        //TODO emergencyOn sent a million times, fixme
        bluetoothService.getConnectedValue(function (value) {
          if (value) {
            $interval.cancel(connectionAvailable);

            //Unsubscribe from regular responses
            sendAndReceive.unsubscribe();

            //Subscribe to emergency responses
            subscribeEmergency();

            //Create listener for emergency command <y8:yX>
            createResetListener1();

            //Send <y8:yX>
            sendEmergency();
          }
        });
      }, 1000);


    });

    //After emergency commands are good allow for resetting of emergency on button click
    $rootScope.$on("resetEmergency", function () {
      createResetListener2();
      sendResetEmergency();
    });

    //service-scoped variables
    let stepMotorNum = shareSettings.getObj().stepMotorNum;
    let command;
    let response;
    let lastCommandTime;
    let lastReceivedTime;
    let subscribed = statusService.getSubscribed();
    let emergencySubscribed = false;

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
        if (tempStr.search('<') > -1 && tempStr.search('>') > -1 &&
          tempStr.search(';') > -1 && tempStr.search('#') > -1) {
            bugout.bugout.log('\ntemp in subscribe: \n'+tempStr);
            $rootScope.$emit('response', tempStr);
            sendAndReceive.emitResponse(tempStr);
            tempStr = '';
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
      if (bluetoothService.getConnectedValue()) {
        emergencySubscribed = false;
        $window.bluetoothSerial.unsubscribe(function () {
          logService.consoleLog('Succesfully unsubscribed');
          statusService.setSubscribed(false);
        }, function () {
          logService.consoleLog('ERROR: could not unsubscribe');
        })
      }
    }

    function responseListener(searchStr) {
      return new Promise((resolve, reject) => {
        let resReceived = false;
        let responseCount = 0;

        //If no reply within 3s, reject
        $timeout(() => {
          if (!resReceived) {
            listener();
            reject('Response not in time');
          }
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
          }
          else if (res.indexOf('667:') > -1) {
            resolve('RETRY');
          }
          else if (responseCount >= 3)
            reject('Too many wrong responses');

          listener();
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
        bugout.bugout.log('res: '+res+', searchValuesArr:');
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

    sendAndReceive.sendWithRetry = $async(function* (str) {
      try {
        let res;
        for (let i = 0; i < 5; i++) {
          bugout.bugout.log('try: '+i+', command: '+str);
          res = yield sendAndReceive.writeAsync(str);
          bugout.bugout.log('res in sendWithretry: '+res);
          if (i === 4)
            return new Promise((resolve, reject) => {
              reject('exceeded num of tries, error: '+res);
            });
          else if (res === 'OK')
            return new Promise((resolve, reject) => {
              bugout.bugout.log('resolve value: '+res);
              resolve('resolve value: '+res);
            });
        }
      }
      catch (err) {
        return new Promise((resolve, reject) => {
          reject(err);
        })
      }
    });

    sendAndReceive.writeAsync = $async(function* (str) {
      try {
        if (statusService.getEmergency() === true)
          throw new Error('Cannot write, emergency is on');

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
        return new Promise((resolve, reject) => resolve(err));
      }
    });

    function write(str) {
      return new Promise((resolve, reject) => {
        if (statusService.getEmergency() === false) {

          //append string with cyclic redundancy check
          const strWithCrc = crcService.appendCRC(str);
          $window.bluetoothSerial.write(strWithCrc, function () {
            logService.addOne('sent command: '+strWithCrc);
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
      bugout.bugout.log('res in emitResponse: '+res);

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
      else if (res.search('wydone:') > -1) {
        //Added a timeout so we can wait for some promises to finish before the wydone listener is initialised
        $timeout(() => {
          $rootScope.$emit('wydone', res);
        }, 200)

      }
      else {
        $rootScope.$emit('bluetoothResponse', res);
      }
    }

    //FIXME this function is called twice
    function sendEmergency() {
      logService.consoleLog('\n\nsendAndReceiveService.sendEmergency called');
      stepMotorNum = shareSettings.getObj().stepMotorNum;
      stepMotorNum = typeof stepMotorNum === 'undefined' ? '0' : stepMotorNum;
      const resetCommand1 = crcService.appendCRC('<y8:y'+stepMotorNum+'>');
      bugout.bugout.log('written resetCommand1: '+resetCommand1);

      $window.bluetoothSerial.write(resetCommand1, function () {
        logService.addOne('Program reset command1 sent: '+resetCommand1);
      }, function (err) {
        logService.addOne('Error: Program reset command could not be sent. '+err, true);
      });
    }

    function subscribeEmergency() {
      logService.consoleLog('subscribed emergency');
      emergencySubscribed = true;
      $window.bluetoothSerial.subscribe('>', function (data) {
        if (data.search('<8:y>') > -1) {
          $rootScope.$emit('emergencyReset1', data);
        }
        if (data.search('11:') > -1) {
          $rootScope.$emit('emergencyReset2', data)
        }
      });
    }

    function createResetListener1() {
      let responded = false;
      $timeout(() => {
        if (!responded) {
          sendEmergency();
          emergencyResponse();
        }
      }, 1000);


      let emergencyResponse = $rootScope.$on('emergencyReset1', function (event, res) {
        bugout.bugout.log('res in emergencyListener: '+res);
        buttonService.setValues({showResetButton: true});
        emergencyResponse();
      });
      bugout.bugout.log('resetListener1 created');
    }

    function sendResetEmergency() {
      subscribeEmergency();

      stepMotorNum = shareSettings.getObj().stepMotorNum;
      const resetCommand2 = crcService.appendCRC('<f0'+stepMotorNum+'>');
      $window.bluetoothSerial.write(resetCommand2, function () {
        logService.addOne('Program reset command2 sent: '+resetCommand2);
      }, function (err) {
        logService.addOne('Error: Program reset command could not be sent. '+err, true);
      });
    }

    function createResetListener2() {
      let emergencyResponse = $rootScope.$on('emergencyReset2', function (event, res) {
        bugout.bugout.log('res in emergencyListener: '+res);
        if (res.search('11:') > -1) {
          logService.addOne('Program succesfully reset');
          sendAndReceive.unsubscribe();
          emergencyService.off();
          emergencyResponse();
        }
      });
      bugout.bugout.log('resetListener2 created');
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
      logService.addOne('Stopswitch '+res.charAt(posStopswitch)+' has been hit. Aborting task.', true);
      logService.consoleLog('Error: hit stopswitch '+res.charAt(posStopswitch));
      //emergencyService.on sets correct buttons and sends resetcommand
      emergencyService.on();
      $rootScope.$emit('stopswitchHit', res, res.charAt(posStopswitch));
    }

    function exceededMaximumNumberOfStepsToMiss(res) {
      const settings = shareSettings.getObj();
      const splicedStr = res.slice(res.lastIndexOf('@'));
      const missedSteps = splicedStr.slice(2, splicedStr.indexOf(';'));
      const maxAllowedMiss = settings.encoder.stepsToMiss ? settings.encoder.stepsToMiss : 'unknown';

      logService.addOne('You have exceeded the maximum number of allowed steps ('+maxAllowedMiss+'). If your machine did not move at all, make sure you set the correct stepmotor number in Settings', true);
      logService.consoleLog('ERROR: hit max number of allowed steps');
      emergencyService.on();
      $rootScope.$emit('maxSteps', res, missedSteps)
    }
  }


