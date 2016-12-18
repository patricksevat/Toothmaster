export default function modalService($ionicModal, $rootScope, logService) {
  const self = this;

  //Public available methods
  self.init = init;
  self.getFullLog = getFullLog;
  self.setFullLog = setFullLog;

  //Scoped variables
  self.log = [];

  // function setFullLog(logArr) {
  //   self.log = logArr;
  // }

  // function getFullLog() {
  //  
  //   return self.log;
  // }

  function init(template, $scope) {

    let promise;
    $scope = $scope || $rootScope.$new();
    promise = $ionicModal.fromTemplateUrl(template, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal= modal;
      return modal
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    return promise;
  }
}
