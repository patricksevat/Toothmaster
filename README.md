# Toothmaster

## Introduction

Toothmaster is an Android application created using the Ionic framework. This Toothmaster app allows you to create Mortise-Tenon joints using an Android smartphone using Bluetooth. For more information see [http://jointmaster.eu/](http://jointmaster.eu/).

It is intended to use in conjunction with a Toothmaster compliant PCB. For more information [click here](http://jointmaster.eu/2017/01/toothmaster-solution-introduction/).

![Toothmaster overview](http://jointmaster.eu/wp-content/uploads/2017/01/Toothmaster-solution-1100x599.jpg)

If you prefer a Windows based USB solution for creating your Mortise-Tenon joints please consider [Jointmaster Pro](http://jointmaster.eu/jointmaster-pro/)

**This Github repository is intended for developers wishing to improve or modify Toothmaster.**
**If you're looking to install the app, please visit the [Google Play store](https://play.google.com/store/search?q=Toothmaster&c=apps&hl=en)**

## Requirements

- [Nodejs](https://nodejs.org/en/)
- [Ionic framework](http://ionicframework.com/docs/guide/installation.html). Please note the additional requirements for Windows note on Java, Ant and Android if you are on Windows.
- [Android Debug Bridge (adb)](https://developer.android.com/studio/command-line/adb.html) for debugging. adb comes installed with [Android Studio](https://developer.android.com/studio/index.html) 

## Installation & workflow

#### Development && debugging

- If you have Nodejs and Ionic installed run this command in a new folder `git clone https://github.com/patricksevat/Toothmaster.git`
- Run `npm install`
- Run `webpack -w` to watch your source code changes, and let this terminal/command prompt run in background
- Open a new terminal/command prompt
- Enable [adb debugging on your android device](https://developer.android.com/studio/command-line/adb.html#Enabling)
- Run `adb devices` to check if your device is available 
- Run `ionic run android --device` to deploy a debug version of Toothmaster to your device
- Open [chrome://inspect/#devices](chrome://inspect/#devices) to debug the app

#### Deploy

- As soon as you have a new version you are content with you can run `ionic build --android`
- Your .apk will be available under `/platforms/android/build/outputs/apk`
- You can now move this .apk to your phone and install it on your phone 
- Optional: create a single .apk (rather than an armv7 and x86 .apk): [instructions on stack overflow](http://stackoverflow.com/questions/32535551/building-combined-armv7-x86-apk-after-crosswalk-integration-in-an-ionic-project)

#### Operating Systems besides Android

- As Toothmaster is built using Ionic, the app can also be used on other platforms, however we do not provide support for OS's besides Android. If you'd like to port Toothmaster to a different OS, please consult the [Cordova documentation](https://cordova.apache.org/docs/en/6.x/guide/support/index.html) and the [Ionic documentation](https://ionicframework.com/docs/guide/installation.html#configure-platforms).  

## Testing

- Unfortunately testing has not yet been completed. A start has been made and can be found under `/tests`. Tests utilize Karma and Jasmine.

## Environment

- Toothmaster is written in ES6 and partially ESnext (async await implementation) and compiled to ES5 using Babel and Webpack
- Toothmaster is based on Ionic 1.x which itself is based on Angular 1.x
- Toothmaster uses the [Crosswalk Cordova plug-in](https://github.com/crosswalk-project/cordova-plugin-crosswalk-webview) which bundles a webview in the app to override the Android system's Webview. This allows for compatibility on older devices at the cost of a larger .apk
- Toothmaster is developed for Android but could also be easily ported to iOS, Windows Phone or other Ionic supported mobile OS's, see [the Cordova documentation](https://cordova.apache.org/docs/en/6.x/guide/support/index.html). If you have specific questions feel free to ask them.
- Toothmaster relies heavily on the [Bluetooth Serial Plugin for Cordova](https://github.com/don/BluetoothSerial), which is available as Angular dependency as $cordovaBluetoothSerial

## Contributing

Pull requests are most welcome.

Contributions on these sections are particularly welcome:

- Tests
- Improvements in bluetooth communication stability (extensive effort has been put in to make this as stable as possible, but could be further improved, ideas: use [buffered commands](https://github.com/patricksevat/Toothmaster/blob/master/PCB-communication.md) or maybe [RxJS](https://github.com/Reactive-Extensions/RxJS)
- Adding JSDoc

## PCB communication

- Jointmaster communicates using serial communication over Bluetooth.
- The PCB can be ordered [here](http://jointmaster.eu/product/jointmaster-usb-solution-low-budget-kit/)
- Alternatively you can flash your own PCB (STM, Arduino, Raspberry Pi) with the software found [here](https://github.com/marcel631/Jointmaster) 
- The PCB flashed with software has its own commands: [here](https://github.com/patricksevat/Toothmaster/blob/master/PCB-communication.md) 

## Contact

Feel free to open an issue if anything is unclear.

You can also contact us via `p.m.c.sevat <at> gmail <dot> com` regarding specific questions abou the code in this repository or fill in [this contact form](http://jointmaster.eu/contact/) for any questions regarding the required hardware or the PCB software.

For more general information see [http://jointmaster.eu/](http://jointmaster.eu/). This website also contains useful blogs and videos on using Toothmaster.  

## License

All software is published under GNU GPL v3 license. This means that you are allow to modify, share and use my source and other stuff in personal or commercial use. If you modify source code, it has to stay under GNU GPL v3 license too. I reserve a right to shut down this website at any time.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.

