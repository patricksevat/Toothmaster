const ionicPlatformMock = {
  ready: function (cb) {
    cb();
  }
};

const spyOnIonicPlatformMock = () => {
  spyOn(ionicPlatformMock, 'ready').and.callThrough();
};

export {ionicPlatformMock, spyOnIonicPlatformMock};
