/**
 * Created by Patrick on 26/11/2016.
 */
export default function shareSettings() {
  const shareSettings = this;
  shareSettings.getObj = getObj;
  shareSettings.setObj = setObj;
  
  shareSettings.obj = {};
  
  if (window.localStorage['settings'] !== '' && window.localStorage['settings'] !== undefined) {
    shareSettings.obj.settings = JSON.parse(window.localStorage['settings']);
  }
  
  function setObj(value) {
    shareSettings.obj.settings = value;
  }

  function getObj() {
    return shareSettings.obj.settings;
  }
}


