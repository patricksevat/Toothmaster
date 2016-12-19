let bluetoothServiceMock = jasmine.createSpyObj('bluetoothService spy', ['getBluetoothEnabledValue',
  'getDeviceName', 'disconnect', 'openBluetoothSettings']);

bluetoothServiceMock.getConnectedValue = function (cb) {
  if (cb)
    cb(false);
  else
    return false
};

spyOn(bluetoothServiceMock, 'getConnectedValue').and.callThrough();

spyOn(bluetoothServiceMock, 'getConnectedValue').and.callThrough();

bluetoothServiceMock.connectToSelectedDevice = function (deviceID, deviceName) {
  return new Promise((resolve, reject) => {
    resolve();
  })
};
spyOn(bluetoothServiceMock, 'connectToSelectedDevice').and.callThrough();

export default bluetoothServiceMock;

//TODO test this in CtrlTest
