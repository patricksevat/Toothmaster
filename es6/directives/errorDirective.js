export default function ($rootScope) {
  console.log('error directive');
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: './templates/errorHeader.html'
  }
}
