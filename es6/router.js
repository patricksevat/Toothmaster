function router($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  // $ionicConfigProvider.views.maxCache(1);

  /**
   * Important, for app, every path is relative to index.html
   * */

  $stateProvider
    .state('app', {
      name: 'app',
      url: '/app',
      abstract: true,
      templateUrl: './templates/menu.html'
    })

    .state('app.settings', {
      name: 'settings',
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: './templates/settings.html',
          controller: 'SettingsCtrl'
        }
      }
    })

    .state('app.home', {
      name: 'home',
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: './templates/home.html'
        }
      }
    })

    .state('app.safety-slide', {
      url: '/safety-slide',
      name: 'safety-slide',
      views: {
        'menuContent': {
          templateUrl: './templates/safety-slide.html',
          controller: 'SafetySlides'
        }
      }
    })

    .state('app.program', {
      name: 'program',
      url: '/program',
      views: {
        'menuContent': {
          templateUrl: './templates/program.html',
          controller: 'ProgramController'
        }
      }
    })

    .state('app.homing', {
      name: 'homing',
      url: '/homing',
      views: {
        'menuContent': {
          templateUrl: './templates/homing.html',
          controller: 'homingCtrl'
        }
      }
    })

    .state('app.runBluetooth', {
      name: 'runBluetooth',
      url: '/runBluetooth',
      views: {
        'menuContent': {
          templateUrl: './templates/runBluetooth.html',
          controller: 'runBluetoothCtrl'
        }
      }
    })

    .state('app.test', {
      name: 'test',
      url: '/test',
      views: {
        'menuContent': {
          templateUrl: './templates/test.html',
          controller: 'testCtrl'
        }
      }
    })

    .state('app.website', {
      name: 'website',
      url: '/website',
      views: {
        'menuContent': {
          templateUrl: './templates/website.html'
        }
      }
    })

    .state('app.bluetoothConnection', {
      name: 'bluetoothConnection',
      url: '/bluetoothConnection',
      views: {
        'menuContent': {
          templateUrl: './templates/bluetoothConnection.html',
          controller: 'bluetoothConnectionCtrl'
        }
      }
    })

  .state('app.asyncTest', {
    name: 'asyncTest',
    url: '/asyncTest',
    views: {
      'menuContent': {
        templateUrl: './templates/asyncTest.html',
        controller: 'asyncCtrl',
        controllerAs: 'async'
      }
    }
  })

    .state('app.crcTest', {
      name: 'crcTest',
      url: '/crcTest',
      views: {
        'menuContent': {
          templateUrl: './templates/crctest.html',
          controller: 'crcTestCtrl',
          controllerAs: 'crc'
        }
      }
    })
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/program');

}

export default router
