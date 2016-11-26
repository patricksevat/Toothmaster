/**
 * Created by Patrick on 22/11/2016.
 */
module.exports = sendAndReceiveService;

  function sendAndReceiveService(statusService, emergencyService, $window, logService, $rootScope,
                                 buttonService, crcService, $ionicPopup, shareSettings, $interval, $timeout, $q, $async) {
    const sendAndReceive = this;
    //Available methods
    sendAndReceive.subscribe = subscribe;
    sendAndReceive.subscribeRawData = subscribeRawData;
    sendAndReceive.unsubscribe = unsubscribe;
    sendAndReceive.write = write;
    // sendAndReceive.writeAsync = writeAsync;
    sendAndReceive.writeBuffered = writeBuffered;
    sendAndReceive.checkInterpretedResponse = checkInterpretedResponse;
    sendAndReceive.startPing = startPing;
    sendAndReceive.stopPing = stopPing;
    sendAndReceive.getNewCommandID = getNewCommandID;
    sendAndReceive.setCommandID = setCommandID;
    sendAndReceive.resetCommandObj = resetCommandObj;
    sendAndReceive.expectedResponse = expectedResponse;
    sendAndReceive.addToCommandObj = addToCommandObj;
    sendAndReceive.emitResponse = emitResponse;
    sendAndReceive.sendEmergency = sendEmergency;
    sendAndReceive.createResetListener = createResetListener;
    sendAndReceive.clearBuffer = clearBuffer;

    //emergency listener
    $rootScope.$on('emergencyOn', function () {
      sendAndReceive.stopPing();
      sendAndReceive.sendEmergency();
      sendAndReceive.resetCommandObj();
    });

    //service-scoped variables
    var stepMotorNum = shareSettings.getObj().stepMotorNum;
    var command;
    var response;
    var lastCommandTime;
    var lastReceivedTime;
    var subscribed = statusService.getSubscribed();
    var commandIdStr = $window.localStorage['commandIdNum'];
    var commandObj = {};
    var ping;

    //method functions
    function subscribe() {
      logService.consoleLog('subscribed');
      statusService.setSubscribed(true);
      let temp = '';
      $window.bluetoothSerial.subscribe('#', function (data) {
        console.log('raw data: '+data);
        lastReceivedTime = Date.now();
        temp += data;
        // if (((temp.match(/#/g) || []).length >= 2 ) || (temp.search('rdy>') > -1)) {
        if (temp.search(';') > -1 && temp.search('#') > -1) {
          console.log('\ntemp in subscribe: \n'+temp);
          $rootScope.$emit('response', temp);
          sendAndReceive.emitResponse(temp);
          temp = '';
        }
      });
    }

    function subscribeRawData() {
      $window.bluetoothSerial.subscribeRawData(function (data) {
        var bytes = String.fromCharCode.apply(null, new Uint8Array(data));
        logService.consoleLog('Rawdata: '+bytes);
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
            console.log('resolving OK');
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
        console.log('res: '+res+', searchValueStr: '+searchValues);
        returnBool = (res.search(searchValues) > -1);
        console.log('returnBool: '+returnBool);
      }
      else if (Array.isArray(searchValues)) {
        console.log('res: '+res+'searchValuesArr');
        console.log(searchValues);
        searchValues.map((value) => {
          if (res.search(value) > -1) {
            returnBool = true;
          }


        });
        console.log('returnBool: '+returnBool);
      }
      return returnBool
    }

    sendAndReceive.writeAsync = $async(function* (str) {
      try {
        yield sendAndReceive.write(str);
        let expectedResponseShouldContain = sendAndReceive.expectedResponse(str[1]);
        console.log('expectedResponseShouldContain: ');
        console.log(expectedResponseShouldContain);
        let resolveValue = yield responseListener(expectedResponseShouldContain);
        expectedResponseShouldContain = null;

        return new Promise((resolve, reject) => {
          console.log('resolve with resolveValue: '+resolveValue);
          resolve(resolveValue);
        });
      }
      catch (err) {
        console.log('ERR: '+err);
        return new Promise((resolve, reject) => reject(err));
      }
    });

    function write(str, cb) {
      return new Promise((resolve, reject) => {
        if (statusService.getEmergency() === false) {
          const commandWithCRC = crcService.appendCRC(str);
          $window.bluetoothSerial.write(commandWithCRC, function () {
            console.log('sent: '+commandWithCRC);
            lastCommandTime = Date.now();
            if (cb) cb();
            resolve();
          }, function () {
            console.log('ERROR: could not send command '+str);
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

    function startPing() {
      stepMotorNum = shareSettings.getObj().stepMotorNum;
      ping = $interval(function () {
        sendAndReceive.write('<w'+stepMotorNum+'>');
      },500)
    }

    function stopPing() {
      $interval.cancel(ping);
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

      var settings = shareSettings.getObj();
      //handle stopswitch hit
      if (res.search('wydone:') > -1 && res.search('wydone:0') === -1) {
        var posStopswitch = res.lastIndexOf('@')-3;
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

      //handle encoder missed steps
      //splice result from '@' till end
      // in splicedStr, splice again from pos[2] ([0] = @, [1] is status code), till indexOf(';')
      else if (res.search('wydone:') > -1 && res.search('@5') > -1 && settings.encoder.enable === true) {

        var splicedStr = res.slice(res.lastIndexOf('@'));
        var missedSteps = splicedStr.slice(2, splicedStr.indexOf(';'));
        var maxAllowedMiss = settings.encoder.stepsToMiss ? settings.encoder.stepsToMiss : 'unknown';
        $ionicPopup.alert({
          title: 'You have missed the maximum number of allowed steps',
          template: 'The program has been stopped.<p>Maximum steps to miss: '+maxAllowedMiss+'</p><p>Number of steps actually missed '+missedSteps+'</p>'
        });
        logService.consoleLog('ERROR: hit max number of allowed steps');
        logService.addOne('ERROR: exceeded maximum number of steps to miss (encoder setting)');
        emergencyService.on();
        $rootScope.$emit('maxSteps', res, missedSteps)
      }
      else if (res.search('2:') > -1) {
        $rootScope.$emit('sendKfault', res);
      }
      else if (res.indexOf('$') > -1 && res.search('10:') === -1) {
        logService.consoleLog('\nERROR:\nPotential faulty response: '+res);
        var numStr1 = res.slice(res.indexOf('$')+1, res.indexOf('>'));
        var commandID1 = Number(numStr1);
        var commandIDObj = commandObj[commandID1];
        logService.consoleLog('commandIDObj.command: '+commandIDObj.command);
        if (res.search(commandIDObj.command) === -1) {
          logService.consoleLog('confirmed faulty response');
          $rootScope.$emit('faultyResponse', res);
          delete  commandObj[commandID1];
        }
      }
      else if (res.search('&') > -1 && res.search('wydone')> -1) {
        var numStr = res.slice(res.indexOf('>')+1, res.indexOf('&'));
        var commandID = Number(numStr);

        $rootScope.$emit('bufferedCommandDone', res, commandID);
      }
      else {
        $rootScope.$emit('bluetoothResponse', res);
      }
    }

    function sendEmergency() {
      logService.consoleLog('sendAndReceiveService.sendEmergency called');
      if (statusService.getSubscribed() === false) sendAndReceive.subscribe();
      createResetListener( function () {
        stepMotorNum = shareSettings.getObj().stepMotorNum;
        $window.bluetoothSerial.write('<y8:y'+stepMotorNum+'>', function () {
          logService.addOne('Program reset command sent');
        }, function (err) {
          logService.addOne('Error: Program reset command could not be sent. '+err);
        });
      });
    }

    function createResetListener(cb) {
      var emergencyResponse = $rootScope.$on('bluetoothResponse', function (event, res) {

        if (res.search('<8:y>')) {
          logService.addOne('Program succesfully reset');
          emergencyResponse();
        }
      });
      if (cb) cb();
    }

    function clearBuffer() {
      $window.bluetoothSerial.clear(function () {
        logService.consoleLog('Received buffer cleared');
      }, function () {
        logService.consoleLog('Error: could not clear receive buffer');
      })
    }
  };


