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

  .service('buttonService', function ($rootScope) {
    var button = this;
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

  .service('emergencyService',['buttonService', 'sendAndReceiveService', function ($rootScope, buttonService, sendAndReceiveService) {
    var emergency = this;
    emergency.value = false;

    emergency.getValue = function () {
      return emergency.value;
    };

    emergency.on = function () {
      console.log('emergencyService.on called');
      emergency.value = true;
      buttonService.setEmergencyValues();
      sendAndReceiveService.sendEmergency();
      $rootScope.$emit('emergencyOn');
    };

    emergency.setEmergency = function (boolean) {
      emergency.value = boolean;
    };

    emergency.off = function () {
      console.log('emegencyService.off called');
      $rootScope.$emit('emergencyOff');
      emergency.value = false;
      buttonService.setValues({
        showEmergency : true,
        showMovingButton : true,
        showCalcButton : true,
        showStressTest : true,
        showHoming : true,
        showSpinner : false,
        showVersionButton : true,
        showMoveXMm : true,
        readyForData : true
      });
    }
  }])

  .service('checkBluetoothEnabledService', function ($cordovaBluetoothSerial) {
    var bluetoothEnabled = this;
    bluetoothEnabled.getValue = function () {
      $cordovaBluetoothSerial.isEnabled().then(function () {
        bluetoothEnabled.value = true;
        bugout.log('checkBluetoothEnabledService.value ='+bluetoothEnabled.value);
        return bluetoothEnabled.value;
      }, function () {
        bluetoothEnabled.value = true;
        bugout.log('checkBluetoothEnabledService.value ='+bluetoothEnabled.value);
        return bluetoothEnabled.value;
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
        if (cb) cb()
      })
    }
  })

  .service('connectToDeviceService', ['isConnectedService', 'logService', 'checkBluetoothEnabledService', 'buttonService',
    function (isConnectedService, logService, checkBluetoothEnabledService, buttonService, $rootScope, $timeout) {
    var connect = this;
      var retry = 1;
      var deviceName;

      $rootScope.$on('emergencyOff', function () {
        retry = 1;
      });
      
      connect.getDeviceName = function () {
        return deviceName;
      };
      
      connect.setDeviceName = function (str) {
        deviceName = str;
      };
      
    connect.connectToLastDevice = function (cb) {
      var bluetoothOn = checkBluetoothEnabledService.getValue();
      logService.addOne('Trying to connect with last known device');
      
      if (bluetoothOn && window.localStorage['lastConnectedDevice'] !== '') {
        var obj = JSON.parse(window.localStorage['lastConnectedDevice']);
        $window.bluetoothSerial.connectInsecure(obj.id, function () {
          connect.setDeviceName(obj.name);
          console.log('succesfully connected to last connected device');
          //TODO show buttons here?
          if (cb) cb();
        }, function () {
          console.log('could not connect to last connected device');
          if (cb) cb();
        })
      }
    };

    connect.connectWithRetry = function () {
      var isConnected = isConnectedService.getValue();
      var bluetoothOn = checkBluetoothEnabledService.getValue();
      
      if (bluetoothOn && !isConnected) {
        connect.connectToLastDevice(function () {
          if (isConnectedService.getValue() === false && retry < 6) {
            $timeout(function () {
              retry += 1;
              console.log('Connect with retry, try: '+retry);
              connect.connectWithRetry();
            }, 500)
          }
          else if (isConnectedService.getValue() === true) {
            retry = 1;
          }
          else if (isConnectedService.getValue() === false && retry >= 6) {
            logService.addOne('Could not connect with last known device, please make sure that device is turned on. If so, turn off your phone\'s Bluetooth and restart the app' );
            retry = 1;
          }
        })
      }
    }
  }])

  .service('turnOnBluetoothService',['checkBluetoothEnabledService', 'logService', function ($cordovaBluetoothSerial, checkBluetoothEnabledService, logService) {
    var turnOnBluetooth = this;

    turnOnBluetooth.turnOn = function () {
      $cordovaBluetoothSerial.enable().then(function () {
        logService.addOne('Bluetooth has been turned on by Toothmaster app');
      }, function (){
        $cordovaBluetoothSerial.showBluetoothSettings();
        logService.addOne('Bluetooth should be turned on manually, redirected to Bluetooth settings');
      })
    }
  }])

  //TODO add stepmotorService
  .service('disconnectService',['logService', function ($cordovaBluetoothSerial, logService) {
    var disconnect = this;
    var stepMotorNum = '3';
    disconnect.disconnect = function () {
      $cordovaBluetoothSerial.write('<<y8:y'+stepMotorNum+'>').then(function () {
        $window.bluetoothSerial.disconnect(function () {
          logService.addOne('User disconnected');
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
        if (logService.UILog[0].search('(') && logService.UILog[0].search(')')) {
          var numStr = logService.UILog.slice(logService.UILog[0].indexOf('('), logService.UILog[0].indexOf(')'));
          var num = Number(numStr);
          //indexOf(')')+1 because of the extra space
          var cleanStr = logService.UILog.slice(logService.UILog[0].indexOf('('), logService.UILog[0].indexOf(')')+1);
          if (str === cleanStr) {
            num += 1;
            logService.UILog[0] = '('+num+') '+cleanStr;
          }
        }
        else if (logService.UILog[0] === str) {
          logService.UILog[0] = '(2) '+str;
        }
        else {
          if (logService.UILog.length > 200) {
            logService.UILog.pop();
            logService.UILog.unshift(str);
          }
          else {
            logService.UILog.unshift(str);
          }
        }
    };

    logService.getLog = function () {
      return logService.UILog;
    }
  })

  .service('calculateVarsService',['shareProgram', 'shareSettings', function (shareProgram, shareSettings) {
    var vars = this;

    var stepMotorNum = '3';
    //type can be: homing, test or runBluetooth
    //TODO perhaps clean up the return of encoderCommands
    vars.getVars = function (type) {
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

      vars.return.encoderCommands = ['<x1'+stepMotorNum+'>',
        '<d'+vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder+stepMotorNum+'>',
        '<b'+vars.return.vars.maxAllowedMiss+stepMotorNum+'>'];

      if (type === 'homing') {
        vars.return.vars.homingDirection = (settings.direction) ? 0:1;
        vars.return.vars.homingStopswitchInt = (settings.homingStopswitch) ? 0 : 1;
        vars.return.homingCommands = ['<v'+vars.return.vars.homingDirection+stepMotorNum+'>',
          '<p'+vars.return.vars.stepsPerRPM+stepMotorNum+'>', '<r'+vars.return.vars.maxRPM+stepMotorNum+'>',
          '<o'+vars.return.vars.time+stepMotorNum+'>','<h'+vars.return.vars.homingStopswitchInt+stepMotorNum+'>',
          '<kFAULT'+stepMotorNum+'>']
      }
      else if (type === 'runBluetooth') {
        vars.return.commands = ['<v'+vars.return.vars.direction+stepMotorNum+'>', '<s'+vars.return.vars.startPositionSteps+stepMotorNum+'>',
          '<p'+vars.return.vars.stepsPerRPM+stepMotorNum+'>','<r'+vars.return.vars.maxRPM+stepMotorNum+'>',
          '<f'+vars.return.vars.stepMotorOnOff+stepMotorNum+'>', '<o'+vars.return.vars.time+stepMotorNum+'>',
          '<kFAULT'+stepMotorNum+'>']
      }

    return vars.return;
    }
  }])

  .service('sendAndReceiveService', ['emergencyService', 'logService', 'buttonService', 'shareSettings',
    function (emergencyService, $window, logService, $rootScope, buttonService, $ionicPopup, shareSettings) {
    var sendAndReceive = this;
    var stepMotorNum = '3';
    var command;
    var response;
    var lastCommandTime;
    var lastReceivedTime;
    var subscribed = false; //TODO add subscribed to statusService
    /*
    * subscribe -> send command\write -> wait for subscribe to receive answer -> rootscope emit command + response
    * -> unsubscribe when done with batch \ unsubscribe after command -> only throw new command when done
    * TODO: create the timeout check
    * TODO: subscribe on scope.enter and unsubscribe on scope.leave
    * */

    sendAndReceive.subscribe = function () {
      console.log('subscribed');
      subscribed = true;
      $window.bluetoothSerial.subscribe('#', function (data) {
        lastReceivedTime = Date.now();
        console.log('response in sendAndReceive.subscribe: '+data);
        sendAndReceive.emitResponse(data);
      });
    };

    sendAndReceive.unsubscribe = function () {
      $window.bluetoothSerial.unsubscribe(function () {
        console.log('Succesfully unsubscribed');
        subscribed = false;
      }, function () {
        console.log('ERROR: could not unsubscribe');
      })
    };

    sendAndReceive.write = function (str, commandID, callingFunction) {
      if (emergencyService.getValue() === false) {
        var command;
        if (commandID !== undefined || commandID !== '') {
          //Used for buffered commands. Command with brackets: "<r34001>", without brackets: "r34001
          var commandWithoutBrackets = str.slice(1, str.length-1);
          command = '<c'+commandWithoutBrackets+'$'+commandID+'>';
        }
        else {
          //non buffered commands
          command = str;
        }
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

      else {
        $rootScope.$emit('bluetoothResponse', res);
      }
    };

    sendAndReceive.sendEmergency = function () {
      console.log('sendAndReceiveService.sendEmergency called');
      if (!subscribed) sendAndReceive.subscribe();
      $rootScope.$on('bluetoothResponse', function (event, res) {
        if (res.search('<8:y>')) {
          logService.addOne('Program succesfully reset');
          emergencyService.emergencyOff();
        }
      });
      $window.bluetoothSerial.write('<<y8:y'+stepMotorNum+'>').then(function () {
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

  //TODO for all 3 modal services: perhaps better to return the function?
  .service('logModalService', function () {
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

  .service('helpModalService', function () {
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
    var status = this;
    var sending = false;

    status.getSending = function () {
      return sending
    };

    status.setSending = function (value) {
      sending = value;
    };
  })

  .service('pauseService', ['statusService', 'isConnectedService', 'logService', 'disconnectService', 'buttonService', 'connectToDeviceService',
    function (logService, statusService, isConnectedService, disconnectService, buttonService, connectToDeviceService) {
    var pause = this;

    pause.pause = function () {
      var sending = statusService.getSending();
      var connected = isConnectedService.getValue();
      console.log('pause.pause called, sending: '+sending+', connected'+connected);
      if (!sending && connected) {
        logService.addOne('Disconnected after pausing application');
        disconnectService.disconnect();
        buttonService.setValues({'showCalcButton': false, 'readyForData': false});
        //TODO: clear availableDevices & pairedDevices arrays --> Not necessary only used in connectBluetooth, can be done there on enter
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

.run(function($ionicPlatform, $rootScope, $state, $window, $ionicHistory, skipService, pauseService, connectToDeviceService) {
  bugout.log('version 0.8.0.13');
  var nextView;
  var prevView;
  var skip;
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
    nextView = toState.name;
    prevView = fromState.name;
    skip = ((prevView === 'app.test' || prevView === 'app.homing' || prevView === 'app.runBluetooth' ||
    prevView === 'app.bluetoothConnection' || prevView === 'app.program') &&
    (nextView === 'app.bluetoothConnection' || nextView === 'app.test' || nextView === 'app.homing' ||
    nextView === 'app.runBluetooth' || nextView === 'app.program')) ? true : false;
    skipService.setSkip(skip);
    bugout.log('skip: '+skip+', prevView: '+prevView+', nextView'+nextView);
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
  if (window.localStorage['lastConnectedDevice'] === undefined) {
    window.localStorage['lastConnectedDevice'] = '';
  }
  else {
    console.log('app started, connect with retry called');
    connectToDeviceService.connectWithRetry();
  }

  bugout.log(window.localStorage);
  bugout.log('localstorage.length ='+window.localStorage.length);
})

.config(function($stateProvider, $urlRouterProvider) {
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



