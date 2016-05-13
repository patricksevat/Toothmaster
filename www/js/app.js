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
      for (var key in obj) {
        switch (key) {
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
    }
  })
//TODO rootScope emit emergency?
  .service('emergencyService',['buttonService', function (buttonService) {
    var emergency = this;
    emergency.value = false;

    emergency.getValue = function () {
      return emergency.value;
    };

    emergency.on = function () {
      emergency.value = true;
      buttonService.setValues({
        showEmergency : false,
        showMovingButton : false,
        showCalcButton : false,
        showStressTest : false,
        showHoming : false,
        showSpinner : false,
        showVersionButton : false,
        showMoveXMm : false,
        readyForData : false
      });
      //TODO send reset command
    };

    emergency.off = function () {
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
      console.log('Added to UI log: '+str);
      if (logService.UILog.length > 200) {
        logService.UILog.pop();
        logService.UILog.unshift(str);
      }
      else {
        logService.UILog.unshift(str);
      }
    };

    logService.getLog = function () {
      return logService.UILog;
    }
  })

  .service('calculateVarsService',['shareProgram', 'shareSettings', function (shareProgram, shareSettings) {
    var vars = this;
    var program = shareProgram.getObj();
    var settings = shareSettings.getObj();
    var stepMotorNum = '3';
    //type can be: homing, test or runBluetooth
    //TODO perhaps clean up the return of encoderCommands
    vars.getVars = function (type) {
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

  .service('sendAndReceiveService', ['emergencyService',function (emergencyService, $window) {
    /*
    * subscribe -> send command\write -> wait for subscribe to receive answer -> rootscope emit command + response
    * -> unsubscribe when done with batch \ unsubscribe after command -> only throw new command when done
    * */
    
    $window.bluetoothSerial.subscribe('#', function (data) {
      
    });
    
    $window.bluetoothSerial.write(str)
    
  }])

.run(function($ionicPlatform, $rootScope, $state, $window, $ionicHistory, skipService) {
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
    if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing'
      || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
      bugout.log('pause from app.js skipped');
    }
    else {
      $window.bluetoothSerial.disconnect(function () {
        bugout.log('disconnected on pause from app.js');

      }, function () {
        bugout.log('could not disconnect on pause from app.js')
      })
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
    window.localStorage['settings'] = '{"maxFreq":666,"dipswitch":5000,"spindleAdvancement":5,"time":0.2, "homingStopswitch": false, "encoder":{"enable": false, "stepsPerRPM": 0, "stepsToMiss": 0, "direction": false}}';
  }
  if (window.localStorage['lastUsedProgram'] === undefined) {
    window.localStorage['lastUsedProgram'] = '';
  }
  if (window.localStorage['lastConnectedDevice'] === undefined) {
    window.localStorage['lastConnectedDevice'] = '';
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



