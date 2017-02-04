# PCB communication

You can find all available commands in the table below. There are some gotcha's:

#### Implemented functionality

- Step-motor number (the number of the selected step motor) is defined as `{STEPMOTOR}`
- After every command 2 characters (16 bytes) are added as a CRC ([Cyclic Redundancy Check](https://en.wikipedia.org/wiki/Cyclic_redundancy_check)).
- In case a faulty CRC is received by the PCB, the PCB responds with `667:<crc fault>` in stead of the expected answer
- After a faulty CRC, the PCB expects the command to be resent
- A Javascript implementation of the CRC can be found in `/es6/crcService.js`, the actual crc function can be found in `/es6/crc16.js`
- In case the PCB detects that a (hardware) stop switch has been hit, the complete program and settings are deleted from the PCB memory. All settings and program commands will have to be resent.
- In case that a reset/emergency command is received by the PCB, the complete program and settings are deleted from the PCB memory. All settings and program commands will have to be resent.

#### Non-implemented functionality

These features of the PCB software are not implemented in the current version of Toothmaster. However, they are available should you wish to use them.
The Windows USB version called [Jointmaster PRO](http://jointmaster.eu/jointmaster-pro/) does implement these features.

##### Buffered commands. 

The PCB software allows to make use of buffered commands to optimize processing speed and reduce time spent on communication.
Buffered commands take the format `<c {COMMAND} $ {COMMAND_ID}>` whereas normal command use the format `<{COMMAND}>`.

For example a *normal* command could be `<q1001>`, thus the *buffered* command would be `<cq1001$333>`.

The response for a buffered command takes the format `10:c< {COMMAND} $ {COMMAND_ID} > {PENDING_COMMANDS} ; {MISSED_STEPS} #`. Thus for buffered command `<cq1001$333>` the response could be `10:c< q1001$333>11;0#`.
 
When the PCB software is busy processing buffered commands, *normal* commands are ignored. The only commands the PCB software will respond to when processing buffered commands are the reset command, additional buffered commands.
 
When **packet loss check** is enabled, commands that did not pass the CRC will be requested again by the PCB software. The PCB will respond in the format `666:<c{COMMAND_ID}>`. The client should then resent the command with this ID as buffered command.

#### PCB Command table

|   Action                                                  |      Command                            |      Expected Answer      |   Additional information                                                                                                                                 |    Implemented in Toothmaster     |
|-----------------------------------------------------------|-----------------------------------------|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| Stop/reset                                                |  `<y8:y{STEPMOTOR}>`                     | `<8:y>#`                  | This resets the program and all settings                                                                                                                 |  Yes                              |
| Enable check packet loss                                  | `<e{COMMAND_ID}{STEPMOTOR}>`             | `<16:{COMMAND_ID}>#`      | After a stop/reset has beent sent, this setting is lost                                                                                                  |  **No**                           |
| Ratio step motor steps : encoder steps                    | `<d{RATIO}{STEPMOTOR}>`                  | `<12:{RATIO}>#`           | {RATIO} = `steps_per_rpm` divided by `steps_per_rpm_encoder`. {RATIO} is a floating point. {RATIO} may be negative if encoder direction is inversed      | Yes, if encoder is enabled        |
| Maximum allowed steps to miss                             | `<b{MISSED_STEPS}{STEPMOTOR}>`           | `<13:{MISSED_STEPS}>#`    | {MISSED_STEPS} = `max_allowed_miss`. Max number of steps that were sent to stepmotor and we confirmed by encoder                                         | Yes, if encoder is enabled        |
| Enable/disable encoder                                    | `x{ENABLE_DISABLE}{STEPMOTOR}>`          | `<14:0>#`                 | {ENABLE_DISABLE} = `0` (disable) or `1` (enable). Determines if encoder is available and allows for encoder settings to be enabled                       | Yes, if encoder is enabled        |
| Enable/disable unused/unavailable step motor              | `<a{ENABLE_DISABLE}{STEPMOTOR}>`         | `<15:0>#`                 | {ENABLE_DISABLE} = `0` (disable) or `1` (enable).                                                                                                        | **No**                            |
| Invert stepmotor direction                                | `<v{ENABLE_DISABLE}{STEPMOTOR}>`         | `<9:{ENABLE_DISABLE}>#`   | {ENABLE_DISABLE} = `0` (disable) or `1` (enable). If enabled, the stepmotor direction is inverted                                                        | Yes                               |
| Dwell time (in seconds)                                   | `<i{TIME}{STEPMOTOR}>`                   | `<18:{TIME}>#`            | {TIME} = integer representing seconds. Seconds between commands??                                                                                        | **No**                            |
| Steps to take for start position                          | `<s{STEPS}{STEPMOTOR}>`                  | `<6:{STEPS}>#`            | {STEPS} = steps to take to start position                                                                                                                | Yes                               |
| Steps per rotation                                        | `<p{STEPS_PER_RPM}{STEPMOTOR}>`          | `<5:{STEPS_PER_RPM}>#`    | {STEPS_PER_RPM} = Amount of steps needed to make 1 revolution on the spindle. Must be positive integer                                                   | Yes                               |
| Maximum revolution speed (in RPM)                         | `<r{MAX_RPM}{STEPMOTOR}>`                | `<3:{MAX_RPM}>#`          | {MAX_RPM} = Maximum round per minute (RPM). Must be positive, may be a floating point                                                                    | Yes                               |
| Feedrate revolution speed (in RPM)                        | `<g{FEEDRATE_RPM}{STEPMOTOR}>`           | `<17:{FEEDRATE_RPM}>#`    | {FEEDRATE_RPM} = Feedrate RPM. Must be positive, may be floating point                                                                                   | **No**                            |
| Time to maximum speed (in seconds)                        | `<o{TIME}{STEPMOTOR}>`                   | `<2:{TIME}>#`             | {TIME} = Time in seconds in which maximum revolution speed should be achieved. Used to gradually accelerate spindle. Must be positive, may be floating point | Yes                               |
| Enable/disable step motor                                 | `<f{ENABLE_DISABLE}{STEPMOTOR}>`         | `<11:{ENABLE_DISABLE}>#`  | {ENABLE_DISABLE} = `0` (disable) or `1` (enable).                                                                                                        | Yes                               |
| Settings have been sent, prepare for program start (success)  | `<kFAULT{STEPMOTOR}>`                | `<0:rdy>0;#`              | This command signifies that all settings have been sent and program can be started. If this command is successful the stepmotor will move to start position | Yes                            |
| Settings have been sent, prepare for program start (success & buffered commands sent)  | `<kFAULT{STEPMOTOR}>`                | `<0:rdy${COMMAND_ID}>0;#`              | This command signifies that all settings have been sent and program can be started. If this command is successful the stepmotor will move to start position and all buffered commands will be executed | **No**                            |
| Settings have been sent, prepare for program start (failure)  | `<kFAULT{STEPMOTOR}>`                | `<kFAULT>#`              | This command signifies that all settings have been sent and program can be started. If this command is unsuccessful all settings have to be sent again    | Yes                            |
| Take steps command (after sending settings)               | `<q{STEPS}{STEPMOTOR}>`                  | `<<0:rdy>0;#`            | **After** settings have been successfully sent (see `<kFAULT{STEPMOTOR}>`), this command can be sent to make a movement                                        | Yes                            |
| Take **buffered** steps command (after sending settings)  | `<cq{STEPS}{STEPMOTOR}${COMMAND_ID}>`    | `<0:rdy${COMMAND_ID}>0;#` | **Before** settings have been successfully sent (see `<kFAULT{STEPMOTOR}>`), this command can be sent to make a buffered movement. Several of these commands can be sent to fill the buffered command list | **No**                            |
| Homing command                                            | `<h{HOMING_DIRECTION}{STEPMOTOR}>`       | `<6:1>#`                  | Homing moves the spindle untill the homing stopswitch has been hit. {HOMING_DIRECTION} = `1` (left stopswitch) or `2` (right stopswitch). Homing will only start after `<kFAULT{STEPMOTOR}>` is sent | Yes   |
| Get PCB software version                                  | `<z{STEPMOTOR}>`                         | `<14:{VERSION}>#`         | Retrieves the software version that the PCB is using, NOT the Toothmaster version                                                                        | Yes                               |
| Get update on current step command / ping                 | `<w{STEPMOTOR}>`                         | `<w{STEPMOTOR}>{PENDING_COMMANDS};{PERCENT}#`| Gets an update on current command being executed. {PENDING_COMMANDS} shows number of buffered command and defaults to `9999` if it is the last command. {PERCENT} is the percentage of current command executed, defaults to 0 during homing | Yes    |

#### Communication initiated from PCB

For all the commands in the table above, the PCB only responds to sent commands. The only time when the PCB initiates communication without a command being sent is when a steps command (`<q{STEPS}{STEPMOTOR}>` or `<cq{STEPS}{STEPMOTOR}${COMMAND_ID}>`) has been completed.

|   Action                                                  | Answer                                    | Additional information                                                                        |
|-----------------------------------------------------------|-------------------------------------------|-----------------------------------------------------------------------------------------------|
| Completed steps command                                   | `<wydone:{STOPSWITCH};{PENDING_COMMANDS}@{STEPMOTOR_SLIP}{MISSED_STEPS};{ENCODER_STATUS}>{COMMAND_ID}&#` | {STOPSWITCH} = `0` if no stopswitch has been hit. Otherwise integer of stopswitch that has been hit. {PENDING_COMMANDS} = Number of pending commands. {STEPMOTOR_SLIP} = `0` if encoder did not slip. Otherwise the integer of stepmotor that slipped, during homing always `0`. {MISSED_STEPS} = Integer of missed stepper as tracked by encoder, during homing the number of steps taken to complete homing. {ENCODER_STATUS} = status code of encoder. {COMMAND_ID} if this was a buffered command, this shows the ID of the command that was executed. |  
  



