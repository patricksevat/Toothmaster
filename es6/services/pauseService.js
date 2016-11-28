export default function (statusService, isConnectedService, logService, disconnectService, buttonService, connectToDeviceService, bugout) {
  const pause = this;
  pause.pause = pauseFunc;
  pause.resume = resume;

  function pauseFunc() {
    //var sending = statusService.getSending();
    const sending = statusService.getSending();
    bugout.bugout.log('sending in pause:'+statusService.getSending());
    const connected = isConnectedService.getValue();
    bugout.bugout.log('pause.pause called, sending: '+sending+', connected'+connected);
    if (!sending && connected) {
      logService.addOne('Disconnected after pausing application');
      disconnectService.disconnect();
      buttonService.setValues({'showCalcButton': false, 'readyForData': false});
    }
    else {
      logService.addOne('User has paused application, continuing task in background')
    }
  }

  function resume() {
    const sending = statusService.getSending();
    if (window.localStorage['lastConnectedDevice'] !== '' && !sending) {
      connectToDeviceService.connectWithRetry();
    }
    else if (sending) {
      bugout.bugout.log('skipped reconnect, because sending is '+sending);
    }
  }
}
