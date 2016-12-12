function bluetoothService(bugout, $cordovaBluetoothSerial, window, logService, shareSettings, buttonService,
                          $rootScope, $interval) {
  const self = this;

  //
  //service public methods
  //

  this.getBluetoothEnabledValue = getBluetoothEnabledValue;
  this.getConnectedValue = getConnectedValue;
  this.getDeviceName = getDeviceName;
  this.setDeviceName = setDeviceName;
  this.connectToLastDevice = connectToLastDevice;
  this.connectToSelectedDevice = connectToSelectedDevice;
  this.connectWithRetry = connectWithRetry;
  this.turnOnBluetooth = turnOn;
  this.disconnect = disconnect;
  this.checkConnectionAliveInterval = checkConnectionAliveInterval;

  //
  //service scope vars
  //

  let bluetoothEnabled, isConnected;
  let retry = 1;
  let deviceName = '';


  function getBluetoothEnabledValue(cb) {
    $cordovaBluetoothSerial.isEnabled().then(function () {
      bluetoothEnabled = true;
      bugout.bugout.log('checkBluetoothEnabledService.value ='+bluetoothEnabled);
      if (cb) cb(bluetoothEnabled);
      else return bluetoothEnabled;
    }, function () {
      bluetoothEnabled = false;
      bugout.bugout.log('checkBluetoothEnabledService.value ='+bluetoothEnabled);
      if (cb) cb(bluetoothEnabled);
      else return bluetoothEnabled;
    })
  }

  function getConnectedValue(cb) {
    $cordovaBluetoothSerial.isConnected().then(function () {
      isConnected = true;
      // bugout.bugout.log('getConnectedValue ='+isConnected);
      return isConnected;
    }, function () {
      isConnected = false;
      bugout.bugout.log('getConnectedValue ='+isConnected);
      return isConnected;
    }).then(function () {
      if (cb) cb(isConnected)
    })
  }

  function getDeviceName() {
    return deviceName;
  }

  function setDeviceName(str) {
    deviceName = str;
  }

  function connectToSelectedDevice(deviceID, deviceName) {
    return new Promise((resolve, reject) => {
      $cordovaBluetoothSerial.connect(deviceID).then(function () {
        saveLastConnectedDevice(deviceID, deviceName);
        setDeviceName(deviceName);
        checkConnectionAliveInterval();
        resolve();
      }, function (error) {
        reject(error);
      })
    })
  }

  function connectToLastDevice(bluetoothOnVal, cb) {
    let bluetoothOn;
    if (bluetoothOnVal === undefined) {
      self.getBluetoothEnabledValue(function (value) {
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

  //TODO refactor connect process into something more logical
  function connectWithRetry() {
    bugout.bugout.log('connectWithRetry called in connectService');
    getConnectedValue(function (value) {
      isConnected = value;
      getBluetoothEnabledValue(function (value) {
        bluetoothEnabled = value;
        valuesRetrieved(bluetoothEnabled, isConnected);
      });
    });
  }

  function turnOn(cb) {
    $cordovaBluetoothSerial.enable().then(function () {
      logService.addOne('Bluetooth has been turned on by Toothmaster app');
      if (cb) cb();
    }, function (){
      $cordovaBluetoothSerial.showBluetoothSettings();
      logService.addOne('Bluetooth should be turned on manually, redirected to Bluetooth settings');
    })
  }

  function disconnect() {
    const stepMotorNum = shareSettings.getObj().stepMotorNum;
    $cordovaBluetoothSerial.write('<y8:y'+stepMotorNum+'>').then(function () {
      $window.bluetoothSerial.disconnect(function () {
        cancelConnectionAliveInterval();
        logService.addOne('User disconnected');
        setDeviceName('');
        buttonService.setValues({'showCalcButton':false});
        getConnectedValue();
      }, function () {
        bugout.bugout.log('User could not disconnect');
        logService.addOne('Could not disconnect from device', true, 'warning');
      })
    });
  }

  //
  //Listeners
  //

  $rootScope.$on('emergencyOff', function () {
    retry = 1;
  });

  //
  //Emitters
  //
  
  let connectionAlive = null;

  function checkConnectionAliveInterval() {
    console.log('interval initiated');
    connectionAlive = $interval(() => {
      getConnectedValue(function (connected) {
        if (!connected) {
          console.log('connection lost from interval');
          $rootScope.$emit('connectionLost');
          $interval.cancel(connectionAlive);
          console.log('\nshould be null: connectionAlive: ');
          console.log(connectionAlive);
        }
      })
    }, 1000);
  }

  function cancelConnectionAliveInterval() {
    if (connectionAlive)
      $interval.cancel(connectionAlive)
  }

  //
  //  Helpers
  //

  function saveLastConnectedDevice(id, name) {
    var obj = {'id':id,'name':name};
    // $scope.deviceName = name;
    window.localStorage.setItem('lastConnectedDevice', JSON.stringify(obj));
    logService.consoleLog('Local storage last connected device set to: '+window.localStorage['lastConnectedDevice']);
    // showSavedDeviceAlert();
  }

  function valuesRetrieved(bluetoothOn, isConnected) {
    if (bluetoothOn && !isConnected) {
      bugout.bugout.log('connectWithRetry bluetoothOn & !isConnected');
      connectToLastDevice(bluetoothOn, function () {
        getConnectedValue(function (value) {
          isConnected = value;
        });
        if (!isConnected && retry < 6) {
          bugout.bugout.log('retry connectToLastDevice');
          $timeout(function () {
            retry += 1;
            bugout.bugout.log('Connect with retry, try: '+retry);
            connectWithRetry();
          }, 500)
        }
        else if (isConnected) {
          retry = 1;
        }
        else if (!isConnected && retry >= 6) {
          logService.addOne('Could not connect with last known device, please make sure that device is turned on. If so, turn off your phone\'s Bluetooth and restart the app', true );
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
        setDeviceName(obj.name);
        logService.addOne('Succesfully connected to last connected device');
        checkConnectionAliveInterval();
        if (cb) cb();
      }, function () {
        bugout.bugout.log('could not connect to last connected device');
        console.log('could not connect to device or connection to device lost');
        if (cb) cb();
      })
    }
  }

}

export { bluetoothService}
