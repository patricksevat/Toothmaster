const statusServiceMock = {
  getSending: function () {
    return true;
  }
};

const spyOnStatusServiceMock = () => {
  spyOn(statusServiceMock, 'getSending').and.callThrough();
};

export {statusServiceMock, spyOnStatusServiceMock};
