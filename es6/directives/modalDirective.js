export default function () {
  console.log('error directive');
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: './templates/modals.html'
  }
}
