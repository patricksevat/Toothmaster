angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
  $scope.ClearLocalStor = function() {
    localStorage.clear();
    console.log('local storage cleared');
  };

  $scope.removeLocalSafety = function() {
    window.localStorage['Safety'] = '';
    console.log('Safety reset to ""');
  }

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
  }

  $scope.setSettings = function () {
    window.localStorage['settings'] = '{"minFreq":55,"maxFreq":555,"dipswitch":55,"spindleAdvancement":5,"time":5}';
  }

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

.controller('ProgramController', function($scope, $ionicModal, $ionicPopup, shareSettings, $state) {

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
      for (a=0; a<window.localStorage.length; a++) {
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
        $scope.confirmProgram();
      }
    };

    $scope.confirmProgram = function(){
      $ionicPopup.alert(
        {
          title: 'Please confirm your program',
          template: '<p>Saw width: '+$scope.currentProgram.sawWidth+'</p>'+'<p>Cut width: '+$scope.currentProgram.cutWidth+'</p>'+'<p>Pin width: '+$scope.currentProgram.pinWidth+'</p>'+'<p>Number of cuts: '+$scope.currentProgram.numberOfCuts+'</p>'+'<p>Start position: '+$scope.currentProgram.startPosition+'</p>',
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
    $ionicPopup.alert(
      {
        title: 'Please confirm your settings',
        template: '<p>Minimum frequency: '+$scope.settings.minFreq+'</p>'+'<p>Maximum frequency: '+$scope.settings.maxFreq+'</p>'+'<p>Step motor dipswitch: '+$scope.settings.dipswitch+'</p>'+'<p>Spindle advancement: '+$scope.settings.spindleAdvancement+'</p>'+'<p>Time to maximum frequency: '+$scope.settings.time+'</p>',
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

    else if ($scope.settings.maxFreq !== null && $scope.settings.minFreq !== null && $scope.settings.dipswitch !== null && $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null) {
      return true;
    }
    else {

        console.log('settings are not filled in correctly');
        $ionicPopup.alert(
          {
            title: 'Please make sure your settings are filled in correctly',
            template: '<p>Minimum frequency: '+$scope.settings.minFreq+'</p>'+'<p>Maximum frequency: '+$scope.settings.maxFreq+'</p>'+'<p>Step motor dipswitch: '+$scope.settings.dipswitch+'</p>'+'<p>Spindle advancement: '+$scope.settings.spindleAdvancement+'</p>'+'<p>Time to maximum frequency: '+$scope.settings.time+'</p>',
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
    }

  $scope.redText = function () {
    if ($scope.currentProgram.numberOfCuts > 2 && window.localStorage['registered'] === 'false') {
      return true;
    }
  }
})

.controller('SettingsCtrl', function($scope, $ionicPopup, shareSettings){

  $scope.settings = {};

  $scope.saveSettings = function() {
    if($scope.settings.minFreq < 50){
      $scope.showAlertMinFreq();
    }
    else if ($scope.settings.maxFreq > 80000) {
      $scope.showAlertMaxFreq();
    }

    else if ($scope.settings.maxFreq == null || $scope.settings.minFreq == null || $scope.settings.dipswitch == null || $scope.settings.spindleAdvancement == null || $scope.settings.time == null) {
      $scope.showAlertSettings();
    }
    else {
      var settingsJSON = JSON.stringify($scope.settings);
      console.log(settingsJSON);
      window.localStorage['settings'] = settingsJSON;
      //call shareSettings service so that settings can be used in programCtrl
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
  }

  $scope.showAlertSettings = function(){
    $ionicPopup.alert(
      {
        title: 'Not all fields are filled in',
        template: 'Please make sure that all fields are filled in correctly'
      }
    )
  }

  $scope.showAlertSaved = function(){
    $ionicPopup.alert(
      {
        title: 'Settings saved',
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
    }

    $scope.generateActivationCode = function(){
      if (window.localStorage['activationCode'] === '') {
      $scope.activationCode = '';
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (j=1; j<41; j++) {
        $scope.activationCode += possible.charAt(Math.floor(Math.random()* possible.length));
        }
      window.localStorage['activationCode'] = $scope.activationCode;
      console.log('Localstorage activation code = '+window.localStorage['activationCode']);
      }
      else {
        $scope.activationCode = window.localStorage['activationCode'];
      }
    }

    $scope.buyPopup = function() {
      $cordovaClipboard.copy($scope.activationCode);
      $ionicPopup.alert({
        title: 'Activation code copied to clipboard',
        template: 'Go to the website to order your license',
        buttons: [
          {
           text: 'Cancel',
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



    $scope.checkLicense = function () {
      if ($scope.codeInput === null) {
        $ionicPopup.alert({
          title: 'Please enter your license code',
          template: 'Go to the website to order your license',
          buttons: [
            {
              text: 'Cancel',
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


  .controller('runBluetoothCtrl', function($scope, $cordovaBluetoothSerial, $ionicPopup, $state, $ionicPlatform, $window){
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
      $scope.bluetoothLog.unshift('Index = '+$index);
      $cordovaBluetoothSerial.connect($scope.availableDevices[$index].id).then(function () {
         $scope.bluetoothLog.unshift('Your smartphone has succesfully connected with the selected Bluetooth device');
         $scope.bluetoothConnected();
        }, function (error) {
          //failure callback
         $scope.bluetoothLog.unshift('Your smartphone has not been able to connect with the selected Bluetooth device');
         $scope.bluetoothLog.unshift('error: '+error);
        $scope.bluetoothConnected();
        })
      })
      };

    $scope.readyForData = false;

    $scope.connectToPairedDevice = function ($index) {
      $ionicPlatform.ready(function() {
        $scope.bluetoothLog.unshift('Trying to connect');
        $scope.bluetoothLog.unshift('Index = '+$index);
        $scope.bluetoothLog.unshift('Id = '+$scope.pairedDevices[$index].id);
        $cordovaBluetoothSerial.connect($scope.pairedDevices[$index].id).then(function () {
        $scope.bluetoothLog.unshift('Your smartphone has succesfully connected with the selected Bluetooth device');
        $scope.bluetoothConnected();
          $scope.readyForData = true;
      }, function (error) {
        $scope.bluetoothLog.unshift('Your smartphone has not been able to connect with the selected Bluetooth device');
          $scope.bluetoothLog.unshift('error: '+error);
      })
      })
    }

    //TODO onthoud ontvangende kant ook programUID?
    //TODO  <c>? --> 'stepper' alleen nodig voor homing
    //TODO check of f0 ergens nog gestuurd moet worden
    $scope.bluetoothStr = "";

    var emergency = false;
    $scope.showEmergency = false;
    $scope.showMovingButton = false;
    var update = false;

    $scope.emergencyOn = function () {
      $scope.bluetoothLog.unshift('Stop button pressed');
      emergency = emergency ? false : true;
      $cordovaBluetoothSerial.write('<<y8:y'+stepMotorNum+'>', function () {
        $scope.bluetoothLog.unshift('Emergency reset sent');
      }, function () {
        $scope.bluetoothLog.unshift('Emergency command could not be set. ');
      });
    };

    var programUID = '';
    var stepMotorNum = '1';
    var direction = '0';
    var totalSteps = '100'; //test
    var maxFreq = '3000'; //test
    var time = '1'; //test
    var clear = false;

    var command = 0;
    var updateSteps = '0';

    $scope.receivedBuffer = [];
    var lastCommandTime;
    var lastReceivedTime;
    $scope.movements = [0,1,2,3];
    $scope.movementsNum = 0;
    var commands = ['<<y8:y'+stepMotorNum+'>', '<v'+direction+stepMotorNum+'>', '<s'+totalSteps+stepMotorNum+'>', '<r'+maxFreq+stepMotorNum+'>',
      '<f1'+stepMotorNum+'>', '<o'+time+stepMotorNum+'>', '<kFAULT'+stepMotorNum+'>'];

    $scope.sendSettingsData = function () {
      $scope.showEmergency = true;
      $scope.subscribe();
      $scope.bluetoothLog.unshift('Starting to send settings data');
      $scope.bluetoothLog.unshift('sending new program setting '+command+commands.length);
      if (command < commands.length-1 && !emergency) {
        write(commands[command]);
        command +=1;
      }
      else if (command === commands.length-1 && !emergency) {
        write(commands[command]);
        command = 0;
        $scope.showMovingButton = true;
      }
      else {

      }
     };

    function write(str){
      lastCommandTime = Date.now();
      $cordovaBluetoothSerial.write(str, function() {
        $scope.bluetoothLog.unshift('Data sent '+str);
        //check if answer is on time
        if ($scope.receivedBuffer[0] !== undefined && lastReceivedTime - lastCommandTime < 1000) {
          $scope.bluetoothLog.unshift('In time, response time = '+(lastReceivedTime - lastCommandTime)+' ms');
          $scope.bluetoothLog.unshift('Response = '+$scope.receivedBuffer[0]);
        }
        else {
          $scope.bluetoothLog.unshift('Not responded in time, trying again');
        }
      }, function () {
        $scope.bluetoothLog.unshift('Could not send data');
      });
    }

    $scope.startMoving = function () {
      $scope.movementsNum +=1;

    };



    $scope.clearBuffer = function () {
     $cordovaBluetoothSerial.clear(function success(){
       $scope.bluetoothLog.unshift('Received buffer cleared');
     }, function err() {
       $scope.bluetoothLog.unshift('Error: Could not clear receive buffer');
     })
    };

    $scope.subscribe = function () {
      $cordovaBluetoothSerial.subscribe('\n', function success(data) {
        $scope.bluetoothLog.unshift('Opening receive buffer');
        $scope.receivedBuffer.unshift(data);
        lastReceivedTime = Date.now();
      }, function failure() {
        $scope.bluetoothLog.unshift('Error: could not subscribe to receive buffer');
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
    }

  });
//end of controller runBluetoothCtrl
