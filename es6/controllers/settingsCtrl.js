export default function($rootScope, $scope, $ionicPopup, $state, shareSettings, logService, bugout){
  $scope.settings = {
    encoder: {
      enable: false,
      stepsPerRPM: null,
      stepsToMiss: null
    },
    homingStopswitch: false,
    direction: false
  };

  //
  //On leaving warn if settings are not saved
  //
  $scope.settingsChanged = false;
  $scope.skipCheck = false;

  //settingsHaveChanged is called when user changes an input element in html
  $scope.settingsHaveChanged = function () {
    $scope.settingsChanged = true;
    $scope.skipCheck = false;
    bugout.bugout.log( '$scope.settings: ');
    bugout.bugout.log($scope.settings);
  };

  $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams, fromState, fromStateParams) {
    if (fromState.name == 'app.settings' && $scope.settingsChanged && $scope.skipCheck === false) {
      event.preventDefault();
      $scope.showAlertUnsavedChanges(toState);
    }
  });
  //End leave warning

  $scope.saveSettings = function() {
    //Make sure that the frequency is not too high
    if ($scope.settings.maxFreq > 20000) {
      $scope.showAlertMaxFreq();
    }

    //  Make sure all regular settings are filled in correctly
    else if ($scope.settings.stepMotorNum == null || $scope.settings.maxFreq == null
      || $scope.settings.dipswitch == null || $scope.settings.spindleAdvancement == null || $scope.settings.time == null) {
      $scope.showAlertSettings();
    }

    //  make sure all encoder seting are filled in correctly
    else if ($scope.settings.encoder.enable && ($scope.settings.encoder.stepsPerRPM ==undefined || $scope.settings.encoder.stepsToMiss== undefined || $scope.settings.encoder.direction == undefined)){
      $scope.showAlertSettings();
    }

    //  Save settings as JSON to localStorage
    else {
      $scope.settingsChanged = false;
      $scope.skipCheck = true;

      const settingsJSON = JSON.stringify($scope.settings);
      logService.consoleLog(settingsJSON);
      window.localStorage['settings'] = settingsJSON;

      shareSettings.setObj($scope.settings);
      $scope.showAlertSaved();
    }

  };

  $scope.loadSettings = function() {
    if (window.localStorage['settings'] === '' || window.localStorage['settings'] === undefined) {

    }
    else {
      $scope.settings = JSON.parse(window.localStorage['settings']);
    }
    logService.consoleLog('settings: ');
    logService.consoleLog($scope.settings);
  };

  //Load settings on enter
  $scope.$on('$ionicView.afterEnter', function () {
    logService.consoleLog('AFTER ENTER');
    $scope.settingsChanged = false;
    $scope.skipCheck = false;
    $scope.loadSettings();
  });


  //
  //Alerts
  //

  $scope.showAlertUnsavedChanges = function(toState){
    if (shareSettings.checkSettings($scope.settings, true) === false) {
      $ionicPopup.alert(
        {
          title: 'You have unsaved changes and incorrect settings',
          template: 'Do you want to correct and save your changes before leaving?',
          buttons: [{
            text: 'Yes',
            type: 'button-positive'
          },{
            text: 'No, leave anyway',
            type: 'button-energized',
            onTap: () => {
              $scope.skipCheck = true;
              $state.go(toState.name);
            }
          }]
        }
      )
    }
    else {
      $ionicPopup.alert(
        {
          title: 'You have unsaved changes',
          template: 'Do you want to save your changes before leaving?',
          buttons: [{
            text: 'Yes',
            type: 'button-positive',
            onTap: () => {
              $scope.saveSettings();
              $state.go(toState.name);
            }
          },{
            text: 'No',
            type: 'button-energized',
            onTap: () => {
              $scope.skipCheck = true;
              $state.go(toState.name);
            }
          }]
        }
      )
    }
  };

  $scope.showAlertMaxFreq = function(){
    $ionicPopup.alert(
      {
        title: 'Maximum frequency invalid',
        template: 'Please make sure that maximum frequency is set to 20.000 or lower'
      }
    )
  };

  $scope.showAlertSettings = function(){
    $ionicPopup.alert(
      {
        title: 'Not all fields are filled in',
        template: 'Please make sure that all fields are filled in correctly'
      }
    )
  };

  $scope.showAlertSaved = function(){
    $ionicPopup.alert(
      {
        title: 'Settings saved'
      }
    )
  }
}
