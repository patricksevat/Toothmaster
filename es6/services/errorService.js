export default function ($rootScope) {
  let errors = [];
  //example error: {level: 'critical', message: 'something went wrong'}

  let self = this;

  this.getErrors = () => {
    return errors
  };

  this.addError = (errorObj) => {
    errors.unshift(errorObj);
    $rootScope.$emit('errorAdded');
  };

  this.removeFirstError = () => {
    console.log('removeFirstError');
    errors = errors.slice(1);
  };

  this.removeEmergencyError = () => {
    errors.filter((error) => {
      if (error.message != 'Emergency is on')
        return error;
    })
  };

  //  emergency listeners
  $rootScope.$on('emergencyOn', () => {
    self.addError({level: 'critical', message: 'Emergency is on'});
    $rootScope.$emit('errorAdded');
  });
  
  // connection lost listeners
  $rootScope.$on('connectionLost', () => {
    self.addError({
      level: 'critical', message: 'Connection with bluetooth device lost'
    });
    $rootScope.$emit('errorAdded');
  })
}
