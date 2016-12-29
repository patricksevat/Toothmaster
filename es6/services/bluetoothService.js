function bluetoothService(bugout, $cordovaBluetoothSerial, window, logService, shareSettings, buttonService,
                          $rootScope, $interval, $async) {
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

  let bluetoothEnabled, isConnected;
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

  self.connectWithRetry = $async(function* () {
    try {
      let lastConnectedDevice = JSON.parse(getLastConnectedDevice());
      isConnected = yield getConnectedPromise();
      bluetoothEnabled = yield getEnabledPromise();
      console.log('lastConnectedDevice: ');
      console.log(lastConnectedDevice);
      console.log('bluetoothEnabled: '+bluetoothEnabled);
      console.log('isConnected: '+isConnected);

      for (let i = 0; i < 5; i++) {
        console.log('connect with retry i: '+i);
        if (i === 4) {
          return new Promise((resolve, reject) => {
            reject();
          });
        }
        else if (lastConnectedDevice && bluetoothEnabled && !isConnected) {
          yield connectToSelectedDevice(lastConnectedDevice.id, lastConnectedDevice.name).then(() => {
            console.log('resolving connect with retry number: '+i);
            isConnected = true;
          }, (err) => {
            console.log('continuing connect with retry after fail to connect, err: '+err);
            isConnected = false;
          });
          console.log('yielded connect with retry number: '+i);
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
    if (connectionAlive) {
      $interval.cancel(connectionAlive);
      console.log('canceled interval')
    }

  }

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
