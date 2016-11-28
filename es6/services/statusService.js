export default function statusService(bugout) {
  const statusService = this;
  //Available methods
  statusService.getSending = getSending;
  statusService.setSending = setSending;
  statusService.getEmergency = getEmergency;
  statusService.setEmergency = setEmergency;
  statusService.getSubscribed = getSubscribed;
  statusService.setSubscribed = setSubscribed;
  
  //Scoped variables
  statusService.sending = false;
  statusService.emergency = false;
  statusService.subscribed = false;

  function getSending() {
    return statusService.sending
  }

  function setSending(value) {
    statusService.sending = value;
  }

  function getEmergency() {
    return statusService.emergency
  }

  function setEmergency(value) {
    statusService.emergency = value;
  }

  function getSubscribed() {
    bugout.bugout.log('getSubscribed called');
    return statusService.subscribed;
  }

  function setSubscribed(boolean) {
    statusService.subscribed = boolean;
  }
}
