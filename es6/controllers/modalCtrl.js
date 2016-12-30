export default function ($scope, modalService, logService, logModalService) {
  const self = this;

  $scope.$on('modal.shown', () => {
    console.log('modal shown');
    $scope.fullLog = logService.getLog();
  });

  $scope.show = null;

  $scope.showAnswer = function(obj) {
    $scope.show = $scope.show === obj ? null : obj;
  };

  $scope.QAList = [
    {
      question: 'Something went wrong! Can you help?',
      answer: "We're very sorry to hear that. Please send us a bug report. You can do that by going to \"Test Connection\" and clicking on \"Show full log\", then click on \"Email bug report\". Possibly a request to see your files will appear. Please click accept. We only use this to retrieve and attach the logfile. You email client shouwld now open and you only have to click send."
    },
    {
      question: 'How do I determine my step motor number?',
      answer: "Your stepmotor number depends on your stepmotor driver. Your stepmotor driver has multiple out ports. Check the port on your stepmotor driver and enter the number in Settings"
    }
  ];
  for (var i=3; i<11; i++) {
    $scope.QAList.push({
      question: 'Question '+i,
      answer: 'Lorem ipsum'
    })
  }

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
