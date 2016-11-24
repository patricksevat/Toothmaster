var bugout = new debugout();
import controllers from './controllers';
import sendAndReceiveService from './sendAndReceiveService';
import crc16 from './crc16';
import angularAsyncAwait from "angular-async-await";
import router from './router'

if (window.localStorage['Safety'] === undefined) {
  window.localStorage.setItem('Safety', '');
}
if (window.localStorage['settings'] === undefined) {
  window.localStorage['settings'] = '{"stepMotorNum": 1, "maxFreq":5000,"dipswitch":5000,"spindleAdvancement":5,"time":0.2, "homingStopswitch": false, "encoder":{"enable": false, "stepsPerRPM": 0, "stepsToMiss": 0, "direction": false}}';
}
if (window.localStorage['lastUsedProgram'] === undefined) {
  window.localStorage['lastUsedProgram'] = '';
}
if (window.localStorage['commandIdNum'] === undefined) {
  window.localStorage['commandIdNum'] = 0;
}

angular.module('Toothmaster', ['ionic', 'starter.controllers', 'ngCordova', 'ngTouch', angularAsyncAwait.name])

  .service('shareSettings', function() {
    var shareSettings = this;
    shareSettings.obj = {};
    if (window.localStorage['settings'] !== '' && window.localStorage['settings'] !== undefined) {
      shareSettings.obj.settings = JSON.parse(window.localStorage['settings']);
    }

      shareSettings.getObj = function() {
        return shareSettings.obj.settings;
      };
      shareSettings.setObj = function(value) {
        shareSettings.obj.settings = value;
      }
    })

  .service('shareProgram', function() {
      var shareProgram = this;
      shareProgram.obj = {
        "program": {}
      };

      shareProgram.getObj = function() {
        if (shareProgram.obj.program.startPosition === undefined) {
          bugout.log('shareProgram.obj.program is undefined, setting start position to nill');
          shareProgram.obj.program.startPosition = 0;
        }
        return shareProgram.obj.program;
      };
      shareProgram.setObj = function(value) {
        shareProgram.obj.program = value;
      }
    })

  .service('skipService', function () {
    var skip = this;
    skip.value = undefined;
    skip.getSkip = function () {
      return skip.value;
    };
    skip.setSkip = function (boolean) {
      skip.value = boolean;
    }
  })

  .service('buttonService', function () {
    var button = this;
    button.value = {};
    button.value.readyForData = false;
    button.value.showEmergency = false;
    button.value.showMovingButton = false;
    button.value.showCalcButton = false;
    button.value.showResetButton = false;
    button.value.showHoming = true;
    button.value.showStressTest = true;
    button.value.showVersionButton = true;
    button.value.showMoveXMm = true;
    button.value.showSpinner = false;


    button.getValues = function () {
      return button.value;
    };

    button.setValues = function (obj) {
      bugout.log('buttonService.setValues called');
      for (var keyVal in obj) {
        switch (keyVal) {
          case 'readyForData':
                button.value.readyForData = obj.readyForData;
                break;
          case 'showEmergency':
                button.value.showEmergency = obj.showEmergency;
                break;
          case 'showMovingButton':
            button.value.showMovingButton = obj.showMovingButton;
            break;
          case 'showCalcButton':
            button.value.showCalcButton = obj.showCalcButton;
            break;
          case 'showResetButton':
            button.value.showResetButton = obj.showResetButton;
            break;
          case 'showHoming':
            button.value.showHoming = obj.showHoming;
            break;
          case 'showStressTest':
            button.value.showStressTest= obj.showStressTest;
            break;
          case 'showVersionButton':
            button.value.showVersionButton= obj.showVersionButton;
            break;
          case 'showMoveXMm':
            button.value.showMoveXMm= obj.showMoveXMm;
            break;
          case 'showSpinner':
                button.value.showSpinner = obj.showSpinner;
        }
      }
    };

    button.setEmergencyValues = function () {
      button.setValues({
        showEmergency : false,
        showMovingButton : false,
        showCalcButton : false,
        showStressTest : false,
        showHoming : false,
        showSpinner : false,
        showVersionButton : false,
        showMoveXMm : false,
        readyForData : false,
        showResetButton: true
      });
    }
  })

  .service('emergencyService',['buttonService', 'statusService', '$rootScope', function (buttonService, statusService, $rootScope) {
    var emergency = this;

    emergency.on = function (cb) {
      bugout.log('emergencyService.on called');
      statusService.setEmergency(true);
      buttonService.setEmergencyValues();
      $rootScope.$emit('emergencyOn');
      if (cb) cb();
    };

    emergency.off = function (cb) {
      bugout.log('emergencyService.off called');
      statusService.setEmergency(false);
      statusService.setSending(false);
      $rootScope.$emit('emergencyOff');
      emergency.value = false;
      buttonService.setValues({
        showEmergency : false,
        showMovingButton : false,
        showResetButton: false,
        showCalcButton : true,
        showStressTest : true,
        showHoming : true,
        showSpinner : false,
        showVersionButton : true,
        showMoveXMm : true,
        readyForData : false
      });
      if (cb) cb();
    }
  }])

  .service('checkBluetoothEnabledService', function ($cordovaBluetoothSerial) {
    var bluetoothEnabled = this;
    bluetoothEnabled.getValue = function (cb) {
      $cordovaBluetoothSerial.isEnabled().then(function () {
        bluetoothEnabled.value = true;
        bugout.log('checkBluetoothEnabledService.value ='+bluetoothEnabled.value);
        if (cb) cb(bluetoothEnabled.value);
        else return bluetoothEnabled.value;
      }, function () {
        bluetoothEnabled.value = false;
        bugout.log('checkBluetoothEnabledService.value ='+bluetoothEnabled.value);
        if (cb) cb(bluetoothEnabled.value);
        else return bluetoothEnabled.value;
      })
    }
  })

  .service('isConnectedService', function ($cordovaBluetoothSerial) {
    var isConnected = this;
    isConnected.getValue = function (cb) {
      $cordovaBluetoothSerial.isConnected().then(function () {
        isConnected.value = true;
        bugout.log('isConnectedService.value ='+isConnected.value);
        return isConnected.value;
      }, function () {
        isConnected.value = false;
        bugout.log('isConnectedService.value ='+isConnected.value);
        return isConnected.value;
      }).then(function () {
        if (cb) cb(isConnected.value)
      })
    }
  })

  .service('connectToDeviceService', ['isConnectedService', 'logService', 'checkBluetoothEnabledService', 'buttonService', '$rootScope', '$timeout', '$window',
    function (isConnectedService, logService, checkBluetoothEnabledService, buttonService, $rootScope, $timeout, $window) {
    var connect = this;
      var retry = 1;
      var deviceName = '';

      $rootScope.$on('emergencyOff', function () {
        retry = 1;
      });

      connect.getDeviceName = function (cb) {
        if (cb) cb(deviceName);
        else return deviceName;
      };

      connect.setDeviceName = function (str) {
        deviceName = str;
      };

    connect.connectToLastDevice = function (bluetoothOnVal, cb) {
      var bluetoothOn;
      if (bluetoothOnVal === undefined) {
        checkBluetoothEnabledService.getValue(function (value) {
          bluetoothOn = value;
          valueRetrieved();
        });
      }
      else {
        bluetoothOn = bluetoothOnVal;
        valueRetrieved();
      }
      logService.addOne('Trying to connect with last known device');

      function valueRetrieved() {
        if (bluetoothOn && window.localStorage['lastConnectedDevice'] !== '' && window.localStorage['lastConnectedDevice'] !== undefined) {
          bugout.log('actually connecting to lastConnected device');
          var obj = JSON.parse(window.localStorage['lastConnectedDevice']);
          $window.bluetoothSerial.connectInsecure(obj.id, function () {
            connect.setDeviceName(obj.name);
            logService.addOne('Succesfully connected to last connected device');
            if (cb) cb();
          }, function () {
            bugout.log('could not connect to last connected device');
            if (cb) cb();
          })
        }
      }

    };

    connect.connectWithRetry = function () {
      bugout.log('connectWithRetry called in connectService');
      var isConnected;
      var bluetoothOn;
      isConnectedService.getValue(function (value) {
        isConnected = value;
        checkBluetoothEnabledService.getValue(function (value) {
          bluetoothOn = value;
          valuesRetrieved();
        });
      });

      function valuesRetrieved() {
        if (bluetoothOn && !isConnected) {
          bugout.log('connectWithRetry bluetoothOn & !isConnected');
          connect.connectToLastDevice(bluetoothOn, function () {
            isConnectedService.getValue(function (value) {
              isConnected = value;
            });
            if (!isConnected && retry < 6) {
              bugout.log('retry connectToLastDevice');
              $timeout(function () {
                retry += 1;
                bugout.log('Connect with retry, try: '+retry);
                connect.connectWithRetry();
              }, 500)
            }
            else if (isConnected) {
              retry = 1;
            }
            else if (!isConnected && retry >= 6) {
              logService.addOne('Could not connect with last known device, please make sure that device is turned on. If so, turn off your phone\'s Bluetooth and restart the app' );
              retry = 1;
            }
          })
        }
      }
    }
  }])

  .service('turnOnBluetoothService',['$cordovaBluetoothSerial', 'checkBluetoothEnabledService', 'logService', function ($cordovaBluetoothSerial, checkBluetoothEnabledService, logService) {
    var turnOnBluetooth = this;

    turnOnBluetooth.turnOn = function (cb) {
      $cordovaBluetoothSerial.enable().then(function () {
        logService.addOne('Bluetooth has been turned on by Toothmaster app');
        if (cb) cb();
      }, function (){
        $cordovaBluetoothSerial.showBluetoothSettings();
        logService.addOne('Bluetooth should be turned on manually, redirected to Bluetooth settings');
      })
    }
  }])

  .service('disconnectService',['$cordovaBluetoothSerial', 'logService', 'buttonService', 'isConnectedService', '$window', 'connectToDeviceService', 'shareSettings',
    function ($cordovaBluetoothSerial, logService, buttonService, isConnectedService, $window, connectToDeviceService, shareSettings) {
    var disconnect = this;
    var stepMotorNum = shareSettings.getObj().stepMotorNum;
    disconnect.disconnect = function () {
      stepMotorNum = shareSettings.getObj().stepMotorNum;
      $cordovaBluetoothSerial.write('<<y8:y'+stepMotorNum+'>').then(function () {
        $window.bluetoothSerial.disconnect(function () {
          logService.addOne('User disconnected');
          connectToDeviceService.setDeviceName('');
          buttonService.setValues({'showCalcButton':false});
          isConnectedService.getValue();
        }, function () {
          bugout.log('User could not disconnect');
          logService.addOne('Could not disconnect from device');
        })
      });
    }
  }])

  .service('logService', function () {
    var logService = this;
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
      bugout.log('adding to UI log: '+str);
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
      bugout.log(str);
    }

  })

  .service('calculateVarsService',['shareProgram', 'shareSettings', function (shareProgram, shareSettings) {
    var vars = this;

    var stepMotorNum = shareSettings.getObj().stepMotorNum;
    //type can be: homing, test or runBluetooth
    //TODO perhaps clean up the return of encoderCommands
    vars.getVars = function (type, cb) {
      stepMotorNum = shareSettings.getObj().stepMotorNum;
      var program = shareProgram.getObj();
      var settings = shareSettings.getObj();
      vars.return = {
        commands: [],
        vars: {}
      };
      vars.return.vars.direction = (settings.direction) ? 1:0;
      vars.return.vars.startPositionSteps =  Math.floor(program.startPosition / settings.spindleAdvancement * settings.dipswitch);
      vars.return.vars.stepsPerRPM = settings.dipswitch;
      vars.return.vars.maxRPM = (settings.maxFreq*60/settings.dipswitch).toFixed(3);
      vars.return.vars.time = settings.time.toFixed(3);
      vars.return.vars.stepMotorOnOff = '1';
      vars.return.vars.disableEncoder = '<x0'+stepMotorNum+'>';
      vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder = (settings.encoder.stepsPerRPM !== 0) ? (settings.dipswitch/settings.encoder.stepsPerRPM.toFixed(3)) : '';
      vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder = (settings.encoder.direction) ? vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder*-1 : vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder;
      vars.return.vars.maxAllowedMiss = (settings.encoder.stepsToMiss) ? settings.encoder.stepsToMiss : '';

      var disableEncoder = ['<y8:y'+stepMotorNum+'>', '<x0'+stepMotorNum+'>'];

      var enableEncoder = ['<y8:y'+stepMotorNum+'>','<x1'+stepMotorNum+'>',
        '<d'+vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder+stepMotorNum+'>',
        '<b'+vars.return.vars.maxAllowedMiss+stepMotorNum+'>'];

      if (type === 'homing') {
        vars.return.vars.homingDirection = (settings.direction) ? 0:1;
        vars.return.vars.homingStopswitchInt = (settings.homingStopswitch) ? 0 : 1;
        vars.return.commands = ['<v'+vars.return.vars.homingDirection+stepMotorNum+'>',
          '<p'+vars.return.vars.stepsPerRPM+stepMotorNum+'>', '<r'+vars.return.vars.maxRPM+stepMotorNum+'>',
          '<o'+vars.return.vars.time+stepMotorNum+'>','<h'+vars.return.vars.homingStopswitchInt+stepMotorNum+'>',
          '<kFAULT'+stepMotorNum+'>'];
        if (settings.encoder.enable) {
          vars.return.commands = enableEncoder.concat(vars.return.commands)
        }
        else {
          vars.return.commands = disableEncoder.concat(vars.return.commands)
        }
      }
      else if (type === 'runBluetooth') {
        vars.return.commands = ['<v'+vars.return.vars.direction+stepMotorNum+'>', '<s'+vars.return.vars.startPositionSteps+stepMotorNum+'>',
          '<p'+vars.return.vars.stepsPerRPM+stepMotorNum+'>','<r'+vars.return.vars.maxRPM+stepMotorNum+'>',
          '<f'+vars.return.vars.stepMotorOnOff+stepMotorNum+'>', '<o'+vars.return.vars.time+stepMotorNum+'>',
          '<kFAULT'+stepMotorNum+'>'];
        if (settings.encoder.enable) {
          vars.return.commands = enableEncoder.concat(vars.return.commands)
        }
        else {
          vars.return.commands = disableEncoder.concat(vars.return.commands)
        }
      }
      else if (type === 'test'){
        vars.return.commands = ['<v'+vars.return.vars.direction+stepMotorNum+'>', '<s0'+stepMotorNum+'>',
          '<p'+vars.return.vars.stepsPerRPM+stepMotorNum+'>','<r'+vars.return.vars.maxRPM+stepMotorNum+'>',
          '<f'+vars.return.vars.stepMotorOnOff+stepMotorNum+'>', '<o'+vars.return.vars.time+stepMotorNum+'>',
          '<kFAULT'+stepMotorNum+'>'];
        if (settings.encoder.enable) {
          vars.return.commands = enableEncoder.concat(vars.return.commands)
        }
        else {
          vars.return.commands = disableEncoder.concat(vars.return.commands)
        }
      }
    if (cb) cb(vars.return);
    else  return vars.return;
    }
  }])

  .service('logModalService', function () {
    var logModal = this;

    logModal.emailFullLog = function () {
      var now = Date.now();
      cordova.plugins.email.isAvailable(
        function(isAvailable) {
          bugout.log('email available:'+isAvailable);
          if (isAvailable === true) {
            var logFile = bugout.getLog();
            // save the file locally, so it can be retrieved from emailComposer
            window.resolveLocalFileSystemURL(cordova.file.externalCacheDirectory, function(fileSystem) {
              bugout.log('file system open: ' + fileSystem.name);
              // create the file if it doesn't exist
              fileSystem.getFile('log'+now+'.txt', {create: true, exclusive: false}, function(file) {
                bugout.log("file is file?" + file.isFile.toString());
                // create writer
                file.createWriter(function(writer) {
                  // write
                  writer.write(logFile);
                  // when done writing, call up email composer
                  writer.onwriteend = function() {
                    bugout.log('done writing');
                    var subject = 'Toothmaster bug report';
                    var body = 'I have encountered an error. Could you please look into this problem? \nMy logfile is attached.\n\nKind regards,\nA Toothmaster user';
                    cordova.plugins.email.open({
                      to: ['p.m.c.sevat@gmail.com','info@goodlife.nu'],
                      subject: subject,
                      body: body,
                      attachments: [cordova.file.externalCacheDirectory+'/'+'log'+now+'.txt']
                    });
                  }
                }, fileSystemError);
              }, fileSystemError);
            }, fileSystemError);
          }
          else {
            // not available
            $ionicPopup.alert({
              title: 'No email composer available',
              template: 'There is no email app available through which the email can be sent'
            });
          }
        });

      function fileSystemError(error) {
        bugout.log('Error getting file system: '+error.code);
      }
    }
  })

  .service('modalService', ['$ionicModal', '$rootScope', function ($ionicModal, $rootScope) {
    var init = function (template, $scope) {

      var promise;
      $scope = $scope || $rootScope.$new();
      promise = $ionicModal.fromTemplateUrl(template, {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal= modal;
        return modal
      });

      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });

      return promise;
    };
    return {
      init: init
    }
  }])

  .service('statusService', function () {
    var statusService = this;
    statusService.sending = false;
    statusService.emergency = false;
    statusService.subscribed = false;

    statusService.getSending = function () {
      return statusService.sending
    };

    statusService.setSending = function (value) {
      statusService.sending = value;
    };

    statusService.getEmergency = function () {
      return statusService.emergency
    };

    statusService.setEmergency = function (value) {
      statusService.emergency = value;
    };

    statusService.getSubscribed = function () {
      bugout.log('getSubscribed called');
      return statusService.subscribed;
    };

    statusService.setSubscribed = function (boolean) {
      statusService.subscribed = boolean;
    }
  })

  .service('pauseService', ['statusService', 'isConnectedService', 'logService', 'disconnectService', 'buttonService', 'connectToDeviceService',
    function (statusService, isConnectedService, logService, disconnectService, buttonService, connectToDeviceService) {
    var pause = this;

      //TODO: fix using cb's for sending & connected?
    pause.pause = function () {
      //var sending = statusService.getSending();
      var sending = statusService.getSending();
      bugout.log('sending in pause:'+statusService.getSending());
      var connected = isConnectedService.getValue();
      bugout.log('pause.pause called, sending: '+sending+', connected'+connected);
      if (!sending && connected) {
        logService.addOne('Disconnected after pausing application');
        disconnectService.disconnect();
        buttonService.setValues({'showCalcButton': false, 'readyForData': false});
      }
      else {
       logService.addOne('User has paused application, continuing task in background')
      }
    };

    pause.resume = function () {
      var sending = statusService.getSending();
      if (window.localStorage['lastConnectedDevice'] !== '' && !sending) {
        connectToDeviceService.connectWithRetry();
      }
      else if (sending) {
        bugout.log('skipped reconnect, because sending is '+sending);
      }
    }
  }])
  //
  // .service('sendAndReceiveService', ['statusService', 'emergencyService', '$window', 'logService', '$rootScope', 'buttonService', 'crcService', '$ionicPopup', 'shareSettings', '$interval', '$timeout',
  //   function (statusService, emergencyService, $window, logService, $rootScope, buttonService, crcService, $ionicPopup, shareSettings, $interval, $timeout) {
  //     var sendAndReceive = this;
  //     var stepMotorNum = shareSettings.getObj().stepMotorNum;
  //     var command;
  //     var response;
  //     var lastCommandTime;
  //     var lastReceivedTime;
  //     var subscribed = statusService.getSubscribed();
  //     var commandIdStr = $window.localStorage['commandIdNum'];
  //     var commandObj = {};
  //     var ping;
  //
  //     /*
  //      * subscribe -> send command\write -> wait for subscribe to receive answer -> rootscope emit command + response
  //      * -> unsubscribe when done with batch \ unsubscribe after command -> only throw new command when done
  //      * TODO: create the timeout check
  //      * */
  //
  //     sendAndReceive.subscribe = function () {
  //       bugout.log('subscribed');
  //       statusService.setSubscribed(true);
  //       $window.bluetoothSerial.subscribe('#', function (data) {
  //         lastReceivedTime = Date.now();
  //         sendAndReceive.emitResponse(data);
  //       });
  //     };
  //
  //     sendAndReceive.subscribeRawData = function () {
  //       $window.bluetoothSerial.subscribeRawData(function (data) {
  //         var bytes = String.fromCharCode.apply(null, new Uint8Array(data));
  //         bugout.log('Rawdata: '+bytes);
  //       })
  //     };
  //
  //     sendAndReceive.unsubscribe = function () {
  //       $window.bluetoothSerial.unsubscribe(function () {
  //         bugout.log('Succesfully unsubscribed');
  //         statusService.setSubscribed(false);
  //       }, function () {
  //         bugout.log('ERROR: could not unsubscribe');
  //       })
  //     };
  //
  //     sendAndReceive.write = function (str, cb) {
  //       if (statusService.getEmergency() === false) {
  //         const commandWithCRC = crcService.appendCRC(str);
  //         $window.bluetoothSerial.write(commandWithCRC, function () {
  //           bugout.log('sent: '+commandWithCRC);
  //           lastCommandTime = Date.now();
  //           if (cb) cb();
  //         }, function () {
  //           bugout.log('ERROR: could not send command '+str);
  //         })
  //       }
  //     };
  //
  //     sendAndReceive.writeBuffered = function (str, callingFunction) {
  //       var commandIDObj = sendAndReceive.addToCommandObj(str);
  //       if (statusService.getEmergency() === false) {
  //         var command;
  //           //Used for buffered commands. Command with brackets: "<r34001>", without brackets: "r34001
  //         var commandWithoutBrackets = str.slice(1, str.length-1);
  //         command = '<c'+commandWithoutBrackets+'$'+commandIDObj.ID+'>';
  //
  //         $window.bluetoothSerial.write(command, function () {
  //           bugout.log('sent: '+command);
  //           lastCommandTime = Date.now();
  //         }, function () {
  //           bugout.log('ERROR: could not send command '+str+' , callingFunction: '+callingFunction);
  //         });
  //         sendAndReceive.checkInterpretedResponse(commandIDObj.ID);
  //       }
  //       else {
  //         logService.addOne('Emergency pressed, will not send command')
  //       }
  //     };
  //
  //     sendAndReceive.checkInterpretedResponse = function (commandID) {
  //       var interpreted = false;
  //       var checkInterpreted = $rootScope.$on('bluetoothResponse', function (event, res) {
  //         if (res.search('10:<c') > -1 && res.search(commandID) > -1) {
  //           interpreted = true;
  //           checkInterpreted();
  //         }
  //       });
  //       $timeout(function () {
  //         if (!interpreted) {
  //           bugout.log('incorrect interpretation, ID: '+commandID);
  //           $rootScope.$emit('faultyResponse');
  //           checkInterpreted();
  //         }
  //       },2500)
  //     };
  //
  //     sendAndReceive.startPing = function () {
  //       stepMotorNum = shareSettings.getObj().stepMotorNum;
  //       ping = $interval(function () {
  //         sendAndReceive.write('<w'+stepMotorNum+'>');
  //       },500)
  //     };
  //
  //     sendAndReceive.stopPing = function () {
  //       $interval.cancel(ping);
  //     };
  //
  //     sendAndReceive.getNewCommandID = function () {
  //       commandIdStr = window.localStorage['commandIdNum'];
  //       var commandIdNum = Number(commandIdStr);
  //       commandIdNum += 1;
  //       sendAndReceive.setCommandID(commandIdNum);
  //       return commandIdNum;
  //     };
  //
  //     sendAndReceive.setCommandID = function (num) {
  //       window.localStorage['commandIdNum'] = num;
  //     };
  //
  //     sendAndReceive.resetCommandObj = function () {
  //       commandObj= {};
  //     };
  //
  //     sendAndReceive.expectedResponse = function (str) {
  //       stepMotorNum = shareSettings.getObj().stepMotorNum;
  //       switch (str) {
  //         case '<':
  //           return '8:y';
  //           break;
  //         case 'd':
  //           return '12:';
  //           break;
  //         case 'b':
  //           return '13:';
  //           break;
  //         case 'x':
  //           return '14:';
  //           break;
  //         case 'v':
  //           return '9:';
  //           break;
  //         case 's':
  //           return '6:';
  //           break;
  //         case 'p':
  //           return '5:';
  //           break;
  //         case 'r':
  //           return '3:';
  //           break;
  //         case 'o':
  //           return '2:';
  //           break;
  //         case 'f':
  //           return '11:';
  //           break;
  //         case 'k':
  //           return ['0:rdy', 'FAULT'];
  //           break;
  //         case 'q':
  //           buttonService.setValues({'showSpinner':true});
  //           return ['rdy','wydone','q'];
  //           break;
  //         case 'h':
  //           return '6:';
  //           break;
  //         case 'z':
  //           return '14:';
  //           break;
  //         case 'w':
  //           return ['wydone','w'+stepMotorNum] ;
  //           break;
  //       }
  //     };
  //
  //     sendAndReceive.addToCommandObj = function (str) {
  //       var id = sendAndReceive.getNewCommandID();
  //       var expectedResponse = sendAndReceive.expectedResponse(str);
  //       var obj = {
  //         'ID': id,
  //         'command': str, //ex: <q2456>
  //         'expectedResponse': expectedResponse,
  //         'interpreted': false,
  //         'response': ''
  //       };
  //       commandObj[id] = obj;
  //       return obj;
  //     };
  //
  //     $rootScope.$on('emergencyOn', function () {
  //       sendAndReceive.stopPing();
  //       sendAndReceive.sendEmergency();
  //       sendAndReceive.resetCommandObj();
  //     });
  //
  //     sendAndReceive.emitResponse = function (res) {
  //       bugout.log('response in emitResponse: '+res);
  //       var settings = shareSettings.getObj();
  //       //handle stopswitch hit
  //       if (res.search('wydone:') > -1 && res.search('wydone:0') === -1) {
  //         var posStopswitch = res.lastIndexOf('@')-3;
  //         $ionicPopup.alert({
  //           title: 'Error: hit stopswitch '+res.charAt(posStopswitch),
  //           template: 'Unexpected stopswitch has been hit. Aborting task and resetting program.'
  //         });
  //         bugout.log('Error: hit stopswitch '+res.charAt(posStopswitch));
  //         logService.addOne('Error: hit stopswitch '+res.charAt(posStopswitch));
  //         //emergencyService.on sets correct buttons and sends resetcommand
  //         emergencyService.on();
  //         $rootScope.$emit('stopswitchHit', res, res.charAt(posStopswitch));
  //       }
  //
  //       //handle encoder missed steps
  //       //splice result from '@' till end
  //       // in splicedStr, splice again from pos[2] ([0] = @, [1] is status code), till indexOf(';')
  //       else if (res.search('wydone:') > -1 && res.search('@5') > -1 && settings.encoder.enable === true) {
  //
  //         var splicedStr = res.slice(res.lastIndexOf('@'));
  //         var missedSteps = splicedStr.slice(2, splicedStr.indexOf(';'));
  //         var maxAllowedMiss = settings.encoder.stepsToMiss ? settings.encoder.stepsToMiss : 'unknown';
  //         $ionicPopup.alert({
  //           title: 'You have missed the maximum number of allowed steps',
  //           template: 'The program has been stopped.<p>Maximum steps to miss: '+maxAllowedMiss+'</p><p>Number of steps actually missed '+missedSteps+'</p>'
  //         });
  //         bugout.log('ERROR: hit max number of allowed steps');
  //         logService.addOne('ERROR: exceeded maximum number of steps to miss (encoder setting)');
  //         emergencyService.on();
  //         $rootScope.$emit('maxSteps', res, missedSteps)
  //       }
  //       else if (res.search('2:') > -1) {
  //         $rootScope.$emit('sendKfault', res);
  //       }
  //       else if (res.indexOf('$') > -1 && res.search('10:') === -1) {
  //         bugout.log('\nERROR:\nPotential faulty response: '+res);
  //         var numStr1 = res.slice(res.indexOf('$')+1, res.indexOf('>'));
  //         var commandID1 = Number(numStr1);
  //         var commandIDObj = commandObj[commandID1];
  //         bugout.log('commandIDObj.command: '+commandIDObj.command);
  //         if (res.search(commandIDObj.command) === -1) {
  //           bugout.log('confirmed faulty response');
  //           $rootScope.$emit('faultyResponse', res);
  //           delete  commandObj[commandID1];
  //         }
  //       }
  //       else if (res.search('&') > -1 && res.search('wydone')> -1) {
  //         var numStr = res.slice(res.indexOf('>')+1, res.indexOf('&'));
  //         var commandID = Number(numStr);
  //
  //         $rootScope.$emit('bufferedCommandDone', res, commandID);
  //       }
  //       else {
  //         $rootScope.$emit('bluetoothResponse', res);
  //       }
  //     };
  //
  //     //TODO add retry to sendEmergency?
  //     sendAndReceive.sendEmergency = function () {
  //       bugout.log('sendAndReceiveService.sendEmergency called');
  //
  //       if (statusService.getSubscribed() === false) sendAndReceive.subscribe();
  //       createResetListener( function () {
  //         stepMotorNum = shareSettings.getObj().stepMotorNum;
  //         $window.bluetoothSerial.write('<<y8:y'+stepMotorNum+'>', function () {
  //           logService.addOne('Program reset command sent');
  //         }, function (err) {
  //           logService.addOne('Error: Program reset command could not be sent. '+err);
  //         });
  //       });
  //
  //
  //
  //       function createResetListener(cb) {
  //         var emergencyResponse = $rootScope.$on('bluetoothResponse', function (event, res) {
  //           if (res.search('<8:y>')) {
  //             logService.addOne('Program succesfully reset');
  //             emergencyResponse();
  //           }
  //         });
  //         if (cb) cb();
  //       }
  //     };
  //
  //     sendAndReceive.clearBuffer = function () {
  //       $window.bluetoothSerial.clear(function () {
  //         bugout.log('Received buffer cleared');
  //       }, function () {
  //         bugout.log('Error: could not clear receive buffer');
  //       })
  //     }
  //
  //   }]) //end of sendAndReceiveService
  .service('sendAndReceiveService', sendAndReceiveService);

  sendAndReceiveService.$inject = ['statusService', 'emergencyService', '$window', 'logService',
    '$rootScope', 'buttonService', 'crcService', '$ionicPopup', 'shareSettings', '$interval', '$timeout', '$q', '$async'];

angular
  .module('Toothmaster')
  .service('crcService', [function () {
    const crcService = this;

    crcService.appendCRC = function (str) {
      let crc = crc16(str);
      str += String.fromCharCode(crc.Uint8High) + String.fromCharCode(crc.Uint8Low) ;
      return str;
    }
  }])

  .run(function($ionicPlatform, $rootScope, $state, $window, $ionicHistory, skipService, pauseService, connectToDeviceService) {
    bugout.log('version 0.9.9.4');
    console.log($window.localStorage);
      $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams, options){
          bugout.log('startChangeStart, fromState: '+fromState.name);
          bugout.log('startChangeStart, toState: '+toState.name);
        });

    $ionicPlatform.on('pause', function () {
      bugout.log('onPause called from app.js');
      if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing'
        || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
        pauseService.pause();
      }
      else {
      }
    });

    $ionicPlatform.on('resume', function () {
      bugout.log('onResume called from app.js');
      if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing'
        || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
        pauseService.resume();
      }
      else {
      }
    });

  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      // cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if (window.localStorage['lastConnectedDevice'] === undefined) {
      window.localStorage['lastConnectedDevice'] = '';
    }
    else {
      $ionicPlatform.ready(function () {
        bugout.log('trying to connectwithretry on startup');
        connectToDeviceService.connectWithRetry();
      });
    }

    //bugout.log(window.localStorage);
    bugout.log('localstorage.length ='+window.localStorage.length);
  });

})

.config(router);



