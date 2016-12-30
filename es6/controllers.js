import ngAsync from './ng-async';

//controllers
import safetySlideCtrl from './controllers/safetySlides';
import programCtrl from './controllers/programCtrl'
import settingsCtrl from './controllers/settingsCtrl'
import runBluetoothCtrl from './controllers/runBluetoothCtrl'
import homingCtrl from './controllers/homingCtrl'
import bluetoothTestCtrl from './controllers/bluetoothTestCtrl'
import bluetoothConnectionCtrl from './controllers/bluetoothConnectionCtrl'
import errorController from './controllers/errorController'
import modalController from './controllers/modalCtrl'
import crcCtrl from './controllers/crcTestCtrl'

module.exports =
angular.module('toothmasterControllers', [ngAsync.name])
  /*
  * $rootScope emits:
  * $rootScope.$on('emergencyOn')
  * $rootScope.$on('resetEmergency')
  * $rootScope.$on('emergencyReset1')
  * $rootScope.$on('emergencyReset2')
  * $rootScope.$on('emergencyOff')
  * $rootScope.$on('stopswitchHit', response, stopswitchNumber)
  * $rootScope.$on('maxSteps', response, missedSteps)
  * $rootScope.$on('bluetoothResponse', response)
  * $rootScope.$on('connectionLost')
  * $rootScope.$on('errorAdded')
  *
  * */

  .controller('SafetySlides', safetySlideCtrl)

  .controller('ProgramController', programCtrl)

  .controller('SettingsCtrl', settingsCtrl)

  .controller('runBluetoothCtrl', runBluetoothCtrl)

  .controller('homingCtrl', homingCtrl)

  .controller('testCtrl', bluetoothTestCtrl)

  .controller('bluetoothConnectionCtrl', bluetoothConnectionCtrl)

  .controller('errorController', errorController)
  
  .controller('crcTestCtrl', crcCtrl)

  .controller('modalCtrl', modalController);

