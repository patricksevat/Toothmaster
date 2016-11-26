//TODO check why the hell callbacks are used here, there's no async here...

export default function (buttonService, statusService, $rootScope, bugout) {
  const emergency = this;
  emergency.on = emergencyOn;
  emergency.off = emergencyOff;

  function emergencyOn(cb) {
    bugout.bugout.log('emergencyService.on called');
    statusService.setEmergency(true);
    buttonService.setEmergencyValues();
    $rootScope.$emit('emergencyOn');
    if (cb) cb();
  }

  function emergencyOff(cb) {
    bugout.bugout.log('emergencyService.off called');
    statusService.setEmergency(false);
    statusService.setSending(false);
    $rootScope.$emit('emergencyOff');
    emergency.value = false;
    buttonService.setValues({
      showEmergency : false,
      showMovingButton : false,
      showResetButton: false,
      showCalcButton : true,
      showStressTest : true,
      showHoming : true,
      showSpinner : false,
      showVersionButton : true,
      showMoveXMm : true,
      readyForData : false
    });
    if (cb) cb();
  }
}
