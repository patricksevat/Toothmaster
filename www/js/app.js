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

  //check if app.safety-slide has been completed, if not redirect to app.safety
  $rootScope.$on( "$locationChangeStart", function(event, toState, fromState) {
    console.log(event);
    if ( window.localStorage.getItem("Safety") !== "Completed") {
      console.log("safety not completed");

      // no safety slides checked, redirect to Safety
      if (toState.name == "app.safety") {
        console.log("no redirect needed");
        // already going to safety.html, no redirect needed

      }
      else {
        // not going to safety.html, we should redirect now
        console.log("redirecting to safety");
        $state.go("app.safety");

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
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html'
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

  .state('app.safety', {
      url: '/safety',
      views: {
        'menuContent': {
          templateUrl: 'templates/safety.html'
        }
      }
    })

    .state('app.safety-slide', {
      url: '/safety-slide',
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
          templateUrl: 'templates/program.html'
        }
      }
    })


    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});

