export default function (bugout) {
  let button = this;
  button.getValues = getValues;
  button.setValues = setValues;
  button.setEmergencyValues = setEmergencyValues;

  button.value = {};
  button.value.readyForData = false;
  button.value.showEmergency = false;
  button.value.showMovingButton = false;
  button.value.showCalcButton = false;
  button.value.showResetButton = false;
  button.value.showHoming = true;
  button.value.showStressTest = true;
  button.value.showVersionButton = true;
  button.value.showMoveXMm = true;
  button.value.showSpinner = false;


  function getValues() {
    return button.value;
  }

  function setValues(obj) {
    bugout.bugout.log('buttonService.setValues called');
    for (const keyVal in obj) {
      if (obj.hasOwnProperty(keyVal))
        button.value[keyVal] = obj[keyVal]
    }
  }

  function setEmergencyValues() {
    button.setValues({
      showEmergency : false,
      showMovingButton : false,
      showCalcButton : false,
      showStressTest : false,
      showHoming : false,
      showSpinner : false,
      showVersionButton : false,
      showMoveXMm : false,
      readyForData : false,
      showResetButton: true
    });
  }
}
