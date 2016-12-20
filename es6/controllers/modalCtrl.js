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

  $scope.QAList = [];
  for (var i=1; i<11; i++) {
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
