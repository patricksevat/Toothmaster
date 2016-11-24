/**
 * Created by Patrick on 24/11/2016.
 */

function asyncCtrl($rootScope, $timeout, $async, $q) {
  console.log('async ctrl loaded');
  this.runAsync = function () {
    console.log('click')
  }
}

export default asyncCtrl
