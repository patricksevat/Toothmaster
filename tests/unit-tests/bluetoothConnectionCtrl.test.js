
import {bluetoothServiceMock, spyOnBluetoothServiceMock} from '../../es6/services/mocks/bluetoothServiceMock'

describe('bluetoothConnectionCtrl', () => {
  let createController,
    $rootScope,
    $scope,
    cordovaClipboardMock,
    cordovaBluetoothSerialMock = {},
    ionicPopupMock,
    ionicModalMock,
    stateMock,
    ionicPlatformMock,
    statusServiceMock,
    logServiceMock,
    buttonServiceMock,
    $timeout,
    logModalServiceMock,
    modalServiceMock,
    errorServiceMock,
    ionicLoadingMock;

  beforeEach(angular.mock.module('toothmasterControllers'));


  beforeEach(inject(function($controller, _$rootScope_, $window, _$timeout_) {
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    cordovaClipboardMock = {};
    ionicPopupMock = jasmine.createSpyObj('$ionicPopup spy', ['alert']);
    ionicModalMock = jasmine.createSpyObj('$ionicModal spy', ['']);
    stateMock = jasmine.createSpyObj('$state spy', ['go']);
    logServiceMock = jasmine.createSpyObj('logService spy', ['getLog', 'consoleLog', 'addOne', 'setBulk']);
    spyOnBluetoothServiceMock();
    modalServiceMock = jasmine.createSpyObj('$state spy', ['init']);
    modalServiceMock.init = function () {
      return Promise.resolve();
    };
    spyOn(modalServiceMock, 'init').and.callThrough();

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
    spyOn(cordovaBluetoothSerialMock, 'discoverUnpaired').and.callThrough();
    spyOn(cordovaBluetoothSerialMock, 'list').and.callThrough();

    ionicLoadingMock = jasmine.createSpyObj('ionicLoading spy', ['show', 'hide']);

    errorServiceMock = jasmine.createSpyObj('errorService spy', ['addError']);

    createController = function (overrideObj, evalArr) {
      console.log('override: ');
      console.log(overrideObj);
      if (evalArr && evalArr.length > 0) {
        evalArr.forEach((statement) => {
          eval(statement);
          console.log('eval: '+statement)
        })
      }

      function override(attrName, defaultValue) {
        if (typeof overrideObj === 'undefined') {
          return defaultValue;
        }

        if (typeof overrideObj[attrName] === 'undefined')
          return defaultValue;
        else {
          for (let subAttr in overrideObj[attrName]) {
            if (overrideObj[attrName].hasOwnProperty(subAttr))
              defaultValue[subAttr] = overrideObj[attrName][subAttr];
          }
          return defaultValue;
        }
      }

      return $controller('bluetoothConnectionCtrl', {
        $rootScope: $rootScope,
        $scope: override('scope', $scope),
        $cordovaClipboard: override('cordovaClipboardMock', cordovaClipboardMock ),
        $cordovaBluetoothSerial: override('cordovaBluetoothSerialMock', cordovaBluetoothSerialMock),
        $ionicPopup: override('ionicPopupMock', ionicPopupMock),
        $ionicModal: override('ionicModalMock', ionicModalMock),
        $state: override('stateMock', stateMock),
        $ionicPlatform: override('ionicPlatformMock', ionicPlatformMock),
        $window: override('$window', $window),
        statusService: override('statusServiceMock', statusServiceMock),
        logService: override('logServiceMock', logServiceMock),
        buttonService: override('buttonServiceMock', buttonServiceMock),
        bluetoothService: override('bluetoothServiceMock', bluetoothServiceMock),
        $timeout: $timeout,
        logModalService: override('logModalServiceMock', logModalServiceMock),
        modalService: override('modalServiceMock', modalServiceMock),
        errorService: override('errorServiceMock', errorServiceMock),
        $ionicLoading: override('ionicLoadingMock', ionicLoadingMock)
      })
    }
  }));

  describe('getAvailableDevices', () => {
    describe('Correct functions are called', () => {
      beforeEach(inject(function () {
        createController(undefined, ['spyOn($window.ionic.Platform, \'isAndroid\').and.returnValue(true)']);
        $scope.getAvailableDevices();
      }));

      it('should have scope defined', function() {
        expect($scope).toBeDefined();
      });

      it('platform should be Android', () => {
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
      describe('On android:', () => {
        describe('No available devices', () => {
          beforeEach(function (done) {
            inject(function () {
              createController(undefined, ['spyOn($window.ionic.Platform, \'isAndroid\').and.returnValue(true)']);
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

        describe('With available devices', () => {
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
              createController(override, ['spyOn($window.ionic.Platform, \'isAndroid\').and.returnValue(true)']);
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
      });


      describe('On iOS', () => {
        describe('No available devices', () => {
          beforeEach(function (done) {
            inject(function () {
              createController(undefined, ['spyOn($window.ionic.Platform, \'isAndroid\').and.returnValue(false)',
                'spyOn($window.ionic.Platform, \'isIOS\').and.returnValue(true)']);
              $scope.getAvailableDevices();
              setTimeout(() => {
                done();
              }, 200);
            })
          });

          it('platform is iOS', ()=> {
            expect(ionic.Platform.isIOS()).toBe(true);
            expect(ionic.Platform.isAndroid()).toBe(false);
          });

          it('Correct functions should be called', () => {
            expect(cordovaBluetoothSerialMock.discoverUnpaired).not.toHaveBeenCalled();
            expect(cordovaBluetoothSerialMock.list).toHaveBeenCalled();
          });

          it('Available devices.length should be 0', () => {
            expect($scope.availableDevices.length).toBe(0);
          })
        });

        describe('With available devices', () => {
          beforeEach(function (done) {
            inject(function () {
              const override = {
                cordovaBluetoothSerialMock: {
                  list: function () {
                    return new Promise((resolve, reject) => {
                      resolve([{id: '1', name: 'Device 1'}, {id: '2', name: 'Device 2'}, {id: '3', name: 'Device 3'}])
                    })
                  }
                }
              };
              createController(override, ['spyOn($window.ionic.Platform, \'isAndroid\').and.returnValue(false)',
                'spyOn($window.ionic.Platform, \'isIOS\').and.returnValue(true)']);
              $scope.getAvailableDevices();
              setTimeout(() => {
                done();
                console.log('ionic.Platform.isAndroid: '+ionic.Platform.isAndroid+'\nionic.Platform.isIOS: '+ionic.Platform.isIOS);
              }, 200);
            })
          });

          it('Available devices.length should be 3', () => {
            expect($scope.availableDevices.length).toBe(3);
          })
        })
      })

    })
  });

  describe('connectToDevice', () => {
    describe('Succesful connect', () => {
      beforeEach(function () {
        inject(function () {
          const override = {
            bluetoothServiceMock: {
              getConnectedValue: function (cb) {
                if (cb)
                  cb(true);
                else
                  return true
              }
            }
          };
          createController(override);
          spyOn(bluetoothServiceMock, 'getConnectedValue').and.callThrough();
          spyOn($scope, 'connectToUnpairedDevice').and.callThrough();
          spyOn($scope, 'connectToPairedDevice').and.callThrough();
          $scope.availableDevices = [{id: '1', name: 'Device 1'}, {id: '2', name: 'Device 2'}, {id: '3', name: 'Device 3'}];
          $scope.pairedDevices = [{id: '1', name: 'Device 1'}, {id: '2', name: 'Device 2'}, {id: '3', name: 'Device 3'}];
        })
      });

      it('Available & paired Devices devices should be seeded', () => {
        expect($scope.availableDevices).toBeDefined();
        expect($scope.availableDevices.length).toBe(3);
        expect($scope.availableDevices[0].id).toEqual('1');

        expect($scope.pairedDevices).toBeDefined();
        expect($scope.pairedDevices.length).toBe(3);
        expect($scope.pairedDevices[0].id).toEqual('1');
      });

      describe('connect to unpaired device', () => {
        beforeEach(function (done) {
          inject(function () {
            $scope.connectToUnpairedDevice(2);
            setTimeout(() => {
              done()
            }, 200);
          })
        });

        it('functions to have been called with correct arguments', () => {
          expect($scope.connectToUnpairedDevice).toHaveBeenCalled();
          expect($scope.connectToUnpairedDevice).toHaveBeenCalledWith(2);
          expect($scope.connectToUnpairedDevice).toHaveBeenCalledTimes(1);
          expect(bluetoothServiceMock.connectToSelectedDevice).toHaveBeenCalled();
          expect(bluetoothServiceMock.connectToSelectedDevice).toHaveBeenCalledWith('3', 'Device 3');
          expect(bluetoothServiceMock.getConnectedValue).toHaveBeenCalled();
          expect(ionicLoadingMock.show).toHaveBeenCalled();
          expect(ionicLoadingMock.hide).toHaveBeenCalled();
          expect(ionicPopupMock.alert).toHaveBeenCalled();
        });

        it('after resolving should set correct values', () => {
          expect($scope.isConnected).toBe(true);
          expect($scope.deviceName).toBe('Device 3');
        })
      });

      describe('connect to paired device', () => {
        beforeEach(function (done) {
          inject(function () {
            $scope.connectToPairedDevice(2);
            setTimeout(() => {
              done()
            }, 200);
          })
        });

        it('functions to have been called with correct arguments', () => {
          expect($scope.connectToPairedDevice).toHaveBeenCalled();
          expect($scope.connectToPairedDevice).toHaveBeenCalledWith(2);
          expect($scope.connectToPairedDevice).toHaveBeenCalledTimes(1);
          expect(bluetoothServiceMock.connectToSelectedDevice).toHaveBeenCalled();
          expect(bluetoothServiceMock.connectToSelectedDevice).toHaveBeenCalledWith('3', 'Device 3');
          expect(bluetoothServiceMock.getConnectedValue).toHaveBeenCalled();
          expect(ionicLoadingMock.show).toHaveBeenCalled();
          expect(ionicLoadingMock.hide).toHaveBeenCalled();
          expect(ionicPopupMock.alert).toHaveBeenCalled();
        });

        it('after resolving should set correct values', () => {
          expect($scope.isConnected).toBe(true);
          expect($scope.deviceName).toBe('Device 3');
        })
      });
    });

    describe('Failed connect', () => {
      beforeEach(function () {
        inject(function () {
          const override = {
            bluetoothServiceMock: {
              connectToSelectedDevice: function (deviceID, deviceName) {
                return new Promise((resolve, reject) => {
                  reject('Unable to connect');
                })
              }
            }
          };
          createController(override);
          spyOn($scope, 'connectToUnpairedDevice').and.callThrough();
          spyOn($scope, 'connectToPairedDevice').and.callThrough();
          spyOn(bluetoothServiceMock, 'connectToSelectedDevice').and.callThrough();
          $scope.availableDevices = [{id: '1', name: 'Device 1'}, {id: '2', name: 'Device 2'}, {id: '3', name: 'Device 3'}];
          $scope.pairedDevices = [{id: '1', name: 'Device 1'}, {id: '2', name: 'Device 2'}, {id: '3', name: 'Device 3'}];
        })
      });

      describe('Connect to paired device should fail', () => {
        beforeEach((done) => {
          $scope.connectToPairedDevice(2);
          setTimeout(() => {
            done();
          }, 200);
        });

        it('should not connect to paired device and throw an error', () => {
          expect($scope.connectToPairedDevice).toHaveBeenCalled();
          expect($scope.connectToPairedDevice).toHaveBeenCalledWith(2);
          expect($scope.connectToPairedDevice).toHaveBeenCalledTimes(1);
          expect(bluetoothServiceMock.connectToSelectedDevice).toHaveBeenCalled();
          expect(bluetoothServiceMock.connectToSelectedDevice).toHaveBeenCalledWith('3', 'Device 3');
          expect(ionicLoadingMock.show).toHaveBeenCalled();
          expect(ionicLoadingMock.hide).toHaveBeenCalled();
          expect(errorServiceMock.addError).toHaveBeenCalled();
          expect(errorServiceMock.addError).toHaveBeenCalledWith({level: 'warning', message: 'Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device'});
        })
      });

      describe('Connect to unpaired device should fail', () => {
        beforeEach((done) => {
          $scope.connectToUnpairedDevice(2);
          setTimeout(() => {
            done();
          }, 200);
        });

        it('should not connect to paired device and throw an error', () => {
          expect($scope.connectToUnpairedDevice).toHaveBeenCalled();
          expect($scope.connectToUnpairedDevice).toHaveBeenCalledWith(2);
          expect($scope.connectToUnpairedDevice).toHaveBeenCalledTimes(1);
          expect(bluetoothServiceMock.connectToSelectedDevice).toHaveBeenCalled();
          expect(bluetoothServiceMock.connectToSelectedDevice).toHaveBeenCalledWith('3', 'Device 3');
          expect(ionicLoadingMock.show).toHaveBeenCalled();
          expect(ionicLoadingMock.hide).toHaveBeenCalled();
          expect(errorServiceMock.addError).toHaveBeenCalled();
          expect(errorServiceMock.addError).toHaveBeenCalledWith({level: 'warning', message: 'Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device'});
        })
      })
    })
  });

  describe('userDisconnect', () => {
    beforeEach(function () {
      inject(function () {
        createController();
        spyOn($scope, 'getAvailableDevices');
        $scope.userDisconnect();
      });
    });

    it('Should disconnect', () => {
      expect(bluetoothServiceMock.disconnect).toHaveBeenCalled();
      expect(bluetoothServiceMock.disconnect).toHaveBeenCalled();
      expect(bluetoothServiceMock.disconnect).toHaveBeenCalledTimes(1);
      expect($scope.isConnected).toBe(false);
      $timeout.flush();
      expect($scope.getAvailableDevices).toHaveBeenCalled();
      expect($scope.getAvailableDevices).toHaveBeenCalledTimes(1);
    });
  });

  describe('Open bluetoothSettings', () => {
    it('Should open bluetooth settings', () => {
      createController();
      $scope.openBluetoothSettings();
      expect(bluetoothServiceMock.openBluetoothSettings).toHaveBeenCalled();
    })
  });

  //TODO move to own test
  describe('Open help modal', () => {
    it('Should open help modal', () => {
      createController();
      $scope.openHelpModal();
      expect(modalServiceMock.init).toHaveBeenCalled();
      expect(modalServiceMock.init).toHaveBeenCalledWith('help-modal.html', $scope);
    })
  });

  describe('Open log modal', () => {
    it('Should open help modal', () => {
      createController();
      $scope.showFullLog();
      expect(modalServiceMock.init).toHaveBeenCalled();
      expect(modalServiceMock.init).toHaveBeenCalledWith('log-modal.html', $scope);
    })
  });

  describe('on events', () => {
    beforeEach(function () {
      inject(function () {
        createController();
        spyOn($scope, '$on').and.callThrough();
      })
    });

    describe('On $ionicView.enter', () => {
      beforeEach(function () {
        $scope.$emit('$ionicView.enter');
        $scope.$digest();
      });

      it('Should have called the correct functions', () => {
        expect(bluetoothServiceMock.getBluetoothEnabledValue).toHaveBeenCalled();
        expect(bluetoothServiceMock.getDeviceName).toHaveBeenCalled();
        expect(buttonServiceMock.getValues).toHaveBeenCalled();
        expect(bluetoothServiceMock.getConnectedValue).toHaveBeenCalled();
      });

      it('Should have the correct variables', () => {
        expect($scope.availableDevices).toEqual([]);
        expect($scope.pairedDevices).toEqual([]);
        //TODO check defaults for these
        // expect($scope.bluetoothEnabled).toBe();
        // expect($scope.isConnected).toBe();
      })
    });

    describe('On $ionicView.leave', () => {
      beforeEach(function () {
        $scope.$emit('$ionicView.leave');
        $scope.$digest();
      });

      it('Should have called logService.setBulk', () => {
        expect(logServiceMock.setBulk).toHaveBeenCalled();
      })

    })
  });
});
