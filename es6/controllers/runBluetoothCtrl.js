export default function($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                        $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                        checkBluetoothEnabledService, isConnectedService, logService, disconnectService, calculateVarsService, sendAndReceiveService,
                        statusService, connectToDeviceService, logModalService, modalService, $async){
  //TODO interval check on bluetoothConnected
  const self = this;

  $scope.bluetoothLog = logService.getLog();
  $scope.bluetoothEnabled = null;
  $scope.isConnected = null;

  //TODO retrieve variables where needed
  var sending = statusService.getSending();
  var program = shareProgram.getObj();
  var emergency = statusService.getEmergency();

  //remove unnecessary $scope variables
  $scope.settings = shareSettings.getObj();
  $scope.deviceName= connectToDeviceService.getDeviceName();
  $scope.buttons = buttonService.getValues();

  logService.consoleLog('program:');
  logService.consoleLog(JSON.stringify(program));

  logService.consoleLog('settings:');
  logService.consoleLog(JSON.stringify($scope.settings));

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
    isConnectedService.getValue(function (value) {
      $scope.isConnected = value;
    });
    checkBluetoothEnabledService.getValue(function (value) {
      $scope.bluetoothEnabled = value;
      logService.consoleLog('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    logService.getLog(function (arr) {
      $scope.bluetoothLog = arr;
    });
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
    $scope.deviceName= connectToDeviceService.getDeviceName();
    $scope.buttons = buttonService.getValues();
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
        'showSpinner': false
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

  $scope.$on('$ionicView.beforeLeave', function () {
    logService.consoleLog('BEFORE LEAVE');
    sendAndReceiveService.unsubscribe();
  });

  $scope.$on('$ionicView.leave',function () {
    logService.consoleLog('ionicView.leave called');
    if (statusService.getSending() === true ) {
      addToLog('Cancelling current tasks');
      emergencyService.on(function () {
        emergencyService.off();
      });
    }
    else {
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
      $scope.buttons = buttonService.getValues()
    });
    logService.consoleLog($scope.buttons);
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
    sendAndReceiveService.subscribe();
  });

  $scope.emergencyOn = function () {
    emergencyService.on();
  };

  $scope.emergencyOff = function () {
    statusService.setSending(false);
    logService.consoleLog('emergencyOff called');
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
    })
  }

  //calculate movement sequence
  $scope.calcSteps = function() {
    program = shareProgram.getObj();
    $scope.settings = shareSettings.getObj();
    $scope.movements = [];
    //call function to calculate steps for cuts, subcuts and pins, log $scope.movements, callback to inform user of movements
    if (program.sawWidth === undefined || program.cutWidth === undefined
      || program.pinWidth === undefined || program.numberOfCuts === undefined) {
      $ionicPopup.alert({
        title: 'Please fill in your Program before continuing',
        buttons: [{
          text: 'Go to program',
          type: 'button-calm',
          onTap: function () {
            $state.go('app.program');
          }
        }]
      });
    }
    else if (program.sawWidth > program.cutWidth) {
      $ionicPopup.alert({
        title: 'Your saw width cannot be wider than your cut width',
        template: 'Please adjust your program',
        buttons: [{
          text: 'Go to program',
          type: 'button-positive',
          onTap: function () {
            $state.go('app.program');
          }
        }]
      });
    }
    else {
      cutsAndPins(function() {
        logService.consoleLog('Movements to take:');
        var count= 1;
        $scope.movements.forEach(function (item) {
          logService.consoleLog('Movement '+count+':'+' steps'+item.steps+', description: '+item.description);
          count +=1;
        })
      });

      function cutsAndPins(callback) {
        //do this for number of cuts
        for (var i = 1; i <= program.numberOfCuts; i++) {
          logService.consoleLog('var i ='+i);

          //if cut width is wider than saw width, calculate subcuts (multiple subcuts needed to complete one cut)
          if (program.cutWidth > program.sawWidth){

            //how many subcuts do we need for this cut to complete
            var subCuts = program.cutWidth / program.sawWidth;
            var cutsRoundedUp = Math.ceil(subCuts);

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

          //calculate steps for pins, not needed after last cut, thus i<numberOfCuts
          if (i<program.numberOfCuts) {
            logService.consoleLog('Calculating pin');
            var pinSteps = program.pinWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
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
            if (callback) callback();
            setButtons({
              'showCalcButton': false,
              'readyForData': true
            })
          }
        }
      }
    }
  };

  //
  //SECTION: send settings before homing, test and makeMovement logic
  //

  self.sendWithRetry = $async(function* (str) {
    try {
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
    }
    catch (err) {
      return new Promise((resolve, reject) => {
        reject(err);
      })
    }
  });


  //user clicks button front end, sendSettingsData() called
  $scope.sendSettingsData = $async(function* () {
    try {
      if (statusService.getEmergency() === false) {
        if (statusService.getSending() === false){
          setButtons({'showSpinner':true,'showEmergency':true, 'readyForData':false});
          statusService.setSending(true);
          settingsDone = false;

          for (let i = 0; i < commands.length; i++){
            console.log('going to await for command reply to command: '+commands[i]);
            let res = yield self.sendWithRetry(commands[i]);
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
      addToLog('Error: '+err);
      addToLog('Cancelling current tasks');
      emergencyService.on(function () {
        emergencyService.off();
      });
    }
  });

  // function settingsSentCorrectlyCheck() {
  //   console.log('settings send correctly func');
  //   const settingsCorrectListener = $rootScope.$on('bluetoothResponse', (event, res) => {
  //     console.log('res in settings sent correctly: '+res);
  //     //Settings have been sent correctly, start pinging for update
  //     if (res.search('rdy') > -1) {
  //       console.log('last command of sendSettings is OK');
  //       addToLog('Moving to start position');
  //       checkWydone();
  //     }
  //     //  Setting have been sent incorrectly
  //     else if (res.search('kFAULT') !== -1){
  //       addToLog('Settings have been sent incorrectly, please try again');
  //       emergencyService.on(function () {
  //         emergencyService.off()
  //       });
  //     }
  //     settingsCorrectListener();
  //   })
  //
  // }



  function checkWydone() {
    console.log('checkWydone');
    let timer = $interval(() => {
      sendAndReceiveService.write('<w'+stepMotorNum+'>');
    }, 250);

    let bluetoothResponseListener = $rootScope.$on('bluetoothResponse', (event, res) => {
      console.log('bluetoothResponseListener: '+res);
    });

    let wydoneListener = $rootScope.$on('wydone', (event, res) => {
      $interval.cancel(timer);
      movedToStartPosition();
      bluetoothResponseListener();
      wydoneListener();
    });

    // var rdy = $rootScope.$on('bluetoothResponse', function (event, res) {
    //   lastSendSettingsCommand(res);
    //   rdy();
    // })
  }

  function movedToStartPosition() {
    setButtons({
      'readyForData':false,
      'showMovingButton':true,
      'showCalcButton':false,
      'showHoming':false,
      'showSpinner': false
    });
    statusService.setSending(false);
    addToLog('Moved to start position');
    var subCuts = program.cutWidth / program.sawWidth;
    var cutsRoundedUp = Math.ceil(subCuts);
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

  // function lastSendSettingsCommand(res) {
  //
  //   //Movement is complete
  //   if (res.search('wydone') > -1) {
  //     //showMoving button becomes available, which allows user to call startMoving()
  //
  //   }
  //
  //   //  Keep connection alive
  //   else {
  //     $timeout(function () {
  //       sendAndReceiveService.write('<w'+stepMotorNum+'>', checkWydone());
  //     }, 100)
  //
  //   }
  // }

  //
  //SECTION: startMoving \ take steps logic
  //

  $scope.startMoving = function () {
    logService.consoleLog('$scope.movements in startMoving:');
    logService.consoleLog($scope.movements);
    logService.consoleLog('$scope.movementsNum in startMoving:');
    logService.consoleLog($scope.movementsNum);
    if (statusService.getEmergency() === false) {
      if (done) {
        statusService.setSending(true);
        done = false;
        setButtons({'showSpinner':true});
        sendAndReceiveService.write('<q'+$scope.movements[$scope.movementsNum].steps+stepMotorNum+'>', checkDone);
      }
      else {
        addToLog('Please wait untill this step is finished');
      }
    }
    else {
      addToLog('Emergency on, will not continue with movement');
    }

    //check if prev stepCommand is done, send command, start pinging <w>, check for 'done:', allow next stepCommand
    function checkDone() {
      var check = $rootScope.$on('bluetoothResponse', function (event, res) {
        logService.consoleLog('on bluetoothResponse in checkDone called');
        if (res.search('wydone') > -1) {
          checkDoneReceivedWydone()
        }
        else {
          $timeout(function () {
            logService.consoleLog('no wydone, sending <w>');
            sendAndReceiveService.write('<w'+stepMotorNum+'>', checkDone);
          }, 250);
        }
        check();
      });
    }

    function checkDoneReceivedWydone() {
      addToLog('Movement done');
      addToLog($scope.movements[$scope.movementsNum].description);
      done = true;
      setButtons({'showSpinner':false, 'showHoming': true, 'showResetButton': false});
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
  };



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

  $scope.show = null;

  $scope.showAnswer = function(obj) {
    $scope.show = $scope.show === obj ? null : obj;
  };

  $scope.QAList = [];
  for (var i=1; i<11; i++) {
    $scope.QAList.push({
      question: 'Question '+i,
      answer: 'Lorem ipsum'
    })
  }

  $scope.showFullLog = function () {
    $scope.fullLog = $scope.bluetoothLog.slice(0,19);
    modalService
      .init('log-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  $scope.emailFullLog = function () {
    logModalService.emailFullLog();
  } ;

  $scope.fullLog = $scope.bluetoothLog.slice(0,19);

  $scope.fullLogPage = 0;

  $scope.getFullLogExtract = function(start, end) {
    logService.consoleLog('getFullLogExtract, start: '+start+' end: '+end);
    $scope.fullLog = $scope.bluetoothLog.slice(start, end)
  };

  $scope.previousFullLogPage = function () {
    logService.consoleLog('prevFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage-1)*10),(($scope.fullLogPage-1)*10)+9);
    $scope.fullLogPage -= 1;
  };

  $scope.nextFullLogPage = function () {
    logService.consoleLog('nextFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage+1)*10),(($scope.fullLogPage+1)*10)+9);
    $scope.fullLogPage += 1;
  };
}
