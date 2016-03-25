angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
  $scope.ClearLocalStor = function() {
    localStorage.clear();
    console.log('local storage cleared');
  };

  $scope.removeLocalSafety = function() {
    window.localStorage['Safety'] = '';
    console.log('Safety reset to ""');
  };

  $scope.setLocalSafety = function () {
    window.localStorage['Safety'] = 'Completed';
    console.log('Safety completed');
  };

  $scope.setRegister = function (){
    window.localStorage['registered'] = 'true';
    console.log('registered = true');
  };

  $scope.setDeregister = function (){
    window.localStorage['registered'] = 'false';
    console.log('registered = false');
  };

  $scope.setSettings = function () {
    window.localStorage['settings'] = '{"minFreq":55,"maxFreq":600,"dipswitch":60,"spindleAdvancement":5,"time":5,"encoder":{"enable": false, "stepsPerRPM": 0, "stepsToMiss": 0}}';
  };

  $scope.setProgram= function () {
    var testProg = {title: 'testprog', sawWidth: 5, cutWidth: 5, pinWidth: 5, numberOfCuts: 2, startPosition: 5  };
    window.localStorage['testProg'] = JSON.stringify(testProg);
  }
})

.controller('SafetySlides', function($scope, $sce, $ionicModal) {
  $scope.i = 0;
  $scope.hidePrev = false;

  $scope.slides = [
    'Start safety instructions','Usage','Caution!', 'Causes of unexpected movements: ', 'Keep in mind!', 'Mitigations against these failure modes:', 'Minimum requirements','Norms and regulations'
  ];

  $scope.slide3 = [
    'Android/iOS is no Operating System for safety applications','Toothmaster software is not developed to aim for a certain so-called SIL(Safety Integrity Level).','You might drop something on your phone and then Toothmaster will order the stepmotor to move.','You or somebody else might by coincidence click on the continue button while making a precision cut.','There might be interference from other applications with Toothmaster.','Your phone memory might be bad. Leading to bit rot, causing inadvertant movement.','There might be Electro Magnetic Interference in your workplace (for instance if you start a heavy motor), leading to bit rot, causing inadvertant movement.','Step motor driver (step motor driver is explained here (TBD)) generates inadvertent movement etc.'
  ];

  $scope.slide4 = [
    'Toothmaster/ OS/ smartphone generates movement when not expected.','Toothmaster/ OS/ driver keeps moving or moves too far. (could also be cause by wrong user input/ installation errors)'
  ];

  $scope.slide5 = [
    {main: 'A) Clamping your workpiece before making a cut.', sub: 'Clamping is very simple and very safe. Of course safety has a negative effect on availability. The time to make the wood joint will be longer because the milling machine might have to be stopped, clamp has to be removed and installed for every cut.'},
    {main: 'B) Safety Switch', sub: 'Operator operates the safety switch. Not recommended because operator could make mistakes/ shorts the safety switch on purpose.', sub2: 'Safety switch is operated by the shifting part of your machinery when the workpiece is in a safe position to move.'},
    {main: 'C) Combination A&B', sub: 'Especially when working on expensive and big workpieces, you might consider A + B2 and even stop your machine before shifting the workpiece.'}
  ];

  $scope.swipeRightToLeft = function() {
    if ($scope.i <7) {
    console.log('swiping right');
    $scope.i ++;
    }
  };

  $scope.next = function() {
    if ($scope.i < 7) {
      console.log("next");
      $scope.i ++;
    }
  };

  $scope.prev = function() {
    if ($scope.i >= 0) {
      console.log("prev");
      $scope.i --;
    }
  };

  $scope.prevHide = function() {
    return $scope.i === 0;
  };

  $scope.nextHide = function() {
    return $scope.i === 7;
  };

  $scope.safetyReadHide = function() {
    return $scope.i !== 7;
  };

  $scope.showScheme = function() {
    if ($scope.i === 6) {
      return true;
    }
  };

  $ionicModal.fromTemplateUrl('scheme-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
    window.screen.lockOrientation('landscape');
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
    window.screen.unlockOrientation();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  //on slide.id = 7, add read-safety-instruction button
  $scope.setLocalStorageSafety = function() {
    window.localStorage.setItem("Safety", "Completed");
  }
})

.controller('ProgramController', function($scope, $ionicModal, $ionicPopup, shareSettings, shareProgram, $state) {

  $scope.presets = [
    { titlePreset: '5mm everything', sawWidth: 5, cutWidth: 5, pinWidth: 5, numberOfCuts: 5, startPosition: 5  },
    { titlePreset: '15mm everything', sawWidth: 15, cutWidth: 15, pinWidth: 15, numberOfCuts: 15, startPosition: 15  }
  ];

  $scope.userPrograms = [];

  $scope.currentProgram = {

  };

  $scope.loadUserPrograms = function() {

    if (window.localStorage.length === 4) {
      console.log('only safety, settings, registered, activationcode found in localstorage');
    }
    //load the userPrograms stored in localStorage. objects are named 1 - n.
    //parse the userPrograms in localStorage so that they are converted to objects
    //push the parsed userPrograms to $scope.userPrograms array
    else {
      console.log(window.localStorage);
      for (var a=0; a<window.localStorage.length; a++) {
        if (window.localStorage.key(a) == 'Safety' || window.localStorage.key(a) == 'settings' || window.localStorage.key(a) == 'registered' || window.localStorage.key(a) == 'activationCode') {

        }
        else{
          var tempName = window.localStorage.key(a);
          var temp = window.localStorage[tempName];
          temp = JSON.parse(temp);
          $scope.userPrograms.push(temp);
          console.log(tempName+' pushed to userPrograms');
        }

      }
    }
  };

  $scope.loadUserPrograms();

  $scope.loadUserProgram = function($index) {
    //load userProgram & close load modal
    console.log('userProgram clicked');

    $scope.currentProgram = $scope.userPrograms[$index];
    $scope.closeModal(1);
  };

  $scope.loadPreset = function($index) {
    //load preset & close load modal
    console.log('loadPreset clicked');
    $scope.currentProgram = $scope.presets[$index];
    $scope.currentProgram.title = $scope.presets[$index].titlePreset;
    $scope.closeModal(1);
  };

  $scope.checkCurrentProgram = function(){
    console.log('num cuts= '+$scope.currentProgram.numberOfCuts);
    console.log('registered = '+ window.localStorage['registered']);
    console.log('condition ='+ (window.localStorage['registered'] = 'false'));
    if ($scope.currentProgram.title == null ) {
      $scope.showAlertTitle();
      return false;
    }
    else if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] == 'false') {
      console.log('cannot save, number of cuts too high for restriction');
      $scope.showAlertNumberOfCuts();
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

  $scope.showAlertNumberOfCuts= function(){
    $ionicPopup.alert(
      {
        title: 'Number of cuts restricted',
        template: 'You have not registered your Toothmaster yet, please register to remove number of cuts restriction',
        buttons: [{
          text: 'Continue unregistered',
          type: 'button-calm',
          onTap: function () {
            $scope.currentProgram.numberOfCuts = 2;
          }
        },{
          text: 'Register',
          type: 'button-balanced',
          onTap: function () {
            $state.go('app.register');
          }
        }]
      }
    )
  };

  $scope.saveProgram = function() {
    //show alert if title is not filled in
    if ($scope.checkCurrentProgram() === true) {
      window.localStorage[$scope.currentProgram.title] = JSON.stringify($scope.currentProgram);
      $scope.userPrograms.push($scope.currentProgram);
      console.log('userProgram pushed to userPrograms & localStorage');
      console.log($scope.userPrograms);
      //call the successful save popup
      $scope.showAlertSaveSucces();
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
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal1.remove();
      $scope.modal2.remove();
    });

  $scope.deleteUserProgram = function($index) {
    console.log('delete userProgram clicked at index: '+$index);
    console.log($scope.userPrograms);
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
                console.log(window.localStorage);
                console.log('index ='+index);
                // remove the userProgram from localstorage. Step 1: get the key under which the userProgram is saved
                var userProg = $scope.userPrograms[index];
                console.log(userProg);
                var userProgName = userProg.title;
                console.log(userProgName);
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
      if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] === 'false') {
        console.log('cannot save, number of cuts too high for restriction');
        $scope.showAlertNumberOfCuts();
      }
      else if ($scope.currentProgram.sawWidth !== null && $scope.currentProgram.cutWidth !== null
        && $scope.currentProgram.pinWidth !== null && $scope.currentProgram.numberOfCuts !== null
        && $scope.currentProgram.startPosition !== null && $scope.checkSettings()) {
        console.log('all fields filled in');
        shareProgram.setObj($scope.currentProgram);
      //console.log('shareProgram set');
      //var checkShared =shareProgram.getObj();
      //console.log('shared sawwidth= '+checkShared.sawWidth);
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
              $scope.confirmSettings();
            }
          }]
        }
      )
    };

  $scope.confirmSettings = function() {
    var templateText = '<p>Minimum frequency: '+$scope.settings.minFreq+'</p>'+'<p>Maximum frequency: '+$scope.settings.maxFreq+'</p>'+
      '<p>Step motor dipswitch: '+$scope.settings.dipswitch+'</p>'+'<p>Spindle advancement: '+$scope.settings.spindleAdvancement+'</p>'+
      '<p>Time to maximum frequency: '+$scope.settings.time+'</p>'+'<p>Encoder enabled: '+$scope.settings.encoder.enable+'</p>';
    if ($scope.settings.encoder.enable) {
      templateText += '<p>Encoder steps per RPM: '+$scope.settings.encoder.stepsPerRPM+'</p>'+'<p>Max allowable missed steps: '+$scope.settings.encoder.stepsToMiss+'</p>';
    }
    $ionicPopup.alert(
      {
        title: 'Please confirm your settings',
        template: templateText,
        buttons: [{
          text: 'Edit settings',
          type: 'button-calm',
          onTap: function() {
            $state.go('app.settings');
          }
        },
          {
          text: 'Confirm settings',
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
    console.log($scope.settings);
    if ($scope.settings === undefined){
      console.log('settings are not filled in correctly');
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

    else if ($scope.settings.maxFreq !== null && $scope.settings.minFreq !== null && $scope.settings.dipswitch !== null &&
      $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.encoder.enable === false) {
      console.log('checkSettings passed');
      return true;
    }
    else if ($scope.settings.maxFreq !== null && $scope.settings.minFreq !== null && $scope.settings.dipswitch !== null &&
      $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null && $scope.settings.encoder.enable === true &&
      $scope.settings.encoder.stepsPerRPM !== 0 && $scope.settings.encoder.stepsToMiss < 0) {
      console.log('checkSettings passed');
      return true;
    }
    else {
        console.log('settings are not filled in correctly');
      var templateText = '<p>Minimum frequency: '+$scope.settings.minFreq+'</p>'+'<p>Maximum frequency: '+$scope.settings.maxFreq+'</p>'+
        '<p>Step motor dipswitch: '+$scope.settings.dipswitch+'</p>'+'<p>Spindle advancement: '+$scope.settings.spindleAdvancement+'</p>'+
        '<p>Time to maximum frequency: '+$scope.settings.time+'</p>'+'<p>Encoder enabled: '+$scope.settings.encoder.enable+'</p>';
      if ($scope.settings.encoder.enable) {
        templateText += '<p>Encoder steps per RPM: '+$scope.settings.encoder.stepsPerRPM+'</p>'+'<p>Max allowable missed steps: '+$scope.settings.encoder.stepsToMiss+'</p>';
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

  $scope.redText = function () {
    if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] === 'false') {
      return true;
    }
  }
})

.controller('SettingsCtrl', function($scope, $ionicPopup, shareSettings){


  $scope.settings = {
    encoder: {
      enable: false,
      stepsPerRPM: undefined,
      stepsToMiss: undefined
    }
  };


  $scope.saveSettings = function() {
    if($scope.settings.minFreq < 50){
      $scope.showAlertMinFreq();
    }
    else if ($scope.settings.maxFreq > 80000) {
      $scope.showAlertMaxFreq();
    }

    else if ($scope.settings.maxFreq == null || $scope.settings.minFreq == null ||
      $scope.settings.dipswitch == null || $scope.settings.spindleAdvancement == null ||
      $scope.settings.time == null) {
      $scope.showAlertSettings();
    }
    else if ($scope.settings.encoder.enable && ($scope.settings.encoder.stepsPerRPM ==undefined || $scope.settings.encoder.stepsToMiss== undefined)){
      $scope.showAlertSettings();
    }
    else {
      var settingsJSON = JSON.stringify($scope.settings);
      console.log(settingsJSON);
      window.localStorage['settings'] = settingsJSON;
      //call shareSettings service so that settings can be used in programCtrl & runBluetoothCtrl
      shareSettings.setObj($scope.settings);
      $scope.showAlertSaved();
    }

  };

  $scope.loadSettings = function() {
    console.log('settings: '+window.localStorage['settings']);
    if (window.localStorage['settings'] === '') {

    }
    else {
      $scope.settings = JSON.parse(window.localStorage['settings']);
    }
  };

  $scope.loadSettings();

  $scope.showAlertMinFreq = function(){
    $ionicPopup.alert(
      {
        title: 'Minimum frequency invalid',
        template: 'Please make sure that minimum frequency is set to 50 or higher'
      }
    )
  };

  $scope.showAlertMaxFreq = function(){
    $ionicPopup.alert(
      {
        title: 'Maximum frequency invalid',
        template: 'Please make sure that maximum frequency is set to 1000 or lower'
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
})

  .controller('registerCtrl', function($scope, $ionicPopup, $cordovaClipboard, $cordovaInAppBrowser, $state) {
    //TODO register not working in program after registering
    $scope.slide2 = false;

    $scope.register = function() {
      $scope.slide2 = true;
      $scope.generateActivationCode();
    };

    $scope.generateActivationCode = function(){
      if (window.localStorage['activationCode'] === '') {
      $scope.activationCode = '';
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var j=1; j<41; j++) {
        $scope.activationCode += possible.charAt(Math.floor(Math.random()* possible.length));
        }
      window.localStorage['activationCode'] = $scope.activationCode;
      console.log('Localstorage activation code = '+window.localStorage['activationCode']);
      }
      else {
        $scope.activationCode = window.localStorage['activationCode'];
      }
    };

    $scope.buyPopup = function() {
      $cordovaClipboard.copy($scope.activationCode);
      $ionicPopup.alert({
        title: 'Activation code copied to clipboard',
        template: 'Go to the website to order your license',
        buttons: [
          {
           text: 'Cancel'
          },
          {
          text: 'Buy<br>Toothmaster',
          type: 'button-balanced',
          onTap: function () {
            $cordovaInAppBrowser.open('http://goodlife.nu', '_self');
          }
        }]
      })
    };



    $scope.checkLicense = function () {
      if ($scope.codeInput === null) {
        $ionicPopup.alert({
          title: 'Please enter your license code',
          template: 'Go to the website to order your license',
          buttons: [
            {
              text: 'Cancel'
            },
            {
              text: 'Buy<br>Toothmaster',
              type: 'button-balanced',
              onTap: function () {
                $cordovaInAppBrowser.open('http://goodlife.nu', '_self');
              }
            }]
        })
      }
      else {
        window.localStorage['registered'] = 'true';
        $ionicPopup.alert({
          title: 'Toothmaster succesfully registered',
          template: 'Number of cuts is no longer restricted',
          onTap: $state.go('app.program')
        })

      }
    }

  })

  .controller('browserCtrl', function($scope, $cordovaInAppBrowser) {
  $scope.openBrowser = function() {
    $cordovaInAppBrowser.open('http://goodlife.nu', '_self');
  }

})


  .controller('runBluetoothCtrl', function($scope, $cordovaClipboard, $cordovaBluetoothSerial, $ionicPopup,
                                           $state, $ionicPlatform, $window, $interval, $timeout, shareSettings, shareProgram){
    $scope.availableDevices = [];
    $scope.pairedDevices = [];
    $scope.bluetoothLog = [];
    $scope.bluetoothEnabled =false;
    $scope.isConnected = false;
    $scope.platform = ionic.Platform.platform();
    //TODO seperate OS instructions

    $scope.checkBluetoothEnabled = function() {
      $ionicPlatform.ready(function() {
      $cordovaBluetoothSerial.isEnabled().then(function(){
        $scope.bluetoothLog.unshift('Bluetooth is turned on');
        $scope.bluetoothEnabled = true;
        $scope.getAvailableDevices();
      },function(){
        $scope.bluetoothLog.unshift('Bluetooth is turned off');
        $scope.bluetoothEnabled = false;
      });
    })
    };

    $scope.checkBluetoothEnabled();

    $scope.bluetoothOn = function () {
      $ionicPlatform.ready(function() {
      $scope.bluetoothLog.unshift('Calling bluetoothOn');
      if (ionic.Platform.isIOS()) {
        $ionicPopup.alert({
          title: 'Please open Bluetooth settings manually',
          template: 'Automatic enable not possible on iOS'
        });
        $scope.bluetoothLog.unshift('Bluetooth should be turned on manually');
      }
      else {
      $cordovaBluetoothSerial.enable().then(function () {
        $scope.bluetoothLog.unshift('Bluetooth has been turned on by Toothmaster app');
        $scope.checkBluetoothEnabled();
        $scope.bluetoothConnected();
      }, function (){
        $cordovaBluetoothSerial.showBluetoothSettings();
        $scope.bluetoothLog.unshift('Bluetooth should be turned on manually, redirected to Bluetooth settings');
      })
      }
      })
      };

    $scope.getAvailableDevices = function () {
      $ionicPlatform.ready(function() {
      $scope.bluetoothLog.unshift('Calling get available devices');
      if (ionic.Platform.isAndroid) {
        //discover unpaired
        $cordovaBluetoothSerial.discoverUnpaired().then(function (devices) {
          $scope.bluetoothLog.unshift('Searching for unpaired Bluetooth devices');
          devices.forEach(function (device) {
            $scope.availableDevices.push(device);
              $scope.bluetoothLog.unshift('Unpaired Bluetooth device found');
          }
          )}, function () {
          $scope.bluetoothLog.unshift('Cannot find unpaired Bluetooth devices');
        });
        //discover paired
        $cordovaBluetoothSerial.list().then(function (devices) {
          $scope.bluetoothLog.unshift('Searching for paired Bluetooth devices');
          devices.forEach(function (device) {
            $scope.pairedDevices.push(device);
            $scope.bluetoothLog.unshift('Paired Bluetooth device found');
          }),function () {
            $scope.bluetoothLog.unshift('Cannot find paired Bluetooth devices');
          }
        })
      }
      else if (ionic.Platform.isIOS) {
        $cordovaBluetoothSerial.list().then(function (devices) {
          $scope.bluetoothLog.unshift('Searching for Bluetooth devices');
          devices.forEach(function (device) {
            $scope.bluetoothLog.unshift('Bluetooth device found');
            $scope.availableDevices.push(device);
          })
        }, function () {
          $scope.bluetoothLog.unshift('No devices found');
        })
      }
      })
    };

    $scope.bluetoothConnected = function () {
      $ionicPlatform.ready(function() {
      $cordovaBluetoothSerial.isConnected().then(function () {
        $scope.bluetoothLog.unshift('Your smartphone is connected with a Bluetooth device');
        $scope.isConnected = true;
      }, function () {
        $scope.bluetoothLog.unshift('Your smartphone is not connected with a Bluetooth device');
        $scope.isConnected = false;
      })
      })
    };

    $scope.connectToUnpairedDevice = function ($index) {
      $ionicPlatform.ready(function() {
      $scope.bluetoothLog.unshift('Trying to connect');
      $scope.bluetoothLog.unshift('Id = '+$scope.availableDevices[$index].id);
      $cordovaBluetoothSerial.connect($scope.availableDevices[$index].id).then(function () {
         $scope.bluetoothLog.unshift('Your smartphone has succesfully connected with the selected Bluetooth device');
         $scope.bluetoothConnected();
         $scope.readyForData = true;
        }, function (error) {
          //failure callback
         $scope.bluetoothLog.unshift('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
         $scope.bluetoothLog.unshift('error: '+error);
        $scope.bluetoothConnected();
        })
      })
      };

    $scope.connectToPairedDevice = function ($index) {
      $ionicPlatform.ready(function() {
        $scope.bluetoothLog.unshift('Trying to connect');
        $scope.bluetoothLog.unshift('Id = '+$scope.pairedDevices[$index].id);
        $cordovaBluetoothSerial.connect($scope.pairedDevices[$index].id).then(function () {
          $scope.bluetoothLog.unshift('Your smartphone has succesfully connected with the selected Bluetooth device');
          $scope.bluetoothConnected();
          $scope.readyForData = true;
      }, function (error) {
          $scope.bluetoothLog.unshift('Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device');
          $scope.bluetoothLog.unshift('error: '+error);
      })
      })
    };

    //TODO onthoud ontvangende kant ook programUID?
    //TODO  <c>? --> 'stepper' alleen nodig voor homing
    //TODO check of f0 ergens nog gestuurd moet worden

    //show buttons on view vars
    $scope.readyForData = false;
    var emergency = false;
    $scope.showEmergency = false;
    $scope.showMovingButton = false;
    $scope.showCalcButton = false;
    $scope.moving = false;

    $scope.emergencyOn = function () {
      $scope.bluetoothLog.unshift('Stop button pressed');
      emergency = true;
      $scope.showEmergency = false;
      $scope.showMovingButton = false;
      $scope.showCalcButton = false;
      $scope.showResetButton = true;
      //Send reset command
      $cordovaBluetoothSerial.write('<<8:y'+stepMotorNum+'>').then(function () {
        $scope.bluetoothLog.unshift('Emergency reset sent');
      }, function (err) {
        $scope.bluetoothLog.unshift('Error: Emergency command could not be set. '+err);
      });
    };

    $scope.emergencyOff = function () {
      $scope.readyForData = true;
      command = 0;
      encoderCommand = 0;
      response = 0;
      $scope.movements = [];
      $scope.movementsNum = 0;
      done = true;
    };

    //get settings and program from other controllers
    $scope.settings = shareSettings.getObj();
    var program = shareProgram.getObj();

    //TODO Wat te doen met encoder direction?
    //setting vars
    var stepMotorNum = '1';
    var direction = ($scope.settings.direction) ? 1 : 0; //if 'change direction' is true then 1, else 0
    var totalSteps = calcTotalSteps();
      function calcTotalSteps() {
      //calculate total movement in mm, calculate total RPM, calculate total steps, modify total steps to negative if necessary
      var totalMovementMM = (program.numberOfCuts*(program.cutWidth))+(program.pinWidth*(program.numberOfCuts-1))+program.startPosition;
      var totalRPM = totalMovementMM / $scope.settings.spindleAdvancement;
      var stepsTotal = totalRPM * $scope.settings.dipswitch;
      if (direction === 1) return stepsTotal*-1;
      else return stepsTotal;
    }; // value can be positive or negative
    var stepsPerRPM = $scope.settings.dipswitch; // value must be positive
    var maxRPM = ($scope.settings.maxFreq*60/$scope.settings.dipswitch).toFixed(3); //MaxFreq*60/dipswitch , value is max speed in RPM, floating point, must be positive
    var time = $scope.settings.time.toFixed(3); //test, value floating point, must be positive
    var stepMotorOnOff = '1'; //test, value 0 or 1

    //other vars/commands
    var homingCommand = '0'; //test, value 0 (left) or 1 (right)
    var stepUpdate;  //test, value is integer, positive or negative allowed
    var softwareVersionCommand = '<z'+stepMotorNum+'>';

    //decoder vars
    var disableEncoder = '<x0'+stepMotorNum+'>';
    var stepsPerRPMDevidedByStepsPerRPMEncoder = ($scope.settings.encoder.stepsPerRPM) ? ($scope.settings.dipswitch/$scope.settings.encoder.stepsPerRPM).toFixed(3) : '' ; //value floating point, allowed positive or negative value
    var maxAllowedMiss = ($scope.settings.encoder.stepsToMiss) ? $scope.settings.encoder.stepsToMiss : ''; //value = integer

    //settings commands
    var commands = ['<v'+direction+stepMotorNum+'>', '<s'+totalSteps+stepMotorNum+'>', '<p'+stepsPerRPM+stepMotorNum+'>',
      '<r'+maxRPM+stepMotorNum+'>', '<f'+stepMotorOnOff+stepMotorNum+'>', '<o'+time+stepMotorNum+'>', '<kFAULT'+stepMotorNum+'>'];
    var command = 0;

    //encoder commands
    var encoderCommands = ['<d'+stepsPerRPMDevidedByStepsPerRPMEncoder+stepMotorNum+'>', '<b'+maxAllowedMiss+stepMotorNum+'>',];
    var encoderCommand = 0;

    //response vars
    var lastCommandTime;
    var lastReceivedTime;
    $scope.receivedBuffer = [];
    var response='';

    //update steps vars
    $scope.movements = [];
    $scope.movementsNum = 0;
    var done = true;

    //function to add number of steps and description to $scope.movements
    function addMovement(steps, descr) {
      $scope.movements.push({
        "steps": steps,
        "description": descr
      })
    }

    //calculate movement sequence
    $scope.calcSteps = function() {
      //add number of steps for startposition
      var startPositionSteps = program.startPosition / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
      var startPositionDescription = 'Moving into right position to make first cut';
      addMovement(startPositionSteps, startPositionDescription);

      //call function to calculate steps for cuts, subcuts and pins, log $scope.movements, callback to inform user of movements
      cutsAndPins(function() {
        $scope.bluetoothLog.unshift('Movements to take:');
        var count= 1;
        $scope.movements.forEach(function (item) {
          $scope.bluetoothLog.unshift('Movement '+count+':'+' steps'+item.steps+', description: '+item.description);
          count +=1;
        })
      });

      function cutsAndPins(callback) {
        //do this for number of cuts
        for (var i = 1; i <= program.numberOfCuts; i++) {
          $scope.bluetoothLog.unshift('var i ='+i);
          if (program.sawWidth === program.cutWidth) {
            var cutSteps = 0;
            var cutDescription = 'Make the cut 1/1';
            addMovement(cutSteps, cutDescription);
          }
        //if cut width is wider than saw width, calculate subcuts (multiple subcuts needed to complete one cut)
          else if (program.cutWidth > program.sawWidth){
          //how many subcuts do we need for this cut to complete
            var subCuts = program.cutWidth / program.sawWidth;
            var cutsRoundedUp = Math.ceil(subCuts);
          //first subcut is already in position
            addMovement(0, 'Make subcut 1/'+cutsRoundedUp);
            // calculate remaining subcut steps, start at 2 because first subcut is already added
            for (var j=2; j<= cutsRoundedUp; j++){
              $scope.bluetoothLog.unshift('Var j'+j);
              if (j<cutsRoundedUp){
                var stepsPerSawWidth = program.sawWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
                addMovement(stepsPerSawWidth, 'Make subcut '+j+'/'+cutsRoundedUp)
              }
              else if (j===cutsRoundedUp) {
                //calculate remaining mm & steps, based on number of subcuts already taken
                var remainingMM = program.cutWidth-((j-1)*program.sawWidth);
                var remainingSteps = remainingMM / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
                addMovement(remainingSteps, 'Make subcut '+j+'/'+cutsRoundedUp);
              }
            }
          }
          //calculate steps for pins, not needed after last cut, thus i<numberOfCuts
          if (i<program.numberOfCuts) {
            $scope.bluetoothLog.unshift('Calculating pin');
            var pinSteps = program.pinWidth / $scope.settings.spindleAdvancement * $scope.settings.dipswitch;
            var pinDescription = 'Moving to next cut';
            addMovement(pinSteps, pinDescription);
          }
          if (i=== program.numberOfCuts){
            $scope.bluetoothLog.unshift('i === numberofcuts');
            if (callback) callback();
            $scope.showMovingButton = true;
            $scope.showCalcButton = false;
          }
        }
      }

    }

    //retrieve bluetooth messages from driver
    function subscribe(){
      $window.bluetoothSerial.subscribeRawData(function (data) {
        //update view as message comes in, response converted from ArrayBuffer to String
        $scope.$apply(function () {
          response += String.fromCharCode.apply(null, new Uint8Array(data));
          lastReceivedTime = Date.now();
        });
      });
    }

    //user clicks button front end, sendSettingsData() called
    $scope.sendSettingsData = function () {
      $scope.showEmergency = true;
      //subscribe to Bluetooth incoming messages
      subscribe();
      //send start command
      send('<<8:y'+stepMotorNum+'>', function () {
        //send encoder settings or disable encode command, after that send settings commands
        if ($scope.settings.encoder.enable) {
          $scope.bluetoothLog.unshift('Encoder enabled');
          send(encoderCommands[0], encoderPlus);
        }
        else {
          $scope.bluetoothLog.unshift('Encoder disabled');
          send(disableEncoder, function () {
            send(commands[command], commandPlus);
          })
        }
      });



      function encoderPlus(){
        if (encoderCommand < encoderCommands.length-1){
          encoderCommand +=1;
          send(encoderCommands[encoderCommand], encoderPlus);
        }
        else if (encoderCommand === encoderCommands.length-1){
          send(commands[command], commandPlus);
        }
      }

      //command closure callback
      function commandPlus() {
        if (command < commands.length-1) {
          command += 1;
          send(commands[command], commandPlus);
        }
        //on last command check if 'rdy' has been sent
        else if (command === commands.length-1 && $scope.receivedBuffer[0].search('rdy')> -1) {
          $scope.bluetoothLog.unshift('Ready for movement');
          $scope.showCalcButton = true;
          $scope.readyForData = false;
          command = 0;
        }
        else if (command === commands.length-1 && $scope.receivedBuffer[0].search('rdy') === -1){
          $scope.bluetoothLog.unshift('Settings have not been sent correctly');
          command = 0;
        }
      }
    };

    $scope.startMoving = function () {
      //check if prev stepCommand is done, send command, start pinging <w>, check for 'done:', allow next stepCommand
      subscribe();
      if (done) {
        done = false;
        send('<q'+$scope.movements[$scope.movementsNum].steps+stepMotorNum+'>', checkDone);
        $scope.bluetoothLog.unshift($scope.movements[$scope.movementsNum].description);
        $scope.movementsNum += 1;

      }
      else {
        $scope.bluetoothLog.unshift('Please wait untill this step is finished');
      }

      function checkDone() {
        if ($scope.receivedBuffer[0].search('done:') !== -1) {
          $scope.bluetoothLog.unshift('Movement done, ready for next movement');
          done = true;
          //once last movement is completed show restart program popup
          if ($scope.movementsNum === $scope.movements.length -1) {
            $scope.showRestartModal();
          }
        }
        else {
          send('<w'+stepMotorNum+'>', checkDone);
        }
      }
    };



    function send(str, callback){
      //Check for emergency
      if(!emergency) {
          //write to bluetooth receiver
          $cordovaBluetoothSerial.write(str).then(function () {
              lastCommandTime = Date.now();
              $scope.bluetoothLog.unshift('Command: '+str);
              $scope.receivedBuffer.unshift('Command: '+str);
              //$scope.bluetoothLog.unshift('Last command time: '+lastCommandTime);

              //check periodically if response has been sent
              var interval = $interval(function () {
                var now = Date.now();
                //parse response && reset response
                $scope.bluetoothLog.unshift('Response: '+response);
                $scope.receivedBuffer.unshift('Response: '+response);
                response = '';
                if(lastReceivedTime - lastCommandTime <1000 && lastReceivedTime - lastCommandTime >0) {
                  $scope.bluetoothLog.unshift('Responded in time = '+(lastReceivedTime-lastCommandTime)+' ms');
                  $interval.cancel(interval);
                  if(callback) callback();
                }
                else if (now - lastCommandTime>3000){
                  $scope.bluetoothLog.unshift('Not responded on time, now = '+now);
                  $scope.bluetoothLog.unshift('Sending command again');
                  $interval.cancel(interval);
                }
              },100);

          }), function () {
            $scope.bluetoothLog.unshift('Could not send command');
          };
      }
      else {
        $scope.bluetoothLog.unshift('Emergency button pressed');
      }
    }

    $scope.clearBuffer = function () {
     $cordovaBluetoothSerial.clear().then(function success(){
       $scope.bluetoothLog.unshift('Received buffer cleared');
     }, function err() {
       $scope.bluetoothLog.unshift('Error: Could not clear receive buffer');
     })
    };

    $scope.showRestartModal = function () {
      $ionicPopup.alert({
        title: 'Program finished!',
        template: 'Would you like to restart your program?',
        buttons: [
          {
            text: 'Yes',
            type: 'button-balanced',
            onTap: function () {

            }
          },
          {
            text: 'Edit program',
            type: 'button-balanced',
            onTap: function () {

            }
          },
          {
            text: 'No',
            type: 'button-calm',
            onTap: function () {

            }
          }]
      })
    };


    $scope.start = function () {
      $ionicPopup.alert({
        title: 'Make sure your workpiece is tightly secured!',
        template: 'Program is about to start!',
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Start',
            type: 'button-balanced',
            onTap: function () {

            }
          }]
      })
    };
/*
    $scope.openBluetoothLog = function () {
      var html ='';
      $scope.bluetoothLog.forEach(function (item) {
        item.replace('<','&lt;');
        item.replace('>','&gt;');
        html += '<pre><p>'+item+'</p></pre>';
      });
      $ionicPopup.alert({
        title: 'Bluetooth log',
        template: $scope.bluetoothLog,
        buttons: [
          {
            text: 'Close'
          },
          {
            text: 'Copy',
            type: 'button-balanced',
            onTap: function () {
              $cordovaClipboard.copy($scope.bluetoothLog.join(' , '));
            }
          }]
      })
    };

    $scope.openReceivedBuffer= function () {
      var html = '';
      for (var i =0; i<5; i++){
        var str = '';
        str += $scope.receivedBuffer[0];
        str.replace('&lt;','open');
        str.replace('>','close');
        html+='<p>'+str+'</p>';
      }
      $ionicPopup.alert({
        title: 'Command log',
        template: html,
        buttons: [
          {
            text: 'Close'
          },
          {
            text: 'Copy',
            type: 'button-balanced',
            onTap: function () {
              $cordovaClipboard.copy($scope.receivedBuffer.join(' , '));
            }
          }]
      })
    };
*/
  });
//end of controller runBluetoothCtrl
