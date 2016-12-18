export default function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                         $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                         bluetoothService, logService, calculateVarsService, sendAndReceiveService,
                         statusService, logModalService, modalService, $async) {

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

//other vars/commands
  var commands;
  $scope.settings = shareSettings.getObj();
  var stepMotorNum = $scope.settings.stepMotorNum;
  var softwareVersionCommand = '<z'+stepMotorNum+'>';
  $scope.bluetoothLog = logService.getLog();
  $scope.bluetoothEnabled = null;
  $scope.buttons = buttonService.getValues();
  $scope.retriesNeeded = 0;
  $scope.completedTest = 0;
  var sentSettingsForTest = false;
  $scope.numberOfTests = {};
  var testsSent = 0;
  $scope.testRunning = false;
  $scope.progress = 0;

  $scope.userDisconnect = function () {
    bluetoothService.disconnect();
    bluetoothService.getConnectedValue(function (val) {
      $scope.isConnected = val;
    })
  };

  function setButtons(obj) {
    buttonService.setValues(obj);
    $scope.buttons = buttonService.getValues();
    logService.consoleLog($scope.buttons);
  }

  $scope.$on('$ionicView.enter', function () {
    logService.consoleLog('enterView in testCtrl fired');
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
    calculateVarsService.getVars('test', function (obj) {
      commands = obj.commands;
      logService.consoleLog('testCommands:');
      logService.consoleLog(commands);
    });
    $scope.settings = shareSettings.getObj();
    stepMotorNum = $scope.settings.stepMotorNum;
  });

  $scope.$on('$ionicView.leave', function () {
    logService.consoleLog('leaveView in bluetoothConnectionCtrl fired');
    $scope.retriesNeeded = 0;
    $scope.completedTest = 0;
    sentSettingsForTest = false;
    $scope.numberOfTests = {};
    testsSent = 0;
    $scope.testRunning = false;
    if (statusService.getSending() === true ) {
      addToLog('Cancelling current tasks');
      emergencyService.on();
      emergencyService.off();
    }
    else {
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
  };

  $scope.emergencyOff = function () {
    logService.consoleLog('emergencyOff called');
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
        })
      }
      else {
        setButtons({'showStressTest': false, 'showVersionButton': false, 'showSpinner':true, 'showEmergency': true});

        //replace standard <s0+stepMotorNum> with moveXMmStepsCommand
        const moveXMmSteps = $scope.numberOfTests.mm / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
        const moveXMmStepsCommand = '<s'+moveXMmSteps+stepMotorNum+'>';
        // '<s0'+stepMotorNum+'>' = default, no need to change
        const commandIndex = commands.indexOf('<s0'+stepMotorNum+'>');
        commands[commandIndex] = moveXMmStepsCommand;
        sendSettings('moveXMm');
      }
    }
  };

  const sendSettings = $async(function* (type) {
    try {
      if (statusService.getEmergency() === false) {
        if (statusService.getSending() === false){
          setButtons({'showSpinner':true,'showEmergency':true, 'readyForData':false, 'showProgress': type === 'moveXMm'});
          statusService.setSending(true);

          for (let i = 0; i < commands.length; i++){
            console.log('going to await for command reply to command: '+commands[i]);
            let res = yield sendAndReceiveService.sendWithRetry(commands[i]);
            console.log('awaited reply for command: '+commands[i]+', i='+i+', response: '+res );

            //On last command, start check if settings have been sent correctly
            if (i === commands.length-1) {
              checkWydone(type);
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
      emergencyService.off();
    }
  });

  function checkWydone(type) {
    console.log('checkWydone');
    let timer = $interval(() => {
      sendAndReceiveService.writeAsync('<w'+stepMotorNum+'>');
    }, 250);

    let bluetoothResponseListener = $rootScope.$on('bluetoothResponse', (event, res) => {
      console.log('bluetoothResponseListener: '+res);
      updateProgress(res);
    });

    let wydoneListener = $rootScope.$on('wydone', (event, res) => {
      $interval.cancel(timer);
      bluetoothResponseListener();
      wydoneListener();

      if (type === 'moveXMm') {
        $ionicPopup.alert({
          title: 'Moved '+$scope.numberOfTests.mm+' mm'
        });
        setButtons({'showStressTest': true, 'showVersionButton': true, 'showEmergency': false, 'showSpinner': false, 'showProgress': false});
        $scope.progress = 0;
        calculateVarsService.getVars('test', function (obj) {
          logService.consoleLog('resetting commands in testCtrl');
          commands = obj.commands;
        });
        sentSettingsForTest = true;
      }
      else if (type === 'stressTest') {
        addToLog('Executing tests');
        sentSettingsForTest = true;
        $scope.stressTest();
      }
      else if (type === 'stressTestCommand') {
        $scope.completedTest += 1;
        $timeout(() => {
          $scope.stressTest();
        }, 300);
      }
    });

    $rootScope.$on('emergencyOn', () => {
      $interval.cancel(timer);
    })
  }

  function updateProgress(res) {
  //  <w1>-9999;90#
    if (res.search('<w') > -1 && res.search(';') > -1 && res.search('#') > -1) {
      $scope.progress = res.slice(res.search(';')+1, res.search('#'));
      console.log('progress: '+$scope.progress);
    }
  }

  $scope.stressTest = $async(function* () {
    if (statusService.getEmergency() === true) {
      addToLog('Emergency on, cancelling stresstest');
    }
    else if ($scope.numberOfTests.tests === undefined || $scope.numberOfTests.tests === 0) {
      $ionicPopup.alert({
        title: 'Please fill in the number of test commands'
      })
    }
    else {
      setButtons({'showEmergency': true, 'showResetButton': false, 'showStressTest': false, 'showVersionButton': false, 'showMoveXMm': false, 'showSpinner': true});
      $scope.testRunning = true;
      if (!sentSettingsForTest) {
        if (statusService.getEmergency() === false) {
          logService.consoleLog('numberOfTests:'+$scope.numberOfTests.tests);
          addToLog('Sending settings needed for testing');
          sendSettings('stressTest');
        }
      }
      else {
        if (statusService.getEmergency() === false) {
          statusService.setSending(true);
          setButtons({'showProgress': true});
          if (testsSent < $scope.numberOfTests.tests) {
            sendTestCommand();
          }
          else
            allTestsSent();
        }
        else {
          addToLog('Emergency on, will not continue with stresstest');
        }
      }
    }
  });

  //TODO debug this
  const sendTestCommand = $async(function* () {
    const command = '<q'+Math.floor((Math.random()*5000)+1000) +stepMotorNum+'>';
    try {
      testsSent += 1;
      yield sendAndReceiveService.sendWithRetry(command);
      console.log('sendwithRetry yielded');
      checkWydone('stressTestCommand');
    }
    catch (err) {
      addToLog('Command '+testsSent+' failed: '+err+', command: '+command);
      $scope.stressTest();
    }
  });

  function allTestsSent() {
    $ionicPopup.alert({
      title: 'Tests completed',
      template: 'Completed '+$scope.completedTest+' out of '+$scope.numberOfTests.tests
    });
    setButtons({'showEmergency':false, 'showSpinner': false, 'showStressTest':true, 'showVersionButton': true, 'showMoveXMm': true});
    $scope.testRunning = false;
    addToLog('Tests completed');
    logService.consoleLog('completed tests: '+$scope.completedTest+' number of tests: '+$scope.numberOfTests.tests+' sent tests: '+testsSent);
    sentSettingsForTest = false;
    statusService.setSending(false);
  }

  // var nextListener;
  // function sendNext() {
  //   nextListener = $rootScope.$on('bluetoothResponse', function (event, res) {
  //     if ($scope.numberOfTests.tests === testsSent && res.search('wydone')) {
  //       $scope.completedTest +=1;
  //       $ionicPopup.alert({
  //         title: 'Tests completed',
  //         template: 'Completed '+$scope.completedTest+' out of '+$scope.numberOfTests.tests
  //       });
  //       setButtons({'showEmergency':false, 'showSpinner': false, 'showStressTest':true, 'showVersionButton': true, 'showMoveXMm': true});
  //       $scope.testRunning = false;
  //       addToLog('Tests completed');
  //       logService.consoleLog('completed tests: '+$scope.completedTest+' number of tests: '+$scope.numberOfTests.tests+' sent tests: '+testsSent);
  //       sentSettingsForTest = false;
  //       statusService.setSending(false);
  //       nextListener();
  //     }
  //     else if (res.search('wydone') > -1) {
  //       $scope.completedTest +=1;
  //       $scope.stressTest();
  //       nextListener();
  //     }
  //     else {
  //       $timeout(function () {
  //         sendAndReceiveService.write('<w'+stepMotorNum+'>', sendNext);
  //       }, 200);
  //       nextListener();
  //     }
  //   })
  // }
  //
  // function send(str, cb) {
  //   if (str === undefined){
  //     $ionicPopup.alert({
  //       title: 'Encountered an error',
  //       template: 'Please email a bug report via \'Show full log\''
  //     })
  //   }
  //   if (statusService.getEmergency() === false) {
  //     //calling .write() with original command (str). callingFunction is optional.
  //     sendAndReceiveService.write(str);
  //     testsSent += 1;
  //     if (cb) cb();
  //   }
  // }

  $scope.getVersion = function() {
    if (statusService.getEmergency() === false && statusService.getSending() === false){
      sendAndReceiveService.write('<y8:y'+stepMotorNum+'>');
      sendAndReceiveService.write(softwareVersionCommand, function () {
        listen = $rootScope.$on('bluetoothResponse', function (event, res) {
          if (res.search('<14:') > -1) {
            $ionicPopup.alert({
              title: 'Version number',
              template: 'Your version number is: '+res.slice(res.lastIndexOf(':')+1,res.lastIndexOf('>'))
            });
            listen();
          }
        })
      });
    }
  };

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

  // $scope.show = null;
  //
  // $scope.showAnswer = function(obj) {
  //   $scope.show = $scope.show === obj ? null : obj;
  // };
  //
  // $scope.QAList = [];
  // for (var i=1; i<11; i++) {
  //   $scope.QAList.push({
  //     question: 'Question '+i,
  //     answer: 'Lorem ipsum'
  //   })
  // }

  $scope.showFullLog = function () {
    $scope.fullLog = $scope.bluetoothLog.slice(0,19);
    modalService
      .init('log-modal.html', $scope)
      .then(function (modal) {
        modal.show();
      })
  };

  // $scope.emailFullLog = function () {
  //   logModalService.emailFullLog();
  // } ;
  //
  // $scope.fullLog = $scope.bluetoothLog.slice(0,19);
  //
  // $scope.fullLogPage = 0;
  //
  // $scope.getFullLogExtract = function(start, end) {
  //   logService.consoleLog('getFullLogExtract, start: '+start+' end: '+end);
  //   $scope.fullLog = $scope.bluetoothLog.slice(start, end)
  // };
  //
  // $scope.previousFullLogPage = function () {
  //   logService.consoleLog('prevFullLogPage');
  //   $scope.getFullLogExtract((($scope.fullLogPage-1)*10),(($scope.fullLogPage-1)*10)+9);
  //   $scope.fullLogPage -= 1;
  // };
  //
  // $scope.nextFullLogPage = function () {
  //   logService.consoleLog('nextFullLogPage');
  //   $scope.getFullLogExtract((($scope.fullLogPage+1)*10),(($scope.fullLogPage+1)*10)+9);
  //   $scope.fullLogPage += 1;
  // };
}
