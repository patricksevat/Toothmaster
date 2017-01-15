function bluetoothService(bugout, $cordovaBluetoothSerial, window, logService, shareSettings, buttonService,
                          $rootScope, $interval, $async, statusService, emergencyService) {
  const self = this;

  //
  //service public methods
  //

  this.getEnabledPromise = getEnabledPromise;
  this.getConnectedPromise = getConnectedPromise;
  this.getBluetoothEnabledValue = getBluetoothEnabledValue;
  this.getConnectedValue = getConnectedValue;
  this.getDeviceName = getDeviceName;
  this.setDeviceName = setDeviceName;
  // this.connectToLastDevice = connectToLastDevice;
  this.connectToSelectedDevice = connectToSelectedDevice;
  this.turnOnBluetooth = turnOn;
  this.disconnect = disconnect;
  this.checkConnectionAliveInterval = checkConnectionAliveInterval;
  this.openBluetoothSettings = openBluetoothSettings;

  //
  //service scope vars
  //
  let valuesChanged = false;
  let bluetoothEnabled;
  let isConnected;
  let retry = 1;
  let deviceName = '';

  function getEnabledPromise() {
    return new Promise((resolve, reject) => {
      getBluetoothEnabledValue(function (value) {
        resolve(value);
      })
    })
  }

  function getConnectedPromise() {
    return new Promise((resolve, reject) => {
      getConnectedValue(function (value) {
        resolve(value);
      })
    })
  }

  function getBluetoothEnabledValue(cb, skipLog) {
    $cordovaBluetoothSerial.isEnabled().then(function () {
      if (!bluetoothEnabled) {
        valuesChanged = true;
      }

      bluetoothEnabled = true;
      bluetoothDisabledBoolean = false;

      emitValues();

      if (cb)
        cb(bluetoothEnabled);
      else
        return bluetoothEnabled;

    }, function () {
      if (bluetoothEnabled) {
        valuesChanged = true;
      }

      bluetoothEnabled = false;
      emitValues();

      if (!skipLog)
        bugout.bugout.log('checkBluetoothEnabledService.value ='+bluetoothEnabled);

      if (cb) cb(bluetoothEnabled);
      else return bluetoothEnabled;
    })
  }

  function getConnectedValue(cb) {
    $cordovaBluetoothSerial.isConnected().then(function () {
      if (!isConnected) {
        valuesChanged = true;
      }

      isConnected = true;
      emitValues();
      return isConnected;
    }, function () {
      if (isConnected) {
        valuesChanged = true;
      }

      isConnected = false;
      emitValues();
      bugout.bugout.log('getConnectedValue ='+isConnected);
      return isConnected;
    }).then(function () {
      if (cb) cb(isConnected)
    })
  }

  function emitValues() {
    if (valuesChanged) {
      console.log('Values changed. bluetoothEnabled: '+bluetoothEnabled+', isConnected: '+isConnected);
      valuesChanged = false;
    }

    $rootScope.$emit('bluetoothValuesUpdated', {
      isConnected,
      bluetoothEnabled,
      deviceName
    });
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
        console.log('connecting to selected device: '+deviceName+' '+deviceID);
        $rootScope.$emit('connectedToDevice');
        saveLastConnectedDevice(deviceID, deviceName);
        setDeviceName(deviceName);
        checkConnectionAliveInterval();
        resolve();
      }, function (error) {
        reject(error);
      })
    })
  }

  self.connectWithRetry = $async(function* () {
    try {
      bugout.bugout.log('connect with retry called, reconnecting with lastConnectedDevice');
      let lastConnectedDevice = JSON.parse(getLastConnectedDevice());
      isConnected = yield getConnectedPromise();
      bluetoothEnabled = yield getEnabledPromise();
      bugout.bugout.log('lastConnectedDevice: ');
      bugout.bugout.log(lastConnectedDevice);
      bugout.bugout.log('bluetoothEnabled: '+bluetoothEnabled);
      bugout.bugout.log('isConnected: '+isConnected);

      if (!bluetoothEnabled) {
        bugout.bugout.log('bluetooth disabled, canceling connectWithRetry');
        return new Promise.reject();
      }

      if (isConnected) {
        bugout.bugout.log('already connected, canceling connectWithRetry');
        return new Promise.reject();
      }

      for (let i = 0; i < 5; i++) {
        bugout.bugout.log('connect with retry i: '+i);
        if (i === 4) {
          return new Promise((resolve, reject) => {
            reject();
          });
        }
        else if (lastConnectedDevice && bluetoothEnabled && !isConnected) {
          yield connectToSelectedDevice(lastConnectedDevice.id, lastConnectedDevice.name).then(() => {
            bugout.bugout.log('resolving connect with retry number: '+i);
            logService.addOne('Connected to your last connected device ('+lastConnectedDevice.name+') on start-up');
            isConnected = true;
          }, (err) => {
            bugout.bugout.log('continuing connect with retry after fail to connect, err: '+err);
            isConnected = false;
          });
          bugout.bugout.log('yielded connect with retry number: '+i);
        }

        if (isConnected)
          break;
      }
    }
    catch (err) {
      return new Promise((resolve, reject) => {
        reject(err);
      })
    }
  });

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
    let stepMotorNum = shareSettings.getObj().stepMotorNum;
    stepMotorNum = stepMotorNum === null ? '0' : stepMotorNum;

    cancelConnectionAliveInterval();
    $cordovaBluetoothSerial.write('<y8:y'+stepMotorNum+'>').then(function () {
      $cordovaBluetoothSerial.disconnect(function () {
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

  function openBluetoothSettings() {
    $cordovaBluetoothSerial.showBluetoothSettings();
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
    bugout.bugout.log('checkConnectionAliveInterval initiated');
    connectionAlive = $interval(() => {
      getConnectedValue(function (connected) {
        if (!connected) {
          bugout.bugout.log('connection lost from interval');
          $rootScope.$emit('connectionLost');
          $interval.cancel(connectionAlive);
          if (statusService.getSending() === true) {
            logService.addOne('Lost connection while sending, turning on emergency', true);
            emergencyService.on();
          }
        }
      }, true);
    }, 1000);
  }

  function cancelConnectionAliveInterval() {
    if (connectionAlive) {
      $interval.cancel(connectionAlive);
      bugout.bugout.log('canceled connectionAliveInterval')
    }
  }

  //TODO cancel this interval when called, reinitiate when bluetooth is turned on, use getBluetoothEnabledValue

  let bluetoothDisabledBoolean = false;

  let bluetoothEnabledInterval = $interval(() => {
    getBluetoothEnabledValue(function (enabled) {
      if (!enabled && !bluetoothDisabledBoolean) {
        bluetoothDisabledBoolean = true;
        bugout.bugout.log('bluetooth disabled from interval');
        if (statusService.getSending() === true) {
          logService.addOne('Bluetooth disabled while sending, turning on emergency', true);
          emergencyService.on();
        }
      }
    }, true)
  }, 1000);

  // function checkBluetoothEnabledInterval() {
  //   bluetoothEnabledInterval = $interval(() => {
  //     getBluetoothEnabledValue(function (enabled) {
  //       if (!enabled) {
  //         // bugout.bugout.log('bluetooth disabled from interval');
  //         if (statusService.getSending() === true) {
  //           logService.addOne('Bluetooth disabled while sending, turning on emergency', true);
  //           emergencyService.on();
  //         }
  //       }
  //     }, true)
  //   }, 1000);
  // }
  //
  // function cancelBluetoothEnabledInterval() {
  //   if (bluetoothEnabledInterval) {
  //     $interval.cancel(bluetoothEnabledInterval);
  //     bugout.bugout.log('canceled bluetoothEnabledInterval');
  //   }
  // }

  //
  //  Helpers
  //

  function saveLastConnectedDevice(id, name) {
    const obj = {'id':id,'name':name};
    window.localStorage.setItem('lastConnectedDevice', JSON.stringify(obj));
    logService.consoleLog('Local storage last connected device set to: '+window.localStorage['lastConnectedDevice']);
  }

  function getLastConnectedDevice() {
    if (window.localStorage['lastConnectedDevice'] !== '' && window.localStorage['lastConnectedDevice'] !== undefined)
      return window.localStorage['lastConnectedDevice'];
    else
      return null;
  }

}

export { bluetoothService}
