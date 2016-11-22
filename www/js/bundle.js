/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _controllers = __webpack_require__(1);
	
	var _controllers2 = _interopRequireDefault(_controllers);
	
	var _sendAndReceiveService = __webpack_require__(3);
	
	var _sendAndReceiveService2 = _interopRequireDefault(_sendAndReceiveService);
	
	var _crc = __webpack_require__(2);
	
	var _crc2 = _interopRequireDefault(_crc);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var bugout = new debugout();
	
	
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
	
	angular.module('Toothmaster', ['ionic', 'starter.controllers', 'ngCordova', 'ngTouch']).service('shareSettings', function () {
	  var shareSettings = this;
	  shareSettings.obj = {};
	  if (window.localStorage['settings'] !== '' && window.localStorage['settings'] !== undefined) {
	    shareSettings.obj.settings = JSON.parse(window.localStorage['settings']);
	  }
	
	  shareSettings.getObj = function () {
	    return shareSettings.obj.settings;
	  };
	  shareSettings.setObj = function (value) {
	    shareSettings.obj.settings = value;
	  };
	}).service('shareProgram', function () {
	  var shareProgram = this;
	  shareProgram.obj = {
	    "program": {}
	  };
	
	  shareProgram.getObj = function () {
	    if (shareProgram.obj.program.startPosition === undefined) {
	      bugout.log('shareProgram.obj.program is undefined, setting start position to nill');
	      shareProgram.obj.program.startPosition = 0;
	    }
	    return shareProgram.obj.program;
	  };
	  shareProgram.setObj = function (value) {
	    shareProgram.obj.program = value;
	  };
	}).service('skipService', function () {
	  var skip = this;
	  skip.value = undefined;
	  skip.getSkip = function () {
	    return skip.value;
	  };
	  skip.setSkip = function (boolean) {
	    skip.value = boolean;
	  };
	}).service('buttonService', function () {
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
	          button.value.showStressTest = obj.showStressTest;
	          break;
	        case 'showVersionButton':
	          button.value.showVersionButton = obj.showVersionButton;
	          break;
	        case 'showMoveXMm':
	          button.value.showMoveXMm = obj.showMoveXMm;
	          break;
	        case 'showSpinner':
	          button.value.showSpinner = obj.showSpinner;
	      }
	    }
	  };
	
	  button.setEmergencyValues = function () {
	    button.setValues({
	      showEmergency: false,
	      showMovingButton: false,
	      showCalcButton: false,
	      showStressTest: false,
	      showHoming: false,
	      showSpinner: false,
	      showVersionButton: false,
	      showMoveXMm: false,
	      readyForData: false,
	      showResetButton: true
	    });
	  };
	}).service('emergencyService', ['buttonService', 'statusService', '$rootScope', function (buttonService, statusService, $rootScope) {
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
	      showEmergency: false,
	      showMovingButton: false,
	      showResetButton: false,
	      showCalcButton: true,
	      showStressTest: true,
	      showHoming: true,
	      showSpinner: false,
	      showVersionButton: true,
	      showMoveXMm: true,
	      readyForData: false
	    });
	    if (cb) cb();
	  };
	}]).service('checkBluetoothEnabledService', function ($cordovaBluetoothSerial) {
	  var bluetoothEnabled = this;
	  bluetoothEnabled.getValue = function (cb) {
	    $cordovaBluetoothSerial.isEnabled().then(function () {
	      bluetoothEnabled.value = true;
	      bugout.log('checkBluetoothEnabledService.value =' + bluetoothEnabled.value);
	      if (cb) cb(bluetoothEnabled.value);else return bluetoothEnabled.value;
	    }, function () {
	      bluetoothEnabled.value = false;
	      bugout.log('checkBluetoothEnabledService.value =' + bluetoothEnabled.value);
	      if (cb) cb(bluetoothEnabled.value);else return bluetoothEnabled.value;
	    });
	  };
	}).service('isConnectedService', function ($cordovaBluetoothSerial) {
	  var isConnected = this;
	  isConnected.getValue = function (cb) {
	    $cordovaBluetoothSerial.isConnected().then(function () {
	      isConnected.value = true;
	      bugout.log('isConnectedService.value =' + isConnected.value);
	      return isConnected.value;
	    }, function () {
	      isConnected.value = false;
	      bugout.log('isConnectedService.value =' + isConnected.value);
	      return isConnected.value;
	    }).then(function () {
	      if (cb) cb(isConnected.value);
	    });
	  };
	}).service('connectToDeviceService', ['isConnectedService', 'logService', 'checkBluetoothEnabledService', 'buttonService', '$rootScope', '$timeout', '$window', function (isConnectedService, logService, checkBluetoothEnabledService, buttonService, $rootScope, $timeout, $window) {
	  var connect = this;
	  var retry = 1;
	  var deviceName = '';
	
	  $rootScope.$on('emergencyOff', function () {
	    retry = 1;
	  });
	
	  connect.getDeviceName = function (cb) {
	    if (cb) cb(deviceName);else return deviceName;
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
	    } else {
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
	        });
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
	              bugout.log('Connect with retry, try: ' + retry);
	              connect.connectWithRetry();
	            }, 500);
	          } else if (isConnected) {
	            retry = 1;
	          } else if (!isConnected && retry >= 6) {
	            logService.addOne('Could not connect with last known device, please make sure that device is turned on. If so, turn off your phone\'s Bluetooth and restart the app');
	            retry = 1;
	          }
	        });
	      }
	    }
	  };
	}]).service('turnOnBluetoothService', ['$cordovaBluetoothSerial', 'checkBluetoothEnabledService', 'logService', function ($cordovaBluetoothSerial, checkBluetoothEnabledService, logService) {
	  var turnOnBluetooth = this;
	
	  turnOnBluetooth.turnOn = function (cb) {
	    $cordovaBluetoothSerial.enable().then(function () {
	      logService.addOne('Bluetooth has been turned on by Toothmaster app');
	      if (cb) cb();
	    }, function () {
	      $cordovaBluetoothSerial.showBluetoothSettings();
	      logService.addOne('Bluetooth should be turned on manually, redirected to Bluetooth settings');
	    });
	  };
	}]).service('disconnectService', ['$cordovaBluetoothSerial', 'logService', 'buttonService', 'isConnectedService', '$window', 'connectToDeviceService', 'shareSettings', function ($cordovaBluetoothSerial, logService, buttonService, isConnectedService, $window, connectToDeviceService, shareSettings) {
	  var disconnect = this;
	  var stepMotorNum = shareSettings.getObj().stepMotorNum;
	  disconnect.disconnect = function () {
	    stepMotorNum = shareSettings.getObj().stepMotorNum;
	    $cordovaBluetoothSerial.write('<<y8:y' + stepMotorNum + '>').then(function () {
	      $window.bluetoothSerial.disconnect(function () {
	        logService.addOne('User disconnected');
	        connectToDeviceService.setDeviceName('');
	        buttonService.setValues({ 'showCalcButton': false });
	        isConnectedService.getValue();
	      }, function () {
	        bugout.log('User could not disconnect');
	        logService.addOne('Could not disconnect from device');
	      });
	    });
	  };
	}]).service('logService', function () {
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
	    bugout.log('adding to UI log: ' + str);
	    if (logService.UILog.length === 0) {
	      logService.UILog.unshift(str);
	    } else if (logService.UILog[0].indexOf(String.fromCharCode(40)) !== -1 && logService.UILog[0].indexOf(String.fromCharCode(41)) !== -1) {
	      var numStr = logService.UILog[0].slice(logService.UILog[0].indexOf('(') + 1, logService.UILog[0].indexOf(')'));
	      var num = Number(numStr);
	      //indexOf(')')+2 because of the extra space
	      var cleanStr = logService.UILog[0].slice(logService.UILog[0].indexOf(')') + 2);
	      if (str === cleanStr) {
	        num += 1;
	        logService.UILog[0] = '(' + num + ') ' + cleanStr;
	      } else {
	        logService.UILog.unshift(str);
	      }
	    } else if (logService.UILog[0] === str) {
	      logService.UILog[0] = '(2) ' + str;
	    } else {
	      if (logService.UILog.length >= 200) {
	        logService.UILog.pop();
	        logService.UILog.unshift(str);
	      } else {
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
	}).service('calculateVarsService', ['shareProgram', 'shareSettings', function (shareProgram, shareSettings) {
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
	    vars.return.vars.direction = settings.direction ? 1 : 0;
	    vars.return.vars.startPositionSteps = Math.floor(program.startPosition / settings.spindleAdvancement * settings.dipswitch);
	    vars.return.vars.stepsPerRPM = settings.dipswitch;
	    vars.return.vars.maxRPM = (settings.maxFreq * 60 / settings.dipswitch).toFixed(3);
	    vars.return.vars.time = settings.time.toFixed(3);
	    vars.return.vars.stepMotorOnOff = '1';
	    vars.return.vars.disableEncoder = '<x0' + stepMotorNum + '>';
	    vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder = settings.encoder.stepsPerRPM !== 0 ? settings.dipswitch / settings.encoder.stepsPerRPM.toFixed(3) : '';
	    vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder = settings.encoder.direction ? vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder * -1 : vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder;
	    vars.return.vars.maxAllowedMiss = settings.encoder.stepsToMiss ? settings.encoder.stepsToMiss : '';
	
	    var disableEncoder = ['<y8:y' + stepMotorNum + '>', '<x0' + stepMotorNum + '>'];
	
	    var enableEncoder = ['<y8:y' + stepMotorNum + '>', '<x1' + stepMotorNum + '>', '<d' + vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder + stepMotorNum + '>', '<b' + vars.return.vars.maxAllowedMiss + stepMotorNum + '>'];
	
	    if (type === 'homing') {
	      vars.return.vars.homingDirection = settings.direction ? 0 : 1;
	      vars.return.vars.homingStopswitchInt = settings.homingStopswitch ? 0 : 1;
	      vars.return.commands = ['<v' + vars.return.vars.homingDirection + stepMotorNum + '>', '<p' + vars.return.vars.stepsPerRPM + stepMotorNum + '>', '<r' + vars.return.vars.maxRPM + stepMotorNum + '>', '<o' + vars.return.vars.time + stepMotorNum + '>', '<h' + vars.return.vars.homingStopswitchInt + stepMotorNum + '>', '<kFAULT' + stepMotorNum + '>'];
	      if (settings.encoder.enable) {
	        vars.return.commands = enableEncoder.concat(vars.return.commands);
	      } else {
	        vars.return.commands = disableEncoder.concat(vars.return.commands);
	      }
	    } else if (type === 'runBluetooth') {
	      vars.return.commands = ['<v' + vars.return.vars.direction + stepMotorNum + '>', '<s' + vars.return.vars.startPositionSteps + stepMotorNum + '>', '<p' + vars.return.vars.stepsPerRPM + stepMotorNum + '>', '<r' + vars.return.vars.maxRPM + stepMotorNum + '>', '<f' + vars.return.vars.stepMotorOnOff + stepMotorNum + '>', '<o' + vars.return.vars.time + stepMotorNum + '>', '<kFAULT' + stepMotorNum + '>'];
	      if (settings.encoder.enable) {
	        vars.return.commands = enableEncoder.concat(vars.return.commands);
	      } else {
	        vars.return.commands = disableEncoder.concat(vars.return.commands);
	      }
	    } else if (type === 'test') {
	      vars.return.commands = ['<v' + vars.return.vars.direction + stepMotorNum + '>', '<s0' + stepMotorNum + '>', '<p' + vars.return.vars.stepsPerRPM + stepMotorNum + '>', '<r' + vars.return.vars.maxRPM + stepMotorNum + '>', '<f' + vars.return.vars.stepMotorOnOff + stepMotorNum + '>', '<o' + vars.return.vars.time + stepMotorNum + '>', '<kFAULT' + stepMotorNum + '>'];
	      if (settings.encoder.enable) {
	        vars.return.commands = enableEncoder.concat(vars.return.commands);
	      } else {
	        vars.return.commands = disableEncoder.concat(vars.return.commands);
	      }
	    }
	    if (cb) cb(vars.return);else return vars.return;
	  };
	}]).service('logModalService', function () {
	  var logModal = this;
	
	  logModal.emailFullLog = function () {
	    var now = Date.now();
	    cordova.plugins.email.isAvailable(function (isAvailable) {
	      bugout.log('email available:' + isAvailable);
	      if (isAvailable === true) {
	        var logFile = bugout.getLog();
	        // save the file locally, so it can be retrieved from emailComposer
	        window.resolveLocalFileSystemURL(cordova.file.externalCacheDirectory, function (fileSystem) {
	          bugout.log('file system open: ' + fileSystem.name);
	          // create the file if it doesn't exist
	          fileSystem.getFile('log' + now + '.txt', { create: true, exclusive: false }, function (file) {
	            bugout.log("file is file?" + file.isFile.toString());
	            // create writer
	            file.createWriter(function (writer) {
	              // write
	              writer.write(logFile);
	              // when done writing, call up email composer
	              writer.onwriteend = function () {
	                bugout.log('done writing');
	                var subject = 'Toothmaster bug report';
	                var body = 'I have encountered an error. Could you please look into this problem? \nMy logfile is attached.\n\nKind regards,\nA Toothmaster user';
	                cordova.plugins.email.open({
	                  to: ['p.m.c.sevat@gmail.com', 'info@goodlife.nu'],
	                  subject: subject,
	                  body: body,
	                  attachments: [cordova.file.externalCacheDirectory + '/' + 'log' + now + '.txt']
	                });
	              };
	            }, fileSystemError);
	          }, fileSystemError);
	        }, fileSystemError);
	      } else {
	        // not available
	        $ionicPopup.alert({
	          title: 'No email composer available',
	          template: 'There is no email app available through which the email can be sent'
	        });
	      }
	    });
	
	    function fileSystemError(error) {
	      bugout.log('Error getting file system: ' + error.code);
	    }
	  };
	}).service('modalService', ['$ionicModal', '$rootScope', function ($ionicModal, $rootScope) {
	  var init = function init(template, $scope) {
	
	    var promise;
	    $scope = $scope || $rootScope.$new();
	    promise = $ionicModal.fromTemplateUrl(template, {
	      scope: $scope,
	      animation: 'slide-in-up'
	    }).then(function (modal) {
	      $scope.modal = modal;
	      return modal;
	    });
	
	    $scope.openModal = function () {
	      $scope.modal.show();
	    };
	    $scope.closeModal = function () {
	      $scope.modal.hide();
	    };
	    $scope.$on('$destroy', function () {
	      $scope.modal.remove();
	    });
	
	    return promise;
	  };
	  return {
	    init: init
	  };
	}]).service('statusService', function () {
	  var statusService = this;
	  statusService.sending = false;
	  statusService.emergency = false;
	  statusService.subscribed = false;
	
	  statusService.getSending = function () {
	    return statusService.sending;
	  };
	
	  statusService.setSending = function (value) {
	    statusService.sending = value;
	  };
	
	  statusService.getEmergency = function () {
	    return statusService.emergency;
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
	  };
	}).service('pauseService', ['statusService', 'isConnectedService', 'logService', 'disconnectService', 'buttonService', 'connectToDeviceService', function (statusService, isConnectedService, logService, disconnectService, buttonService, connectToDeviceService) {
	  var pause = this;
	
	  //TODO: fix using cb's for sending & connected?
	  pause.pause = function () {
	    //var sending = statusService.getSending();
	    var sending = statusService.getSending();
	    bugout.log('sending in pause:' + statusService.getSending());
	    var connected = isConnectedService.getValue();
	    bugout.log('pause.pause called, sending: ' + sending + ', connected' + connected);
	    if (!sending && connected) {
	      logService.addOne('Disconnected after pausing application');
	      disconnectService.disconnect();
	      buttonService.setValues({ 'showCalcButton': false, 'readyForData': false });
	    } else {
	      logService.addOne('User has paused application, continuing task in background');
	    }
	  };
	
	  pause.resume = function () {
	    var sending = statusService.getSending();
	    if (window.localStorage['lastConnectedDevice'] !== '' && !sending) {
	      connectToDeviceService.connectWithRetry();
	    } else if (sending) {
	      bugout.log('skipped reconnect, because sending is ' + sending);
	    }
	  };
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
	.service('sendAndReceiveService', _sendAndReceiveService2.default);
	
	_sendAndReceiveService2.default.$inject = ['statusService', 'emergencyService', '$window', 'logService', '$rootScope', 'buttonService', 'crcService', '$ionicPopup', 'shareSettings', '$interval', '$timeout'];
	
	angular.module('Toothmaster').service('crcService', [function () {
	  var crcService = this;
	
	  crcService.appendCRC = function (str) {
	    var crc = (0, _crc2.default)(str);
	    console.log('high: ' + crc.Uint8High);
	    console.log('low: ' + crc.Uint8Low);
	    str += String.fromCharCode(crc.Uint8High) + String.fromCharCode(crc.Uint8Low);
	    return str;
	  };
	}]).run(function ($ionicPlatform, $rootScope, $state, $window, $ionicHistory, skipService, pauseService, connectToDeviceService) {
	  bugout.log('version 0.9.9.4');
	  console.log($window.localStorage);
	  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
	    bugout.log('startChangeStart, fromState: ' + fromState.name);
	    bugout.log('startChangeStart, toState: ' + toState.name);
	  });
	
	  $ionicPlatform.on('pause', function () {
	    bugout.log('onPause called from app.js');
	    if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing' || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
	      pauseService.pause();
	    } else {}
	  });
	
	  $ionicPlatform.on('resume', function () {
	    bugout.log('onResume called from app.js');
	    if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing' || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
	      pauseService.resume();
	    } else {}
	  });
	
	  $ionicPlatform.ready(function () {
	
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
	    } else {
	      $ionicPlatform.ready(function () {
	        bugout.log('trying to connectwithretry on startup');
	        connectToDeviceService.connectWithRetry();
	      });
	    }
	
	    //bugout.log(window.localStorage);
	    bugout.log('localstorage.length =' + window.localStorage.length);
	  });
	}).config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	  $ionicConfigProvider.views.maxCache(1);
	
	  $stateProvider.state('app', {
	    name: 'app',
	    url: '/app',
	    abstract: true,
	    templateUrl: '../templates/menu.html'
	  }).state('app.settings', {
	    name: 'settings',
	    url: '/settings',
	    views: {
	      'menuContent': {
	        templateUrl: '../templates/settings.html',
	        controller: 'SettingsCtrl'
	      }
	    }
	  }).state('app.home', {
	    name: 'home',
	    url: '/home',
	    views: {
	      'menuContent': {
	        templateUrl: '../templates/home.html'
	      }
	    }
	  }).state('app.safety-slide', {
	    url: '/safety-slide',
	    name: 'safety-slide',
	    views: {
	      'menuContent': {
	        templateUrl: '../templates/safety-slide.html',
	        controller: 'SafetySlides'
	      }
	    }
	  }).state('app.program', {
	    name: 'program',
	    url: '/program',
	    views: {
	      'menuContent': {
	        templateUrl: '../templates/program.html',
	        controller: 'ProgramController'
	      }
	    }
	  }).state('app.homing', {
	    name: 'homing',
	    url: '/homing',
	    views: {
	      'menuContent': {
	        templateUrl: '../templates/homing.html',
	        controller: 'homingCtrl'
	      }
	    }
	  }).state('app.runBluetooth', {
	    name: 'runBluetooth',
	    url: '/runBluetooth',
	    views: {
	      'menuContent': {
	        templateUrl: '../templates/runBluetooth.html',
	        controller: 'runBluetoothCtrl'
	      }
	    }
	  }).state('app.test', {
	    name: 'test',
	    url: '/test',
	    views: {
	      'menuContent': {
	        templateUrl: '../templates/test.html',
	        controller: 'testCtrl'
	      }
	    }
	  }).state('app.website', {
	    name: 'website',
	    url: '/website',
	    views: {
	      'menuContent': {
	        templateUrl: '../templates/website.html'
	      }
	    }
	  }).state('app.bluetoothConnection', {
	    name: 'bluetoothConnection',
	    url: '/bluetoothConnection',
	    views: {
	      'menuContent': {
	        templateUrl: '../templates/bluetoothConnection.html',
	        controller: 'bluetoothConnectionCtrl'
	      }
	    }
	  });
	  // if none of the above states are matched, use this as the fallback
	  $urlRouterProvider.otherwise('/app/program');
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = angular.module('starter.controllers', [])
	//TODO replace console.log with bugout.log
	/*
	* $rootScope emits:
	* $rootScope.$on('emergencyOn')
	* $rootScope.$on('emergencyOff')
	* $rootScope.$on('stopswitchHit', response, stopswitchNumber)
	* $rootScope.$on('maxSteps', response, missedSteps)
	* $rootScope.$on('bluetoothResponse', response)
	* */
	
	.controller('SafetySlides', function ($scope, $ionicModal) {
	  $scope.i = 0;
	  $scope.hidePrev = false;
	
	  $scope.slides = ['Start safety instructions', 'Usage', 'Caution!', 'Causes of unexpected movements: ', 'Keep in mind!', 'Mitigations against these failure modes:', 'Minimum requirements', 'Norms and regulations'];
	
	  $scope.slide3 = ['Android/iOS is no Operating System for safety applications', 'Toothmaster software is not developed to aim for a certain so-called SIL(Safety Integrity Level).', 'You might drop something on your phone and then Toothmaster will order the stepmotor to move.', 'You or somebody else might by coincidence click on the continue button while making a precision cut.', 'There might be interference from other applications with Toothmaster.', 'Your phone memory might be bad. Leading to bit rot, causing inadvertant movement.', 'There might be Electro Magnetic Interference in your workplace (for instance if you start a heavy motor), leading to bit rot, causing inadvertant movement.', 'Step motor driver (step motor driver is explained here (TBD)) generates inadvertent movement etc.'];
	
	  $scope.slide4 = ['Toothmaster/ OS/ smartphone generates movement when not expected.', 'Toothmaster/ OS/ driver keeps moving or moves too far. (could also be cause by wrong user input/ installation errors)'];
	
	  $scope.slide5 = [{ main: 'A) Clamping your workpiece before making a cut.', sub: 'Clamping is very simple and very safe. Of course safety has a negative effect on availability. The time to make the wood joint will be longer because the milling machine might have to be stopped, clamp has to be removed and installed for every cut.' }, { main: 'B) Safety Switch', sub: 'Operator operates the safety switch. Not recommended because operator could make mistakes/ shorts the safety switch on purpose.', sub2: 'Safety switch is operated by the shifting part of your machinery when the workpiece is in a safe position to move.' }, { main: 'C) Combination A&B', sub: 'Especially when working on expensive and big workpieces, you might consider A + B2 and even stop your machine before shifting the workpiece.' }];
	
	  $scope.swipeRightToLeft = function () {
	    if ($scope.i < 7) {
	      console.log('swiping right');
	      $scope.i++;
	    }
	  };
	
	  $scope.next = function () {
	    if ($scope.i < 7) {
	      console.log("next");
	      $scope.i++;
	    }
	  };
	
	  $scope.prev = function () {
	    if ($scope.i >= 0) {
	      console.log("prev");
	      $scope.i--;
	    }
	  };
	
	  $scope.prevHide = function () {
	    return $scope.i === 0;
	  };
	
	  $scope.nextHide = function () {
	    return $scope.i === 7;
	  };
	
	  $scope.safetyReadHide = function () {
	    return $scope.i !== 7;
	  };
	
	  $scope.showScheme = function () {
	    if ($scope.i === 6) {
	      return true;
	    }
	  };
	
	  $ionicModal.fromTemplateUrl('scheme-modal.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function (modal) {
	    $scope.modal = modal;
	  });
	  $scope.openModal = function () {
	    $scope.modal.show();
	    window.screen.lockOrientation('landscape');
	  };
	  $scope.closeModal = function () {
	    $scope.modal.hide();
	    window.screen.unlockOrientation();
	  };
	  /*
	  //Cleanup the modal when we're done with it!
	  $scope.$on('$ionicView.leave', function() {
	    $scope.modal.remove();
	    console.log('cleaning up modal');
	  });*/
	
	  //on slide.id = 7, add read-safety-instruction button
	  $scope.setLocalStorageSafety = function () {
	    window.localStorage.setItem("Safety", "Completed");
	  };
	}).controller('ProgramController', function ($scope, $ionicModal, $ionicPopup, shareSettings, shareProgram, $state) {
	  $scope.presets = [{ titlePreset: '5mm everything', sawWidth: 5, cutWidth: 5, pinWidth: 5, numberOfCuts: 5, startPosition: 5 }, { titlePreset: '15mm everything', sawWidth: 15, cutWidth: 15, pinWidth: 15, numberOfCuts: 15, startPosition: 15 }];
	
	  $scope.userPrograms = [];
	
	  $scope.currentProgram = {};
	
	  (function loadLastUsedProgram() {
	    if (window.localStorage['lastUsedProgram'] !== "" && window.localStorage['lastUsedProgram'] !== undefined) {
	      $scope.currentProgram = JSON.parse(window.localStorage['lastUsedProgram']);
	      shareProgram.setObj($scope.currentProgram);
	    }
	  })();
	
	  $scope.loadUserPrograms = function () {
	    $scope.userPrograms = [];
	    if (window.localStorage.length === 5) {
	      console.log('only safety, settings, lastConnectedDevice, commandIDNum and lastUsedProgram found in localstorage');
	    }
	    //load the userPrograms stored in localStorage. objects are named 1 - n.
	    //parse the userPrograms in localStorage so that they are converted to objects
	    //push the parsed userPrograms to $scope.userPrograms array
	    else {
	        console.log(window.localStorage);
	        for (var a = 0; a < window.localStorage.length; a++) {
	          if (window.localStorage.key(a) == 'Safety' || window.localStorage.key(a) == 'settings' || window.localStorage.key(a) == 'lastUsedProgram' || window.localStorage.key(a) == 'lastConnectedDevice' || window.localStorage.key(a) == 'commandIdNum') {} else {
	            var tempName = window.localStorage.key(a);
	            var temp = window.localStorage[tempName];
	            temp = JSON.parse(temp);
	            $scope.userPrograms.push(temp);
	            console.log(tempName + ' pushed to userPrograms');
	          }
	        }
	      }
	  };
	
	  $scope.loadUserPrograms();
	
	  $scope.loadUserProgram = function ($index) {
	    //load userProgram & close load modal
	    console.log('userProgram clicked');
	    $scope.currentProgram = $scope.userPrograms[$index];
	    shareProgram.setObj($scope.currentProgram);
	    $scope.closeModal(1);
	  };
	
	  $scope.loadPreset = function ($index) {
	    //load preset & close load modal
	    console.log('loadPreset clicked');
	    $scope.currentProgram = $scope.presets[$index];
	    $scope.currentProgram.title = $scope.presets[$index].titlePreset;
	    shareProgram.setObj($scope.currentProgram);
	    $scope.closeModal(1);
	  };
	
	  $scope.checkCurrentProgram = function () {
	    /*console.log('registered = '+ window.localStorage['registered']);
	    console.log('condition ='+ (window.localStorage['registered'] = 'false'));*/
	    if ($scope.currentProgram.title == null) {
	      $scope.showAlertTitle();
	      return false;
	    }
	    /*else if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] == 'false') {
	      console.log('cannot save, number of cuts too high for restriction');
	      $scope.showAlertNumberOfCuts();
	      return false;
	    }*/
	
	    //show alert if not all program fields are filled in
	    else if ($scope.currentProgram.sawWidth == null || $scope.currentProgram.cutWidth == null || $scope.currentProgram.pinWidth == null || $scope.currentProgram.numberOfCuts == null || $scope.currentProgram.startPosition == null) {
	        $scope.showAlertVars();
	        return false;
	      } else {
	        return true;
	      }
	  };
	  /*
	  $scope.showAlertNumberOfCuts= function(){
	    $ionicPopup.alert(
	      {
	        title: 'Number of cuts restricted',
	        template: 'You have not registered your Toothmaster yet, please register to remove number of cuts restriction',
	        buttons: [{
	          text: 'Continue unregistered',
	          type: 'button-calm',
	          onTap: function () {
	            $scope.currentProgram.numberOfCuts = 2;
	          }
	        },{
	          text: 'Register',
	          type: 'button-balanced',
	          onTap: function () {
	            $state.go('app.register');
	          }
	        }]
	      }
	    )
	  };
	  */
	  $scope.saveProgram = function () {
	    //show alert if title is not filled in
	    if ($scope.checkCurrentProgram() === true) {
	      if ($scope.currentProgram.titlePreset) {
	        delete $scope.currentProgram.titlePreset;
	      }
	      window.localStorage[$scope.currentProgram.title] = JSON.stringify($scope.currentProgram);
	      $scope.userPrograms.push($scope.currentProgram);
	      console.log('userProgram pushed to userPrograms & localStorage');
	      console.log('\nuserPrgrams after pushed saved program:');
	      console.log($scope.userPrograms);
	      console.log('\ncurrentProgram:');
	      console.log($scope.currentProgram);
	      //call the successful save popup
	      $scope.showAlertSaveSucces();
	      //update the list of userPrograms
	      $scope.loadUserPrograms();
	      shareProgram.setObj($scope.currentProgram);
	    } else {
	      //$scope.checkCurrentProgram();
	    }
	  };
	
	  $scope.showAlertSaveSucces = function () {
	    $ionicPopup.show({
	      title: 'Program saved!',
	      scope: $scope,
	      buttons: [{
	        //button holds current program & closes modal
	        text: 'Use current program',
	        type: 'button-balanced',
	        onTap: function onTap() {
	          $scope.closeModal(2);
	        }
	      }, {
	        //button clears program fields and title
	        text: 'Create new program',
	        type: 'button-calm',
	        onTap: function onTap() {
	          $scope.currentProgram.title = undefined;
	          $scope.currentProgram.sawWidth = undefined;
	          $scope.currentProgram.cutWidth = undefined;
	          $scope.currentProgram.pinWidth = undefined;
	          $scope.currentProgram.numberOfCuts = undefined;
	          $scope.currentProgram.startPosition = undefined;
	          $scope.closeModal(2);
	        }
	      }]
	    });
	  };
	
	  $scope.showAlertVars = function () {
	    $ionicPopup.alert({
	      title: 'Not all fields are filled in',
	      template: 'Please fill in all Program fields before saving the program'
	    });
	  };
	
	  $scope.showAlertTitle = function () {
	    $ionicPopup.alert({
	      title: 'Not all fields are filled in',
	      template: 'Title is not filled in'
	    });
	  };
	
	  $ionicModal.fromTemplateUrl('load-modal.html', {
	    id: 1,
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function (modal) {
	    $scope.modal1 = modal;
	  });
	
	  $ionicModal.fromTemplateUrl('save-modal.html', {
	    id: 2,
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function (modal) {
	    $scope.modal2 = modal;
	  });
	
	  $scope.openModal = function (index) {
	    if (index === 1) {
	      $scope.modal1.show();
	    } else {
	      $scope.modal2.show();
	    }
	  };
	
	  $scope.closeModal = function (index) {
	    if (index === 1) {
	      $scope.modal1.hide();
	    } else {
	      $scope.modal2.hide();
	    }
	  };
	
	  /*
	    $scope.$on('$ionicView.leave', function() {
	      $scope.modal1.remove();
	      $scope.modal2.remove();
	      console.log('modals removed')
	    });*/
	
	  $scope.deleteUserProgram = function ($index) {
	    console.log('delete userProgram clicked at index: ' + $index);
	    console.log($scope.userPrograms);
	    $scope.showDeleteAlert($index);
	  };
	
	  $scope.showDeleteAlert = function ($index) {
	    var index = $index;
	    $ionicPopup.show({
	      title: 'Are you sure you want to delete this program?',
	      scope: $scope,
	
	      buttons: [{
	        //button clears program fields and title
	        text: 'Yes',
	        type: 'button-assertive',
	        onTap: function sureDelete() {
	          console.log(window.localStorage);
	          console.log('index =' + index);
	          // remove the userProgram from localstorage. Step 1: get the key under which the userProgram is saved
	          var userProg = $scope.userPrograms[index];
	          console.log(userProg);
	          var userProgName = userProg.title;
	          console.log(userProgName);
	          window.localStorage.removeItem(userProgName);
	          //remove the userProgram visually
	          $scope.userPrograms.splice(index, 1);
	        }
	      }, {
	        text: 'No',
	        type: 'button-balanced'
	      }]
	    });
	  };
	
	  //On run program button, make sure that program and settings are filled in correctly
	  $scope.runProgram = function () {
	
	    /*
	    if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] === 'false') {
	      console.log('cannot save, number of cuts too high for restriction');
	      $scope.showAlertNumberOfCuts();
	    }
	    else */
	    if ($scope.currentProgram.sawWidth > $scope.currentProgram.cutWidth) {
	      $ionicPopup.alert({
	        title: 'Saw width cannot be wider than cut width',
	        template: 'Please make sure that your saw width and cut width are entered correctly'
	      });
	    } else if ($scope.currentProgram.numberOfCuts % 1 !== 0) {
	      $ionicPopup.alert({
	        title: 'Number of cuts cannot be a floating point',
	        template: 'Please make sure that the number of cuts is a whole number. "2" is correct, "2.2" is incorrect.'
	      });
	    } else if ($scope.currentProgram.sawWidth > 0 && $scope.currentProgram.cutWidth > 0 && $scope.currentProgram.pinWidth > 0 && $scope.currentProgram.numberOfCuts > 0 && $scope.currentProgram.startPosition >= 0 && $scope.checkSettings()) {
	      console.log('all fields filled in');
	      shareProgram.setObj($scope.currentProgram);
	      window.localStorage['lastUsedProgram'] = JSON.stringify($scope.currentProgram);
	      $scope.confirmProgram();
	    } else {
	      $ionicPopup.alert({
	        title: 'Not all fields are filled in',
	        template: 'Please fill in all Program fields before running the program'
	      });
	    }
	  };
	
	  $scope.confirmProgram = function () {
	    $ionicPopup.alert({
	      title: 'Please confirm your program',
	      template: '<p>Saw width: ' + $scope.currentProgram.sawWidth + '</p>' + '<p>Cut width: ' + $scope.currentProgram.cutWidth + '</p>' + '<p>Pin width: ' + $scope.currentProgram.pinWidth + '</p>' + '<p>Number of cuts: ' + $scope.currentProgram.numberOfCuts + '</p>' + '<p>Start position: ' + $scope.currentProgram.startPosition + '</p>',
	      buttons: [{
	        text: 'Edit program',
	        type: 'button-calm'
	      }, {
	        text: 'Confirm program',
	        type: 'button-balanced',
	        onTap: function onTap() {
	          //$scope.confirmSettings();
	          $state.go('app.runBluetooth');
	        }
	      }]
	    });
	  };
	  /*
	    $scope.confirmSettings = function() {
	      var templateText = '<p>Minimum frequency: '+$scope.settings.minFreq+'</p>'+'<p>Maximum frequency: '+$scope.settings.maxFreq+'</p>'+
	        '<p>Step motor dipswitch: '+$scope.settings.dipswitch+'</p>'+'<p>Spindle advancement: '+$scope.settings.spindleAdvancement+'</p>'+
	        '<p>Time to maximum frequency: '+$scope.settings.time+'</p>'+'<p>Encoder enabled: '+$scope.settings.encoder.enable+'</p>';
	      if ($scope.settings.encoder.enable) {
	        templateText += '<p>Encoder steps per RPM: '+$scope.settings.encoder.stepsPerRPM+'</p>'+
	          '<p>Max allowable missed steps: '+$scope.settings.encoder.stepsToMiss+'</p>'+
	          '<p>Reverse encoder direction: '+$scope.settings.encoder.direction+'</p>';
	      }
	      $ionicPopup.alert(
	        {
	          title: 'Please confirm your settings',
	          template: templateText,
	          buttons: [{
	            text: 'Edit settings',
	            type: 'button-calm',
	            onTap: function() {
	              $state.go('app.settings');
	            }
	          },
	            {
	            text: 'Confirm settings',
	            type: 'button-balanced',
	            onTap: function () {
	              $state.go('app.runBluetooth');
	            }
	  
	          }]
	        }
	      )
	    };
	  */
	  $scope.settings = shareSettings.getObj();
	
	  $scope.checkSettings = function () {
	    $scope.settings = shareSettings.getObj();
	    console.log($scope.settings);
	    if ($scope.settings === undefined) {
	      console.log('settings are not filled in correctly');
	      $ionicPopup.alert({
	        title: 'Please make sure your settings are filled in correctly',
	        template: 'Use the buttons to go to settings',
	        buttons: [{
	          text: 'Edit settings',
	          type: 'button-calm',
	          onTap: function onTap() {
	            $state.go('app.settings');
	          }
	        }]
	      });
	      return false;
	    } else if ($scope.settings.maxFreq !== null && $scope.settings.dipswitch !== null && $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.stepMotorNum !== null && $scope.settings.homingStopswitch !== null && $scope.settings.encoder.enable === false) {
	      console.log('checkSettings passed');
	      return true;
	    } else if ($scope.settings.maxFreq !== null && $scope.settings.dipswitch !== null && $scope.settings.stepMotorNum !== null && $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.homingStopswitch !== null && $scope.settings.encoder.enable === true && $scope.settings.encoder.stepsPerRPM !== 0 && $scope.settings.encoder.stepsToMiss > 0) {
	      console.log('checkSettings passed');
	      return true;
	    } else {
	      console.log('settings are not filled in correctly');
	      var templateText = '<p>Maximum frequency: ' + $scope.settings.maxFreq + '</p>' + '<p>Step motor dipswitch: ' + $scope.settings.dipswitch + '</p>' + '<p>Spindle advancement: ' + $scope.settings.spindleAdvancement + '</p>' + '<p>Time to maximum frequency: ' + $scope.settings.time + '</p>' + '<p>Encoder enabled: ' + $scope.settings.encoder.enable + '</p>';
	      if ($scope.settings.encoder.enable) {
	        templateText += '<p>Encoder steps per RPM: ' + $scope.settings.encoder.stepsPerRPM + '</p>' + '<p>Max allowable missed steps: ' + $scope.settings.encoder.stepsToMiss + '</p>' + '<p>Encoder directtion: ' + $scope.settings.encoder.stepsToMiss + '</p>';
	      }
	      $ionicPopup.alert({
	        title: 'Please make sure your settings are filled in correctly',
	        template: templateText,
	        buttons: [{
	          text: 'Edit settings',
	          type: 'button-calm',
	          onTap: function onTap() {
	            $state.go('app.settings');
	          }
	        }]
	      });
	      return false;
	    }
	  };
	  /*
	  $scope.redText = function () {
	    if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] === 'false') {
	      return true;
	    }
	  }*/
	}).controller('SettingsCtrl', function ($scope, $ionicPopup, shareSettings) {
	  //TODO add stepmotorNum
	  $scope.settings = {
	    encoder: {
	      enable: false,
	      stepsPerRPM: undefined,
	      stepsToMiss: undefined
	    },
	    homingStopswitch: false
	  };
	
	  $scope.saveSettings = function () {
	    if ($scope.settings.maxFreq > 80000) {
	      $scope.showAlertMaxFreq();
	    } else if ($scope.settings.maxFreq == null || $scope.settings.dipswitch == null || $scope.settings.spindleAdvancement == null || $scope.settings.time == null || $scope.settings.stepMotorNum == null) {
	      $scope.showAlertSettings();
	    } else if ($scope.settings.encoder.enable && ($scope.settings.encoder.stepsPerRPM == undefined || $scope.settings.encoder.stepsToMiss == undefined || $scope.settings.encoder.direction == undefined)) {
	      $scope.showAlertSettings();
	    } else {
	      var settingsJSON = JSON.stringify($scope.settings);
	      console.log(settingsJSON);
	      window.localStorage['settings'] = settingsJSON;
	      //call shareSettings service so that settings can be used in programCtrl & runBluetoothCtrl
	      shareSettings.setObj($scope.settings);
	      $scope.showAlertSaved();
	    }
	  };
	
	  $scope.loadSettings = function () {
	    console.log('settings: ' + window.localStorage['settings']);
	    if (window.localStorage['settings'] === '' || window.localStorage['settings'] === undefined) {} else {
	      $scope.settings = JSON.parse(window.localStorage['settings']);
	    }
	  };
	
	  $scope.loadSettings();
	
	  $scope.showAlertMaxFreq = function () {
	    $ionicPopup.alert({
	      title: 'Maximum frequency invalid',
	      template: 'Please make sure that maximum frequency is set to 1000 or lower'
	    });
	  };
	
	  $scope.showAlertSettings = function () {
	    $ionicPopup.alert({
	      title: 'Not all fields are filled in',
	      template: 'Please make sure that all fields are filled in correctly'
	    });
	  };
	
	  $scope.showAlertSaved = function () {
	    $ionicPopup.alert({
	      title: 'Settings saved'
	    });
	  };
	}).controller('runBluetoothCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal, $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService, checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService, statusService, connectToDeviceService, logModalService, modalService) {
	
	  $scope.$on('$ionicView.beforeLeave', function () {
	    console.log('BEFORE LEAVE');
	    sendAndReceiveService.unsubscribe();
	  });
	
	  $scope.$on('$ionicView.afterEnter', function () {
	    console.log('AFTER ENTER');
	    sendAndReceiveService.subscribe();
	  });
	
	  $scope.bluetoothLog = logService.getLog();
	  $scope.bluetoothEnabled = null;
	  $scope.isConnected = null;
	  var sending = statusService.getSending();
	  var program = shareProgram.getObj();
	  console.log('program:');
	  console.log(JSON.stringify(program));
	  $scope.settings = shareSettings.getObj();
	  console.log('settings:');
	  console.log(JSON.stringify($scope.settings));
	  $scope.deviceName = connectToDeviceService.getDeviceName();
	  //TODO aren't these variables superfluous because of ionicView.enter?
	  $scope.buttons = buttonService.getValues();
	  var emergency = statusService.getEmergency();
	  var runBluetoothVars;
	
	  //settings commands
	  var commands;
	  var settingsDone;
	
	  //update steps vars
	  $scope.movements = [];
	  $scope.movementsNum = 0;
	  var done = true;
	
	  //setting vars
	  var stepMotorNum = $scope.settings.stepMotorNum;
	
	  //
	  //SECTION: changing & entering views
	  //
	
	  $scope.$on('$ionicView.unloaded', function () {
	    console.log('\nUNLOADED\n');
	  });
	
	  // and only calculateVarsService.getVars('runBluetooth') is called && log is imported && correct buttons are set
	  $scope.$on('$ionicView.enter', function () {
	    console.log('enterView in runBluetoothCtrl fired');
	    isConnectedService.getValue(function (value) {
	      $scope.isConnected = value;
	    });
	    checkBluetoothEnabledService.getValue(function (value) {
	      $scope.bluetoothEnabled = value;
	      console.log('$scope.bluetoothEnabled: ' + $scope.bluetoothEnabled);
	    });
	    logService.getLog(function (arr) {
	      $scope.bluetoothLog = arr;
	    });
	    //no need to connect or anything, connectToLastDevice is done on app startup
	    $scope.settings = shareSettings.getObj();
	    program = shareProgram.getObj();
	    console.log('program:');
	    console.log(JSON.stringify(program));
	    console.log('settings:');
	    console.log(JSON.stringify($scope.settings));
	    $scope.bluetoothLog = logService.getLog();
	    //runBluetoothVars is an object which contains settings commands (obj.commands)
	    // and individual variables (obj.vars.*)
	    calculateVarsService.getVars('runBluetooth', function (runBluetoothVars) {
	      commands = runBluetoothVars.commands;
	      console.log('commands:');
	      console.log(commands);
	    });
	    $scope.deviceName = connectToDeviceService.getDeviceName();
	    $scope.buttons = buttonService.getValues();
	    if (statusService.getEmergency() === true) {
	      console.log('set resetbutton true');
	      setButtons({ 'showResetButton': true });
	    } else {
	      setButtons({
	        'showCalcButton': true,
	        'showMovingButton': false,
	        'showEmergency': false,
	        'readyForData': false,
	        'showSpinner': false
	      });
	    }
	    $scope.movements = [];
	    $scope.movementsNum = 0;
	    stepMotorNum = $scope.settings.stepMotorNum;
	  });
	
	  $scope.$on('$ionicView.leave', function () {
	    console.log('ionicView.leave called');
	    if (statusService.getSending() === true) {
	      addToLog('Cancelling current tasks');
	      emergencyService.on(function () {
	        emergencyService.off();
	      });
	    } else {
	      sendAndReceiveService.clearBuffer();
	    }
	    logService.setBulk($scope.bluetoothLog);
	  });
	
	  $scope.userDisconnect = function () {
	    disconnectService.disconnect();
	    $scope.isConnected = false;
	  };
	
	  //
	  //SECTION: Show buttons variables
	  //
	
	  function setButtons(obj) {
	    buttonService.setValues(obj);
	    $scope.$apply(function () {
	      $scope.buttons = buttonService.getValues();
	    });
	    console.log($scope.buttons);
	  }
	
	  //
	  //SECTION: UI log function
	  //
	
	  function addToLog(str) {
	    logService.addOne(str);
	    logService.getLog(function (arr) {
	      $scope.bluetoothLog = arr;
	    });
	  }
	
	  //
	  //SECTION: setting & resetting stop buttons
	  //
	
	  $rootScope.$on('emergencyOn', function () {
	    emergency = true;
	  });
	
	  $rootScope.$on('emergencyOff', function () {
	    emergency = false;
	    $scope.movements = [];
	    $scope.movementsNum = 0;
	    done = true;
	    settingsDone = true;
	    $scope.buttons = buttonService.getValues();
	  });
	
	  $scope.emergencyOn = function () {
	    emergencyService.on();
	  };
	
	  $scope.emergencyOff = function () {
	    statusService.setSending(false);
	    console.log('emergencyOff called');
	    emergencyService.off();
	  };
	
	  //
	  //SECTION: functions to determine movement steps
	  //
	
	  //function to add number of steps and description to $scope.movements
	  function addMovement(steps, descr) {
	    $scope.movements.push({
	      "steps": steps,
	      "description": descr
	    });
	  }
	
	  //calculate movement sequence
	  $scope.calcSteps = function () {
	    program = shareProgram.getObj();
	    $scope.settings = shareSettings.getObj();
	    $scope.movements = [];
	    //call function to calculate steps for cuts, subcuts and pins, log $scope.movements, callback to inform user of movements
	    if (program.sawWidth === undefined || program.cutWidth === undefined || program.pinWidth === undefined || program.numberOfCuts === undefined) {
	      $ionicPopup.alert({
	        title: 'Please fill in your Program before continuing',
	        buttons: [{
	          text: 'Go to program',
	          type: 'button-calm',
	          onTap: function onTap() {
	            $state.go('app.program');
	          }
	        }]
	      });
	    } else if (program.sawWidth > program.cutWidth) {
	      $ionicPopup.alert({
	        title: 'Your saw width cannot be wider than your cut width',
	        template: 'Please adjust your program',
	        buttons: [{
	          text: 'Go to program',
	          type: 'button-positive',
	          onTap: function onTap() {
	            $state.go('app.program');
	          }
	        }]
	      });
	    } else {
	      var cutsAndPins = function cutsAndPins(callback) {
	        //do this for number of cuts
	        for (var i = 1; i <= program.numberOfCuts; i++) {
	          console.log('var i =' + i);
	
	          //if cut width is wider than saw width, calculate subcuts (multiple subcuts needed to complete one cut)
	          if (program.cutWidth > program.sawWidth) {
	
	            //how many subcuts do we need for this cut to complete
	            var subCuts = program.cutWidth / program.sawWidth;
	            var cutsRoundedUp = Math.ceil(subCuts);
	
	            // calculate remaining subcut steps, start at 2 because first subcut is already added after moving to past pin
	            for (var j = 2; j <= cutsRoundedUp; j++) {
	              console.log('Var j' + j);
	              if (j < cutsRoundedUp) {
	                var stepsPerSawWidth = program.sawWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
	                addMovement(stepsPerSawWidth, 'Make subcut ' + j + '/' + cutsRoundedUp);
	              }
	
	              //calculate remaining mm & steps, based on number of subcuts already taken
	              else if (j === cutsRoundedUp) {
	                  var remainingMM = program.cutWidth - (j - 1) * program.sawWidth;
	                  console.log('remaining mm: ' + remainingMM);
	                  var remainingSteps = remainingMM / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
	                  addMovement(remainingSteps, 'Make subcut ' + j + '/' + cutsRoundedUp);
	                }
	            }
	          }
	
	          //calculate steps for pins, not needed after last cut, thus i<numberOfCuts
	          if (i < program.numberOfCuts) {
	            console.log('Calculating pin');
	            var pinSteps = program.pinWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
	            if (program.cutWidth > program.sawWidth) {
	              addMovement(pinSteps, 'Make subcut 1/' + cutsRoundedUp);
	            } else if (program.cutWidth === program.sawWidth) {
	              addMovement(pinSteps, 'Make the cut');
	            }
	          }
	          if (i === program.numberOfCuts) {
	            console.log('i === numberofcuts');
	            addToLog('Done calculating movements');
	            console.log('$scope.movements:');
	            console.log($scope.movements);
	            if (callback) callback();
	            setButtons({
	              'showCalcButton': false,
	              'readyForData': true
	            });
	          }
	        }
	      };
	
	      cutsAndPins(function () {
	        console.log('Movements to take:');
	        var count = 1;
	        $scope.movements.forEach(function (item) {
	          console.log('Movement ' + count + ':' + ' steps' + item.steps + ', description: ' + item.description);
	          count += 1;
	        });
	      });
	    }
	  };
	
	  //
	  //SECTION: send settings before homing, test and makeMovement logic
	  //
	
	  //user clicks button front end, sendSettingsData() called
	  $scope.sendSettingsData = function () {
	    if (statusService.getEmergency() === false) {
	      if (statusService.getSending() === false) {
	        setButtons({ 'showSpinner': true, 'showEmergency': true, 'readyForData': false });
	        statusService.setSending(true);
	        settingsDone = false;
	
	        for (var i = 0; i < commands.length - 1; i++) {
	          sendAndReceiveService.write(commands[i]);
	        }
	        //All other setting commands need to be sent before sending kFault,
	        // so on second to last setting command a 'sendKfault' is emitted after which kFault is sent
	        var sendKfault = $rootScope.$on('sendKfault', function () {
	          sendAndReceiveService.write(commands[commands.length - 1], function () {
	            checkWydone();
	            sendKfault();
	          });
	          //on sending kFault, check for response
	        });
	      }
	      console.log('cannot continue sendSettingsData, sending is true');
	    } else {
	      addToLog('Emergency on, will not continue sending settings data');
	    }
	  };
	
	  function checkWydone() {
	    var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
	      lastSendSettingsCommand(res);
	      rdy();
	    });
	  }
	
	  function lastSendSettingsCommand(res) {
	    if (res.search('rdy') !== -1) {
	      addToLog('Moving to start position');
	      sendAndReceiveService.write('<w' + stepMotorNum + '>', checkWydone());
	    } else if (res.search('wydone') !== -1) {
	      setButtons({ 'readyForData': false, 'showMovingButton': true, 'showCalcButton': false, 'showHoming': false, 'showSpinner': false });
	      statusService.setSending(false);
	      addToLog('Moved to start position');
	      var subCuts = program.cutWidth / program.sawWidth;
	      var cutsRoundedUp = Math.ceil(subCuts);
	      if (program.cutWidth !== program.sawWidth) {
	        $ionicPopup.alert({
	          title: 'Make the subcut 1/' + cutsRoundedUp
	        });
	      } else {
	        $ionicPopup.alert({
	          title: 'Make the cut'
	        });
	      }
	    } else if (res.search('kFAULT') !== -1) {
	      addToLog('Settings have been sent incorrectly, please try again');
	      emergencyService.on(function () {
	        emergencyService.off();
	      });
	    } else {
	      $timeout(function () {
	        sendAndReceiveService.write('<w' + stepMotorNum + '>', checkWydone());
	      }, 100);
	    }
	  }
	
	  //
	  //SECTION: startMoving \ take steps logic
	  //
	
	  $scope.startMoving = function () {
	    console.log('$scope.movements in startMoving:');
	    console.log($scope.movements);
	    console.log('$scope.movementsNum in startMoving:');
	    console.log($scope.movementsNum);
	    if (statusService.getEmergency() === false) {
	      if (done) {
	        statusService.setSending(true);
	        done = false;
	        setButtons({ 'showSpinner': true });
	        sendAndReceiveService.write('<q' + $scope.movements[$scope.movementsNum].steps + stepMotorNum + '>', checkDone);
	      } else {
	        addToLog('Please wait untill this step is finished');
	      }
	    } else {
	      addToLog('Emergency on, will not continue with movement');
	    }
	
	    //check if prev stepCommand is done, send command, start pinging <w>, check for 'done:', allow next stepCommand
	    function checkDone() {
	      var check = $rootScope.$on('bluetoothResponse', function (event, res) {
	        console.log('on bluetoothResponse in checkDone called');
	        if (res.search('wydone:0') > -1) {
	          addToLog('Movement done');
	          addToLog($scope.movements[$scope.movementsNum].description);
	          done = true;
	          setButtons({ 'showSpinner': false, 'showHoming': true, 'showResetButton': false });
	          if ($scope.movements[$scope.movementsNum].description !== 'Moving to next cut' && $scope.movementsNum !== $scope.movements.length - 1) {
	            $ionicPopup.alert({
	              title: $scope.movements[$scope.movementsNum].description
	            });
	            $scope.movementsNum += 1;
	          }
	          //once last movement is completed show restart program popup
	          else if ($scope.movementsNum === $scope.movements.length - 1) {
	              $ionicPopup.alert({
	                title: $scope.movements[$scope.movementsNum].description,
	                buttons: [{
	                  type: 'button-calm',
	                  text: 'OK',
	                  onTap: $scope.showRestartPopup()
	                }]
	              });
	              setButtons({ 'showMovingButton': false, 'showEmergency': false, 'showResetButton': false });
	              statusService.setSending(false);
	              $scope.movements = [];
	              $scope.movementsNum = 0;
	            }
	        } else {
	          $timeout(function () {
	            console.log('no wydone, sending <w>');
	            sendAndReceiveService.write('<w' + stepMotorNum + '>', checkDone);
	          }, 250);
	        }
	        check();
	      });
	    }
	  };
	
	  //
	  //SECTION: popups && modals
	  //
	  $scope.showRestartPopup = function () {
	    $ionicPopup.alert({
	      title: 'Program finished!',
	      template: 'Would you like to return to start position?',
	      buttons: [{
	        text: 'Yes',
	        type: 'button-balanced',
	        onTap: function onTap() {
	          $state.go('app.homing');
	        }
	      }, {
	        text: 'No',
	        type: 'button-calm',
	        onTap: function onTap() {
	          setButtons({ 'showCalcButton': true });
	        }
	      }, {
	        text: 'Edit program',
	        type: 'button-positive',
	        onTap: function onTap() {
	          $state.go('app.program');
	        }
	      }]
	    });
	  };
	
	  $scope.start = function () {
	    $ionicPopup.alert({
	      title: 'Make sure your workpiece is tightly secured!',
	      template: 'Program is about to start!',
	      buttons: [{
	        text: 'Cancel',
	        type: 'button-positive'
	      }, {
	        text: 'Start',
	        type: 'button-balanced',
	        onTap: function onTap() {
	          $scope.sendSettingsData();
	        }
	      }]
	    });
	  };
	
	  $scope.openHelpModal = function () {
	    modalService.init('help-modal.html', $scope).then(function (modal) {
	      modal.show();
	    });
	  };
	
	  $scope.show = null;
	
	  $scope.showAnswer = function (obj) {
	    $scope.show = $scope.show === obj ? null : obj;
	  };
	
	  $scope.QAList = [];
	  for (var i = 1; i < 11; i++) {
	    $scope.QAList.push({
	      question: 'Question ' + i,
	      answer: 'Lorem ipsum'
	    });
	  }
	
	  $scope.showFullLog = function () {
	    $scope.fullLog = $scope.bluetoothLog.slice(0, 19);
	    modalService.init('log-modal.html', $scope).then(function (modal) {
	      modal.show();
	    });
	  };
	
	  $scope.emailFullLog = function () {
	    logModalService.emailFullLog();
	  };
	
	  $scope.fullLog = $scope.bluetoothLog.slice(0, 19);
	
	  $scope.fullLogPage = 0;
	
	  $scope.getFullLogExtract = function (start, end) {
	    console.log('getFullLogExtract, start: ' + start + ' end: ' + end);
	    $scope.fullLog = $scope.bluetoothLog.slice(start, end);
	  };
	
	  $scope.previousFullLogPage = function () {
	    console.log('prevFullLogPage');
	    $scope.getFullLogExtract(($scope.fullLogPage - 1) * 10, ($scope.fullLogPage - 1) * 10 + 9);
	    $scope.fullLogPage -= 1;
	  };
	
	  $scope.nextFullLogPage = function () {
	    console.log('nextFullLogPage');
	    $scope.getFullLogExtract(($scope.fullLogPage + 1) * 10, ($scope.fullLogPage + 1) * 10 + 9);
	    $scope.fullLogPage += 1;
	  };
	})
	//end of controller runBluetoothCtrl
	
	.controller('homingCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal, $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService, checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService, statusService, connectToDeviceService, $ionicHistory, logModalService, modalService) {
	  $scope.$on('$ionicView.unloaded', function () {
	    console.log('\nUNLOADED\n');
	  });
	
	  $scope.$on('$ionicView.beforeLeave', function () {
	    console.log('BEFORE LEAVE');
	    sendAndReceiveService.unsubscribe();
	  });
	
	  $scope.$on('$ionicView.afterEnter', function () {
	    console.log('AFTER ENTER');
	    sendAndReceiveService.subscribe();
	  });
	
	  var homingStopswitchInt;
	  //homing commands
	  var homingCommands;
	  $scope.settings = shareSettings.getObj();
	  var stepMotorNum = $scope.settings.stepMotorNum;
	  $scope.bluetoothLog = [];
	  $scope.bluetoothEnabled = null;
	  $scope.buttons = buttonService.getValues();
	  $scope.userDisconnect = function () {
	    disconnectService.disconnect();
	    isConnectedService.getValue(function (val) {
	      $scope.isConnected = val;
	    });
	  };
	
	  function setButtons(obj) {
	    buttonService.setValues(obj);
	    $scope.$apply(function () {
	      $scope.buttons = buttonService.getValues();
	    });
	    console.log($scope.buttons);
	  }
	
	  $scope.$on('$ionicView.enter', function () {
	    console.log('enterView in homingCtrl fired');
	    logService.getLog(function (arr) {
	      $scope.bluetoothLog = arr;
	    });
	    checkBluetoothEnabledService.getValue(function (value) {
	      $scope.bluetoothEnabled = value;
	      console.log('$scope.bluetoothEnabled: ' + $scope.bluetoothEnabled);
	    });
	    connectToDeviceService.getDeviceName(function (value) {
	      $scope.deviceName = value;
	    });
	    $scope.buttons = buttonService.getValues();
	    isConnectedService.getValue(function (value) {
	      $scope.isConnected = value;
	      console.log('$scope.isConnected: ' + $scope.isConnected);
	    });
	    calculateVarsService.getVars('homing', function (obj) {
	      homingCommands = obj.commands;
	      console.log('homingcommands:');
	      console.log(homingCommands);
	      homingStopswitchInt = obj.vars.homingStopswitchInt;
	    });
	    $scope.settings = shareSettings.getObj();
	    stepMotorNum = $scope.settings.stepMotorNum;
	  });
	
	  $scope.$on('$ionicView.leave', function () {
	    console.log('leaveView in bluetoothConnectionCtrl fired');
	    if (statusService.getSending() === true) {
	      addToLog('Cancelling current tasks');
	      emergencyService.on(function () {
	        emergencyService.off();
	      });
	    } else {
	
	      sendAndReceiveService.clearBuffer();
	    }
	    //TODO perhaps create listeners in a var and cancel var on leave?
	    logService.setBulk($scope.bluetoothLog);
	  });
	
	  $scope.emergencyOn = function () {
	    emergencyService.on();
	  };
	
	  $scope.emergencyOff = function () {
	    console.log('emergencyOff called');
	    emergencyService.off();
	  };
	
	  //
	  //SECTION: homing logic
	  //
	
	  $scope.homing = function () {
	    if (statusService.getEmergency() === false) {
	      console.log('homingStopswitch = ' + homingStopswitchInt);
	      if (statusService.getSending() === false) {
	        setButtons({ 'showSpinner': true, 'showEmergency': true, 'showHoming': false });
	        statusService.setSending(true);
	        //send start command
	        for (var i = 0; i < homingCommands.length - 1; i++) {
	          sendAndReceiveService.write(homingCommands[i]);
	        }
	        var sendKfault = $rootScope.$on('sendKfault', function () {
	          sendAndReceiveService.write(homingCommands[homingCommands.length - 1], function () {
	            sendKfault();
	          });
	        });
	        var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
	          homingResponse(res);
	          rdy();
	        });
	      } else {
	        $ionicPopup.alert({
	          title: 'Please wait untill moving to start position is done in run Bluetooth program'
	        });
	      }
	    } else {
	      $ionicPopup.alert({
	        title: 'Emergency has been pressed, will not continue homing'
	      });
	    }
	
	    //TODO !!! Check real-life homing correct handling, using my STM-32 stopswitch is automatically hit, not able to check correct homing"
	    function homingResponse(res) {
	      if (res.search('wydone') > -1 && $ionicHistory.currentStateName() === 'app.homing') {
	        setButtons({ 'showSpinner': false, 'showEmergency': false, 'showHoming': true });
	        $ionicPopup.alert({
	          title: 'Homing completed'
	        });
	        statusService.setSending(false);
	      } else if ($ionicHistory.currentStateName() === 'app.homing') {
	        $timeout(function () {
	          sendAndReceiveService.write('<w' + stepMotorNum + '>');
	          var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
	            homingResponse(res);
	            rdy();
	          });
	        }, 200);
	      }
	    }
	  };
	
	  function addToLog(str) {
	    logService.addOne(str);
	    logService.getLog(function (arr) {
	      $scope.bluetoothLog = arr;
	    });
	  }
	
	  $scope.openHelpModal = function () {
	    modalService.init('help-modal.html', $scope).then(function (modal) {
	      modal.show();
	    });
	  };
	
	  $scope.show = null;
	
	  $scope.showAnswer = function (obj) {
	    $scope.show = $scope.show === obj ? null : obj;
	  };
	
	  $scope.QAList = [];
	  for (var i = 1; i < 11; i++) {
	    $scope.QAList.push({
	      question: 'Question ' + i,
	      answer: 'Lorem ipsum'
	    });
	  }
	
	  $scope.showFullLog = function () {
	    $scope.fullLog = $scope.bluetoothLog.slice(0, 19);
	    modalService.init('log-modal.html', $scope).then(function (modal) {
	      modal.show();
	    });
	  };
	
	  $scope.emailFullLog = function () {
	    logModalService.emailFullLog();
	  };
	
	  $scope.fullLog = $scope.bluetoothLog.slice(0, 19);
	
	  $scope.fullLogPage = 0;
	
	  $scope.getFullLogExtract = function (start, end) {
	    console.log('getFullLogExtract, start: ' + start + ' end: ' + end);
	    $scope.fullLog = $scope.bluetoothLog.slice(start, end);
	  };
	
	  $scope.previousFullLogPage = function () {
	    console.log('prevFullLogPage');
	    $scope.getFullLogExtract(($scope.fullLogPage - 1) * 10, ($scope.fullLogPage - 1) * 10 + 9);
	    $scope.fullLogPage -= 1;
	  };
	
	  $scope.nextFullLogPage = function () {
	    console.log('nextFullLogPage');
	    $scope.getFullLogExtract(($scope.fullLogPage + 1) * 10, ($scope.fullLogPage + 1) * 10 + 9);
	    $scope.fullLogPage += 1;
	  };
	})
	//end of controller homingCtrl
	
	.controller('testCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal, $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService, checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService, statusService, connectToDeviceService, logModalService, modalService) {
	  $scope.$on('$ionicView.unloaded', function () {
	    console.log('\nUNLOADED\n');
	  });
	
	  $scope.$on('$ionicView.beforeLeave', function () {
	    console.log('BEFORE LEAVE');
	    sendAndReceiveService.unsubscribe();
	  });
	
	  $scope.$on('$ionicView.afterEnter', function () {
	    console.log('AFTER ENTER');
	    sendAndReceiveService.subscribe();
	  });
	
	  //other vars/commands
	  var commands;
	  $scope.settings = shareSettings.getObj();
	  var stepMotorNum = $scope.settings.stepMotorNum;
	  var softwareVersionCommand = '<z' + stepMotorNum + '>';
	  $scope.bluetoothLog = [];
	  $scope.bluetoothEnabled = null;
	  $scope.buttons = buttonService.getValues();
	  $scope.retriesNeeded = 0;
	  $scope.completedTest = 0;
	  var sentSettingsForTest = false;
	  $scope.numberOfTests = {};
	  var testsSent = 0;
	  $scope.testRunning = false;
	
	  $scope.userDisconnect = function () {
	    disconnectService.disconnect();
	    isConnectedService.getValue(function (val) {
	      $scope.isConnected = val;
	    });
	  };
	
	  function setButtons(obj) {
	    buttonService.setValues(obj);
	    $scope.$apply(function () {
	      $scope.buttons = buttonService.getValues();
	    });
	    console.log($scope.buttons);
	  }
	
	  $scope.$on('$ionicView.enter', function () {
	    console.log('enterView in testCtrl fired');
	    logService.getLog(function (arr) {
	      $scope.bluetoothLog = arr;
	    });
	    checkBluetoothEnabledService.getValue(function (value) {
	      $scope.bluetoothEnabled = value;
	      console.log('$scope.bluetoothEnabled: ' + $scope.bluetoothEnabled);
	    });
	    connectToDeviceService.getDeviceName(function (value) {
	      $scope.deviceName = value;
	    });
	    $scope.buttons = buttonService.getValues();
	    isConnectedService.getValue(function (value) {
	      $scope.isConnected = value;
	      console.log('$scope.isConnected: ' + $scope.isConnected);
	    });
	    calculateVarsService.getVars('test', function (obj) {
	      commands = obj.commands;
	      console.log('testCommands:');
	      console.log(commands);
	    });
	    $scope.settings = shareSettings.getObj();
	    stepMotorNum = $scope.settings.stepMotorNum;
	  });
	
	  $scope.$on('$ionicView.leave', function () {
	    console.log('leaveView in bluetoothConnectionCtrl fired');
	    $scope.retriesNeeded = 0;
	    $scope.completedTest = 0;
	    sentSettingsForTest = false;
	    $scope.numberOfTests = {};
	    testsSent = 0;
	    $scope.testRunning = false;
	    if (statusService.getSending() === true) {
	      addToLog('Cancelling current tasks');
	      emergencyService.on(function () {
	        emergencyService.off();
	      });
	    } else {
	
	      sendAndReceiveService.clearBuffer();
	    }
	    logService.setBulk($scope.bluetoothLog);
	  });
	
	  $scope.emergencyOn = function () {
	    emergencyService.on();
	    $scope.completedTest = 0;
	    $scope.retriesNeeded = 0;
	    sentSettingsForTest = false;
	    testsSent = 0;
	    $scope.testRunning = false;
	    sendKfault();
	    rdy();
	    rdy2();
	    listen();
	    newCommand();
	    nextListener();
	  };
	
	  $scope.emergencyOff = function () {
	    console.log('emergencyOff called');
	    emergencyService.off();
	  };
	  //
	  //SECTION: stressTest && move X mm logic
	  //
	
	  $scope.moveXMm = function () {
	    if (statusService.getEmergency() === false && statusService.getSending() === false) {
	      if ($scope.numberOfTests.mm === undefined) {
	        $ionicPopup.alert({
	          title: 'Please fill in "Move X mm"'
	        });
	      } else {
	        setButtons({ 'showStressTest': false, 'showVersionButton': false, 'showSpinner': true, 'showEmergency': true });
	
	        //replace standard <s0+stepMotorNum> with moveXMmStepsCommand
	        var moveXMmSteps = $scope.numberOfTests.mm / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
	        var moveXMmStepsCommand = '<s' + moveXMmSteps + stepMotorNum + '>';
	        var position = commands.indexOf('<s0' + stepMotorNum + '>');
	        commands[position] = moveXMmStepsCommand;
	        sendSettings('moveXMm');
	      }
	    }
	  };
	
	  var sendKfault;
	  var rdy;
	  var rdy2;
	  var listen;
	  var newCommand;
	
	  function sendSettings(type) {
	    var typeStr = type;
	    console.log('Commands in testCtrl -> sendSettings:');
	    console.log(commands);
	    //send commands, except last one
	    for (var i = 0; i < commands.length - 1; i++) {
	      sendAndReceiveService.write(commands[i]);
	    }
	    //send last command on sendKfault notification
	    sendKfault = $rootScope.$on('sendKfault', function () {
	      sendAndReceiveService.write(commands[commands.length - 1], function () {
	        initRdy(typeStr);
	        sendKfault();
	      });
	    });
	    //check if commands have been sent correctly
	  }
	
	  function initRdy(typeStr) {
	    rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
	      checkRdy(res, typeStr);
	      rdy();
	    });
	  }
	
	  function checkRdy(res, type) {
	    var typeStr = type;
	    if (res.search('wydone') > -1) {
	      if (typeStr === 'moveXMm') {
	        $ionicPopup.alert({
	          title: 'Moved ' + $scope.numberOfTests.mm + ' mm'
	        });
	        setButtons({ 'showStressTest': true, 'showVersionButton': true, 'showEmergency': false, 'showSpinner': false });
	        calculateVarsService.getVars('test', function (obj) {
	          console.log('resetting commands in testCtrl');
	          commands = obj.commands;
	        });
	      } else if (typeStr === 'stressTest') {
	        addToLog('Executing tests');
	        sentSettingsForTest = true;
	        $scope.stressTest();
	      }
	    } else if (res.search('FAULT') > -1) {
	      addToLog('Error sending moveXMmResponse, aborting current task & resetting');
	      emergencyService.on(function () {
	        emergencyService.off();
	      });
	    } else {
	      $timeout(function () {
	        sendAndReceiveService.write('<w' + stepMotorNum + '>');
	        rdy2 = $rootScope.$on('bluetoothResponse', function (event, response) {
	          checkRdy(response, typeStr);
	          rdy2();
	        });
	      }, 200);
	    }
	  }
	
	  //TODO tried to work with buffered commands, did not work, reverting back to one at a time
	  $scope.stressTest = function () {
	    if (statusService.getEmergency() === true) {
	      addToLog('Emergency on, cancelling stresstest');
	    } else if ($scope.numberOfTests.tests === undefined || $scope.numberOfTests.tests === 0) {
	      $ionicPopup.alert({
	        title: 'Please fill in the number of test commands'
	      });
	    } else {
	      setButtons({ 'showEmergency': true, 'showResetButton': false, 'showStressTest': false, 'showVersionButton': false, 'showMoveXMm': false, 'showSpinner': true });
	      $scope.testRunning = true;
	      if (!sentSettingsForTest) {
	        if (statusService.getEmergency() === false) {
	          console.log('numberOfTests:' + $scope.numberOfTests.tests);
	          addToLog('Sending settings needed for testing');
	          sendSettings('stressTest');
	        }
	      } else {
	        if (statusService.getEmergency() === false) {
	          statusService.setSending(true);
	
	          //with 10 or less tests, send them all at once
	          if (testsSent < $scope.numberOfTests.tests) {
	            //Send a random command, true = create listener, function is executed as soon as wydone+commandID has come back
	            $timeout(function () {
	              send('<q' + Math.floor(Math.random() * 1000 + 20) + stepMotorNum + '>', sendNext);
	            }, 150);
	          }
	        } else {
	          addToLog('Emergency on, will not continue with stresstest');
	        }
	      }
	    }
	  };
	
	  var nextListener;
	  function sendNext() {
	    nextListener = $rootScope.$on('bluetoothResponse', function (event, res) {
	      if ($scope.numberOfTests.tests === testsSent && res.search('wydone')) {
	        $scope.completedTest += 1;
	        $ionicPopup.alert({
	          title: 'Tests completed',
	          template: 'Completed ' + $scope.completedTest + ' out of ' + $scope.numberOfTests.tests
	        });
	        setButtons({ 'showEmergency': false, 'showSpinner': false, 'showStressTest': true, 'showVersionButton': true, 'showMoveXMm': true });
	        $scope.testRunning = false;
	        addToLog('Tests completed');
	        console.log('completed tests: ' + $scope.completedTest + ' number of tests: ' + $scope.numberOfTests.tests + ' sent tests: ' + testsSent);
	        sentSettingsForTest = false;
	        statusService.setSending(false);
	        nextListener();
	      } else if (res.search('wydone') > -1) {
	        $scope.completedTest += 1;
	        $scope.stressTest();
	        nextListener();
	      } else {
	        $timeout(function () {
	          sendAndReceiveService.write('<w' + stepMotorNum + '>', sendNext);
	        }, 200);
	        nextListener();
	      }
	    });
	  }
	
	  function send(str, cb) {
	    if (str === undefined) {
	      $ionicPopup.alert({
	        title: 'Encountered an error',
	        template: 'Please email a bug report via \'Show full log\''
	      });
	    }
	    if (statusService.getEmergency() === false) {
	      //calling .write() with original command (str). callingFunction is optional.
	      sendAndReceiveService.write(str);
	      testsSent += 1;
	      if (cb) cb();
	    }
	  }
	
	  $scope.getVersion = function () {
	    if (statusService.getEmergency() === false && statusService.getSending() === false) {
	      sendAndReceiveService.write('<<y8:y' + stepMotorNum + '>');
	      sendAndReceiveService.write(softwareVersionCommand, function () {
	        listen = $rootScope.$on('bluetoothResponse', function (event, res) {
	          if (res.search('<14:') > -1) {
	            $ionicPopup.alert({
	              title: 'Version number',
	              template: 'Your version number is: ' + res.slice(res.lastIndexOf(':') + 1, res.lastIndexOf('>'))
	            });
	            listen();
	          }
	        });
	      });
	    }
	  };
	
	  function addToLog(str) {
	    logService.addOne(str);
	    logService.getLog(function (arr) {
	      $scope.bluetoothLog = arr;
	    });
	  }
	
	  $scope.openHelpModal = function () {
	    modalService.init('help-modal.html', $scope).then(function (modal) {
	      modal.show();
	    });
	  };
	
	  $scope.show = null;
	
	  $scope.showAnswer = function (obj) {
	    $scope.show = $scope.show === obj ? null : obj;
	  };
	
	  $scope.QAList = [];
	  for (var i = 1; i < 11; i++) {
	    $scope.QAList.push({
	      question: 'Question ' + i,
	      answer: 'Lorem ipsum'
	    });
	  }
	
	  $scope.showFullLog = function () {
	    $scope.fullLog = $scope.bluetoothLog.slice(0, 19);
	    modalService.init('log-modal.html', $scope).then(function (modal) {
	      modal.show();
	    });
	  };
	
	  $scope.emailFullLog = function () {
	    logModalService.emailFullLog();
	  };
	
	  $scope.fullLog = $scope.bluetoothLog.slice(0, 19);
	
	  $scope.fullLogPage = 0;
	
	  $scope.getFullLogExtract = function (start, end) {
	    console.log('getFullLogExtract, start: ' + start + ' end: ' + end);
	    $scope.fullLog = $scope.bluetoothLog.slice(start, end);
	  };
	
	  $scope.previousFullLogPage = function () {
	    console.log('prevFullLogPage');
	    $scope.getFullLogExtract(($scope.fullLogPage - 1) * 10, ($scope.fullLogPage - 1) * 10 + 9);
	    $scope.fullLogPage -= 1;
	  };
	
	  $scope.nextFullLogPage = function () {
	    console.log('nextFullLogPage');
	    $scope.getFullLogExtract(($scope.fullLogPage + 1) * 10, ($scope.fullLogPage + 1) * 10 + 9);
	    $scope.fullLogPage += 1;
	  };
	})
	//end of controller testCtrl
	
	.controller('bluetoothConnectionCtrl', function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal, $state, $ionicPlatform, $window, turnOnBluetoothService, statusService, isConnectedService, logService, buttonService, checkBluetoothEnabledService, connectToDeviceService, disconnectService, $timeout, logModalService, modalService) {
	
	  $scope.availableDevices = [];
	  $scope.pairedDevices = [];
	  logService.getLog(function (arr) {
	    $scope.bluetoothLog = arr;
	  });
	  $scope.bluetoothOn = function () {
	    turnOnBluetoothService.turnOn(function () {
	      checkBluetoothEnabledService.getValue(function (val) {
	        $scope.bluetoothEnabled = val;
	        if ($scope.bluetoothEnabled) $scope.getAvailableDevices();
	      });
	    });
	  };
	  checkBluetoothEnabledService.getValue(function (val) {
	    $scope.bluetoothEnabled = val;
	  });
	  $scope.deviceName = connectToDeviceService.getDeviceName();
	  $scope.buttons = buttonService.getValues();
	  $scope.isConnected = isConnectedService.getValue();
	
	  function addToLog(str) {
	    console.log(str);
	    logService.addOne(str);
	    logService.getLog(function (arr) {
	      $scope.bluetoothLog = arr;
	    });
	  }
	
	  function setButtons(obj) {
	    buttonService.setValues(obj);
	    $scope.buttons = buttonService.getValues();
	  }
	
	  $scope.$on('$ionicView.enter', function () {
	    $scope.availableDevices = [];
	    $scope.pairedDevices = [];
	    console.log('enterView in bluetoothConnectionCtrl fired');
	    logService.getLog(function (arr) {
	      $scope.bluetoothLog = arr;
	    });
	    checkBluetoothEnabledService.getValue(function (value) {
	      $scope.bluetoothEnabled = value;
	      console.log('$scope.bluetoothEnabled: ' + $scope.bluetoothEnabled);
	    });
	    connectToDeviceService.getDeviceName(function (value) {
	      $scope.deviceName = value;
	    });
	    $scope.buttons = buttonService.getValues();
	    isConnectedService.getValue(function (value) {
	      $scope.isConnected = value;
	      console.log('$scope.isConnected: ' + $scope.isConnected);
	      if (!$scope.isConnected) {
	        console.log('connected false, calling getAvailableDevices');
	        $scope.getAvailableDevices();
	      }
	    });
	  });
	
	  $scope.userDisconnect = function () {
	    disconnectService.disconnect();
	    $scope.isConnected = false;
	    $timeout(function () {
	      $scope.getAvailableDevices();
	    }, 500);
	  };
	
	  $scope.$on('$ionicView.leave', function () {
	    console.log('leaveView in bluetoothConnectionCtrl fired');
	    logService.setBulk($scope.bluetoothLog);
	  });
	
	  $scope.getAvailableDevices = function () {
	    $scope.availableDevices = [];
	    $scope.pairedDevices = [];
	    isConnectedService.getValue(function (value) {
	      if (value === false) {
	        $ionicPlatform.ready(function () {
	          console.log('Calling get available devices');
	          if (ionic.Platform.isAndroid) {
	            //discover unpaired
	            $cordovaBluetoothSerial.discoverUnpaired().then(function (devices) {
	              addToLog('Searching for unpaired Bluetooth devices');
	              devices.forEach(function (device) {
	                $scope.availableDevices.push(device);
	                addToLog('Unpaired Bluetooth device found');
	              });
	            }, function () {
	              addToLog('Cannot find unpaired Bluetooth devices');
	            });
	            //discover paired
	            $cordovaBluetoothSerial.list().then(function (devices) {
	              addToLog('Searching for paired Bluetooth devices');
	              devices.forEach(function (device) {
	                $scope.pairedDevices.push(device);
	                addToLog('Paired Bluetooth device found');
	              });
	            }, function () {
	              addToLog('Cannot find paired Bluetooth devices');
	            });
	          } else if (ionic.Platform.isIOS) {
	            $cordovaBluetoothSerial.list().then(function (devices) {
	              addToLog('Searching for Bluetooth devices');
	              devices.forEach(function (device) {
	                addToLog('Bluetooth device found');
	                $scope.availableDevices.push(device);
	              });
	            }, function () {
	              addToLog('No devices found');
	            });
	          }
	        });
	      }
	    });
	  };
	
	  $scope.connectToUnpairedDevice = function ($index) {
	    $ionicPlatform.ready(function () {
	      addToLog('Trying to connect');
	      console.log('Id = ' + $scope.availableDevices[$index].id);
	      $cordovaBluetoothSerial.connectInsecure($scope.availableDevices[$index].id).then(function () {
	        addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
	        saveLastConnectedDevice($scope.availableDevices[$index].id, $scope.availableDevices[$index].name);
	        connectToDeviceService.setDeviceName($scope.availableDevices[$index].name);
	        isConnectedService.getValue(function (val) {
	          $timeout(function () {
	            $scope.$apply(function () {
	              $scope.isConnected = val;
	            });
	          }, 500);
	        });
	      }, function (error) {
	        //failure callback
	        addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
	        addToLog('error: ' + error);
	        $scope.isConnected = isConnectedService.getValue();
	      });
	    });
	  };
	
	  $scope.connectToPairedDevice = function ($index) {
	    $ionicPlatform.ready(function () {
	      addToLog('Trying to connect');
	      console.log('Id = ' + $scope.pairedDevices[$index].id);
	      $cordovaBluetoothSerial.connect($scope.pairedDevices[$index].id).then(function () {
	        saveLastConnectedDevice($scope.pairedDevices[$index].id, $scope.pairedDevices[$index].name);
	        connectToDeviceService.setDeviceName($scope.pairedDevices[$index].name);
	        addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
	        isConnectedService.getValue(function (val) {
	          $timeout(function () {
	            $scope.$apply(function () {
	              $scope.isConnected = val;
	            });
	          }, 500);
	        });
	      }, function (error) {
	        addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
	        addToLog('error: ' + error);
	      });
	    });
	  };
	
	  function saveLastConnectedDevice(id, name) {
	    var obj = { 'id': id, 'name': name };
	    $scope.deviceName = name;
	    window.localStorage.setItem('lastConnectedDevice', JSON.stringify(obj));
	    console.log('Local storage last connected device set to: ' + window.localStorage['lastConnectedDevice']);
	    showSavedDeviceAlert();
	  }
	
	  function addToLog(str) {
	    logService.addOne(str);
	    logService.getLog(function (arr) {
	      $scope.bluetoothLog = arr;
	    });
	  }
	
	  function showSavedDeviceAlert() {
	    $ionicPopup.alert({
	      title: 'Bluetooth device saved',
	      template: 'This bluetooth device is saved and will connect automatically from now on.<br \>If you need to change your device later on choose a new device via Bluetooth connection in the menu',
	      buttons: [{
	        text: 'Go to program',
	        type: 'button-calm',
	        onTap: function onTap() {
	          $state.go('app.program');
	        }
	      }, {
	        text: 'Close'
	      }]
	    });
	  }
	
	  $scope.openHelpModal = function () {
	    modalService.init('help-modal.html', $scope).then(function (modal) {
	      modal.show();
	    });
	  };
	
	  $scope.show = null;
	
	  $scope.showAnswer = function (obj) {
	    $scope.show = $scope.show === obj ? null : obj;
	  };
	
	  $scope.QAList = [];
	  for (var i = 1; i < 11; i++) {
	    $scope.QAList.push({
	      question: 'Question ' + i,
	      answer: 'Lorem ipsum'
	    });
	  }
	
	  $scope.showFullLog = function () {
	    $scope.fullLog = $scope.bluetoothLog.slice(0, 19);
	    modalService.init('log-modal.html', $scope).then(function (modal) {
	      modal.show();
	    });
	  };
	
	  $scope.emailFullLog = function () {
	    logModalService.emailFullLog();
	  };
	
	  $scope.fullLog = $scope.bluetoothLog.slice(0, 19);
	
	  $scope.fullLogPage = 0;
	
	  $scope.getFullLogExtract = function (start, end) {
	    console.log('getFullLogExtract, start: ' + start + ' end: ' + end);
	    $scope.fullLog = $scope.bluetoothLog.slice(start, end);
	  };
	
	  $scope.previousFullLogPage = function () {
	    console.log('prevFullLogPage');
	    $scope.getFullLogExtract(($scope.fullLogPage - 1) * 10, ($scope.fullLogPage - 1) * 10 + 9);
	    $scope.fullLogPage -= 1;
	  };
	
	  $scope.nextFullLogPage = function () {
	    console.log('nextFullLogPage');
	    $scope.getFullLogExtract(($scope.fullLogPage + 1) * 10, ($scope.fullLogPage + 1) * 10 + 9);
	    $scope.fullLogPage += 1;
	  };
	});
	//end of controller bluetoothConnectionCtrl

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	var crcTableStr = '0 4129 8258 12387 16516 20645 24774 28903 33032 37161 41290 45419 49548 53677 57806 61935 4657 528 12915 8786 21173 17044 29431 25302 37689 33560 45947 41818 54205 50076 62463 58334 9314 13379 1056 5121 25830 29895 17572 21637 42346 46411 34088 38153 58862 62927 50604 54669 13907 9842 5649 1584 30423 26358 22165 18100 46939 42874 38681 34616 63455 59390 55197 51132 18628 22757 26758 30887 2112 6241 10242 14371 51660 55789 59790 63919 35144 39273 43274 47403 23285 19156 31415 27286 6769 2640 14899 10770 56317 52188 64447 60318 39801 35672 47931 43802 27814 31879 19684 23749 11298 15363 3168 7233 60846 64911 52716 56781 44330 48395 36200 40265 32407 28342 24277 20212 15891 11826 7761 3696 65439 61374 57309 53244 48923 44858 40793 36728 37256 33193 45514 41451 53516 49453 61774 57711 4224 161 12482 8419 20484 16421 28742 24679 33721 37784 41979 46042 49981 54044 58239 62302 689 4752 8947 13010 16949 21012 25207 29270 46570 42443 38312 34185 62830 58703 54572 50445 13538 9411 5280 1153 29798 25671 21540 17413 42971 47098 34713 38840 59231 63358 50973 55100 9939 14066 1681 5808 26199 30326 17941 22068 55628 51565 63758 59695 39368 35305 47498 43435 22596 18533 30726 26663 6336 2273 14466 10403 52093 56156 60223 64286 35833 39896 43963 48026 19061 23124 27191 31254 2801 6864 10931 14994 64814 60687 56684 52557 48554 44427 40424 36297 31782 27655 23652 19525 15522 11395 7392 3265 61215 65342 53085 57212 44955 49082 36825 40952 28183 32310 20053 24180 11923 16050 3793 7920';
	var crcTable = crcTableStr.split(' ');
	
	var crcTableHex = [];
	
	crcTable.map(function (str, i) {
	  crcTableHex.push(parseInt(str, 10));
	});
	
	function crc16(s) {
	  var returnObj = {};
	  var crc = 0xFFFF;
	  var j, i;
	
	  for (i = 0; i < s.length; i++) {
	
	    var c = s.charCodeAt(i);
	    if (c > 255) {
	      throw new RangeError();
	    }
	    j = (c ^ crc >> 8) & 0xFF;
	    crc = crcTable[j] ^ crc << 8;
	  }
	
	  returnObj.Uint16 = (crc ^ 0) & 0xFFFF;
	
	  returnObj.Uint8High = returnObj.Uint16 >> 8 & 0xff;
	  returnObj.Uint8Low = returnObj.Uint16 & 0xff;
	
	  return returnObj;
	}
	
	module.exports = crc16;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Created by Patrick on 22/11/2016.
	 */
	module.exports = sendAndReceiveService;
	// angular
	//   .module('Toothmaster')
	//   .service('sendAndReceiveService', sendAndReceiveService);
	//
	// sendAndReceiveService.$inject = ['statusService', 'emergencyService', '$window', 'logService',
	//   '$rootScope', 'buttonService', 'crcService', '$ionicPopup', 'shareSettings', '$interval', '$timeout'];
	
	function sendAndReceiveService(statusService, emergencyService, $window, logService, $rootScope, buttonService, crcService, $ionicPopup, shareSettings, $interval, $timeout) {
	  var sendAndReceive = this;
	  //Available methods
	  sendAndReceive.subscribe = subscribe;
	  sendAndReceive.subscribeRawData = subscribeRawData;
	  sendAndReceive.unsubscribe = unsubscribe;
	  sendAndReceive.write = write;
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
	    $window.bluetoothSerial.subscribe('#', function (data) {
	      lastReceivedTime = Date.now();
	      sendAndReceive.emitResponse(data);
	    });
	  }
	
	  function subscribeRawData() {
	    $window.bluetoothSerial.subscribeRawData(function (data) {
	      var bytes = String.fromCharCode.apply(null, new Uint8Array(data));
	      logService.consoleLog('Rawdata: ' + bytes);
	    });
	  }
	
	  function unsubscribe() {
	    $window.bluetoothSerial.unsubscribe(function () {
	      logService.consoleLog('Succesfully unsubscribed');
	      statusService.setSubscribed(false);
	    }, function () {
	      logService.consoleLog('ERROR: could not unsubscribe');
	    });
	  }
	
	  function write(str, cb) {
	    if (statusService.getEmergency() === false) {
	      (function () {
	        var commandWithCRC = crcService.appendCRC(str);
	        $window.bluetoothSerial.write(commandWithCRC, function () {
	          logService.consoleLog('sent: ' + commandWithCRC);
	          lastCommandTime = Date.now();
	          if (cb) cb();
	        }, function () {
	          logService.consoleLog('ERROR: could not send command ' + str);
	        });
	      })();
	    }
	  }
	
	  function writeBuffered() {
	    var commandIDObj = sendAndReceive.addToCommandObj(str);
	    if (statusService.getEmergency() === false) {
	      var command;
	      //Used for buffered commands. Command with brackets: "<r34001>", without brackets: "r34001
	      var commandWithoutBrackets = str.slice(1, str.length - 1);
	      command = '<c' + commandWithoutBrackets + '$' + commandIDObj.ID + '>';
	
	      $window.bluetoothSerial.write(command, function () {
	        logService.consoleLog('sent: ' + command);
	        lastCommandTime = Date.now();
	      }, function () {
	        logService.consoleLog('ERROR: could not send command ' + str + ' , callingFunction: ' + callingFunction);
	      });
	      sendAndReceive.checkInterpretedResponse(commandIDObj.ID);
	    } else {
	      logService.addOne('Emergency pressed, will not send command');
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
	        logService.consoleLog('incorrect interpretation, ID: ' + commandID);
	        $rootScope.$emit('faultyResponse');
	        checkInterpreted();
	      }
	    }, 2500);
	  }
	
	  function startPing() {
	    stepMotorNum = shareSettings.getObj().stepMotorNum;
	    ping = $interval(function () {
	      sendAndReceive.write('<w' + stepMotorNum + '>');
	    }, 500);
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
	    commandObj = {};
	  }
	
	  function expectedResponse(str) {
	    stepMotorNum = shareSettings.getObj().stepMotorNum;
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
	        buttonService.setValues({ 'showSpinner': true });
	        return ['rdy', 'wydone', 'q'];
	        break;
	      case 'h':
	        return '6:';
	        break;
	      case 'z':
	        return '14:';
	        break;
	      case 'w':
	        return ['wydone', 'w' + stepMotorNum];
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
	    logService.consoleLog('response in emitResponse: ' + res);
	    var settings = shareSettings.getObj();
	    //handle stopswitch hit
	    if (res.search('wydone:') > -1 && res.search('wydone:0') === -1) {
	      var posStopswitch = res.lastIndexOf('@') - 3;
	      $ionicPopup.alert({
	        title: 'Error: hit stopswitch ' + res.charAt(posStopswitch),
	        template: 'Unexpected stopswitch has been hit. Aborting task and resetting program.'
	      });
	      logService.consoleLog('Error: hit stopswitch ' + res.charAt(posStopswitch));
	      logService.addOne('Error: hit stopswitch ' + res.charAt(posStopswitch));
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
	          template: 'The program has been stopped.<p>Maximum steps to miss: ' + maxAllowedMiss + '</p><p>Number of steps actually missed ' + missedSteps + '</p>'
	        });
	        logService.consoleLog('ERROR: hit max number of allowed steps');
	        logService.addOne('ERROR: exceeded maximum number of steps to miss (encoder setting)');
	        emergencyService.on();
	        $rootScope.$emit('maxSteps', res, missedSteps);
	      } else if (res.search('2:') > -1) {
	        $rootScope.$emit('sendKfault', res);
	      } else if (res.indexOf('$') > -1 && res.search('10:') === -1) {
	        logService.consoleLog('\nERROR:\nPotential faulty response: ' + res);
	        var numStr1 = res.slice(res.indexOf('$') + 1, res.indexOf('>'));
	        var commandID1 = Number(numStr1);
	        var commandIDObj = commandObj[commandID1];
	        logService.consoleLog('commandIDObj.command: ' + commandIDObj.command);
	        if (res.search(commandIDObj.command) === -1) {
	          logService.consoleLog('confirmed faulty response');
	          $rootScope.$emit('faultyResponse', res);
	          delete commandObj[commandID1];
	        }
	      } else if (res.search('&') > -1 && res.search('wydone') > -1) {
	        var numStr = res.slice(res.indexOf('>') + 1, res.indexOf('&'));
	        var commandID = Number(numStr);
	
	        $rootScope.$emit('bufferedCommandDone', res, commandID);
	      } else {
	        $rootScope.$emit('bluetoothResponse', res);
	      }
	  }
	
	  function sendEmergency() {
	    logService.consoleLog('sendAndReceiveService.sendEmergency called');
	    if (statusService.getSubscribed() === false) sendAndReceive.subscribe();
	    createResetListener(function () {
	      stepMotorNum = shareSettings.getObj().stepMotorNum;
	      $window.bluetoothSerial.write('<<y8:y' + stepMotorNum + '>', function () {
	        logService.addOne('Program reset command sent');
	      }, function (err) {
	        logService.addOne('Error: Program reset command could not be sent. ' + err);
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
	    });
	  }
	};

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map