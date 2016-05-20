var bugout = new debugout();
//TODO chekc permissions
//Force screen on while executing program
angular.module('Toothmaster', ['ionic', 'starter.controllers', 'ngCordova', 'ngTouch'])

  .service('shareSettings', function() {
    var shareSettings = this;
    shareSettings.obj = {};
    if (window.localStorage['settings'] !== '') {
      shareSettings.obj.settings = JSON.parse(window.localStorage['settings']);
    }

      shareSettings.getObj = function() {
        return shareSettings.obj.settings;
      };
      shareSettings.setObj = function(value) {
        shareSettings.obj.settings = value;
      }
    }
  )

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
      console.log('buttonService.setValues called');
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
  //TODO create a new service: emergencyService cannot be dependant on SendAndReceiveService, replace sendAndReceive.sendEmergency & resetCommandObj
  .service('emergencyService',['buttonService', 'statusService', '$rootScope', function (buttonService, statusService, $rootScope) {
    var emergency = this;

    emergency.on = function (cb) {
      console.log('emergencyService.on called');
      statusService.setEmergency(true);
      buttonService.setEmergencyValues();
      $rootScope.$emit('emergencyOn');
      if (cb) cb();
    };

    emergency.off = function (cb) {
      console.log('emergencyService.off called');
      statusService.setEmergency(false);
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
    console.log($cordovaBluetoothSerial);
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
        if (bluetoothOn && window.localStorage['lastConnectedDevice'] !== '') {
          console.log('actually connecting to lastConnected device');
          var obj = JSON.parse(window.localStorage['lastConnectedDevice']);
          $window.bluetoothSerial.connectInsecure(obj.id, function () {
            connect.setDeviceName(obj.name);
            logService.addOne('Succesfully connected to last connected device');
            if (cb) cb();
          }, function () {
            console.log('could not connect to last connected device');
            if (cb) cb();
          })
        }
      }

    };

    connect.connectWithRetry = function () {
      console.log('connectWithRetry called in connectService');
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
          console.log('connectWithRetry bluetoothOn & !isConnected');
          connect.connectToLastDevice(bluetoothOn, function () {
            isConnectedService.getValue(function (value) {
              isConnected = value;
            });
            if (!isConnected && retry < 6) {
              console.log('retry connectToLastDevice');
              $timeout(function () {
                retry += 1;
                console.log('Connect with retry, try: '+retry);
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

  //TODO add stepmotorService
  .service('disconnectService',['$cordovaBluetoothSerial', 'logService', 'buttonService', 'isConnectedService', '$window',
    function ($cordovaBluetoothSerial, logService, buttonService, isConnectedService, $window) {
    var disconnect = this;
    var stepMotorNum = '3';
    disconnect.disconnect = function () {
      $cordovaBluetoothSerial.write('<<y8:y'+stepMotorNum+'>').then(function () {
        $window.bluetoothSerial.disconnect(function () {
          logService.addOne('User disconnected');
          buttonService.setValues({'showCalcButton':false});
          isConnectedService.getValue();
        }, function () {
          console.log('User could not disconnect');
          logService.addOne('Could not disconnect from device');
        })
      });
    }
  }])

  .service('logService', function () {
    var logService = this;
    logService.UILog = [];

    logService.setBulk = function (arr) {
      logService.UILog = arr;
    };

    logService.addOne = function (str) {
      console.log('adding to UI log: '+str);
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
    };

    logService.getLog = function (cb) {
      if (cb) cb(logService.UILog);
      return logService.UILog;

    }
  })

  .service('calculateVarsService',['shareProgram', 'shareSettings', function (shareProgram, shareSettings) {
    var vars = this;

    var stepMotorNum = '3';
    //type can be: homing, test or runBluetooth
    //TODO perhaps clean up the return of encoderCommands
    vars.getVars = function (type, cb) {
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

      var disableEncoder = ['<<y8:y'+stepMotorNum+'>', '<x0'+stepMotorNum+'>'];

      var enableEncoder = ['<<y8:y'+stepMotorNum+'>','<x1'+stepMotorNum+'>',
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

  //TODO for all 3 modal services: perhaps better to return the function?
  .service('logModalService', function ($ionicModal) {
    var logModal = this;

    logModal.create = function (cb) {
      $ionicModal.fromTemplateUrl('log-modal.html', {
        id: 1,
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal1 = modal;
        if (cb) cb();
      });
    };

    logModal.showFullLog = function () {
      console.log('bluetoothLog.length'+$scope.bluetoothLog.length);
      $scope.fullLog = $scope.bluetoothLog.slice(0,19);
      $scope.openModal(1);
    };

    logModal.getFullLogExtract = function(start, end) {
      console.log('getFullLogExtract, start: '+start+' end: '+end);
      $scope.fullLog = $scope.bluetoothLog.slice(start, end)
    };

    logModal.previousFullLogPage = function () {
      console.log('prevFullLogPage');
      $scope.getFullLogExtract((($scope.fullLogPage-1)*10),(($scope.fullLogPage-1)*10)+9);
      $scope.fullLogPage -= 1;
    };

    logModal.nextFullLogPage = function () {
      console.log('nextFullLogPage');
      $scope.getFullLogExtract((($scope.fullLogPage+1)*10),(($scope.fullLogPage+1)*10)+9);
      $scope.fullLogPage += 1;
    };

    logModal.emailFullLog = function () {
      var now = Date.now();
      cordova.plugins.email.isAvailable(
        function(isAvailable) {
          console.log('email available:'+isAvailable);
          if (isAvailable === true) {
            var logFile = bugout.getLog();
            // save the file locally, so it can be retrieved from emailComposer
            window.resolveLocalFileSystemURL(cordova.file.externalCacheDirectory, function(fileSystem) {
              console.log('file system open: ' + fileSystem.name);
              // create the file if it doesn't exist
              fileSystem.getFile('log'+now+'.txt', {create: true, exclusive: false}, function(file) {
                console.log("file is file?" + file.isFile.toString());
                // create writer
                file.createWriter(function(writer) {
                  // write
                  writer.write(logFile);
                  // when done writing, call up email composer
                  writer.onwriteend = function() {
                    console.log('done writing');
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
        console.log('Error getting file system: '+error.code);
      }
    }
  })

  .service('helpModalService', function ($ionicModal) {
    var helpModal = this;

    helpModal.create = function (cb) {
      $ionicModal.fromTemplateUrl('help-modal.html', {
        id: 2,
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        console.log('modal created');
        $scope.modal2 = modal;
        if (cb) cb();
      });
    }
  })

  .service('modalService', ['helpModalService', 'logModalService', function (helpModalService, logModalService) {
      var modalService = this;

      modalService.openModal = function (index) {
        if (index === 1) {
          if ($scope.modal1 == undefined) {
            logModalService.create(function () {
              console.log('showing modal');
              $scope.modal1.show();
            });
          }
          else {
            $scope.modal1.show();
          }
        }
        else {
          if ($scope.modal2 == undefined) {
            helpModalService.create(function () {
              console.log('showing modal');
              $scope.modal2.show();
            });
          }
          else {
            $scope.modal2.show();
          }
        }
      };

      modalService.close = function (index) {
        if (index === 1) $scope.modal1.hide();
        else $scope.modal2.hide();
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
      console.log('getSubscribed called');
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
      console.log('sending in pause:'+statusService.getSending());
      var connected = isConnectedService.getValue();
      console.log('pause.pause called, sending: '+sending+', connected'+connected);
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
        console.log('skipped reconnect, because sending is '+sending);
      }
    }
  }])

  .service('sendAndReceiveService', ['statusService', 'emergencyService', '$window', 'logService', '$rootScope', 'buttonService', '$ionicPopup', 'shareSettings', '$interval',
    function (statusService, emergencyService, $window, logService, $rootScope, buttonService, $ionicPopup, shareSettings, $interval) {
      var sendAndReceive = this;
      var stepMotorNum = '3';
      var command;
      var response;
      var lastCommandTime;
      var lastReceivedTime;
      var subscribed = statusService.getSubscribed();
      var commandIdStr = $window.localStorage['commandIdNum'];
      var commandObj = {};
      var ping;

      /*
       * subscribe -> send command\write -> wait for subscribe to receive answer -> rootscope emit command + response
       * -> unsubscribe when done with batch \ unsubscribe after command -> only throw new command when done
       * TODO: create the timeout check
       * */

      sendAndReceive.subscribe = function () {
        console.log('subscribed');
        statusService.setSubscribed(true);
        $window.bluetoothSerial.subscribe('#', function (data) {
          lastReceivedTime = Date.now();
          sendAndReceive.emitResponse(data);
        });
      };

      sendAndReceive.subscribeRawData = function () {
        $window.bluetoothSerial.subscribeRawData(function (data) {
          var bytes = String.fromCharCode.apply(null, new Uint8Array(data));
          console.log('Rawdata: '+bytes);
        })
      };

      sendAndReceive.unsubscribe = function () {
        $window.bluetoothSerial.unsubscribe(function () {
          console.log('Succesfully unsubscribed');
          statusService.setSubscribed(false);
        }, function () {
          console.log('ERROR: could not unsubscribe');
        })
      };

      sendAndReceive.write = function (str, cb) {
        $window.bluetoothSerial.write(str, function () {
          console.log('sent: '+str);
          lastCommandTime = Date.now();
          if (cb) cb();
        }, function () {
          console.log('ERROR: could not send command '+str);
        })
      };

      sendAndReceive.writeBuffered = function (str, commandID, callingFunction) {
        console.log('sendAndReceiveService.write called. Ori str: '+str+', commandID: '+commandID+', callingFunction: '+callingFunction);
        if (statusService.getEmergency() === false) {
          var command;
            //Used for buffered commands. Command with brackets: "<r34001>", without brackets: "r34001
          var commandWithoutBrackets = str.slice(1, str.length-1);
          command = '<c'+commandWithoutBrackets+'$'+commandID+'>';

          $window.bluetoothSerial.write(command, function () {
            console.log('sent: '+command);
            lastCommandTime = Date.now();
          }, function () {
            console.log('ERROR: could not send command '+str+' , callingFunction: '+callingFunction);
          })
        }
        else {
          //TODO add UI log message
          console.log('Emergency pressed, will not send command')
        }
      };

      sendAndReceive.startPing = function () {
        ping = $interval(function () {
          sendAndReceive.write('<w'+stepMotorNum+'>');
        },250)
      };

      sendAndReceive.stopPing = function () {
        $interval.cancel(ping);
      };

      sendAndReceive.getNewCommandID = function () {
        commandIdStr = window.localStorage['commandIdNum'];
        var commandIdNum = Number(commandIdStr);
        commandIdNum += 1;
        sendAndReceive.setCommandID(commandIdNum);
        return commandIdNum;
      };

      sendAndReceive.setCommandID = function (num) {
        window.localStorage['commandIdNum'] = num;
      };

      sendAndReceive.resetCommandObj = function () {
        commandObj= {};
      };

      sendAndReceive.expectedResponse = function (str) {
        switch (str) {
          case '<':
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
      };

      sendAndReceive.addToCommandObj = function (str) {
        var id = sendAndReceive.getNewCommandID();
        var expectedResponse = sendAndReceive.expectedResponse(str);
        var obj = {
          'ID': id,
          'command': str,
          'expectedResponse': expectedResponse,
          'responded': false,
          'response': ''
        };
        commandObj[id] = obj;
        return obj;
      };
      /*
      //listen for bluetoothResponse and remove from commandObj is expectedResponse is found in response
      $rootScope.$on('bluetoothResponse', function (event, res) {
        console.log('bluetoothResponse listener within sendAndReceiveService, response:'+res);
        if (res.search('10c') > -1){
          //retrieve commandID from response
          var commandId = res.slice(res.search('$'), res.search('>'));
          //use commandId to compare actual response with expected response, if correct, remove command from commandObj
          // & emit commandId + response
          commandObj[commandId]['responded'] = true;
          commandObj[commandId]['response'] = res;
          if (typeof commandObj[commandId]['expectedResponse'] === 'string') {
            if (res.search(commandObj[commandId]['expectedResponse']) > -1) {
              $rootScope.$emit(commandId, res);
              delete commandObj[commandId];
            }
          }
          else if (commandObj[commandId]['expectedResponse'].isArray) {
            for (var i = 0; i<commandObj[commandId]['expectedResponse'].length; i++) {
              if (res.search(commandObj[commandId]['expectedResponse'][i]) > -1) {
                $rootScope.$emit(commandId, res);
                delete commandObj[commandId];
                return;
              }
            }
          }
        }
      });
      */

      $rootScope.$on('emergencyOn', function () {
        sendAndReceive.stopPing();
        sendAndReceive.sendEmergency();
        sendAndReceive.resetCommandObj();
      });

      sendAndReceive.emitResponse = function (res) {
        console.log('response in emitResponse: '+res);

        //handle stopswitch hit
        if (res.search('wydone:') > -1 && res.search('wydone:0') === -1) {
          var posStopswitch = res.lastIndexOf('@')-3;
          $ionicPopup.alert({
            title: 'Error: hit stopswitch '+res.charAt(posStopswitch),
            template: 'Unexpected stopswitch has been hit. Aborting task and resetting program.'
          });
          console.log('Error: hit stopswitch '+res.charAt(posStopswitch));
          logService.addOne('Error: hit stopswitch '+res.charAt(posStopswitch));
          //emergencyService.on sets correct buttons and sends resetcommand
          emergencyService.on();
          $rootScope.$emit('stopswitchHit', res, res.charAt(posStopswitch));
        }

        //handle encoder missed steps
        //splice result from '@' till end
        // in splicedStr, splice again from pos[2] ([0] = @, [1] is status code), till indexOf(';')
        else if (res.search('wydone:') > -1 && res.search('@5') > -1) {
          var splicedStr = res.slice(res.lastIndexOf('@'));
          var missedSteps = splicedStr.slice(2, splicedStr.indexOf(';'));
          var settings = shareSettings.getObj();
          var maxAllowedMiss = settings.encoder.stepsToMiss ? settings.encoder.stepsToMiss : 'unknown';
          $ionicPopup.alert({
            title: 'You have missed the maximum number of allowed steps',
            template: 'The program has been stopped.<p>Maximum steps to miss: '+maxAllowedMiss+'</p><p>Number of steps actually missed '+missedSteps+'</p>'
          });
          console.log('ERROR: hit max number of allowed steps');
          logService.addOne('ERROR: exceeded maximum number of steps to miss (encoder setting)');
          emergencyService.on();
          $rootScope.$emit('maxSteps', res, missedSteps)
        }
        else if (res.search('2:') > -1) {
          $rootScope.$emit('sendKfault', res);
        }
        else if (res.indexOf('$') > -1 && res.search('10:') === -1) {
          console.log('\nERROR:\nPotential faulty response: '+res);
          var numStr = res.slice(res.indexOf('$')+1, res.indexOf('>'));
          var commandID = Number(numStr);
          var commandIDObj = commandObj[commandID];
          console.log('commandIDObj.command: '+commandIDObj.command);
          if (res.search(commandIDObj.command) === -1) {
            console.log('confirmed faulty response');
            $rootScope.$emit('faultyResponse', res);
            delete  commandObj[commandID];
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
      };
      //TODO add retry to sendEmergency?
      sendAndReceive.sendEmergency = function () {
        console.log('sendAndReceiveService.sendEmergency called');
        if (statusService.getSubscribed() === false) sendAndReceive.subscribe();
        $rootScope.$on('bluetoothResponse', function (event, res) {
          if (res.search('<8:y>')) {
            logService.addOne('Program succesfully reset');
            emergencyService.off();
          }
        });
        $window.bluetoothSerial.write('<<y8:y'+stepMotorNum+'>', function () {
          logService.addOne('Program reset command sent');
        }, function (err) {
          logService.addOne('Error: Program reset command could not be sent. '+err);
        })
      };

      sendAndReceive.clearBuffer = function () {
        $window.bluetoothSerial.clear(function () {
          logService.addOne('Received buffer cleared');
        }, function () {
          logService.addOne('Error: could not clear receive buffer');
        })
      }

    }]) //end of sendAndReceiveService


  .run(function($ionicPlatform, $rootScope, $state, $window, $ionicHistory, skipService, pauseService, connectToDeviceService) {
  bugout.log('version 0.9.5.3');

    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams, options){
        console.log('startChangeStart, fromState: '+fromState.name);
        console.log('startChangeStart, toState: '+toState.name);
      });

  $ionicPlatform.on('pause', function () {
    console.log('onPause called from app.js');
    if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing'
      || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
      pauseService.pause();
    }
    else {
    }
  });

  $ionicPlatform.on('resume', function () {
    console.log('onResume called from app.js');
    if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing'
      || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
      pauseService.resume();
    }
    else {
    }
  });

    if (window.localStorage['Safety'] === undefined) {
      window.localStorage.setItem('Safety', '');
    }
    if (window.localStorage['settings'] === undefined) {
      window.localStorage['settings'] = '{"maxFreq":5000,"dipswitch":5000,"spindleAdvancement":5,"time":0.2, "homingStopswitch": false, "encoder":{"enable": false, "stepsPerRPM": 0, "stepsToMiss": 0, "direction": false}}';
    }
    if (window.localStorage['lastUsedProgram'] === undefined) {
      window.localStorage['lastUsedProgram'] = '';
    }
    if (window.localStorage['commandIdNum'] === undefined) {
      window.localStorage['commandIdNum'] = 0;
    }

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
        console.log('trying to connectwithretry on startup');
        connectToDeviceService.connectWithRetry();
      });
    }

    bugout.log(window.localStorage);
    bugout.log('localstorage.length ='+window.localStorage.length);
  });

})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(1);

  $stateProvider
    //TODO split BluetoothCtrl into seperate controllers :'[
    .state('app', {
      name: 'app',
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.settings', {
    name: 'settings',
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.home', {
      name: 'home',
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html'
        }
      }
  })

    .state('app.safety-slide', {
      url: '/safety-slide',
      name: 'safety-slide',
      views: {
        'menuContent': {
          templateUrl: 'templates/safety-slide.html',
          controller: 'SafetySlides'
        }
      }
    })

    .state('app.program', {
      name: 'program',
      url: '/program',
      views: {
        'menuContent': {
          templateUrl: 'templates/program.html',
          controller: 'ProgramController'
        }
      }
    })

    .state('app.homing', {
      name: 'homing',
      url: '/homing',
      views: {
        'menuContent': {
          templateUrl: 'templates/homing.html',
          controller: 'homingCtrl'
        }
      }
    })

    .state('app.runBluetooth', {
      name: 'runBluetooth',
      url: '/runBluetooth',
      views: {
        'menuContent': {
          templateUrl: 'templates/runBluetooth.html',
          controller: 'runBluetoothCtrl'
        }
      }
    })

    .state('app.test', {
      name: 'test',
      url: '/test',
      views: {
        'menuContent': {
          templateUrl: 'templates/test.html',
          controller: 'testCtrl'
        }
      }
    })

    .state('app.website', {
      name: 'website',
      url: '/website',
      views: {
        'menuContent': {
          templateUrl: 'templates/website.html'
        }
      }
    })

    .state('app.bluetoothConnection', {
      name: 'bluetoothConnection',
      url: '/bluetoothConnection',
      views: {
        'menuContent': {
          templateUrl: 'templates/bluetoothConnection.html',
          controller: 'bluetoothConnectionCtrl'
        }
      }
    })
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/program');

});



