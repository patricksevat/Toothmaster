/**
 * Created by Patrick on 20/12/2016.
 */
export default function ($scope, sendAndReceiveService) {
  $scope.input = '';

  $scope.$on('$ionicView.enter', function () {
    sendAndReceiveService.subscribe();
    sendAndReceiveService.subscribeRawData();
  });

  $scope.$on('$ionicView.leave', function () {
    sendAndReceiveService.unsubscribe();
    sendAndReceiveService.unsubscribeRawData();
  });

  $scope.send = function () {
    console.log('Sending: '+$scope.input);
    sendAndReceiveService.sendWithRetry($scope.input).then((resValue) => {}, (err) => {})
  };
  
}
