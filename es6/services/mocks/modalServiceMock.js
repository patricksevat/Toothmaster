const modalServiceMock = {
  init: function () {
    return Promise.resolve();
  }
};

const spyOnModalServiceMock = () => {
  spyOn(modalServiceMock, 'init').and.callThrough();
};

export {modalServiceMock, spyOnModalServiceMock};
