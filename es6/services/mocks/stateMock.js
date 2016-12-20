const stateMock = {
  go: function (path) {

  }
};

const spyOnStateMock = () => {
  spyOn(stateMock, 'go').and.callThrough();
};

export {stateMock, spyOnStateMock};
