var bugout = new debugout();
//TODO chekc permissions
//Force screen on while executing program
angular.module('Toothmaster', ['ionic', 'starter.controllers', 'ngCordova', 'ngTouch'])

  .config(function($ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(1);
  })

  .service('shareSettings', function() {
    var shareSettings = this;
    shareSettings.obj = {};
    if (window.localStorage['settings'] !== '') {
      shareSettings.obj.settings = JSON.parse(window.localStorage['settings']);
    }

      shareSettings.getObj = function() {
        return shareSettings.obj.settings;
      };
      shareSettings.setObj = function(value) {
        shareSettings.obj.settings = value;
      }
    }
  )

  .service('shareProgram', function() {
      var shareProgram = this;
      shareProgram.obj = {
        "program": {}
      };

      shareProgram.getObj = function() {
        if (shareProgram.obj.program.startPosition === undefined) {
          bugout.log('shareProgram.obj.program is undefined, setting start position to nill');
          shareProgram.obj.program.startPosition = 0;
        }
        return shareProgram.obj.program;
      };
      shareProgram.setObj = function(value) {
        shareProgram.obj.program = value;
      }
    }
  )

  .service('skipService', function () {
    var skip = this;
    skip.value = undefined;
    skip.getSkip = function () {
      return skip.value;
    };
    skip.setSkip = function (boolean) {
      skip.value = boolean;
    }
  })

.run(function($ionicPlatform, $rootScope, $state, $window, $ionicHistory, skipService) {
  bugout.log('version 0.8.0.13');
  var nextView;
  var prevView;
  var skip;
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
    nextView = toState.name;
    prevView = fromState.name;
    skip = ((prevView === 'app.test' || prevView === 'app.homing' || prevView === 'app.runBluetooth' ||
    prevView === 'app.bluetoothConnection' || prevView === 'app.program') &&
    (nextView === 'app.bluetoothConnection' || nextView === 'app.test' || nextView === 'app.homing' ||
    nextView === 'app.runBluetooth' || nextView === 'app.program')) ? true : false;
    skipService.setSkip(skip);
    bugout.log('skip: '+skip+', prevView: '+prevView+', nextView'+nextView);
  });

  $ionicPlatform.on('pause', function () {
    if ($ionicHistory.currentStateName() === 'app.runBluetooth' || $ionicHistory.currentStateName() === 'app.homing'
      || $ionicHistory.currentStateName() === 'app.test' || $ionicHistory.currentStateName() === 'app.bluetoothConnection') {
      bugout.log('pause from app.js skipped');
    }
    else {
      $window.bluetoothSerial.disconnect(function () {
        bugout.log('disconnected on pause from app.js');

      }, function () {
        bugout.log('could not disconnect on pause from app.js')
      })
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

  });
  if (window.localStorage['Safety'] === undefined) {
    window.localStorage.setItem('Safety', '');
  }
  if (window.localStorage['settings'] === undefined) {
    window.localStorage['settings'] = '{"maxFreq":666,"dipswitch":5000,"spindleAdvancement":5,"time":0.2, "homingStopswitch": false, "encoder":{"enable": false, "stepsPerRPM": 0, "stepsToMiss": 0, "direction": false}}';
  }
  if (window.localStorage['lastUsedProgram'] === undefined) {
    window.localStorage['lastUsedProgram'] = '';
  }
  if (window.localStorage['lastConnectedDevice'] === undefined) {
    window.localStorage['lastConnectedDevice'] = '';
  }

  bugout.log(window.localStorage);
  bugout.log('localstorage.length ='+window.localStorage.length);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    //TODO split BluetoothCtrl into seperate controllers :'[
    .state('app', {
      name: 'app',
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.settings', {
    name: 'settings',
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.home', {
      name: 'home',
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html'
        }
      }
  })

    .state('app.safety-slide', {
      url: '/safety-slide',
      name: 'safety-slide',
      views: {
        'menuContent': {
          templateUrl: 'templates/safety-slide.html',
          controller: 'SafetySlides'
        }
      }
    })

    .state('app.program', {
      name: 'program',
      url: '/program',
      views: {
        'menuContent': {
          templateUrl: 'templates/program.html',
          controller: 'ProgramController'
        }
      }
    })

    .state('app.homing', {
      name: 'homing',
      url: '/homing',
      views: {
        'menuContent': {
          templateUrl: 'templates/homing.html',
          controller: 'homingCtrl'
        }
      }
    })

    .state('app.runBluetooth', {
      name: 'runBluetooth',
      url: '/runBluetooth',
      views: {
        'menuContent': {
          templateUrl: 'templates/runBluetooth.html',
          controller: 'runBluetoothCtrl'
        }
      }
    })

    .state('app.test', {
      name: 'test',
      url: '/test',
      views: {
        'menuContent': {
          templateUrl: 'templates/test.html',
          controller: 'testCtrl'
        }
      }
    })

    .state('app.website', {
      name: 'website',
      url: '/website',
      views: {
        'menuContent': {
          templateUrl: 'templates/website.html'
        }
      }
    })

    .state('app.bluetoothConnection', {
      name: 'bluetoothConnection',
      url: '/bluetoothConnection',
      views: {
        'menuContent': {
          templateUrl: 'templates/bluetoothConnection.html',
          controller: 'bluetoothConnectionCtrl'
        }
      }
    })
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/program');

});



