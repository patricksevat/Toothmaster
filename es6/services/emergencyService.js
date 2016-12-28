//TODO check why the hell callbacks are used here, there's no async here...

/**
 * Workflow:
 * 1. Controller calls $scope.emergencyOn
 * 2. emergencyOn calls emergencyService.on & resets scope variables & sends <y8:yX>
 * 3. $rootScope.$emit "emergencyOn" is emitted which is heard by controllers \ services \ etc.
 * 4. once correct answer is sent for <y8:yX>, rootScope emits "readyForEmergencyReset" which allows button RESET to be clicked
 * 5. User clicks button to RESET
 * 6. emergency.reset is called which rootScope.emits "resetEmergency"
 * 7. sendAndReceiveService picks up on "resetEmergency" and sends <f0X> command
 * 8. On correct responses emergencyService.off is called and rootScope emits "emergencyOff"
 * */

export default function (buttonService, statusService, $rootScope, bugout) {
  const emergency = this;
  emergency.on = emergencyOn;
  emergency.off = emergencyOff;
  emergency.reset = reset;

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
  
  function reset() {
    $rootScope.$emit("resetEmergency");
  }
}
