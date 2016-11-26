
import controllers from './controllers';
import sendAndReceiveService from './services/sendAndReceiveService';
import shareSettingsService from './services/shareSettingsService';
import shareProgramService from './services/shareProgramService';
import skipService from './services/skipService';
import buttonService from './services/buttonService';
import emergencyService from './services/emergencyService';
import {bluetoothEnabledService, bluetoothConnectedService} from './services/bluetoothService';
import crc16 from './crc16';
import ngAsync from './ng-async';
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

angular.module('Toothmaster', ['ionic', 'starter.controllers', 'ngCordova', 'ngTouch', ngAsync.name])
  .service('bugout', function () {
    const bugout = new debugout();
    this.bugout = bugout;
  })
  .service('shareSettings', [shareSettingsService])
  .service('shareProgram', ['bugout', shareProgramService])
  .service('skipService', skipService)
  .service('buttonService', ['bugout', buttonService])
  .service('emergencyService',['buttonService', 'statusService', '$rootScope', 'bugout', emergencyService])
  .service('checkBluetoothEnabledService', ['bugout', bluetoothEnabledService])
  .service('isConnectedService', ['bugout', bluetoothConnectedService])
  .service('connectToDeviceService', ['isConnectedService', 'logService', 'checkBluetoothEnabledService', 'buttonService', '$rootScope', '$timeout', '$window', 'bugout',
    function (isConnectedService, logService, checkBluetoothEnabledService, buttonService, $rootScope, $timeout, $window, bugout) {
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
          bugout.bugout.log('actually connecting to lastConnected device');
          var obj = JSON.parse(window.localStorage['lastConnectedDevice']);
          $window.bluetoothSerial.connectInsecure(obj.id, function () {
            connect.setDeviceName(obj.name);
            logService.addOne('Succesfully connected to last connected device');
            if (cb) cb();
          }, function () {
            bugout.bugout.log('could not connect to last connected device');
            if (cb) cb();
          })
        }
      }

    };

    connect.connectWithRetry = function () {
      bugout.bugout.log('connectWithRetry called in connectService');
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
          bugout.bugout.log('connectWithRetry bluetoothOn & !isConnected');
          connect.connectToLastDevice(bluetoothOn, function () {
            isConnectedService.getValue(function (value) {
              isConnected = value;
            });
            if (!isConnected && retry < 6) {
              bugout.bugout.log('retry connectToLastDevice');
              $timeout(function () {
                retry += 1;
                bugout.bugout.log('Connect with retry, try: '+retry);
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

  .service('disconnectService',['$cordovaBluetoothSerial', 'logService', 'buttonService', 'isConnectedService', '$window', 'connectToDeviceService', 'shareSettings', 'bugout',
    function ($cordovaBluetoothSerial, logService, buttonService, isConnectedService, $window, connectToDeviceService, shareSettings, bugout) {
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
          bugout.bugout.log('User could not disconnect');
          logService.addOne('Could not disconnect from device');
        })
      });
    }
  }])

  .service('logService', ['bugout', function (bugout) {
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

  }])

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

  .service('logModalService', ['bugout',function (bugout) {
    var logModal = this;

    logModal.emailFullLog = function () {
      var now = Date.now();
      cordova.plugins.email.isAvailable(
        function(isAvailable) {
          bugout.bugout.log('email available:'+isAvailable);
          if (isAvailable === true) {
            var logFile = bugout.bugout.getLog();
            // save the file locally, so it can be retrieved from emailComposer
            window.resolveLocalFileSystemURL(cordova.file.externalCacheDirectory, function(fileSystem) {
              bugout.bugout.log('file system open: ' + fileSystem.name);
              // create the file if it doesn't exist
              fileSystem.getFile('log'+now+'.txt', {create: true, exclusive: false}, function(file) {
                bugout.bugout.log("file is file?" + file.isFile.toString());
                // create writer
                file.createWriter(function(writer) {
                  // write
                  writer.write(logFile);
                  // when done writing, call up email composer
                  writer.onwriteend = function() {
                    bugout.bugout.log('done writing');
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
        bugout.bugout.log('Error getting file system: '+error.code);
      }
    }
  }])

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

  .service('statusService', ['bugout', function (bugout) {
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
      bugout.bugout.log('getSubscribed called');
      return statusService.subscribed;
    };

    statusService.setSubscribed = function (boolean) {
      statusService.subscribed = boolean;
    }
  }])

  .service('pauseService', ['statusService', 'isConnectedService', 'logService', 'disconnectService', 'buttonService', 'connectToDeviceService', 'bugout',
    function (statusService, isConnectedService, logService, disconnectService, buttonService, connectToDeviceService, bugout) {
    var pause = this;

      //TODO: fix using cb's for sending & connected?
    pause.pause = function () {
      //var sending = statusService.getSending();
      var sending = statusService.getSending();
      bugout.bugout.log('sending in pause:'+statusService.getSending());
      var connected = isConnectedService.getValue();
      bugout.bugout.log('pause.pause called, sending: '+sending+', connected'+connected);
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
        bugout.bugout.log('skipped reconnect, because sending is '+sending);
      }
    }
  }])

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

  .run(function($ionicPlatform, $rootScope, $state, $window, $ionicHistory, skipService, pauseService, connectToDeviceService, bugout) {
    bugout.bugout.log('version 0.9.9.14');
    console.log($window.localStorage);
      $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams, options){
          bugout.bugout.log('startChangeStart, fromState: '+fromState.name);
          bugout.bugout.log('startChangeStart, toState: '+toState.name);
        });

    $ionicPlatform.on('pause', function () {
      bugout.bugout.log('onPause called from app.js');
      if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing'
        || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
        pauseService.pause();
      }
      else {
      }
    });

    $ionicPlatform.on('resume', function () {
      bugout.bugout.log('onResume called from app.js');
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
        bugout.bugout.log('trying to connectwithretry on startup');
        connectToDeviceService.connectWithRetry();
      });
    }

    //bugout.log(window.localStorage);
    bugout.bugout.log('localstorage.length ='+window.localStorage.length);
  });

})

.config(router);



