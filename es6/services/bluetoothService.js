function bluetoothEnabledService(bugout, $cordovaBluetoothSerial) {
  const bluetoothEnabled = this;
  bluetoothEnabled.getValue = getValue;

  function getValue(cb) {
    $cordovaBluetoothSerial.isEnabled().then(function () {
      bluetoothEnabled.value = true;
      bugout.bugout.log('checkBluetoothEnabledService.value ='+bluetoothEnabled.value);
      if (cb) cb(bluetoothEnabled.value);
      else return bluetoothEnabled.value;
    }, function () {
      bluetoothEnabled.value = false;
      bugout.bugout.log('checkBluetoothEnabledService.value ='+bluetoothEnabled.value);
      if (cb) cb(bluetoothEnabled.value);
      else return bluetoothEnabled.value;
    })
  }
}

function bluetoothConnectedService(bugout, $cordovaBluetoothSerial) {
  const isConnected = this;
  isConnected.getValue = getValue;

  function getValue(cb) {
    $cordovaBluetoothSerial.isConnected().then(function () {
      isConnected.value = true;
      bugout.bugout.log('isConnectedService.value ='+isConnected.value);
      return isConnected.value;
    }, function () {
      isConnected.value = false;
      bugout.bugout.log('isConnectedService.value ='+isConnected.value);
      return isConnected.value;
    }).then(function () {
      if (cb) cb(isConnected.value)
    })
  }
}

function bluetoothConnectedToDeviceService(isConnectedService, logService, checkBluetoothEnabledService, buttonService, $rootScope, $timeout, $window, bugout) {
  const connect = this;
  connect.getDeviceName = getDeviceName;
  connect.setDeviceName = setDeviceName;
  connect.connectToLastDevice = connectToLastDevice;

  let retry = 1;
  let deviceName = '';

  $rootScope.$on('emergencyOff', function () {
    retry = 1;
  });

  function getDeviceName(cb) {
    if (cb) cb(deviceName);
    else return deviceName;
  }

  function setDeviceName(str) {
    deviceName = str;
  }

  function connectToLastDevice(bluetoothOnVal, cb) {
    let bluetoothOn;
    if (bluetoothOnVal === undefined) {
      checkBluetoothEnabledService.getValue(function (value) {
        bluetoothOn = value;
        valueRetrieved(cb);
      });
    }
    else {
      bluetoothOn = bluetoothOnVal;
      valueRetrieved(cb);
    }
    logService.addOne('Trying to connect with last known device');
  }

  function connectWithRetry() {
    bugout.bugout.log('connectWithRetry called in connectService');
    let isConnected;
    let bluetoothOn;
    isConnectedService.getValue(function (value) {
      isConnected = value;
      checkBluetoothEnabledService.getValue(function (value) {
        bluetoothOn = value;
        valuesRetrieved(bluetoothOn, isConnected);
      });
    });
  }

  function valuesRetrieved(bluetoothOn, isConnected) {
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

  function valueRetrieved(cb) {
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
}

function turnOnBluetoothService($cordovaBluetoothSerial, checkBluetoothEnabledService, logService) {
  const turnOnBluetooth = this;
  turnOnBluetooth.turnOn = turnOn;

  function turnOn(cb) {
    $cordovaBluetoothSerial.enable().then(function () {
      logService.addOne('Bluetooth has been turned on by Toothmaster app');
      if (cb) cb();
    }, function (){
      $cordovaBluetoothSerial.showBluetoothSettings();
      logService.addOne('Bluetooth should be turned on manually, redirected to Bluetooth settings');
    })
  }
}

function disconnectService($cordovaBluetoothSerial, logService, buttonService, isConnectedService, $window, connectToDeviceService, shareSettings, bugout) {
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
}

export {bluetoothEnabledService, bluetoothConnectedService, bluetoothConnectedToDeviceService, turnOnBluetoothService,
  disconnectService}
