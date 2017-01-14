export default function ($rootScope, $scope, bluetoothService) {
  $scope.deviceName = bluetoothService.getDeviceName();

  bluetoothService.getBluetoothEnabledValue(function (val) {
    $scope.bluetoothEnabled = val;
  });

  bluetoothService.getConnectedValue(function (val) {
    $scope.isConnected = val;
  });

  $rootScope.$on('bluetoothValuesUpdated', function (event, valuesObj) {
    $scope.bluetoothEnabled = valuesObj.bluetoothEnabled;
    $scope.isConnected = valuesObj.isConnected;
    $scope.deviceName = valuesObj.deviceName;
  });

  $rootScope.$on('connectionLost', () => {
    $scope.isConnected = false;
  });
}
