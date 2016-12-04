export default function($scope, $ionicModal, $ionicPopup, shareSettings, shareProgram, $state, logService) {
  $scope.presets = [
    { titlePreset: '5mm everything', sawWidth: 5, cutWidth: 5, pinWidth: 5, numberOfCuts: 5, startPosition: 5  },
    { titlePreset: '15mm everything', sawWidth: 15, cutWidth: 15, pinWidth: 15, numberOfCuts: 15, startPosition: 15  }
  ];

  $scope.userPrograms = [];

  $scope.currentProgram = {};

  (function loadLastUsedProgram() {
    if (window.localStorage['lastUsedProgram'] !== "" && window.localStorage['lastUsedProgram'] !== undefined) {
      $scope.currentProgram = JSON.parse(window.localStorage['lastUsedProgram']);
      shareProgram.setObj($scope.currentProgram);
    }
  })();

  $scope.loadUserPrograms = function() {
    $scope.userPrograms = [];
    if (window.localStorage.length === 5) {
      logService.consoleLog('only safety, settings, lastConnectedDevice, commandIDNum and lastUsedProgram found in localstorage');
    }
    //load the userPrograms stored in localStorage. objects are named 1 - n.
    //parse the userPrograms in localStorage so that they are converted to objects
    //push the parsed userPrograms to $scope.userPrograms array
    else {
      logService.consoleLog(window.localStorage);
      for (var a=0; a<window.localStorage.length; a++) {
        if (window.localStorage.key(a) == 'Safety' || window.localStorage.key(a) == 'settings' || window.localStorage.key(a) == 'lastUsedProgram' || window.localStorage.key(a) == 'lastConnectedDevice' || window.localStorage.key(a) == 'commandIdNum') {

        }
        else{
          var tempName = window.localStorage.key(a);
          var temp = window.localStorage[tempName];
          temp = JSON.parse(temp);
          $scope.userPrograms.push(temp);
          logService.consoleLog(tempName+' pushed to userPrograms');
        }
      }
    }
  };

  $scope.loadUserPrograms();

  $scope.loadUserProgram = function($index) {
    //load userProgram & close load modal
    logService.consoleLog('userProgram clicked');
    $scope.currentProgram = $scope.userPrograms[$index];
    shareProgram.setObj($scope.currentProgram);
    $scope.closeModal(1);
  };

  $scope.loadPreset = function($index) {
    //load preset & close load modal
    logService.consoleLog('loadPreset clicked');
    $scope.currentProgram = $scope.presets[$index];
    $scope.currentProgram.title = $scope.presets[$index].titlePreset;
    shareProgram.setObj($scope.currentProgram);
    $scope.closeModal(1);
  };

  $scope.checkCurrentProgram = function(){
    if ($scope.currentProgram.title == null ) {
      $scope.showAlertTitle();
      return false;
    }

    //show alert if not all program fields are filled in
    else if ($scope.currentProgram.sawWidth == null || $scope.currentProgram.cutWidth == null
      || $scope.currentProgram.pinWidth == null    || $scope.currentProgram.numberOfCuts == null
      || $scope.currentProgram.startPosition == null) {
      $scope.showAlertVars();
      return false;
    }
    else {
      return true;
    }
  };

  $scope.saveProgram = function() {
    //show alert if title is not filled in
    if ($scope.checkCurrentProgram() === true) {
      if ($scope.currentProgram.titlePreset) {
        delete $scope.currentProgram.titlePreset
      }
      window.localStorage[$scope.currentProgram.title] = JSON.stringify($scope.currentProgram);
      $scope.userPrograms.push($scope.currentProgram);
      logService.consoleLog('userProgram pushed to userPrograms & localStorage');
      logService.consoleLog('\nuserPrgrams after pushed saved program:');
      logService.consoleLog($scope.userPrograms);
      logService.consoleLog('\ncurrentProgram:');
      logService.consoleLog($scope.currentProgram);
      //call the successful save popup
      $scope.showAlertSaveSucces();
      //update the list of userPrograms
      $scope.loadUserPrograms();
      shareProgram.setObj($scope.currentProgram);
    }
    else {
      //$scope.checkCurrentProgram();
    }
  };

  $scope.showAlertSaveSucces = function() {
    $ionicPopup.show(
      {
        title: 'Program saved!',
        scope: $scope,
        buttons: [
          {
            //button holds current program & closes modal
            text: 'Use current program',
            type: 'button-balanced',
            onTap: function() {
              $scope.closeModal(2);
            }
          },
          {
            //button clears program fields and title
            text: 'Create new program',
            type: 'button-calm',
            onTap: function () {
              $scope.currentProgram.title = undefined;
              $scope.currentProgram.sawWidth = undefined;
              $scope.currentProgram.cutWidth = undefined;
              $scope.currentProgram.pinWidth = undefined;
              $scope.currentProgram.numberOfCuts = undefined;
              $scope.currentProgram.startPosition = undefined;
              $scope.closeModal(2);
            }
          }
        ]
      }
    )
  };

  $scope.showAlertVars = function(){
    $ionicPopup.alert(
      {
        title: 'Not all fields are filled in',
        template: 'Please fill in all Program fields before saving the program'
      }
    )
  };

  $scope.showAlertTitle = function(){
    $ionicPopup.alert(
      {
        title: 'Not all fields are filled in',
        template: 'Title is not filled in'
      }
    )
  };

  $ionicModal.fromTemplateUrl('load-modal.html', {
    id: 1,
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal1 = modal;
  });

  $ionicModal.fromTemplateUrl('save-modal.html', {
    id: 2,
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal2 = modal;
  });

  $scope.openModal = function(index) {
    if (index === 1) {
      $scope.modal1.show();
    }
    else {
      $scope.modal2.show();
    }
  };

  $scope.closeModal = function(index) {
    if (index === 1) {
      $scope.modal1.hide();
    }
    else {
      $scope.modal2.hide();
    }

  };

  $scope.deleteUserProgram = function($index) {
    logService.consoleLog('delete userProgram clicked at index: '+$index);
    logService.consoleLog($scope.userPrograms);
    $scope.showDeleteAlert($index);
  };

  $scope.showDeleteAlert = function($index) {
    var index = $index;
    $ionicPopup.show(
      {
        title: 'Are you sure you want to delete this program?',
        scope: $scope,

        buttons: [
          {
            //button clears program fields and title
            text: 'Yes',
            type: 'button-assertive',
            onTap: function sureDelete() {
              logService.consoleLog(window.localStorage);
              logService.consoleLog('index ='+index);
              // remove the userProgram from localstorage. Step 1: get the key under which the userProgram is saved
              var userProg = $scope.userPrograms[index];
              logService.consoleLog(userProg);
              var userProgName = userProg.title;
              logService.consoleLog(userProgName);
              window.localStorage.removeItem(userProgName);
              //remove the userProgram visually
              $scope.userPrograms.splice(index, 1);
            }
          },
          {
            text: 'No',
            type: 'button-balanced'
          }
        ]
      }
    );

  };

  //On run program button, make sure that program and settings are filled in correctly
  $scope.runProgram = function() {
    if ($scope.currentProgram.sawWidth > $scope.currentProgram.cutWidth){
      $ionicPopup.alert(
        {
          title: 'Saw width cannot be wider than cut width',
          template: 'Please make sure that your saw width and cut width are entered correctly'
        }
      )
    }
    else if ($scope.currentProgram.numberOfCuts % 1 !== 0) {
      $ionicPopup.alert(
        {
          title: 'Number of cuts cannot be a floating point',
          template: 'Please make sure that the number of cuts is a whole number. "2" is correct, "2.2" is incorrect.'
        }
      )
    }
    else if ($scope.currentProgram.sawWidth > 0 && $scope.currentProgram.cutWidth > 0
      && $scope.currentProgram.pinWidth > 0 && $scope.currentProgram.numberOfCuts > 0
      && $scope.currentProgram.startPosition >= 0 && $scope.checkSettings()) {
      logService.consoleLog('all fields filled in');
      shareProgram.setObj($scope.currentProgram);
      window.localStorage['lastUsedProgram'] = JSON.stringify($scope.currentProgram);
      $scope.confirmProgram();
    }
    else {
      $ionicPopup.alert(
        {
          title: 'Not all fields are filled in',
          template: 'Please fill in all Program fields before running the program'
        }
      )
    }
  };

  $scope.confirmProgram = function(){
    $ionicPopup.alert(
      {
        title: 'Please confirm your program',
        template: '<p>Saw width: '+$scope.currentProgram.sawWidth+'</p>'+'<p>Cut width: '+$scope.currentProgram.cutWidth+'</p>'+
        '<p>Pin width: '+$scope.currentProgram.pinWidth+'</p>'+'<p>Number of cuts: '+$scope.currentProgram.numberOfCuts+'</p>'+
        '<p>Start position: '+$scope.currentProgram.startPosition+'</p>',
        buttons: [{
          text: 'Edit program',
          type: 'button-calm'
        },{
          text: 'Confirm program',
          type: 'button-balanced',
          onTap: function () {
            $state.go('app.runBluetooth');
          }
        }]
      }
    )
  };

  $scope.settings = shareSettings.getObj();

  $scope.checkSettings = function() {
    $scope.settings = shareSettings.getObj();
    logService.consoleLog($scope.settings);
    if ($scope.settings === undefined){
      logService.consoleLog('settings are not filled in correctly');
      $ionicPopup.alert(
        {
          title: 'Please make sure your settings are filled in correctly',
          template: 'Use the buttons to go to settings',
          buttons: [{
            text: 'Edit settings',
            type: 'button-calm',
            onTap: function() {
              $state.go('app.settings');
            }
          }]
        });
      return false;
    }

    else if ($scope.settings.maxFreq !== null && $scope.settings.dipswitch !== null &&
      $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.stepMotorNum !== null &&
      $scope.settings.homingStopswitch !== null && $scope.settings.encoder.enable === false) {
      logService.consoleLog('checkSettings passed');
      return true;
    }
    else if ($scope.settings.maxFreq !== null  && $scope.settings.dipswitch !== null && $scope.settings.stepMotorNum !== null &&
      $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.homingStopswitch !== null && $scope.settings.encoder.enable === true &&
      $scope.settings.encoder.stepsPerRPM !== 0 && $scope.settings.encoder.stepsToMiss > 0) {
      logService.consoleLog('checkSettings passed');
      return true;
    }
    else {
      logService.consoleLog('settings are not filled in correctly');
      var templateText = '<p>Maximum frequency: '+$scope.settings.maxFreq+'</p>'+
        '<p>Step motor dipswitch: '+$scope.settings.dipswitch+'</p>'+'<p>Spindle advancement: '+$scope.settings.spindleAdvancement+'</p>'+
        '<p>Time to maximum frequency: '+$scope.settings.time+'</p>'+'<p>Encoder enabled: '+$scope.settings.encoder.enable+'</p>';
      if ($scope.settings.encoder.enable) {
        templateText += '<p>Encoder steps per RPM: '+$scope.settings.encoder.stepsPerRPM+'</p>'+'<p>Max allowable missed steps: '+$scope.settings.encoder.stepsToMiss+'</p>'+'<p>Encoder directtion: '+$scope.settings.encoder.stepsToMiss+'</p>';
      }
      $ionicPopup.alert(
        {
          title: 'Please make sure your settings are filled in correctly',
          template: templateText,
          buttons: [{
            text: 'Edit settings',
            type: 'button-calm',
            onTap: function() {
              $state.go('app.settings');
            }
          }]
        });
      return false;
    }
  };
}
