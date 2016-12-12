export default function (statusService, bluetoothService, logService, buttonService, bugout) {
  const pause = this;
  pause.pause = pauseFunc;
  pause.resume = resume;

  function pauseFunc() {
    //var sending = statusService.getSending();
    const sending = statusService.getSending();
    bugout.bugout.log('sending in pause:'+statusService.getSending());
    const connected = bluetoothService.getConnectedValue();
    bugout.bugout.log('pause.pause called, sending: '+sending+', connected'+connected);
    if (!sending && connected) {
      logService.addOne('Disconnected after pausing application');
      bluetoothService.disconnect();
      buttonService.setValues({'showCalcButton': false, 'readyForData': false});
    }
    else {
      logService.addOne('User has paused application, continuing task in background')
    }
  }

  function resume() {
    const sending = statusService.getSending();
    if (window.localStorage['lastConnectedDevice'] !== '' && !sending) {
      bluetoothService.connectWithRetry();
    }
    else if (sending) {
      bugout.bugout.log('skipped reconnect, because sending is '+sending);
    }
  }
}
