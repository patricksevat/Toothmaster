export default function ($rootScope, $scope, modalService, logService, logModalService, $ionicPopup) {
  const self = this;
  
  /**
   * Program.html modals
   * */

  $scope.presets = [
    { titlePreset: '5mm everything', sawWidth: 5, cutWidth: 5, pinWidth: 5, numberOfCuts: 5, startPosition: 5  },
    { titlePreset: '15mm everything', sawWidth: 15, cutWidth: 15, pinWidth: 15, numberOfCuts: 15, startPosition: 15  }
  ];

  $scope.deleteUserProgram = function(index) {
    logService.consoleLog('delete userProgram clicked at index: '+index);
    $scope.showDeleteAlert(index);
  };

  $scope.showDeleteAlert = function(index) {
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
              const userProg = $scope.userPrograms[index];
              logService.consoleLog(userProg);
              const userProgName = userProg.title;
              logService.consoleLog(userProgName);
              window.localStorage.removeItem(userProgName);
              //remove the userProgram visually
              // $scope.userPrograms.splice(index, 1);
              $rootScope.$emit('deleteUserProgram', index);
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

  $scope.$on('modal.shown', () => {
    $scope.fullLog = logService.getLog();
  });

  $scope.show = null;

  $scope.showAnswer = function(obj) {
    $scope.show = $scope.show === obj ? null : obj;
  };

  $scope.QAList = [
    {
      question: 'Something went wrong! Can you help?',
      answer: "We're very sorry to hear that. Please send us a bug report. You can do that by going to \"Test Connection\" and clicking on \"Show full log\", then click on \"Email bug report\". Possibly a request to see your files will appear. Please click accept. We only use this to retrieve and attach the logfile. Your email app should now open and you only have to click send."
    },
    {
      question: 'How do I determine my step motor number?',
      answer: "Your stepmotor number depends on your stepmotor driver. Your stepmotor driver has multiple out ports. Check the port on your stepmotor driver and enter the number in Settings"
    },
    {
      question: 'Where can I find the software version?',
      answer: 'Go to "Test Connection" and click on "Get version number". This will return the software version of your STM-32.'
    }
  ];

  $scope.emailFullLog = function () {
    logModalService.emailFullLog();
  } ;

  $scope.fullLog = [];

  self.getFullLog = function () {
    $scope.fullLog = modalService.getFullLog();
  };

  $scope.fullLogPage = 0;

  $scope.getFullLogExtract = function(start, end) {
    logService.consoleLog('getFullLogExtract, start: '+start+' end: '+end);
    $scope.fullLog = $scope.bluetoothLog.slice(start, end)
  };

  $scope.previousFullLogPage = function () {
    logService.consoleLog('prevFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage-1)*10),(($scope.fullLogPage-1)*10)+9);
    $scope.fullLogPage -= 1;
  };

  $scope.nextFullLogPage = function () {
    logService.consoleLog('nextFullLogPage');
    $scope.getFullLogExtract((($scope.fullLogPage+1)*10),(($scope.fullLogPage+1)*10)+9);
    $scope.fullLogPage += 1;
  };
}
