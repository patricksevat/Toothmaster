//controllers
import toothmasterControllers from './controllers';

// services
import sendAndReceiveService from './services/sendAndReceiveService';
import shareSettingsService from './services/shareSettingsService';
import shareProgramService from './services/shareProgramService';
import skipService from './services/skipService';
import buttonService from './services/buttonService';
import emergencyService from './services/emergencyService';
import { bluetoothService} from './services/bluetoothService';
import logService from './services/logService'
import calculateVarsService from './services/calculateVarsService'
import logModalService from './services/logModalService'
import modalService from './services/modalService'
import statusService from './services/statusService'
import pauseService from './services/pauseService'
import crcService from './services/crcService'
import errorService from './services/errorService'

//directives
import errorDirective from './directives/errorDirective'
import modalDirective from './directives/modalDirective'

import ngAsync from './ng-async';
import router from './router'

if (window.localStorage['Safety'] === undefined) {
  window.localStorage.setItem('Safety', '');
}
if (window.localStorage['settings'] === undefined) {
  window.localStorage['settings'] = '{"stepMotorNum": null, "maxFreq":5000,"dipswitch":5000,"spindleAdvancement":5,"time":0.2, "homingStopswitch": false, "encoder":{"enable": false, "stepsPerRPM": 0, "stepsToMiss": 0, "direction": false}}';
}
if (window.localStorage['lastUsedProgram'] === undefined) {
  window.localStorage['lastUsedProgram'] = '';
}
if (window.localStorage['commandIdNum'] === undefined) {
  window.localStorage['commandIdNum'] = 0;
}

angular.module('Toothmaster', ['ionic', 'toothmasterControllers', 'ngCordova', 'ngTouch', ngAsync.name])
  .service('bugout', function () {
    const bugout = new debugout();
    this.bugout = bugout;
  })
  .service('shareSettings', [shareSettingsService])
  .service('shareProgram', ['bugout', shareProgramService])
  .service('skipService', skipService)
  .service('buttonService', ['bugout', buttonService])
  .service('emergencyService',['buttonService', 'statusService', '$rootScope', 'bugout', emergencyService])
  .service('bluetoothService', ['bugout', '$cordovaBluetoothSerial', '$window', 'logService', 'shareSettings',
    'buttonService', '$rootScope', '$interval', '$async', bluetoothService])
  .service('logService', ['bugout', 'errorService', logService])
  .service('calculateVarsService',['shareProgram', 'shareSettings', calculateVarsService])
  .service('logModalService', ['bugout', logModalService])
  .service('statusService', ['bugout', statusService])
  .service('pauseService', ['statusService', 'bluetoothService', 'logService', 'buttonService', 'bugout', '$async',
    pauseService])
  .service('sendAndReceiveService', ['statusService', 'emergencyService', '$window', 'logService', '$rootScope',
    'buttonService', 'crcService', 'shareSettings', '$timeout', '$async', 'bugout',
    sendAndReceiveService])
  .service('crcService', [crcService])
  .service('errorService', ['$rootScope', errorService])
  .service('modalService', ['$ionicModal', '$rootScope', 'logService', modalService])
  .directive('errorHeader', ['$rootScope', errorDirective])
  .directive('modals', [modalDirective])

  .run(function($ionicPlatform, $rootScope, $state, $window, $ionicHistory, skipService, pauseService, bluetoothService, bugout) {
    bugout.bugout.log('version 0.9.10.31');
    console.log($window.localStorage);
      $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams, options){
          bugout.bugout.log('startChangeStart, fromState: '+fromState.name);
          bugout.bugout.log('startChangeStart, toState: '+toState.name);
        });

    $ionicPlatform.on('pause', function () {
      bugout.bugout.log('onPause called from app.js');
      if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing'
        || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
        pauseService.pause();
      }
      else {
      }
    });

    $ionicPlatform.on('resume', function () {
      bugout.bugout.log('onResume called from app.js');
      if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing'
        || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
        pauseService.resume();
      }
      else {
      }
    });

  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      // cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if (window.localStorage['lastConnectedDevice'] === undefined) {
      window.localStorage['lastConnectedDevice'] = '';
    }
    else {
      $ionicPlatform.ready(function () {
        bugout.bugout.log('trying to connectwithretry on startup');
        bluetoothService.connectWithRetry();
      });
    }

    //bugout.log(window.localStorage);
    bugout.bugout.log('localstorage.length ='+window.localStorage.length);
  });

})

.config(router);



