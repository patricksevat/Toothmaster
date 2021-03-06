export default function($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                        $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                        bluetoothService, logService, calculateVarsService, sendAndReceiveService,
                        statusService, logModalService, modalService, $async, errorService, bugout){

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

  //TODO check if needed to cancel listener, now multiple listeners are created

  $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams, fromState, fromStateParams) {
    if (fromState.name === 'app.runBluetooth') {
      logService.consoleLog('BEFORE LEAVE runBluetoothCtrl');
      if (statusService.getSending() === true && !skipLeaveCheck) {
        event.preventDefault();
        leaveWhileSendingWarning(toState);
      }
    }
  });

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
    $scope.progress = 0;
    $scope.movements = [];
    $scope.movementsNum = 0;
    done = true;
    settingsDone = true;
    $scope.buttons = buttonService.getValues();
    sendAndReceiveService.subscribe();
  });

  $rootScope.$on('bluetoothValuesUpdated', function (event, valuesObj) {
    $scope.bluetoothEnabled = valuesObj.bluetoothEnabled;
    $scope.isConnected = valuesObj.isConnected;
  });

  $rootScope.$on('connectionLost', () => {
    skipLeaveCheck = true;
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
    bugout.bugout.log('program in calcSteps:');
    bugout.bugout.log(program);
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
      logService.consoleLog('calculating cut ='+i);

      //IMPORTANT: for the first (sub)cut: we are already in place for the first (sub)cut after moving to start position.
      //The popup message for making the first (sub)cut is handled by movedToStartPosition() which is called
      //after settings have succesfully been sent

      //The order may seem counter intuitive: calculating subcuts before calculating pins.
      //However, remember that with the first cut we are already in start position for the first (sub)cut,
      // then we need to add movements for subcuts of cut 1 (if needed), then we need to calculate pin 1,
      // add message for the cut 2 and add movements for the subcuts of cut 2 (if needed), then calculate pin 2, etc.
      // on the last cut we only calculate the subcuts of the last cut (if needed) and skip the last pin calculation

      //how many subcuts do we need for this cut to complete
      const cutsRoundedUp = Math.ceil(program.cutWidth / program.sawWidth);

      //if we need subcuts, calculate subcuts (multiple subcuts needed to complete one cut)
      if (cutsRoundedUp > 1){
        calculateSubCuts(cutsRoundedUp);
      }

      //IMPORTANT: similar to moving to start position, we are now going to calculate the pins.
      //Pins behave like moving to start position, with the exception that we do need to add a message
      //Furthermore we do not need to move beyond the last (sub)cut, thus for calculating pin steps we use
      //i<numberOfCuts

      if (i<program.numberOfCuts) {
        logService.consoleLog('Calculating pin');
        //A pin needs to include the saw width to get to the right position
        const pinSteps = (program.pinWidth + program.sawWidth) / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;

        //Add the message after moving beyond a pin
        if (program.cutWidth > program.sawWidth) {
          addMovement(pinSteps, 'Make the subcut 1/'+cutsRoundedUp);
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

  function calculateSubCuts(cutsRoundedUp) {
    // IMPORTANT: here we calculate the remaining subcut steps,
    // we start iterating at 2 because first subcut is already added after moving to the start position or
    // moving past the pin, the messages for the first subcut are handled in other places:
    // movedToStartPosition() for first cut, cutsAndPins() for subsequent cuts

    for (let j=2; j<= cutsRoundedUp; j++){
      logService.consoleLog('Var j'+j);
      if (j<cutsRoundedUp){
        var stepsPerSawWidth = program.sawWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
        addMovement(stepsPerSawWidth, 'Make the subcut '+j+'/'+cutsRoundedUp)
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
            bugout.bugout.log('going to await for command reply to command: '+commands[i]);
            let res = yield sendAndReceiveService.sendWithRetry(commands[i]);
            bugout.bugout.log('awaited reply for command: '+commands[i]+', i='+i+', response: '+res );

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
      bugout.bugout.log('progress: '+$scope.progress);
    }
  }

  function checkWydone() {
    bugout.bugout.log('checkWydone');
    let timer = $interval(() => {
      sendAndReceiveService.writeAsync('<w'+stepMotorNum+'>');
      bugout.bugout.log('checkWyDone runBluetooth')
    }, 250);

    let bluetoothResponseListener = $rootScope.$on('bluetoothResponse', (event, res) => {
      updateProgress(res);
    });

    let wydoneListener = $rootScope.$on('wydone', (event, res) => {
      $interval.cancel(timer);
      movedToStartPosition();
      bluetoothResponseListener();
      wydoneListener();
      wydoneEmergencyListener();
      wydoneLeaveListener();
    });

    let wydoneEmergencyListener = $rootScope.$on('emergencyOn', () => {
      $interval.cancel(timer);
      bluetoothResponseListener();
      wydoneListener();
      wydoneEmergencyListener();
      wydoneLeaveListener();
    });

    let wydoneLeaveListener = $scope.$on('$ionicView.leave', () => {
      $interval.cancel(timer);
      bluetoothResponseListener();
      wydoneListener();
      wydoneEmergencyListener();
      wydoneLeaveListener();
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
    bugout.bugout.log('checkDone');
    let timer = $interval(() => {
      sendAndReceiveService.writeAsync('<w'+stepMotorNum+'>');
      bugout.bugout.log('checkDone runBluetooth')
    }, 250);

    let bluetoothResponseListener = $rootScope.$on('bluetoothResponse', (event, res) => {
      bugout.bugout.log('bluetoothResponseListener: '+res);
      updateProgress(res);
    });

    let wydoneListener = $rootScope.$on('wydone', (event, res) => {
      $interval.cancel(timer);
      checkDoneReceivedWydone();
      bluetoothResponseListener();
      wydoneListener();
      checkdoneEmergencyListener();
      checkDoneLeaveListener();
    });

    let checkdoneEmergencyListener = $rootScope.$on('emergencyOn', () => {
      $interval.cancel(timer);
      bluetoothResponseListener();
      wydoneListener();
      checkdoneEmergencyListener();
      checkDoneLeaveListener();
    });

    let checkDoneLeaveListener = $scope.$on('$ionicView.leave', () => {
      $interval.cancel(timer);
      bluetoothResponseListener();
      wydoneListener();
      checkdoneEmergencyListener();
      checkDoneLeaveListener();
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
          type: 'button-positive',
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
