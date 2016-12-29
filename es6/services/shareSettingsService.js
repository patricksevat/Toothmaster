/**
 * Created by Patrick on 26/11/2016.
 */
export default function shareSettings($ionicPopup, logService, $state) {
  const shareSettings = this;
  shareSettings.getObj = getObj;
  shareSettings.setObj = setObj;
  shareSettings.checkSettings = checkSettings;
  shareSettings.checkStepMotor = checkStepMotor;

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

  function checkStepMotor() {
    if (shareSettings.obj.settings.stepMotorNum !== null)
      return true;
    else {
      stepMotorAlert();
      return false;
    }
  }

  function checkSettings() {
    // shareSettings.obj = shareSettings.getObj();
    logService.consoleLog(shareSettings.obj.settings);
    if (shareSettings.obj.settings === undefined){
      logService.consoleLog('settings are not filled in correctly');
      settingsAlert();
      return false;
    }

    //Pass the check with encoder disabled
    else if (shareSettings.obj.settings.maxFreq !== null && shareSettings.obj.settings.dipswitch !== null &&
      shareSettings.obj.settings.spindleAdvancement !== null && shareSettings.obj.settings.time !== null && shareSettings.obj.settings.stepMotorNum !== null &&
      shareSettings.obj.settings.homingStopswitch !== null && shareSettings.obj.settings.encoder.enable === false) {
      logService.consoleLog('checkSettings passed');
      return true;
    }
    //  Pass the check with encoder enabled
    else if (shareSettings.obj.settings.maxFreq !== null  && shareSettings.obj.settings.dipswitch !== null && shareSettings.obj.settings.stepMotorNum !== null &&
      shareSettings.obj.settings.spindleAdvancement !== null && shareSettings.obj.settings.time !== null && shareSettings.obj.settings.homingStopswitch !== null && shareSettings.obj.settings.encoder.enable === true &&
      shareSettings.obj.settings.encoder.stepsPerRPM !== 0 && shareSettings.obj.settings.encoder.stepsToMiss > 0) {
      logService.consoleLog('checkSettings passed');
      return true;
    }
    else {
      logService.consoleLog('settings are not filled in correctly');
      settingsAlert();
      return false;
    }
  }

  //Helper functions

  const humanReadable = {
    stepMotorNum: 'Stepmotor number',
    maxFreq: 'Maximum frequency',
    dipswitch: 'Stepmotor dipswitch',
    spindleAdvancement: 'Spindle advancement',
    time: 'Time to maximum frequency',
    homingStopswitch: 'Homing stopswitch inverted',
    direction: 'Reversed direction',
    encoder: {
      enable: 'Encoder enabled',
      stepsPerRPM: 'Encoder steps per RPM',
      stepsToMiss: 'Max allowable missed steps',
      direction: 'Encoder direction'
    }
  };

  function createWrongSettingsTemplate(settingsObj) {
    let templateText = '';
    for (let setting in settingsObj) {
      if (settingsObj.hasOwnProperty(setting)) {
        //iterate over encoder object if encoder is enabled
        if (angular.isObject(settingsObj[setting])) {
          if (settingsObj.encoder.enable) {
            console.log('object setting, should be encoder: ');
            console.log(setting);
            for (let encoderSetting in settingsObj.encoder) {
              if (settingsObj.encoder.hasOwnProperty(encoderSetting)) {
                templateText += `<p>${humanReadable.encoder[encoderSetting]}: ${validateValue(settingsObj.encoder[encoderSetting])}</p>`
              }
            }
          }
          else
            templateText += `<p>Encoder enabled: false</p>`
        }
        else {
          templateText += `<p>${humanReadable[setting]}: ${validateValue(settingsObj[setting])}</p>`
        }
      }
    }

    return templateText;
  }

  function validateValue(value) {
    if (value != null)
      return value;
    else
      return '<span class="redText">'+value+'</span>';
  }

  //
  //Alerts
  //
  
  function stepMotorAlert() {
    $ionicPopup.alert(
      {
        title: 'Please define your stepmotor number',
        template: 'Use the button to go to settings',
        buttons: [{
          text: 'Edit settings',
          type: 'button-calm',
          onTap: function() {
            $state.go('app.settings');
          }
        }]
      });
  }

  function settingsAlert(customTemplate) {
    $ionicPopup.alert(
      {
        title: 'Please make sure your settings are filled in correctly',
        template: customTemplate ? createWrongSettingsTemplate(shareSettings.obj.settings) : 'Use the buttons to go to settings',
        buttons: [{
          text: 'Edit settings',
          type: 'button-calm',
          onTap: function() {
            $state.go('app.settings');
          }
        }]
      });
  }
}


