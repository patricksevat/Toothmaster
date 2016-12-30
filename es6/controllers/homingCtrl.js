export default function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                         $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                         bluetoothService, logService, calculateVarsService, sendAndReceiveService,
                         statusService, $ionicHistory, logModalService, modalService, $async, errorService) {
  $scope.$on('$ionicView.unloaded', function () {
    logService.consoleLog('\nUNLOADED\n');
  });

  $scope.$on('$ionicView.beforeLeave', function () {
    logService.consoleLog('BEFORE LEAVE');
    sendAndReceiveService.unsubscribe();
  });

  $scope.$on('$ionicView.afterEnter', function () {
    logService.consoleLog('AFTER ENTER');
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
    bluetoothService.disconnect();
    bluetoothService.getConnectedValue(function (val) {
      $scope.isConnected = val;
    })
  };
  $scope.homingDone = false;

  function setButtons(obj) {
    buttonService.setValues(obj);
    $scope.buttons = buttonService.getValues();
    logService.consoleLog($scope.buttons);
  }

  $scope.$on('$ionicView.enter', function () {
    logService.consoleLog('enterView in homingCtrl fired');
    $scope.bluetoothLog= logService.getLog();
    bluetoothService.getBluetoothEnabledValue(function (value) {
      $scope.bluetoothEnabled = value;
      logService.consoleLog('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    $scope.deviceName = bluetoothService.getDeviceName();
    $scope.buttons = buttonService.getValues();
    bluetoothService.getConnectedValue(function (value) {
      $scope.isConnected = value;
      logService.consoleLog('$scope.isConnected: '+$scope.isConnected);
    });
    calculateVarsService.getVars('homing', function (obj) {
      homingCommands = obj.commands;
      logService.consoleLog('homingcommands:');
      logService.consoleLog(homingCommands);
      homingStopswitchInt = obj.vars.homingStopswitchInt;
    });
    $scope.settings = shareSettings.getObj();
    stepMotorNum = $scope.settings.stepMotorNum;
    $scope.homingDone = false;
  });

  $scope.$on('$ionicView.leave', function () {
    logService.consoleLog('leaveView in bluetoothConnectionCtrl fired');
    if (statusService.getSending() === true ) {
      addToLog('Cancelling current tasks');
      emergencyService.on(function () {
        emergencyService.off();
      });
    }
    else {
      sendAndReceiveService.clearBuffer();
    }
    //TODO perhaps create listeners in a var and cancel var on leave?
    logService.setBulk($scope.bluetoothLog);
  });

  $scope.emergencyOn = function () {
    emergencyService.on();
  };

  $scope.emergencyOff = function () {
    logService.consoleLog('emergency reset called');
    emergencyService.reset();
  };

  $rootScope.$on('connectionLost', () => {
    $scope.isConnected = false;
  });
  
  //
  //SECTION: homing logic
  //

  $scope.sendWithRetry = $async(function* (str) {
    let res;
    for (let i = 0; i < 5; i++) {
      console.log('try: '+i+', command: '+str);
      res = yield sendAndReceiveService.writeAsync(str);
      console.log('res in sendWithretry: '+res);
      if (i === 4)
        return new Promise((resolve, reject) => {
          reject('exceeded num of tries');
        });
      else if (res === 'OK')
        return new Promise((resolve, reject) => {
          console.log('resolve value: '+res);
          resolve('resolve value: '+res);
        });
    }
  });

  $scope.homing = $async(function* () {
    if (statusService.getEmergency() === false) {
      logService.consoleLog('homingStopswitch = '+homingStopswitchInt);
      if (statusService.getSending() === false && shareSettings.checkStepMotor()){
        setButtons({'showSpinner':true,'showEmergency':true,'showHoming':false});
        statusService.setSending(true);

        for (let i = 0; i < homingCommands.length; i++){
          console.log('going to await for command reply to command: '+homingCommands[i]);
          let res = yield $scope.sendWithRetry(homingCommands[i]);
          console.log('awaited reply for command: '+homingCommands[i]+', i='+i+', response: '+res );

          if (i === homingCommands.length-1) {
            console.log('commands');
            console.log(homingCommands);
            console.log('commands.length');
            console.log(homingCommands.length);
            console.log('last command of sendSettings is OK');
            checkWydone();
          }
        }
      }
      else {
        $ionicPopup.alert({
          title: 'Please wait until moving to current command is finished'
        });
      }
    }
    else {
      $ionicPopup.alert({
        title: 'Emergency has been pressed, will not continue homing'
      });
    }
  });

  function checkWydone() {
    console.log('checkWydone');
    let timer = $interval(() => {
      sendAndReceiveService.writeAsync('<w'+stepMotorNum+'>');
      console.log('checkWydone Homing')
    }, 250);

    let bluetoothResponseListener = $rootScope.$on('bluetoothResponse', (event, res) => {
      console.log('bluetoothResponseListener: '+res);
    });

    let wydoneListener = $rootScope.$on('wydone', (event, res) => {
      $interval.cancel(timer);
      $scope.homingDone = true;
      setButtons({'showSpinner': false, 'showEmergency': false, 'showHoming': true});
      $ionicPopup.alert({
        title: 'Homing completed'
      });
      statusService.setSending(false);
      bluetoothResponseListener();
      wydoneListener();
    });

    $rootScope.$on('emergencyOn', () => {
      $interval.cancel(timer);
      wydoneListener();
    });
    
    $rootScope.$on('$ionicView.leave', () => {
      $interval.cancel(timer);
      wydoneListener();
    })
  }

  function addToLog(str) {
    logService.addOne(str);
    $scope.bluetoothLog = logService.getLog();
  }

  $scope.openHelpModal = function () {
    modalService
      .init('help-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  $scope.showFullLog = function () {
    modalService
      .init('log-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };
}
