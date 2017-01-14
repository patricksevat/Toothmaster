export default function ($scope, $rootScope, errorService, $ionicScrollDelegate) {
  $scope.showErrorHeader = false;
  $scope.errors = [];
  //example error: {level: 'critical', message: 'something went wrong'}

  $scope.$on('ionicView.enter', () => {
    loadErrors();
  });

  $rootScope.$on('errorsChanged', function () {
    loadErrors();
  });

  function loadErrors() {
    $scope.errors = errorService.getErrors();
    if ($scope.errors.length > 0) {
      $scope.showErrorHeader = true;
      $ionicScrollDelegate.scrollTop();
    }
    else
      $scope.showErrorHeader = false;
  }

  loadErrors();

  $scope.dismissError = () => {
    errorService.removeFirstError();
    loadErrors();
  };
}
