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

function bluetoothConnectedService($cordovaBluetoothSerial) {
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

export {bluetoothEnabledService, bluetoothConnectedService}
