const logServiceMock = {
  getLog: function (path) {
    return [];
  },
  consoleLog: function (path) {

  },
  addOne: function (path) {

  },
  setBulk: function (path) {

  }
};

const spyOnLogServiceMock = () => {
  spyOn(logServiceMock, 'getLog').and.callThrough();
  spyOn(logServiceMock, 'consoleLog').and.callThrough();
  spyOn(logServiceMock, 'addOne').and.callThrough();
  spyOn(logServiceMock, 'setBulk').and.callThrough();
};

export {logServiceMock, spyOnLogServiceMock};
