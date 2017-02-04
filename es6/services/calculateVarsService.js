export default function calculateVarsService(shareProgram, shareSettings) {
  const vars = this;
  //Available methods
  vars.getVars = getVars;

  //Scoped variables
  let stepMotorNum = shareSettings.getObj().stepMotorNum;

  //TODO check why cb is used, again there's no async here
  function getVars(type, cb) {
    stepMotorNum = shareSettings.getObj().stepMotorNum;
    const program = shareProgram.getObj();
    const settings = shareSettings.getObj();

    //this will be the return obj
    vars.return = {
      commands: [],
      vars: {}
    };

    //these variables are always needed
    vars.return.vars.direction = (settings.direction) ? 1:0;
    vars.return.vars.startPositionSteps = Math.floor(program.startPosition / settings.spindleAdvancement * settings.dipswitch);
    console.log('startPositionSteps', vars.return.vars.startPositionSteps, 'program.startPosition', program.startPosition, 'settings.spindleAdvancement', settings.spindleAdvancement, 'settings.dipswitch', settings.dipswitch);

    vars.return.vars.stepsPerRPM = settings.dipswitch;
    vars.return.vars.maxRPM = (settings.maxFreq*60/settings.dipswitch).toFixed(3);
    vars.return.vars.time = settings.time.toFixed(3);
    vars.return.vars.stepMotorOnOff = '1';
    vars.return.vars.disableEncoder = '<x0'+stepMotorNum+'>';
    vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder = (settings.encoder.stepsPerRPM !== 0) ? (settings.dipswitch/settings.encoder.stepsPerRPM.toFixed(3)) : '';
    vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder = (settings.encoder.direction) ? vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder*-1 : vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder;
    vars.return.vars.maxAllowedMiss = (settings.encoder.stepsToMiss) ? settings.encoder.stepsToMiss : '';

    //depends if encoder is enabled, will be added later
    const disableEncoder = ['<y8:y'+stepMotorNum+'>', '<x0'+stepMotorNum+'>'];
    const enableEncoder = ['<y8:y'+stepMotorNum+'>','<x1'+stepMotorNum+'>',
      '<d'+vars.return.vars.stepsPerRPMDevidedByStepsPerRPMEncoder+stepMotorNum+'>',
      '<b'+vars.return.vars.maxAllowedMiss+stepMotorNum+'>'];

    //depends on type of movement
    //type can be: homing, test or runBluetooth
    if (type === 'homing') {
      vars.return.vars.homingStopswitchInt = (settings.homingStopswitch) ? 0 : 1;
      vars.return.commands = ['<v'+vars.return.vars.direction+stepMotorNum+'>',
        '<p'+vars.return.vars.stepsPerRPM+stepMotorNum+'>', '<r'+vars.return.vars.maxRPM+stepMotorNum+'>',
        '<o'+vars.return.vars.time+stepMotorNum+'>','<h'+vars.return.vars.homingStopswitchInt+stepMotorNum+'>',
        '<kFAULT'+stepMotorNum+'>'];
      //add encoder commands
      if (settings.encoder.enable) {
        vars.return.commands = enableEncoder.concat(vars.return.commands)
      }
      else {
        vars.return.commands = disableEncoder.concat(vars.return.commands)
      }
    }
    else if (type === 'runBluetooth') {
      vars.return.commands = ['<v'+vars.return.vars.direction+stepMotorNum+'>', '<s'+vars.return.vars.startPositionSteps+stepMotorNum+'>',
        '<p'+vars.return.vars.stepsPerRPM+stepMotorNum+'>','<r'+vars.return.vars.maxRPM+stepMotorNum+'>',
        '<f'+vars.return.vars.stepMotorOnOff+stepMotorNum+'>', '<o'+vars.return.vars.time+stepMotorNum+'>',
        '<kFAULT'+stepMotorNum+'>'];
      //add encoder commands
      if (settings.encoder.enable) {
        vars.return.commands = enableEncoder.concat(vars.return.commands)
      }
      else {
        vars.return.commands = disableEncoder.concat(vars.return.commands)
      }
    }
    else if (type === 'test'){
      vars.return.commands = ['<v'+vars.return.vars.direction+stepMotorNum+'>', '<s0'+stepMotorNum+'>',
        '<p'+vars.return.vars.stepsPerRPM+stepMotorNum+'>','<r'+vars.return.vars.maxRPM+stepMotorNum+'>',
        '<f'+vars.return.vars.stepMotorOnOff+stepMotorNum+'>', '<o'+vars.return.vars.time+stepMotorNum+'>',
        '<kFAULT'+stepMotorNum+'>'];
      //add encoder commands
      if (settings.encoder.enable) {
        vars.return.commands = enableEncoder.concat(vars.return.commands)
      }
      else {
        vars.return.commands = disableEncoder.concat(vars.return.commands)
      }
    }
    if (cb) cb(vars.return);
    else  return vars.return;
  }
}
