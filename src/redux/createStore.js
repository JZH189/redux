export default function createStore(reducer, storeEnhancer) {
  if (storeEnhancer) {
    return storeEnhancer(createStore)(reducer);
  }
  //保存全局的state
  let currentState;
  //保存监听的事件
  let listeners = [];
  //getter
  function getState() {
    return currentState;
  }
  //setter
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error("Actions must be plain objects");
    }
    // 先修改store state
    currentState = reducer(currentState, action);
    // state改变，执行订阅的函数
    listeners.forEach((listener) => listener());
  }
  //发布订阅
  function subscribe(listener) {
    //将更新函数收集起来
    listeners.push(listener);
    //有订阅功能也必须得有取消订阅。返回一个取消订阅的函数，用于取消相关的更新函数
    return () => {
      let index = listeners.findIndex(listener);
      listeners.splice(index, 1);
    };
  }
  //初始化state,这里使用Math.random()是想与用户自定义的type区分开来。
  dispatch({ type: `@@redux/INIT${Math.random()}` });
  return {
    getState,
    dispatch,
    subscribe,
  };
}

function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}
