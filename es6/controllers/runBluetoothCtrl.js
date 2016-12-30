export default function($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                        $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                        bluetoothService, logService, calculateVarsService, sendAndReceiveService,
                        statusService, logModalService, modalService, $async, errorService){

  $scope.bluetoothLog = logService.getLog();
  $scope.bluetoothEnabled = null;
  $scope.isConnected = null;

  //TODO retrieve variables where needed
  var sending = statusService.getSending();
  var program = shareProgram.getObj();

  $scope.progress = 0;
  $scope.settings = shareSettings.getObj();
  $scope.deviceName= bluetoothService.getDeviceName();
  $scope.buttons = buttonService.getValues();

  logService.consoleLog('program:');
  logService.consoleLog(JSON.stringify(program));

  logService.consoleLog('settings:');
  logService.consoleLog(JSON.stringify($scope.settings));
  let skipLeaveCheck = false;

  //settings commands
  let commands;
  let settingsDone;

  //update steps vars
  $scope.movements = [];
  $scope.movementsNum = 0;
  let done = true;

  //setting vars
  let stepMotorNum = $scope.settings.stepMotorNum;

  //
  //SECTION: changing & entering views
  //

  $scope.$on('$ionicView.enter',function () {
    logService.consoleLog('enterView in runBluetoothCtrl fired');
    bluetoothService.getConnectedValue(function (value) {
      $scope.isConnected = value;
    });
    bluetoothService.getBluetoothEnabledValue(function (value) {
      $scope.bluetoothEnabled = value;
      logService.consoleLog('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    $scope.bluetoothLog = logService.getLog();
    //no need to connect or anything, connectToLastDevice is done on app startup
    $scope.settings = shareSettings.getObj();
    program = shareProgram.getObj();
    logService.consoleLog('program:');
    logService.consoleLog(JSON.stringify(program));
    logService.consoleLog('settings:');
    logService.consoleLog(JSON.stringify($scope.settings));
    $scope.bluetoothLog = logService.getLog();
    //runBluetoothVars is an object which contains settings commands (obj.commands)
    // and individual variables (obj.vars.*)
    calculateVarsService.getVars('runBluetooth', function (runBluetoothVars) {
      commands = runBluetoothVars.commands;
      logService.consoleLog('commands:');
      logService.consoleLog(commands);
    });
    $scope.deviceName= bluetoothService.getDeviceName();
    $scope.buttons = buttonService.getValues();
    skipLeaveCheck = false;
    if (statusService.getEmergency() === true) {
      logService.consoleLog('set resetbutton true');
      setButtons({'showResetButton': true});
    }
    else {
      setButtons({
        'showCalcButton': true,
        'showMovingButton': false,
        'showEmergency': false,
        'readyForData': false,
        'showSpinner': false,
        'showProgress': false
      })
    }
    $scope.movements = [];
    $scope.movementsNum = 0;
    stepMotorNum = $scope.settings.stepMotorNum;
  });

  $scope.$on('$ionicView.afterEnter', function () {
    logService.consoleLog('AFTER ENTER');
    sendAndReceiveService.subscribe();
  });

  $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams, fromState, fromStateParams) {
    logService.consoleLog('BEFORE LEAVE');
    if (statusService.getSending() === true && !skipLeaveCheck ) {
      event.preventDefault();
      leaveWhileSendingWarning(toState);
    }
  });

  //TODO check this emergency sequence
  $scope.$on('$ionicView.leave',function () {
    logService.consoleLog('ionicView.leave called');
    sendAndReceiveService.unsubscribe();
    sendAndReceiveService.clearBuffer();
    logService.setBulk($scope.bluetoothLog);
  });

  function leaveWhileSendingWarning(toState) {
    $ionicPopup.alert({
      title: 'Your program is still running, are you sure?',
      template: 'Leaving now will abort your program and turn on emergency',
      buttons: [{
        text: 'Cancel',
        type: 'button-positive'
      },{
        text: 'Leave',
        type: 'button-assertive',
        onTap: function () {
          skipLeaveCheck = true;
          addToLog('Cancelling current tasks');
          statusService.setSending(false);
          emergencyService.on();
          $state.go(toState);
        }
      }]
    })
  }

  $scope.userDisconnect = function () {
    bluetoothService.disconnect();
    $scope.isConnected = false;
  };

  //
  //SECTION: Show buttons variables
  //

  function setButtons(obj) {
    buttonService.setValues(obj);
    $scope.buttons = buttonService.getValues();
    // $scope.$apply(function () {
    //   $scope.buttons = buttonService.getValues()
    // });
    logService.consoleLog($scope.buttons);
  }

  //
  //SECTION: UI log function
  //

  function addToLog(str, isError, errorType) {
    logService.addOne(str);
    $scope.bluetoothLog= logService.getLog();
    if (isError === true) {
      errorService.addError({level: errorType ? errorType : 'critical', message: str});
    }
  }

  //
  //SECTION: setting & resetting stop buttons
  //

  $rootScope.$on('emergencyOn', function () {
    addToLog('Emergency is on');
  });

  $rootScope.$on('emergencyOff', function () {
    statusService.setSending(false);
    $scope.movements = [];
    $scope.movementsNum = 0;
    done = true;
    settingsDone = true;
    $scope.buttons = buttonService.getValues();
    sendAndReceiveService.subscribe();
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
  //SECTION: functions to determine movement steps
  //

  //function to add number of steps and description to $scope.movements
  function addMovement(steps, descr) {
    $scope.movements.push({
      "steps": steps,
      "description": descr
    })
  }

  //calculate movement sequence
  $scope.calcSteps = function() {
    program = shareProgram.getObj();
    console.log('program in calcSteps:');
    console.log(program);
    $scope.settings = shareSettings.getObj();
    $scope.movements = [];
    //call function to calculate steps for cuts, subcuts and pins, log $scope.movements, callback to inform user of movements

    if (shareProgram.checkProgram()) {
      cutsAndPins();
      logService.consoleLog('Movements to take:');
      $scope.movements.map(function (item, index) {
        logService.consoleLog('Movement '+index+':'+' steps'+item.steps+', description: '+item.description);
      });
      setButtons({
        'showCalcButton': false,
        'readyForData': true
      });
    }
  };

  function cutsAndPins() {
    //do this for number of cuts
    for (let i = 1; i <= program.numberOfCuts; i++) {
      logService.consoleLog('let i ='+i);

      //how many subcuts do we need for this cut to complete
      const subCuts = program.cutWidth / program.sawWidth;
      const cutsRoundedUp = Math.ceil(subCuts);
      //if cut width is wider than saw width, calculate subcuts (multiple subcuts needed to complete one cut)
      if (program.cutWidth > program.sawWidth){
        calculateSubCuts(subCuts, cutsRoundedUp);
      }

      //calculate steps for pins, not needed after last cut, thus i<numberOfCuts
      if (i<program.numberOfCuts) {
        logService.consoleLog('Calculating pin');
        const pinSteps = program.pinWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
        if (program.cutWidth > program.sawWidth) {
          addMovement(pinSteps, 'Make subcut 1/'+cutsRoundedUp);
        }
        else if (program.cutWidth === program.sawWidth) {
          addMovement(pinSteps, 'Make the cut');
        }
      }
      if (i=== program.numberOfCuts){
        logService.consoleLog('i === numberofcuts');
        addToLog('Done calculating movements');
        logService.consoleLog('$scope.movements:');
        logService.consoleLog($scope.movements);
      }
    }
  }

  function calculateSubCuts(subCuts, cutsRoundedUp) {


    // calculate remaining subcut steps, start at 2 because first subcut is already added after moving to past pin
    for (var j=2; j<= cutsRoundedUp; j++){
      logService.consoleLog('Var j'+j);
      if (j<cutsRoundedUp){
        var stepsPerSawWidth = program.sawWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
        addMovement(stepsPerSawWidth, 'Make subcut '+j+'/'+cutsRoundedUp)
      }

      //calculate remaining mm & steps, based on number of subcuts already taken
      else if (j===cutsRoundedUp) {
        var remainingMM = program.cutWidth-((j-1)*program.sawWidth);
        logService.consoleLog('remaining mm: '+remainingMM);
        var remainingSteps = remainingMM / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
        addMovement(remainingSteps, 'Make subcut '+j+'/'+cutsRoundedUp);
      }
    }
  }


  //
  //SECTION: send settings before homing, test and makeMovement logic
  //

  //TODO refactor sendwithRetry, sendSettings, etc to sendAndReceiveService

  //user clicks button front end, sendSettingsData() called
  $scope.sendSettingsData = $async(function* () {
    try {
      if (statusService.getEmergency() === false) {
        if (statusService.getSending() === false && shareSettings.checkSettings()){
          setButtons({'showSpinner':true,'showEmergency':true, 'readyForData':false, 'showProgress': true});
          statusService.setSending(true);
          settingsDone = false;

          for (let i = 0; i < commands.length; i++){
            console.log('going to await for command reply to command: '+commands[i]);
            let res = yield sendAndReceiveService.sendWithRetry(commands[i]);
            console.log('awaited reply for command: '+commands[i]+', i='+i+', response: '+res );

            //On last command, start check if settings have been sent correctly
            if (i === commands.length-1) {
              checkWydone();
            }
          }
        }
      }
      else {
        addToLog('Emergency on, will not continue sending settings data');
      }
    }
    catch (err) {
      addToLog('Error: '+err, true);
      addToLog('Cancelling current tasks');
      emergencyService.on();
    }
  });

  function updateProgress(res) {
    // Example: <w1>-9999;90#
    if (res.search('<w') > -1 && res.search(';') > -1 && res.search('#') > -1) {
      $scope.progress = res.slice(res.search(';')+1, res.search('#'));
      console.log('progress: '+$scope.progress);
    }
  }

  function checkWydone() {
    console.log('checkWydone');
    let timer = $interval(() => {
      sendAndReceiveService.writeAsync('<w'+stepMotorNum+'>');
      console.log('checkWyDone runBluetooth')
    }, 250);

    let bluetoothResponseListener = $rootScope.$on('bluetoothResponse', (event, res) => {
      updateProgress(res);
    });

    let wydoneListener = $rootScope.$on('wydone', (event, res) => {
      $interval.cancel(timer);
      movedToStartPosition();
      bluetoothResponseListener();
      wydoneListener();
    });

    $rootScope.$on('emergencyOn', () => {
      $interval.cancel(timer);
      bluetoothResponseListener();
      wydoneListener();
    });

    $rootScope.$on('$ionicView.leave', () => {
      $interval.cancel(timer);
      bluetoothResponseListener();
      wydoneListener();
    })
  }

  function movedToStartPosition() {
    setButtons({
      'readyForData':false,
      'showMovingButton':true,
      'showCalcButton':false,
      'showHoming':false,
      'showSpinner': false,
      'showProgress': false
    });
    statusService.setSending(false);
    addToLog('Moved to start position');
    const cutsRoundedUp = Math.ceil(program.cutWidth / program.sawWidth);

    //On popup user is able to indicate that cut is complete
    //Button on popup triggers startMoving()
    if (program.cutWidth !== program.sawWidth) {
      $ionicPopup.alert({
        title: 'Make the subcut 1/'+cutsRoundedUp
      });
    }
    else {
      $ionicPopup.alert({
        title: 'Make the cut'
      });
    }
  }

  //
  //SECTION: startMoving \ take steps logic
  //

  $scope.startMoving = $async(function* () {
    try {
      logService.consoleLog('$scope.movements in startMoving:');
      logService.consoleLog($scope.movements);
      logService.consoleLog('$scope.movementsNum in startMoving:');
      logService.consoleLog($scope.movementsNum);
      if (statusService.getEmergency() === false) {
        if (done) {
          statusService.setSending(true);
          done = false;
          setButtons({'showSpinner':true, 'showProgress': true});
          yield sendAndReceiveService.sendWithRetry('<q'+$scope.movements[$scope.movementsNum].steps+stepMotorNum+'>');
          checkDone();
        }
        else {
          addToLog('Please wait until this step is finished', true, 'warning');
        }
      }
      else {
        addToLog('Emergency on, will not continue with movement', true);
      }
    }
    catch (err) {
      addToLog('Error: '+err, true);
      addToLog('Cancelling current tasks');
      emergencyService.on();
    }
  });

  //check if prev stepCommand is done, send command, start pinging <w>, check for 'done:', allow next stepCommand
  function checkDone() {
    console.log('checkDone');
    let timer = $interval(() => {
      sendAndReceiveService.writeAsync('<w'+stepMotorNum+'>');
      console.log('checkDone runBluetooth')
    }, 250);

    let bluetoothResponseListener = $rootScope.$on('bluetoothResponse', (event, res) => {
      console.log('bluetoothResponseListener: '+res);
      updateProgress(res);
    });

    let wydoneListener = $rootScope.$on('wydone', (event, res) => {
      $interval.cancel(timer);
      checkDoneReceivedWydone();
      bluetoothResponseListener();
      wydoneListener();
    });

    $rootScope.$on('emergencyOn', () => {
      $interval.cancel(timer);
      bluetoothResponseListener();
      wydoneListener();
    });

    $rootScope.$on('$ionicView.leave', () => {
      $interval.cancel(timer);
      bluetoothResponseListener();
      wydoneListener();
    })
  }

  function checkDoneReceivedWydone() {
    addToLog('Movement done');
    addToLog($scope.movements[$scope.movementsNum].description);
    done = true;
    setButtons({'showSpinner':false, 'showHoming': true, 'showResetButton': false, 'showProgress': false});
    if ($scope.movements[$scope.movementsNum].description !== 'Moving to next cut'
      && $scope.movementsNum !== $scope.movements.length -1){
      $ionicPopup.alert({
        title: $scope.movements[$scope.movementsNum].description
      });
      //increment movementsNum, so when user clicks Start Moving button again,
      // startMoving() will be called with next command
      $scope.movementsNum += 1;
    }
    //once last movement is completed show restart program popup
    else if ($scope.movementsNum === $scope.movements.length -1) {
      $ionicPopup.alert({
        title: $scope.movements[$scope.movementsNum].description,
        buttons: [{
          type: 'button-calm',
          text: 'OK',
          onTap: $scope.showRestartPopup()
        }]
      });
      setButtons({'showMovingButton':false,'showEmergency':false,'showResetButton':false});
      statusService.setSending(false);
      $scope.movements = [];
      $scope.movementsNum = 0;
    }
  }


  //
  //SECTION: popups && modals
  //
  $scope.showRestartPopup = function () {
    $ionicPopup.alert({
      title: 'Program finished!',
      template: 'Would you like to return to start position?',
      buttons: [
        {
          text: 'Yes',
          type: 'button-balanced',
          onTap: function () {
            $state.go('app.homing')
          }
        },
        {
          text: 'No',
          type: 'button-calm',
          onTap: function () {
            setButtons({'showCalcButton': true})
          }
        },
        {
          text: 'Edit program',
          type: 'button-positive',
          onTap: function () {
            $state.go('app.program');
          }
        }]
    })
  };


  $scope.start = function () {
    $ionicPopup.alert({
      title: 'Make sure your workpiece is tightly secured!',
      template: 'Program is about to start!',
      buttons: [
        {
          text: 'Cancel',
          type: 'button-positive'
        },
        {
          text: 'Start',
          type: 'button-balanced',
          onTap: function () {
            $scope.sendSettingsData()
          }
        }]
    })
  };

  //Q&A section

  $scope.openHelpModal = function () {
    modalService
      .init('help-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  $scope.showFullLog = function () {
    // $scope.fullLog = $scope.bluetoothLog.slice(0,19);
    modalService
      .init('log-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };
}
