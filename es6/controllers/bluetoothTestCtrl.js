export default function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                         $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram, skipService, buttonService, emergencyService,
                         bluetoothService, logService, calculateVarsService, sendAndReceiveService,
                         statusService, logModalService, modalService) {
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
    bluetoothService.disconnect();
    bluetoothService.getConnectedValue(function (val) {
      $scope.isConnected = val;
    })
  };

  function setButtons(obj) {
    buttonService.setValues(obj);
    $scope.buttons = buttonService.getValues();
    // $scope.$apply(function () {
    //   $scope.buttons = buttonService.getValues()
    // });
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
      emergencyService.on(function () {
        emergencyService.off();
      });
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
    sendKfault();
    rdy();
    rdy2();
    listen();
    newCommand();
    nextListener();
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
        var moveXMmSteps = $scope.numberOfTests.mm / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
        var moveXMmStepsCommand = '<s'+moveXMmSteps+stepMotorNum+'>';
        var position = commands.indexOf('<s0'+stepMotorNum+'>');
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
    logService.consoleLog('Commands in testCtrl -> sendSettings:');
    logService.consoleLog(commands);
    //send commands, except last one
    for (var i = 0; i < commands.length -1; i++){
      sendAndReceiveService.write(commands[i]);
    }
    //send last command on sendKfault notification
    sendKfault = $rootScope.$on('sendKfault', function () {
      sendAndReceiveService.write(commands[commands.length-1], function () {
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
          title: 'Moved '+$scope.numberOfTests.mm+' mm'
        });
        setButtons({'showStressTest': true, 'showVersionButton': true, 'showEmergency': false, 'showSpinner': false});
        calculateVarsService.getVars('test', function (obj) {
          logService.consoleLog('resetting commands in testCtrl');
          commands = obj.commands;
        });
      }
      else if (typeStr === 'stressTest') {
        addToLog('Executing tests');
        sentSettingsForTest = true;
        $scope.stressTest();
      }
    }
    else if (res.search('FAULT') > -1) {
      addToLog('Error sending moveXMmResponse, aborting current task & resetting');
      emergencyService.on(function () {
        emergencyService.off();
      })
    }
    else {
      $timeout(function () {
        sendAndReceiveService.write('<w'+stepMotorNum+'>');
        rdy2 = $rootScope.$on('bluetoothResponse', function (event, response) {
          checkRdy(response, typeStr);
          rdy2();
        })
      }, 200);
    }
  }

  //TODO tried to work with buffered commands, did not work, reverting back to one at a time
  $scope.stressTest = function () {
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

          //with 10 or less tests, send them all at once
          if (testsSent < $scope.numberOfTests.tests) {
            //Send a random command, true = create listener, function is executed as soon as wydone+commandID has come back
            $timeout(function () {
              send('<q'+Math.floor((Math.random()*1000)+20) +stepMotorNum+'>', sendNext);
            }, 150);
          }
        }
        else {
          addToLog('Emergency on, will not continue with stresstest');
        }
      }
    }
  };

  var nextListener;
  function sendNext() {
    nextListener = $rootScope.$on('bluetoothResponse', function (event, res) {
      if ($scope.numberOfTests.tests === testsSent && res.search('wydone')) {
        $scope.completedTest +=1;
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
        nextListener();
      }
      else if (res.search('wydone') > -1) {
        $scope.completedTest +=1;
        $scope.stressTest();
        nextListener();
      }
      else {
        $timeout(function () {
          sendAndReceiveService.write('<w'+stepMotorNum+'>', sendNext);
        }, 200);
        nextListener();
      }
    })
  }

  function send(str, cb) {
    if (str === undefined){
      $ionicPopup.alert({
        title: 'Encountered an error',
        template: 'Please email a bug report via \'Show full log\''
      })
    }
    if (statusService.getEmergency() === false) {
      //calling .write() with original command (str). callingFunction is optional.
      sendAndReceiveService.write(str);
      testsSent += 1;
      if (cb) cb();
    }
  }

  $scope.getVersion = function() {
    if (statusService.getEmergency() === false && statusService.getSending() === false){
      sendAndReceiveService.write('<<y8:y'+stepMotorNum+'>');
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
