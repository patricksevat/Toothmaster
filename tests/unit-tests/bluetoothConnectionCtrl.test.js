describe('bluetoothConnectionCtrl', () => {
  let controller,
    $scope,
      cordovaClipboardMock,
      cordovaBluetoothSerialMock = {},
      ionicPopupMock,
      ionicModalMock,
      stateMock,
      ionicPlatformMock,
      window,
      statusServiceMock,
      logServiceMock,
      buttonServiceMock,
      bluetoothServiceMock,
      logModalServiceMock,
      modalServiceMock,
      errorServiceMock,
      ionicLoadingMock;

  beforeEach(module('Toothmaster'));


  beforeEach(inject(function($controller, _$rootScope_, $window, _$timeout_) {
    $scope = _$rootScope_.$new();
    cordovaClipboardMock = {};
    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert']);
    ionicModalMock = jasmine.createSpyObj('$ionicModal spy', ['']);
    stateMock = jasmine.createSpyObj('$state spy', ['go']);
    logServiceMock = jasmine.createSpyObj('logService spy', ['getLog', 'consoleLog', 'addOne']);
    bluetoothServiceMock = jasmine.createSpyObj('bluetoothService spy', ['getBluetoothEnabledValue',
      'getDeviceName']);
    bluetoothServiceMock.getConnectedValue = function (cb) {
      if (cb)
        cb(false);
      else
        return false
    };
    spyOn(bluetoothServiceMock, 'getConnectedValue').and.callThrough();
    buttonServiceMock= jasmine.createSpyObj('$state spy', ['getValues']);
    ionicPlatformMock = {
      ready: function (cb) {
        cb();
      }
    };
    cordovaBluetoothSerialMock = {
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

    $window.ionic.Platform.isAndroid = true;
    spyOn($window.ionic.Platform, 'isAndroid').and.returnValue(true);

    createController = function (overrideObj, evalArr) {
      if (evalArr && Array.isArray(evalArr) && evalArr.length > 0) {
        evalArr.forEach((statement) => {
          eval(statement);
        })
      }

      function undef(attrName) {
        if (typeof overrideObj === 'undefined') {
          return true;
        }

        console.log(attrName+' '+typeof overrideObj[attrName] === 'undefined');
        return typeof overrideObj[attrName] === 'undefined';
      }

      return $controller('bluetoothConnectionCtrl', {
        $rootScope: _$rootScope_,
        $scope: undef('scope') ? $scope : overrideObj['$scope'],
        $cordovaClipboard: cordovaClipboardMock,
        $cordovaBluetoothSerial: undef('cordovaBluetoothSerialMock') ? cordovaBluetoothSerialMock : overrideObj['cordovaBluetoothSerialMock'],
        $ionicPopup: ionicPopupMock,
        $ionicModal: ionicModalMock,
        $state: stateMock,
        $ionicPlatform: ionicPlatformMock,
        $window: $window,
        statusService: statusServiceMock,
        logService: logServiceMock,
        buttonService: buttonServiceMock,
        bluetoothService: bluetoothServiceMock,
        $timeout: _$timeout_,
        logModalService: logModalServiceMock,
        modalService: modalServiceMock,
        errorService: errorServiceMock,
        $ionicLoading: ionicLoadingMock
      })
    }
  }));

  describe('getAvailableDevices', () => {
    beforeEach(inject(function (_$rootScope_) {
      $rootScope = _$rootScope_;
    }));

    describe('Correct functions are called', () => {
      beforeEach(inject(function () {
        spyOn(cordovaBluetoothSerialMock, 'discoverUnpaired').and.callThrough();
        spyOn(cordovaBluetoothSerialMock, 'list').and.callThrough();
        createController();
        $scope.getAvailableDevices();
      }));

      it('should have scope defined', function() {
        expect($scope).toBeDefined();
      });

      it('platform should be Android', () => {
        console.log('ionic.Platform.isAndroid: '+ionic.Platform.isAndroid);
        expect(ionic.Platform.isAndroid()).toBe(true);
      });

      it('should call bluetoothService.getConnectedValue', () => {
        expect(bluetoothServiceMock.getConnectedValue).toHaveBeenCalled();
      });

      it('should call cordovaBluetoothSerial.discoverUnpaired', () => {
        expect(cordovaBluetoothSerialMock.discoverUnpaired).toHaveBeenCalled();
      });

      it('should call cordovaBluetoothSerial.list (paired devices)', () => {
        expect(cordovaBluetoothSerialMock.list).toHaveBeenCalled();
      });
    });

    describe('When devices are being discovered', () => {
      describe('When no devices are available on Android:', () => {
        beforeEach(function (done) {
          inject(function () {
            createController();
            $scope.getAvailableDevices();
            setTimeout(() => {
              console.log('noUnpairedDevices: '+$scope.noUnpairedDevices);
              done();
            }, 500);
          })
        });

        it('Unpaired devices & paired devices length should be 0', (done) => {
          expect($scope.availableDevices.length).toBe(0);
          expect($scope.noUnpairedDevices).toBe(true);
          expect($scope.pairedDevices.length).toBe(0);
          done();
        })
      });

      describe('When there are devices available on Android', () => {
        beforeEach(function (done) {
          inject(function () {
            const override = {
              cordovaBluetoothSerialMock: {
                discoverUnpaired: function () {
                  return new Promise((resolve, reject) => {
                    resolve([{id: '1', name: 'Device 1'}, {id: '2', name: 'Device 2'}, {id: '3', name: 'Device 3'}])
                  })
                },
                list: function () {
                  return new Promise((resolve, reject) => {
                    resolve([{id: '1', name: 'Device 1'}, {id: '2', name: 'Device 2'}, {id: '3', name: 'Device 3'}])
                  })
                }
              }
            };
            createController(override);
            $scope.getAvailableDevices();
            setTimeout(() => {
              done()
            }, 500);
          })
        });

        it('Should show 3 unpaired devices and 3 paired devices', (done) => {
          expect($scope.availableDevices.length).toBe(3);
          expect($scope.availableDevices[1].name).toBe('Device 2');
          expect($scope.pairedDevices.length).toBe(3);
          expect($scope.pairedDevices[1].name).toBe('Device 2');
          expect($scope.noUnpairedDevices).toBe(false);
          done();
        })
      });

      describe('On iOS', () => {

      })

    })
  });

  describe('connectToDevice', () => {

  })
});
