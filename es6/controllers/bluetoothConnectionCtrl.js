export default function ($rootScope, $scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup, $ionicModal,
                         $state, $ionicPlatform, $window, statusService, logService,
                         buttonService, bluetoothService, $timeout,
                         logModalService, modalService, errorService) {

  //TODO connection lost timer
  //TODO add spinner on connecting
  $scope.availableDevices = [];
  $scope.pairedDevices = [];
  $scope.bluetoothLog = logService.getLog();
  $scope.bluetoothOn = function () {
    bluetoothService.turnOnBluetooth(function () {
      bluetoothService.getBluetoothEnabledValue(function (val) {
        $scope.bluetoothEnabled = val;
        if ($scope.bluetoothEnabled) $scope.getAvailableDevices();
      })
    });
  };
  bluetoothService.getBluetoothEnabledValue(function (val) {
    $scope.bluetoothEnabled = val;
  });
  $scope.deviceName= bluetoothService.getDeviceName();
  $scope.buttons = buttonService.getValues();
  $scope.isConnected = bluetoothService.getConnectedValue();

  function addToLog(str, isError) {
    logService.consoleLog(str);
    logService.addOne(str);
    $scope.bluetoothLog = logService.getLog();
    if (isError === true) {
      errorService.addError({level: 'critical', message: str});
    }
  }

  function setButtons(obj) {
    buttonService.setValues(obj);
    $scope.buttons = buttonService.getValues();
  }

  $scope.$on('$ionicView.enter', function () {
    $scope.availableDevices = [];
    $scope.pairedDevices = [];
    logService.consoleLog('enterView in bluetoothConnectionCtrl fired');
    $scope.bluetoothLog = logService.getLog();
    bluetoothService.getBluetoothEnabledValue(function (value) {
      $scope.bluetoothEnabled = value;
      logService.consoleLog('$scope.bluetoothEnabled: '+$scope.bluetoothEnabled);
    });
    $scope.deviceName= bluetoothService.getDeviceName();
    $scope.buttons = buttonService.getValues();
    bluetoothService.getConnectedValue(function (value) {
      $scope.isConnected = value;
      logService.consoleLog('$scope.isConnected: '+$scope.isConnected);
      if (!$scope.isConnected) {
        logService.consoleLog('connected false, calling getAvailableDevices');
        $scope.getAvailableDevices();
      }
    });
  });

  $scope.userDisconnect = function () {
    bluetoothService.disconnect();
    $scope.isConnected = false;
    $timeout(function () {
      $scope.getAvailableDevices();
    }, 500);

  };

  $scope.$on('$ionicView.leave', function () {
    logService.consoleLog('leaveView in bluetoothConnectionCtrl fired');
    logService.setBulk($scope.bluetoothLog);
  });

  $scope.noUnpairedDevices = false;

  $scope.getAvailableDevices = function () {
    $scope.availableDevices = [];
    $scope.pairedDevices = [];
    bluetoothService.getConnectedValue(function (value) {
      if (value === false) {
        $ionicPlatform.ready(function() {
          logService.consoleLog('Calling get available devices');
          if (ionic.Platform.isAndroid) {
            //discover unpaired
            addToLog('Searching for unpaired Bluetooth devices');
            $cordovaBluetoothSerial.discoverUnpaired().then(function (devices) {
              if (devices.length === 0) {
                $scope.noUnpairedDevices = true;
              }
              console.log('unpaired devices');
              console.log(devices);
              devices.forEach(function (device) {
                  $scope.availableDevices.push(device);
                  addToLog('Unpaired Bluetooth device found');
                }
              )}, function () {
              addToLog('Cannot find unpaired Bluetooth devices', true);
            });
            //discover paired
            $cordovaBluetoothSerial.list().then(function (devices) {
              addToLog('Searching for paired Bluetooth devices');
              devices.forEach(function (device) {
                $scope.pairedDevices.push(device);
                addToLog('Paired Bluetooth device found');
              })
            },function () {
              addToLog('Cannot find paired Bluetooth devices', true);
            })
          }
          else if (ionic.Platform.isIOS) {
            $cordovaBluetoothSerial.list().then(function (devices) {
              addToLog('Searching for Bluetooth devices');
              devices.forEach(function (device) {
                addToLog('Bluetooth device found');
                $scope.availableDevices.push(device);
              })
            }, function () {
              addToLog('No devices found', true);
            })
          }
        })
      }
    })
  };

  $scope.connectToUnpairedDevice = function ($index) {
    $ionicPlatform.ready(function() {
      addToLog('Trying to connect');
      logService.consoleLog('Id = '+$scope.availableDevices[$index].id);
      $cordovaBluetoothSerial.connectInsecure($scope.availableDevices[$index].id).then(function () {
        addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
        saveLastConnectedDevice($scope.availableDevices[$index].id, $scope.availableDevices[$index].name);
        bluetoothService.setDeviceName($scope.availableDevices[$index].name);
        $scope.isConnected = bluetoothService.getConnectedValue();
        bluetoothService.checkConnectionAliveInterval();
        // isConnectedService.getValue(function (val) {
        //   $timeout(function () {
        //     $scope.$apply(function () {
        //       $scope.isConnected = val;
        //     })
        //   }, 500);
        // });
      }, function (error) {
        //failure callback
        addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device', true);
        addToLog('error: '+error);
        $scope.isConnected = bluetoothService.getConnectedValue();
      })
    })
  };

  //TODO cleaner to move connecting to bluetoothService
  
  $scope.connectToPairedDevice = function ($index) {
    $ionicPlatform.ready(function() {
      addToLog('Trying to connect');
      logService.consoleLog('Id = '+$scope.pairedDevices[$index].id);
      $cordovaBluetoothSerial.connect($scope.pairedDevices[$index].id).then(function () {
        saveLastConnectedDevice($scope.pairedDevices[$index].id, $scope.pairedDevices[$index].name);
        bluetoothService.setDeviceName($scope.pairedDevices[$index].name);
        addToLog('Your smartphone has succesfully connected with the selected Bluetooth device');
        $scope.isConnected = bluetoothService.getConnectedValue();
        bluetoothService.checkConnectionAliveInterval();
        // isConnectedService.getValue(function (val) {
        //   $timeout(function () {
        //     $scope.$apply(function () {
        //       $scope.isConnected = val;
        //     })
        //   }, 500);
        //
        // });
      }, function (error) {
        addToLog('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device', true);
        addToLog('error: '+error);
      })
    })
  };

  function saveLastConnectedDevice(id, name) {
    var obj = {'id':id,'name':name};
    $scope.deviceName = name;
    window.localStorage.setItem('lastConnectedDevice', JSON.stringify(obj));
    logService.consoleLog('Local storage last connected device set to: '+window.localStorage['lastConnectedDevice']);
    showSavedDeviceAlert();
  }

  function showSavedDeviceAlert() {
    $ionicPopup.alert({
      title: 'Bluetooth device saved',
      template: 'This bluetooth device is saved and will connect automatically from now on.<br \>If you need to change your device later on choose a new device via Bluetooth connection in the menu',
      buttons: [{
        text: 'Go to program',
        type: 'button-calm',
        onTap: function () {
          $state.go('app.program')
        }
      },
        {
          text: 'Close'
        }
      ]
    })
  }

  $scope.openBluetoothSettings = function() {
    $cordovaBluetoothSerial.showBluetoothSettings();
  };

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
