let bluetoothServiceMock = {
  getBluetoothEnabledValue: function (cb) {
    cb(true);
  },
  getDeviceName: function () {
    return 'Device 1';
  },
  disconnect: function () {

  },
  openBluetoothSettings: function () {

  },
  getConnectedValue: function (cb) {
  if (cb)
    cb(false);
  else
    return false
  },
  connectToSelectedDevice: function () {
    return new Promise((resolve, reject) => {
      resolve();
    })
  },
  openBluetoothSettings: function () {

  }
};


function spyOnBluetoothServiceMock() {
  spyOn(bluetoothServiceMock, 'getBluetoothEnabledValue').and.callThrough();
  spyOn(bluetoothServiceMock, 'getDeviceName').and.callThrough();
  spyOn(bluetoothServiceMock, 'disconnect').and.callThrough();
  spyOn(bluetoothServiceMock, 'getConnectedValue').and.callThrough();
  spyOn(bluetoothServiceMock, 'connectToSelectedDevice').and.callThrough();
  spyOn(bluetoothServiceMock, 'openBluetoothSettings').and.callThrough();
}



export {bluetoothServiceMock, spyOnBluetoothServiceMock} ;

//TODO test this in CtrlTest
