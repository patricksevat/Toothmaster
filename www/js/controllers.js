angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
  $scope.ClearLocalStor = function() {
    localStorage.clear();
    console.log('local storage cleared');
  }

  $scope.setLocalSafety = function () {
    window.localStorage['Safety'] = 'Completed';
    console.log('Safety completed');
  }
})

.controller('SafetySlides', function($scope, $sce, $ionicModal) {
  $scope.i = 0;
  $scope.hidePrev = false;

  $scope.slides = [
    { title: 'Start safety instructions', description: '<div class="safety-text"><h4>Dear customer, before you start using the program in your application, please read this note on safety, health and responsibilities.</h4></div>', id: 0 },
    { title: 'Usage', description: '<div class="safety-text">Toothmaster contains functionality that can be used in an application/ product to make a <u>mortise tenon connection.</u> You will have to add other components or jiggs to saw or mill a <u>mortise tenon connection.</u> You might even have to make modifications to your existing machinery.  <br><br><h2 style="color:red; font-size: 1.2em;">For this reason we cannot take responsibility that your mortise tenon solution will be safe and complies with all norms.</h2> <br>Toothmaster requires other components to create safe mortise tenon connections as is explained next.</div>', id: 1 },
    { title: 'Caution!', description: '<div class="safety-text">You will use Toothmaster to create precise movements in order to enable an operator to make a precision cut. There is a chance (explained below) that there will be unexpected movements while the operator makes the cut. These movements could lead to damage to persons, your workpiece or machinery. For this reason, you have to take additional safety measures</div>', id: 2 },
    { title: 'Causes of unexpected movements: ', description: '<div class="item item-text-wrap row"><div class="warning-sign col-20"><i class="glyphicon glyphicon-exclamation-sign"></i></div><div class="safety-text col-75">Android/iOS is no Opereating System for safety applications</div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign"></i></div> <div class="safety-text col-75">Toothmaster software is not developed to aim for a certain so-called SIL(Safety Integrity Level).</div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign"></i></div><div class="safety-text col-75"> You might drop something on your phone and then Toothmaster will order the stepmotor to move.</div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign"></i></div><div class="safety-text col-75">You or somebody else might by coincidence click on the continue button while making a precision cut.</div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign"></i></div><div class="safety-text col-75">There might be interference from other applications with Toothmaster.</div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign"></i></div><div class="safety-text col-75">Your phone memory might be bad. Leading to bit rot, causing inadvertant movement.</div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign"></i></div><div class="safety-text col-75">There might be Electro Magnetic Interference in your workplace (for instance if you start a heavy motor), leading to bit rot, causing inadvertant movement.</div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign"></i></div><div class="safety-text col-75">Toothmaster uses the soundcard to steer the step motor. If you play a song/ an application does beep, there is inadvertant movement.</div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign"></i></div><div class="safety-text col-75"> etc.</div></div>', id: 3 },
    { title: 'Keep in mind!', description: '<div class="safety-text">To stress once more, the Toothmaster program and OS environment might generate unexpected movements.<br><br>Thus you might need extra safety precautions. Do NEVER trust the Toothmaster and OS environment alone!<br><br>Please take the following failure modes into account (even though the chances will be small that this will happen in reality):</div><br><br><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign red-warning"></i></div><div class="safety-text col-75">Toothmaster/ OS/ smartphone generates movement when not expected.</div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-exclamation-sign red-warning"></i></div><div class="safety-text col-75">Toothmaster/ OS/ smartphone keeps moving/ moves too far. (could also be cause by wrong user input/ installation errors)</div></div>', id: 4 },
    { title: 'Mitigations against these failure modes:', description:'<div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-ok-sign"></i></div><div class="safety-text col-75">A) Clamping your workpiece before making a cut.<div class="safety-recommendation"><br><p class="safety-recommendation-text">Clamping is very simple and very safe. The time to make the mortise tenon connection will be longer because the milling machine has to be stopped, clamp has to be removed and installed for every cut.</p></div></div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-ok-sign"></i></div><div class="safety-text col-75">B) Safety Switch<div class="safety-recommendation"><br><p class="safety-recommendation-text">Operator operates the safety switch. Not recommended because operator could make mistakes/ shorts the safety switch on purpose.<br>Safety switch is operated by the shifting part of your machinery when the workpiece is in a safe position to move.</p></div></div></div><div class="item item-text-wrap row"><div class="warning-sign col-center col-20"><i class="glyphicon glyphicon-ok-sign"></i></div><div class="safety-text col-75">C) Combination A&B<div class="safety-recommendation"><br><p class="safety-recommendation-text">Especially when working on expensive and big workpieces, you might consider A + B2 and even stop your machine before shifting the workpiece.</p></div></div></div>', id: 5 },
    { title: 'Minimum requirements', description:'<div class="safety-text">We strongly advice you to at least introduce a safety switch (can also be ordered at goodlife.nu) to switch of power to the step motor when you are making a precision cut (Click scheme button on this page and watch movies/ tutorials on www.Goodlife.nu).  Please note that taking sufficient safety measures is your choice. For example you could also decide to use a momentary switch from a refrigerator door if you think this is sufficient safe and reliable for your application. If you do not use a safety switch, clamp your workpiece so that inadvertent movement is impossible. Or do both, clamping and safety switch.</div>', id: 6 },
    { title: 'Norms and regulations', description:'<div class="safety-text">There is always the question when is safe sufficiently safe. This depends on the region in the world. In the Eu there are many norms that guarantee health and safety. You could consider complying with the machines directive, the EMC directive and the ATEX directive. Complying with these standards is costly.<br><br>Be aware that we cannot take responsibility for complying with all these norms because we only deliver components and no complete solution. YOU have to think carefully if what you want to do is safe and in agreement with norms/ directives. You can find some examples on www.goodlife.nu of how you can make relatively safe mortise tenon connections. This might not be sufficient to comply with all norms in your situation/ country.<br><br>Now that you know your responsibilities and Tootmaster limitations, cllick the button below and enjoy !</div>', id: 7 }
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
  }

  $scope.prev = function() {
    if ($scope.i >= 0) {
      console.log("prev");
      $scope.i --;
    }
  }

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.prevHide = function() {
    if ($scope.i === 0) {return true;}
    else {return false;}
  }

  $scope.nextHide = function() {
    if ($scope.i === 7 ) {return true;}
    else {return false;}
  }

  $scope.safetyReadHide = function() {
    if ($scope.i === 7 ) {return false;}
    else {return true;}
  }

  $scope.showScheme = function() {
    if ($scope.i === 6) {
      return true;
    }
  }

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

.controller('ProgramController', function($scope, $ionicModal, $ionicPopup) {


  $scope.presets = [
    { titlePreset: '5mm everything', sawWidth: 5, cutWidth: 5, pinWidth: 5, numberOfCuts: 5, startPosition: 5  },
    { titlePreset: '15mm everything', sawWidth: 15, cutWidth: 15, pinWidth: 15, numberOfCuts: 15, startPosition: 15  }
  ];

  $scope.userPrograms = [];

  $scope.currentProgram = {};

  $scope.loadUserPrograms = function() {

    if (window.localStorage.length === 3) {
      console.log('only safety, settings & numUserProgs found in localstorage');
    }
    //load the userPrograms stored in localStorage. objects are named userProgram1 - userProgramN.
    //parse the userPrograms in localStorage so that they are converted to objects
    //push the parsed userPrograms to $scope.userPrograms array
    else {
      for (a=1; a<window.localStorage.length-1; a++) {
        if (window.localStorage['userProgram'+a] !== undefined) {
          var temp = window.localStorage['userProgram'+a];
          var temp = JSON.parse(temp);
          $scope.userPrograms.push(temp);
          console.log('window.localStorage[userProgram'+a+'] pushed to userPrograms');
        }
      }
    }
  }

  $scope.loadUserPrograms();

  $scope.loadUserProgram = function($index) {
    //load userProgram & close load modal
    console.log('userProgram clicked');
    $scope.currentProgram = $scope.userPrograms[$index];
    $scope.closeModal(1);
  }

  $scope.loadPreset = function($index) {
    //load preset & close load modal
    console.log('loadPreset clicked');
    $scope.currentProgram = $scope.presets[$index];
    $scope.closeModal(1);
  }

  $scope.saveProgram = function() {
    //show alert if title is not filled in
    if ($scope.currentProgram.title === undefined ) {
      $scope.showAlertTitle();
    }
    //show alert if not all program fields are filled in
    else if ($scope.currentProgram.sawWidth === undefined || $scope.currentProgram.cutWidth === undefined
      || $scope.currentProgram.pinWidth === undefined    || $scope.currentProgram.numberOfCuts === undefined
      || $scope.currentProgram.startPosition === undefined) {
      $scope.showAlertVars();
    }
    else {
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
  };

    $scope.showAlertSaveSucces = function() {
      var alertPopup3 = $ionicPopup.show(
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
    }

    $scope.showAlertVars = function(){
      var alertPopup2 = $ionicPopup.alert(
        {
          title: 'Not all fields are filled in',
          template: 'Please fill in all Program fields before saving the program'
        }
      )
    }

  $scope.showAlertTitle = function(){
    var alertPopup = $ionicPopup.alert(
      {
        title: 'Not all fields are filled in',
        template: 'Title is not filled in'
      }
    )
  }

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
          title: 'Areyou sure you want to delete this program?',
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
                // $index+3 is because the first item is 'Safety' and second item is numUserProgs, third is settings
                var userProgName = window.localStorage.key( index+3 );

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
              type: 'button-balanced',
            }
          ]
        }
      );

    }
}
)
.controller('SettingsCtrl', function($scope, $ionicPopup){
  $scope.settings = {};

  $scope.saveSettings = function() {
    if($scope.settings.minFreq < 50){
      $scope.showAlertMinFreq();
    }
    else if ($scope.settings.maxFreq > 1000) {
      $scope.showAlertMaxFreq();
    }
    else {
      var settingsJSON = JSON.stringify($scope.settings);
      console.log(settingsJSON);
      window.localStorage['settings'] = settingsJSON;
    }

  }

  $scope.loadSettings = function() {
    console.log(window.localStorage['settings']);
    if (window.localStorage['settings'] !== '') {
      $scope.settings = JSON.parse(window.localStorage['settings']);
    }

  }

  $scope.loadSettings();

  $scope.showAlertMinFreq = function(){
    $ionicPopup.alert(
      {
        title: 'Minimum frequency invalid',
        template: 'Please make sure that minimum frequency is set to 50 or higher'
      }
    )
  }

  $scope.showAlertMaxFreq = function(){
    $ionicPopup.alert(
      {
        title: 'Maximum frequency invalid',
        template: 'Please make sure that maximum frequency is set to 1000 or lower'
      }
    )
  }
})
