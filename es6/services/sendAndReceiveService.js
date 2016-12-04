/**
 * Created by Patrick on 22/11/2016.
 */
module.exports = sendAndReceiveService;

  function sendAndReceiveService(statusService, emergencyService, $window, logService, $rootScope,
                                 buttonService, crcService, $ionicPopup, shareSettings, $interval, $timeout, $q, $async, bugout) {
    const sendAndReceive = this;
    //Available methods
    sendAndReceive.subscribe = subscribe;
    sendAndReceive.subscribeRawData = subscribeRawData;
    sendAndReceive.unsubscribe = unsubscribe;
    sendAndReceive.write = write;
    // sendAndReceive.writeAsync = writeAsync;
    sendAndReceive.writeBuffered = writeBuffered;
    sendAndReceive.checkInterpretedResponse = checkInterpretedResponse;
    sendAndReceive.getNewCommandID = getNewCommandID;
    sendAndReceive.setCommandID = setCommandID;
    sendAndReceive.resetCommandObj = resetCommandObj;
    sendAndReceive.expectedResponse = expectedResponse;
    sendAndReceive.addToCommandObj = addToCommandObj;
    sendAndReceive.emitResponse = emitResponse;
    sendAndReceive.sendEmergency = sendEmergency;
    sendAndReceive.createResetListener = createResetListener;
    sendAndReceive.subscribeEmergency = subscribeEmergency;
    sendAndReceive.clearBuffer = clearBuffer;

    //emergency listener
    $rootScope.$on('emergencyOn', function () {
      bugout.bugout.log('emergencyOn received in sendAndReceiveService');
      sendAndReceive.sendEmergency();
      sendAndReceive.resetCommandObj();
    });

    //service-scoped variables
    let stepMotorNum = shareSettings.getObj().stepMotorNum;
    var command;
    var response;
    var lastCommandTime;
    var lastReceivedTime;
    var subscribed = statusService.getSubscribed();
    var commandIdStr = $window.localStorage['commandIdNum'];
    var commandObj = {};

    //method functions
    function subscribe() {
      logService.consoleLog('subscribed');
      statusService.setSubscribed(true);
      let temp = '';
      $window.bluetoothSerial.subscribe('#', function (data) {
        lastReceivedTime = Date.now();
        temp += data;
        // if (((temp.match(/#/g) || []).length >= 2 ) || (temp.search('rdy>') > -1)) {
        if (temp.search(';') > -1 && temp.search('#') > -1) {
          bugout.bugout.log('\ntemp in subscribe: \n'+temp);
          $rootScope.$emit('response', temp);
          sendAndReceive.emitResponse(temp);
          temp = '';
        }
      });
    }

    function subscribeEmergency() {
      logService.consoleLog('subscribed emergency');
      $window.bluetoothSerial.subscribe('>', function (data) {
        lastReceivedTime = Date.now();
        if (data === '<8:y>') {
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
        let responseCount = 0;

        let listener = $rootScope.$on('response', function (event, res) {
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

    function write(str, cb) {
      return new Promise((resolve, reject) => {
        if (statusService.getEmergency() === false) {
          const commandWithCRC = crcService.appendCRC(str);
          $window.bluetoothSerial.write(commandWithCRC, function () {
            bugout.bugout.log('sent: '+commandWithCRC);
            lastCommandTime = Date.now();
            if (cb) cb();
            resolve();
          }, function () {
            bugout.bugout.log('ERROR: could not send command '+str);
            reject();
          })
        }
      })

    }

    function writeBuffered() {
      var commandIDObj = sendAndReceive.addToCommandObj(str);
      if (statusService.getEmergency() === false) {
        var command;
        //Used for buffered commands. Command with brackets: "<r34001>", without brackets: "r34001
        var commandWithoutBrackets = str.slice(1, str.length-1);
        command = '<c'+commandWithoutBrackets+'$'+commandIDObj.ID+'>';

        $window.bluetoothSerial.write(command, function () {
          logService.consoleLog('sent: '+command);
          lastCommandTime = Date.now();
        }, function () {
          logService.consoleLog('ERROR: could not send command '+str+' , callingFunction: '+callingFunction);
        });
        sendAndReceive.checkInterpretedResponse(commandIDObj.ID);
      }
      else {
        logService.addOne('Emergency pressed, will not send command')
      }
    }

    function checkInterpretedResponse(commandID) {
      var interpreted = false;
      var checkInterpreted = $rootScope.$on('bluetoothResponse', function (event, res) {
        if (res.search('10:<c') > -1 && res.search(commandID) > -1) {
          interpreted = true;
          checkInterpreted();
        }
      });
      $timeout(function () {
        if (!interpreted) {
          logService.consoleLog('incorrect interpretation, ID: '+commandID);
          $rootScope.$emit('faultyResponse');
          checkInterpreted();
        }
      },2500)
    }

    function getNewCommandID() {
      commandIdStr = window.localStorage['commandIdNum'];
      var commandIdNum = Number(commandIdStr);
      commandIdNum += 1;
      sendAndReceive.setCommandID(commandIdNum);
      return commandIdNum;
    }

    function setCommandID(num) {
      window.localStorage['commandIdNum'] = num;
    }

    function resetCommandObj() {
      commandObj= {};
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

    function addToCommandObj(str) {
      var id = sendAndReceive.getNewCommandID();
      var expectedResponse = sendAndReceive.expectedResponse(str);
      var obj = {
        'ID': id,
        'command': str, //ex: <q2456>
        'expectedResponse': expectedResponse,
        'interpreted': false,
        'response': ''
      };
      commandObj[id] = obj;
      return obj;
    }

    function emitResponse(res) {
      console.log('res in emiteResponse: '+res);

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
      // else if (res.search('&') > -1 && res.search('wydone')> -1) {
      //   bugout.bugout.log('bufferedCommand done: \n'+res);
      //   const numStr = res.slice(res.indexOf('>')+1, res.indexOf('&'));
      //   const commandID = Number(numStr);
      //   $rootScope.$emit('bufferedCommandDone', res, commandID);
      // }
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
        logService.addOne('Error: Program reset command could not be sent. '+err);
      });
    }

    function createResetListener() {
      let emergencyResponse = $rootScope.$on('emergencyReset', function (event, res) {
        console.log('res in emergencyListener: '+res);
        if (res.search('8:y') > -1) {
          logService.addOne('Program succesfully reset');
          sendAndReceive.unsubscribe();
          emergencyResponse();
        }
      });
      console.log('resetListener created');
    }

    function clearBuffer() {
      $window.bluetoothSerial.clear(function () {
        logService.consoleLog('Received buffer cleared');
      }, function () {
        logService.consoleLog('Error: could not clear receive buffer');
      })
    }

  //  Helper functions
    function stopSwitchHit(res) {
      const posStopswitch = res.lastIndexOf('@')-3;
      $ionicPopup.alert({
        title: 'Error: hit stopswitch '+res.charAt(posStopswitch),
        template: 'Unexpected stopswitch has been hit. Aborting task and resetting program.'
      });
      logService.consoleLog('Error: hit stopswitch '+res.charAt(posStopswitch));
      logService.addOne('Error: hit stopswitch '+res.charAt(posStopswitch));
      //emergencyService.on sets correct buttons and sends resetcommand
      emergencyService.on();
      $rootScope.$emit('stopswitchHit', res, res.charAt(posStopswitch));
    }

    function exceededMaximumNumberOfStepsToMiss(res) {
      const splicedStr = res.slice(res.lastIndexOf('@'));
      const missedSteps = splicedStr.slice(2, splicedStr.indexOf(';'));
      const maxAllowedMiss = settings.encoder.stepsToMiss ? settings.encoder.stepsToMiss : 'unknown';
      $ionicPopup.alert({
        title: 'You have missed the maximum number of allowed steps',
        template: 'The program has been stopped.<p>Maximum steps to miss: '+maxAllowedMiss+'</p><p>Number of steps actually missed '+missedSteps+'</p>'
      });
      logService.consoleLog('ERROR: hit max number of allowed steps');
      logService.addOne('ERROR: exceeded maximum number of steps to miss (encoder setting)');
      emergencyService.on();
      $rootScope.$emit('maxSteps', res, missedSteps)
    }

    function faultyResponse(res) {
      logService.consoleLog('\nERROR:\nPotential faulty response: '+res);
      var numStr1 = res.slice(res.indexOf('$')+1, res.indexOf('>'));
      var commandID1 = Number(numStr1);
      var commandIDObj = commandObj[commandID1];
      logService.consoleLog('commandIDObj.command: '+commandIDObj.command);
      if (res.search(commandIDObj.command) === -1) {
        logService.consoleLog('confirmed faulty response');
        $rootScope.$emit('faultyResponse', res);
        delete commandObj[commandID1];
      }
    }

  }


