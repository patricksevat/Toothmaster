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
  }

  $scope.setRegister = function (){
    window.localStorage['registered'] = true;
    console.log('registered = true');
  }
})

.controller('SafetySlides', function($scope, $sce, $ionicModal) {
  $scope.i = 0;
  $scope.hidePrev = false;

  $scope.slides = [
    'Start safety instructions','Usage','Caution!', 'Causes of unexpected movements: ', 'Keep in mind!', 'Mitigations against these failure modes:', 'Minimum requirements','Norms and regulations'
  ];

  $scope.slide3 = [
    'Android/iOS is no Operating System for safety applications','Toothmaster software is not developed to aim for a certain so-called SIL(Safety Integrity Level).','You might drop something on your phone and then Toothmaster will order the stepmotor to move.','You or somebody else might by coincidence click on the continue button while making a precision cut.','There might be interference from other applications with Toothmaster.','Your phone memory might be bad. Leading to bit rot, causing inadvertant movement.','There might be Electro Magnetic Interference in your workplace (for instance if you start a heavy motor), leading to bit rot, causing inadvertant movement.','Toothmaster uses the soundcard to steer the step motor. If you play a song/ an application does beep, there is inadvertant movement.','etc.'
  ];

  $scope.slide4 = [
    'Toothmaster/ OS/ smartphone generates movement when not expected.','Toothmaster/ OS/ smartphone keeps moving/ moves too far. (could also be cause by wrong user input/ installation errors)'
  ];

  $scope.slide5 = [
    {main: 'A) Clamping your workpiece before making a cut.', sub: 'Clamping is very simple and very safe. The time to make the mortise tenon connection will be longer because the milling machine has to be stopped, clamp has to be removed and installed for every cut.'},
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

  /*If localstorage[registered] == false restrict number of cuts to 2
  $scope.numberOfCutsRestriction = function() {
    if (window.localStorage['registered'] === true) {
      console.log('number cuts not restricted');
      return 999999999;
    }
    else {
      console.log('number of cuts restricted');
      return 2;
    }
  }*/

  $scope.loadUserPrograms = function() {

    if (window.localStorage.length === 4) {
      console.log('only safety, settings, registered & numUserProgs found in localstorage');
    }
    //load the userPrograms stored in localStorage. objects are named userProgram1 - userProgramN.
    //parse the userPrograms in localStorage so that they are converted to objects
    //push the parsed userPrograms to $scope.userPrograms array
    else {
      for (a=1; a<window.localStorage.length-1; a++) {
        if (window.localStorage['userProgram'+a] !== undefined) {
          var temp = window.localStorage['userProgram'+a];
          temp = JSON.parse(temp);
          $scope.userPrograms.push(temp);
          console.log('window.localStorage[userProgram'+a+'] pushed to userPrograms');
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
    $scope.closeModal(1);
  };

  $scope.checkCurrentProgram = function(){
    if ($scope.currentProgram.title == null ) {
      $scope.showAlertTitle();
    }
    else if ($scope.currentProgram.numberOfCuts > 2 && !window.localStorage['registered']) {
      console.log('cannot save, number of cuts too high for restriction');
      $scope.showAlertNumberOfCuts();
    }

    //show alert if not all program fields are filled in
    else if ($scope.currentProgram.sawWidth == null || $scope.currentProgram.cutWidth == null
      || $scope.currentProgram.pinWidth == null    || $scope.currentProgram.numberOfCuts == null
      || $scope.currentProgram.startPosition == null) {
      $scope.showAlertVars();
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
    if ($scope.checkCurrentProgram()) {
      //add 1 to window.localStorage['numUserProgs']
      var tempNumUserProgs = window.localStorage['numUserProgs'];
      tempNumUserProgs = Number(tempNumUserProgs);
      tempNumUserProgs += 1;
      window.localStorage.setItem('numUserProgs',tempNumUserProgs);
      console.log('numUserProg for this save is = '+window.localStorage['numUserProgs']);

      //create variables for naming the new userProgram
      var numUserProgs = window.localStorage['numUserProgs'];
      var userProgramID = "userProgram";
      userProgramID += numUserProgs;

      //store the new userProgram in localStorage
      window.localStorage[userProgramID] = JSON.stringify($scope.currentProgram);
      $scope.userPrograms.push($scope.currentProgram);
      console.log('userProgram pushed to userPrograms & localStorage');

      //call the succesful save popup
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

                console.log('index ='+index);
                //remove the userProgram visually
                $scope.userPrograms.splice(index, 1);

                // remove the userProgram from localstorage. Step 1: get the key under which the userProgram is saved
                // $index+4 is because the first item is 'Safety', second item is numUserProgs, third is settings and fourth is registered
                var userProgName = window.localStorage.key( index+4 );

                //check if the userProgramName has 1 or 2 ID-numbers
                //set userProgNum to the ID-number(s) and remove from localStorage
                if (userProgName.length === 11) {
                  var userProgNum = userProgName.charAt(11);
                  window.localStorage.removeItem('userProgram'+userProgNum);
                }
                else if (userProgName.length === 12) {
                  var userProgNum = userProgName.charAt(11)+userProgName.charAt(12);
                  window.localStorage.removeItem('userProgram'+userProgNum);
                }

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
    $scope.confirmVars = function() {
      if ($scope.checkCurrentProgram() && $scope.checkSettings()) {
        console.log('all fields filled in');
        $scope.confirmProgram();
      }
      else if (!$scope.checkSettings) {
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
            $scope.chooseOutput();
          }

        }]
      }
    )
  };

  $scope.settings = shareSettings.getObj();

  $scope.checkSettings = function() {
    console.log($scope.settings);
    if ($scope.settings.maxFreq !== null && $scope.settings.minFreq !== null && $scope.settings.dipswitch !== null && $scope.settings.spindleAdvancement !== null && $scope.settings.time !== null) {
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

  $scope.chooseOutput = function() {
    $ionicPopup.alert(
      {
        title: 'Please choose your output mode',
        template: 'You can choose between audio output or bluetooth connection',
        buttons: [{
          text: 'Audio  <i class="icon ion-volume-medium"></i>',
          type: 'button-calm',
          onTap: function() {
            $state.go('app.runAudio');
          }
        },
          {
            text: '<span class="vertical-align">Bluetooth  </span><i class="icon ion-bluetooth"></i>',
            type: 'button-calm',
            onTap: function() {
              $state.go('app.runAudio');
            }
        }]
      });
  }

})

.controller('SettingsCtrl', function($scope, $ionicPopup, shareSettings){


  $scope.saveSettings = function() {
    if($scope.settings.minFreq < 50){
      $scope.showAlertMinFreq();
    }
    else if ($scope.settings.maxFreq > 1000) {
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
    }

  };

  $scope.loadSettings = function() {
    console.log(window.localStorage['settings']);
    if (window.localStorage['settings'] !== '') {
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

})

  .controller('registerCtrl', function($scope) {

  })
