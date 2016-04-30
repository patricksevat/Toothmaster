angular.module('Toothmaster', ['ionic', 'starter.controllers', 'ngCordova', 'ngTouch'])

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
      shareProgram.obj = {};

      shareProgram.getObj = function() {
        return shareProgram.obj.program;
      };
      shareProgram.setObj = function(value) {
        shareProgram.obj.program = value;
      }
    }
  )

.run(function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {


    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

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
    window.localStorage['settings'] = '{"minFreq":50,"maxFreq":5000,"dipswitch":5000,"spindleAdvancement":5,"time":.2,"encoder":{"enable": false, "stepsPerRPM": 0, "stepsToMiss": 0, "direction": false}}';
  }
  if (window.localStorage['lastUsedProgram'] === undefined) {
    window.localStorage['lastUsedProgram'] = '';
  }
  console.log(window.localStorage);

  console.log('localstorage.length ='+window.localStorage.length);

  //TODO fix the redirector
  //check if app.safety-slide has been completed, if not redirect to app.safety
  /*$rootScope.$on( "$stateChangeStart", function(event, toState, fromState) {
    if ( (window.localStorage["Safety"] !== "Completed") ) {
      console.log("safety not completed");

      // no safety slides checked, redirect to Safety
      if (toState.name = "safety-slide") {
        console.log("no redirect needed");
        // already going to safety, no redirect needed

      }
      else {
        // not going to safety, we should redirect now

        console.log("redirecting to safety");
        $state.go("app.safety-slide");

      }
    }
  });
  */
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

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
  ;
  // if none of the above states are matched, use this as the fallback
  if (window.localStorage['Safety'] === "Completed") {
    $urlRouterProvider.otherwise('/app/program');
  }
  else {
    $urlRouterProvider.otherwise('/app/safety-slide');
  }

});



