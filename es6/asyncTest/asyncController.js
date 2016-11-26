/**
 * Created by Patrick on 24/11/2016.
 */

function asyncCtrl($rootScope, $timeout, $async, $q) {
  var self = this;
  console.log('async ctrl loaded');

  this.runAsync = function () {
    console.log('click');
  };

  this.asyncFunction = $async(function* () {
    try {
      console.log('asyncFunction');
      let timeout;
      timeout = yield self.retryFunc();
      console.log('async timeout resolved: '+timeout);
    }
    catch (err) {
      console.log('async timeout rejected: '+err);
    }
  });

  this.retryFunc = $async(function* () {
    let value, returnValue;
    for (let i = 0; i < 5; i++) {
      console.log('i: '+i);
      value = yield self.timeout(i);

      if (i=== 4) {
        return new Promise((resolve, reject) => {
          reject('exceeded num of tries');
        });
      }
      else if (value == 'resolved') {
        return new Promise((resolve, reject) => {
          console.log('resolve value: '+value);
          resolve('resolve value: '+value);
        });
      }
    }
  });

  this.timeout = function (i) {
    console.log('timeout called');
    return new Promise((resolve, reject) => {
      $timeout(function () {
        console.log('timeout 2s, i: '+i);
        if (i === 3) {
          resolve('resolved');
        }
        else {
          resolve('rejected');

        }
      }, 2000)
    });

  }
}

export default asyncCtrl
