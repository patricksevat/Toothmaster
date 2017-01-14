export default function ($rootScope, bugout) {
  let errors = [];
  //example error: {level: 'critical', message: 'something went wrong'}

  let self = this;

  this.getErrors = () => {
    return errors
  };

  this.addError = (newErrorObj) => {
    let priorityMessage = false;
    let priorityIndex;
    errors.forEach((errObj, index) => {
      if (errObj.message === 'Connection with bluetooth device lost' ||
        errObj.message.search('has been hit. Aborting task.') > -1 ||
        errObj.message === 'You have exceeded the maximum number of allowed steps') {
        priorityMessage = true;
        priorityIndex = index;
      }
    });

    if (!priorityMessage) {
      errors.unshift(newErrorObj);
    }
    else {
      errors = [errors[0], newErrorObj, errors.slice(1)];
    }

    $rootScope.$emit('errorsChanged');
  };

  this.removeFirstError = () => {
    bugout.bugout.log('removeFirstError');
    errors = errors.slice(1);
  };

  //  emergency listeners
  $rootScope.$on('emergencyOn', () => {
    self.addError({level: 'critical', message: 'Emergency is on'});
  });

  $rootScope.$on('emergencyOff', () => {
    removeError(['Emergency is on', 'Emergency on, will not continue with movement',
    'Error: Program reset command could not be sent.', 'has been hit. Aborting task.',
    'You have exceeded the maximum number of allowed steps'])
  });

  // connection listeners
  $rootScope.$on('connectionLost', () => {
    self.addError({
      level: 'critical', message: 'Connection with bluetooth device lost'
    });
  });

  $rootScope.$on('connectedToDevice', () => {
    removeError(['Connection with bluetooth device lost', 'Cannot find paired Bluetooth devices',
    'No devices found', 'Lost connecting while sending, turning on emergency', 
      'Your smartphone has not been able to connect or has lost connection with the selected Bluetooth device']);
  });

  function removeError(msgArr) {
    bugout.bugout.log('removeError called, errors.length: '+errors.length);
    errors = errors.filter((errObj) => {
      let remove = false;
      msgArr.forEach((msg) => {
        if (errObj.message.search(msg) > -1) {
          remove = true;
        }
      });
      if (!remove)
        return errObj;
    });
    $rootScope.$emit('errorsChanged');
    bugout.bugout.log('errors after filtering: '+errors);
  }
}
