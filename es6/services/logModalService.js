export default function logModalService(bugout) {
  const logModal = this;

  logModal.emailFullLog = function () {
    const now = Date.now();
    cordova.plugins.email.isAvailable(
      function(isAvailable) {
        bugout.bugout.log('email available:'+isAvailable);
        if (isAvailable === true) {
          const logFile = bugout.bugout.getLog();
          // save the file locally, so it can be retrieved from emailComposer
          window.resolveLocalFileSystemURL(cordova.file.externalCacheDirectory, function(fileSystem) {
            bugout.bugout.log('file system open: ' + fileSystem.name);
            // create the file if it doesn't exist
            fileSystem.getFile('log'+now+'.txt', {create: true, exclusive: false}, function(file) {
              bugout.bugout.log("file is file?" + file.isFile.toString());
              // create writer
              file.createWriter(function(writer) {
                // write
                writer.write(logFile);
                // when done writing, call up email composer
                writer.onwriteend = function() {
                  bugout.bugout.log('done writing');
                  cordova.plugins.email.open({
                    to: ['p.m.c.sevat@gmail.com','info@goodlife.nu'],
                    subject: 'Toothmaster bug report',
                    body: 'I have encountered an error. Could you please look into this problem? \nMy logfile is attached.\n\nKind regards,\nA Toothmaster user',
                    attachments: [cordova.file.externalCacheDirectory+'/'+'log'+now+'.txt']
                  });
                }
              }, fileSystemError);
            }, fileSystemError);
          }, fileSystemError);
        }
        else {
          // not available
          $ionicPopup.alert({
            title: 'No email composer available',
            template: 'There is no email app available through which the email can be sent'
          });
        }
      });

    function fileSystemError(error) {
      bugout.bugout.log('Error getting file system: '+error.code);
    }
  }
}
