import {sendAndReceiveServiceMock, spyOnSendAndReceiveServiceMock} from '../../es6/services/mocks/sendAndReceiveServiceMock'
import {bluetoothServiceMock, spyOnBluetoothServiceMock} from '../../es6/services/mocks/bluetoothServiceMock'
import {logServiceMock, spyOnLogServiceMock} from '../../es6/services/mocks/logServiceMock'
import {buttonServiceMock, spyOnButtonServiceMock} from '../../es6/services/mocks/buttonServiceMock'
import {calculateVarsServiceMock, spyOnCalculateServiceMock} from '../../es6/services/mocks/calculateVarsServiceMock'
import {shareSettingsServiceMock, spyOnShareSettingsServiceMock} from '../../es6/services/mocks/shareSettingsServiceMock'
import {ionicPopupMock, spyOnIonicPopupMock} from '../../es6/services/mocks/ionicPopupMock'
import {modalServiceMock, spyOnModalServiceMock} from '../../es6/services/mocks/modalServiceMock'
import {emergencyServiceMock, spyOnEmergencyServiceMock} from '../../es6/services/mocks/emergencyServiceMock'
import {statusServiceMock, spyOnStatusServiceMock} from '../../es6/services/mocks/statusServiceMock'

describe('bluetoothTestCtrl', () => {
  let createController, $rootScope, $scope;

  beforeEach(angular.mock.module('toothmasterControllers'));

  beforeEach(inject(function ($controller, _$rootScope_, _$interval_, _$timeout_, _$async_) {
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    spyOnSendAndReceiveServiceMock();
    spyOnBluetoothServiceMock();
    spyOnLogServiceMock();
    spyOnButtonServiceMock();
    spyOnCalculateServiceMock();
    spyOnShareSettingsServiceMock();
    spyOnStatusServiceMock();
    spyOnEmergencyServiceMock();
    spyOnModalServiceMock();
    spyOnIonicPopupMock();

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

      return $controller('testCtrl', {
        $rootScope: $rootScope,
        $scope: override('scope', $scope),
        $ionicPopup: ionicPopupMock,
        $interval: _$interval_,
        $timeout: _$timeout_,
        shareSettings: shareSettingsServiceMock,
        buttonService: buttonServiceMock,
        emergencyService: emergencyServiceMock,
        bluetoothService: bluetoothServiceMock,
        logService: logServiceMock,
        calculateVarsService: calculateVarsServiceMock,
        sendAndReceiveService: override('sendAndReceiveServiceMock', sendAndReceiveServiceMock),
        statusService: override('statusServiceMock', statusServiceMock),
        modalService: override('modalServiceMock', modalServiceMock),
        $async: _$async_
      })
    }
  }));

  describe('user disconnects', () => {
    it('Should disconnect and retrieve get false connected value', () => {
      createController();
      $scope.userDisconnect();

      expect(bluetoothServiceMock.disconnect).toHaveBeenCalled();
      expect(bluetoothServiceMock.disconnect).toHaveBeenCalledTimes(1);
      expect(bluetoothServiceMock.getConnectedValue).toHaveBeenCalled();
      expect(bluetoothServiceMock.getConnectedValue).toHaveBeenCalledTimes(1);
      expect($scope.isConnected).toBe(false);
    })
  });

  describe('user turns on emergency', () => {

  })

  describe('on events', () => {
    describe('on enter', () => {
      beforeEach(() => {
        createController();
        $scope.$emit('$ionicView.enter');
        $scope.$digest();
      });

      it('expect correct functions to have been called', () => {
        expect(logServiceMock.getLog).toHaveBeenCalled();
        expect(bluetoothServiceMock.getBluetoothEnabledValue).toHaveBeenCalled();
        expect(bluetoothServiceMock.getDeviceName).toHaveBeenCalled();
        expect(buttonServiceMock.getValues).toHaveBeenCalled();
        expect(bluetoothServiceMock.getConnectedValue).toHaveBeenCalled();
        expect(calculateVarsServiceMock.getVars).toHaveBeenCalled();
        expect(calculateVarsServiceMock.getVars.calls.argsFor(0)[0]).toBe('test');
        expect(shareSettingsServiceMock.getObj).toHaveBeenCalled();
      });

      it('expect variables to have correct values', () => {
        setTimeout(() => {}, 100);
        expect($scope.bluetoothLog).toEqual([]);
        expect($scope.bluetoothEnabled).toBe(true);
        expect($scope.deviceName).toBe('Device 1');
        expect($scope.isConnected).toBe(false);
        expect($scope.settings.stepMotorNum).toEqual('10')
      })
    });

    describe('after enter', () => {
      it('Should call subscribe', () => {
        createController();
        $scope.$emit('$ionicView.afterEnter');
        expect(sendAndReceiveServiceMock.subscribe).toHaveBeenCalled();
        expect(sendAndReceiveServiceMock.subscribe).toHaveBeenCalledTimes(1);
      })
    });

    describe('before leave', () => {
      it('Should call unsubscribe', () => {
        createController();
        $scope.$emit('$ionicView.beforeLeave');
        expect(sendAndReceiveServiceMock.unsubscribe).toHaveBeenCalled();
        expect(sendAndReceiveServiceMock.unsubscribe).toHaveBeenCalledTimes(1);
      })
    });

    describe('on leave', () => {

      describe('While sending = true', () => {
        it('Should call the correct functions', () => {
          createController();
          $scope.$emit('$ionicView.leave');
          expect(statusServiceMock.getSending).toHaveBeenCalled();
          expect(emergencyServiceMock.on).toHaveBeenCalled();
          expect(emergencyServiceMock.off).toHaveBeenCalled();
          expect(logServiceMock.setBulk).toHaveBeenCalled();
        })
      });

      describe('While sending = false', () => {
        it('should call the correct functions', () => {
          createController({statusServiceMock: {getSending: () => {return false}}});
          spyOn(statusServiceMock, 'getSending').and.callThrough();
          $scope.$emit('$ionicView.leave');

          expect(statusServiceMock.getSending).toHaveBeenCalled();
          expect(sendAndReceiveServiceMock.clearBuffer).toHaveBeenCalled();
          expect(logServiceMock.setBulk).toHaveBeenCalled();
        })
      });

      it('Correct values should be set', () => {
        createController();
        $scope.$emit('$ionicView.leave');

        expect($scope.retriesNeeded).toBe(0);
        expect($scope.completedTest).toBe(0);
        expect($scope.numberOfTests).toEqual({});
        expect($scope.testRunning).toBe(false);
      })

    })
  })
  });
