export default function () {
  let errors = [{level: 'critical', message: 'something very went wrong'}, {level: 'warning', message: 'something might\'ve went wrong'}];

  this.getErrors = () => {
    return errors
  };

  this.addError = (errorObj) => {
    errors.push(errorObj)
  };
  
  this.removeFirstError = () => {
    console.log('removeFirstError');
    errors = errors.slice(1);
  }
}
