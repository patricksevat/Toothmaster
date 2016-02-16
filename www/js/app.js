// Ionic Starter App



// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('Toothmaster', ['ionic', 'starter.controllers'])

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
  if (window.localStorage['numUserProgs'] === undefined) {
    window.localStorage['numUserProgs'] = 0;
  }
  if (window.localStorage['settings'] === undefined) {
    window.localStorage['settings'] = '';
  }

  console.log('localstorage.length ='+window.localStorage.length);

  //check if app.safety-slide has been completed, if not redirect to app.safety
  $rootScope.$on( "$locationChangeStart", function(event, toState, fromState) {
    if ( (window.localStorage["Safety"] !== "Completed") ) {
      console.log("safety not completed");

      // no safety slides checked, redirect to Safety
      if (toState.name === "app.safety") {
        console.log("no redirect needed");
        // already going to safety.html, no redirect needed
        return;
      }
      else {
        // not going to safety.html, we should redirect now
        console.log("redirecting to safety");
        $state.go("app.safety-slide");

      }
    }
  });

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
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
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html'
        }
      }
  })

    .state('app.safety-slide', {
      url: '/safety-slide',
      name: 'app.safety-slide',
      views: {
        'menuContent': {
          templateUrl: 'templates/safety-slide.html',
          controller: 'SafetySlides'
        }
      }
    })

    .state('app.program', {
      url: '/program',
      views: {
        'menuContent': {
          templateUrl: 'templates/program.html',
          controller: 'ProgramController'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/safety-slide');
});



