//我们使用一个 applyMiddleware() 来“单纯”地使用 middleware。在 applyMiddleware() 中，我们取得最终完整的被包装过的 dispatch() 函数，并返回一个 store 的副本，这样我们就可以使用加强版本的dispatch了。
export default function applyMiddleware(...middlewares) {
  //利用函数柯里化返回一个使用createStore参数的函数，因此我们就能够在函数内部操作store
  return (createStore) => (reducer) => {
    const store = createStore(reducer);
    let dispatch = store.dispatch;

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args), //这里使用一个匿名函数来返回一个dispatch是为了不让middleware彼此之间的的dispatch不受影响（每个middleware各自执行自己的逻辑）。
    };
    //我们将middlewareAPI传给middleware就能访问store并且执行各自的业务，chain是个能够访问store的中间件数组
    const chain = middlewares.map((middleware) =>
      middleware(middlewareAPI)
    );
    // 返回一个加强版本的dispatch
    dispatch = compose(...chain)(store.dispatch);
    //返回store的副本
    return { ...store, dispatch };
  };
}

function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
}
