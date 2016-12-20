const cordovaBluetoothSerialMock = {
  discoverUnpaired: function () {
    return new Promise((resolve, reject) => {
      resolve([])
    })
  },
  list: function () {
    return new Promise((resolve, reject) => {
      resolve([])
    })
  }
};

const spyOnCordovaBluetoothSerialMock = () => {
  spyOn(cordovaBluetoothSerialMock, 'discoverUnpaired').and.callThrough();
  spyOn(cordovaBluetoothSerialMock, 'list').and.callThrough();
};

export {cordovaBluetoothSerialMock, spyOnCordovaBluetoothSerialMock};
