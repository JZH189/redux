# 前言

本文学习目标：

1. redux的手写实现
2. 理解Middleware的“洋葱模型”
3. redux Middleware的手写实现

# Redux

Redux 是 JavaScript 状态容器，提供可预测化的状态管理。应用中所有的 state 都以一个对象树的形式储存在一个单一的 store 中。 惟一改变 state 的办法是触发 action，action是一个用来描述发生什么的对象。
Redux 有三大基本原则：
1. 单一数据源 （整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中。）
2. State 是只读的 （唯一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象。）
3. 使用纯函数来执行修改 （为了描述 action 如何改变 state tree ，你需要编写 reducers。）


### Redux的动机

随着 JavaScript 单页应用开发日趋复杂，JavaScript 需要管理比任何时候都要多的 state （状态）。 这些 state 可能包括服务器响应、缓存数据、本地生成尚未持久化到服务器的数据，也包括 UI 状态，如激活的路由，被选中的标签，是否显示加载动效或者分页器等等。用一句话来解释就是指公共状态管理库**store** 。那么这个store需要提供什么功能呢？

1. currentState（保存公共状态）
2. getState （getter)
3. dispatch （setter)
4. subscribe (发布订阅)

**注意：为了让这个 store 的修改变得“可预测”、"可维护“，我们希望这个 store 既可以被全局访问到，又是私有的不能被直接修改（需要通过提交action来修改state）。于是我们可以使用闭包的方式来实现这个store。** 

在src目录下新建redux文件夹，然后新建两个文件:

index.js

```js
// src/redux/index.js

import createStore from "./createStore";
export { createStore };

```

createStore.js

```js
// src/redux/createStore.js

export default function createStore(reducer, storeEnhancer) {
  if (storeEnhancer) {
    return storeEnhancer(createStore)(reducer);
  }
  //保存全局的state
  let currentState;
  //保存监听的事件
  let listeners = [];
  //getter
  function getState() {};
  //setter
  function dispatch(action){};
  //发布订阅
  function subscribe(listener){};
  return {
    getState,
    dispatch,
    subscribe,
  };
}
```

### getState的实现
   
getState主要用来获取当前state的，特别简单。

```js
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
  };
  //setter
  function dispatch(action){};
  //发布订阅
  function subscribe(listener){};
  return {
    getState,
    dispatch,
    subscribe,
  };
}
```

### dispatch的实现

dispatch用来修改当前state的。但是不可以随便修改state，需要遵循一定的规则。在使用dispatch的时候，我们会给dispatch()传入一个action对象，这个action对象包含了修改类型（actionType），和修改规则。

```js
// ation对象
{
  type: "increase",
  //others
}
```

```js
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
  };
  //setter
  function dispatch(action) {
    if (!isPlainObject(action)) {
      //action必须为普通对象
      throw new Error("Actions must be plain objects");
    }
    // 先修改store state
    currentState = reducer(currentState, action);
    // state改变，执行订阅的函数
    listeners.forEach((listener) => listener());
  };
  //发布订阅
  function subscribe(listener){};
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
```

### subscribe的实现

```js
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
  };
  //setter
  function dispatch(action) {
    if (!isPlainObject(action)) {
      //action必须为普通对象
      throw new Error("Actions must be plain objects");
    }
    // 先修改store state
    currentState = reducer(currentState, action);
    // state改变，执行订阅的函数
    listeners.forEach((listener) => listener());
  };
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
```
然后我们来看一个计数器的例子：

在 src/store 文件夹下新建一个index.js

```js
//  src/store/index.js
import { createStore } from "../redux/index";


function counterReducer(state = 0, action) {
  switch (action.type) {
    case "increase":
      return state + 1;
    case "decrease":
      return state - 1;
    default:
      return state;
  }
}
const store = createStore(counterReducer);
export default store;
```

在src目录下新建ReduxPage.js

```js
import React, { Component } from "react";
import store from "./store/";
export default class ReduxPage extends Component {
  componentDidMount() {
    store.subscribe(() => {
      this.forceUpdate();
      //打印下store
      console.log("getState", store.getState());
    });
  }
  increase = () => {
    store.dispatch({ type: "increase" });
  };
  decrease = () => {
    store.dispatch({ type: "decrease" });
  };
  render() {
    return (
      <div>
        <h3>ReduxPage</h3>
        <p>{store.getState()}</p>
        <button onClick={this.increase}>increase</button>
        <button onClick={this.decrease} style={{ margin: "50px" }}>
          decrease
        </button>
      </div>
    );
  }
}
```
实现了这个简单版本的store，通过运行npm run start启动看看效果:


![redux5.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b723a235f90e437db2d4d5006b6b44bf~tplv-k3u1fbpfcp-watermark.image)


上面的代码运行起来发现，点击按扭可以正常的显示计数。但是页面首次加载没有显示初始数值。


![redux1.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/583029df470442d981c3e11d16731e3a~tplv-k3u1fbpfcp-watermark.image)

这是因为在用户没有操作的时候没有返回默认值。我们需要在createStore中添加一行代码：

```js
dispatch({ type: `@@redux/INIT${Math.random()}` });
```

上面这行代码会执行默认的type，返回store的初始值。修改后的代码如下:

```js
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
      //action必须为普通对象
      throw new Error("Actions must be plain objects");
    }
    // 先修改store state
    currentState = reducer(currentState, action);
    // state改变，执行订阅的函数
    listeners.forEach((listener) => listener());
  };
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
```


![redux2.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0056d094ecaa4c3b8f4043394af93654~tplv-k3u1fbpfcp-watermark.image)

到此一个简单的redux就实现了。


1. 异步action

实际开发中会出现从服务端请求一个接口然后以返回的结果作为state，我们使用一个asyncIncrease方法来模拟这个异步action：

修改下ReduxPage.js

```js
import React, { Component } from "react";
import store from "./store/";

export default class ReduxPage extends Component {
  componentDidMount() {
    store.subscribe(() => {
      this.forceUpdate();
    });
  }
  increase = () => {
    store.dispatch({ type: "increase" });
  };
  //模拟异步
  asyncIncrease = () => {
    let timeOut = () => {
      setTimeout(() => {
        store.dispatch({ type: "increase" });
      }, 1000);
    }
    thunk(store, timeOut)
  };
  render() {
    return (
      <div>
        <h3>ReduxPage</h3>
        <p>{store.getState()}</p>
        <button onClick={this.increase}>increase</button>
        <button onClick={this.asyncIncrease} style={{ margin: "50px" }}>
          asyncIncrease
        </button>
      </div>
    );
  }
}

```

由于刚才的手写createStore方法中的dispatch方法只接收“Plain Object”的action，当我们使用异步的action的时候没有提示用户使用相对应的中间件的处理。因此我们先使用官方的redux来看看当我们没有使用中间件的时候会给我们提示什么？

修改 src/store/index.js

```js
// src/store/index.js
// import { createStore } from "../redux/";
import { createStore } from "redux";

function counterReducer(state = 0, action) {
  switch (action.type) {
    case "increase":
      return state + 1;
    case "decrease":
      return state - 1;
    default:
      return state;
  }
}

const store = createStore(counterReducer);

export default store;

```



![redux3.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f4e8d56dcb1429385cfaea891a0df40~tplv-k3u1fbpfcp-watermark.image)

我们看到页面提示说，操作必须是普通对象，实际的类型是：“函数”。您可能需要在设置中添加中间件来处理调度其他值，例如“redux-thunk”来处理调度函数。

首先我们来分析下这个thunk的功能：

1. 如果用户dispatch一个函数，那么thunk需要帮他执行这个函数。
2. 如果用户dispatch一个action对象，那么thunk直接返回这个action。

明白了thunk的用途，我们现在就开始动手实现一个thunk吧。

```js
//thunk用于执行函数并且提交action
function thunk(store, action) {
    let next = store.dispatch
    //如果用户传一个函数，执行它
    if (typeof action === 'function') {
      return action();
    }
    next(action)
}
```
我们使用thunk函数来封装了一个公用的新的dispatch方法，然后在我们需要执行异步的时候引入这个thunk方法就可以了。

具体的使用我们来看ReduxPage.js

```js

// src/ReduxPage.js
import React, { Component } from "react";
import store from "./store";

function thunk(store, action) {
  let next = store.dispatch;
  //如果用户传一个函数，执行它
  if (typeof action === "function") {
    return action();
  }
  next(action);
}

export default class ReduxPage extends Component {
  componentDidMount() {
    store.subscribe(() => {
      this.forceUpdate();
      console.log("getState", store.getState());
    });
  }
  increase = () => {
    store.dispatch({ type: "increase" });
  };
  //模拟异步
  asyncIncrease = () => {
    let timeOut = () => {
      setTimeout(() => {
        store.dispatch({ type: "increase" });
      }, 1000);
    };
    //使用thunk处理这个异步action
    thunk(store, timeOut);
  };
  render() {
    return (
      <div>
        <h3>ReduxPage</h3>
        <p>{store.getState()}</p>
        <button onClick={this.increase}>increase</button>
        <button onClick={this.asyncIncrease} style={{ margin: "50px" }}>
          asyncIncrease
        </button>
      </div>
    );
  }
}
```
引入thunk之后我们再来跑下刚才的计数器的例子，it works!


![redux6.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a630fe27ed94aad9307e02fd67f13ce~tplv-k3u1fbpfcp-watermark.image)

到此我们的thunk实现了。


# Middleware

Middleware就是⼀个函数，对 store.dispatch ⽅法进⾏改造，在发出 Action 和执⾏ Reducer 这两步之间，添加了其他功能。例如 Express 或者 Koa 的 middleware 可以完成添加 CORS headers、记录日志、内容压缩等工作。middleware 最优秀的特性就是可以被链式组合。你可以在一个项目中使用多个独立的第三方 middleware。


![Redux-width-middlewares.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31542502432b4acaafe2e61e64b5f441~tplv-k3u1fbpfcp-watermark.image)

于是我们得到启发，将多个middleware串联起来。需要用到的时候统一引入,每个 middleware接收store并在函数内部做自己的事情，做完以后再返回store给到下一个middleware，依次类推。就像这样：

```js
funciton M1(store){
    //M1 todo
    return store.dispatch
}
funciton M2(store){
    //M2 todo
    return store.dispatch
}
funciton M3(store){
    //M3 todo
    return store.dispatch
}

M1(
  M2(
    M3(
      store.dispatch(Action)
    )
  )
)
```

### 洋葱模型

我们的dispatch被若干个 Middleware 包裹起来，一圈一圈的。上面的代码结构其实就像一个“洋葱模型”:smiley_cat:


![Onion.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1121484a23504de18594618699715f1a~tplv-k3u1fbpfcp-watermark.image)

其实刚才我们在需要异步action的时候就引入thunk的做法会使得我们的代码变得臃肿。如果我们还想加上一个打印日志的功能呢？这样多个中间件的使用会让我们的ReduxPage.js文件变得越来越难以维护...

### 函数式编程
但是上面的代码结构在多个函数嵌套的时候会出现代码向右偏移，影响代码的可读性。这个时候函数式编程思想就派上用场了。

函数式编程有两个最基本的运算：合成（compose）和柯里化（Currying）。

合成（compose）

如果一个值要经过多个函数，才能变成另外一个值，就可以把所有中间步骤合并成一个函数，这叫做"函数的合成"（compose）。合成的好处显而易见，它让代码变得简单而富有可读性，同时通过不同的组合方式，我们可以轻易组合出其他常用函数，让我们的代码更具表现力(避免了代码的向右偏移,更加优雅。:blush:)。

```js
function funcA(arg) { 
  console.log("funcA", arg); 
  return arg; 
}

function funcB(arg) { 
  console.log("funcB", arg); 
  return arg; 
}

function funcC(arg) { 
  console.log("funcC", arg); 
  return arg; 
}

function compose(...funcs) { 
  if (funcs.length === 0) { 
    return arg => arg; 
  } 
  if (funcs.length === 1) { 
    return funcs[0]; 
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args))); 
}

let res = compose(funcA, funcB, funcC)("omg"); //compose(funcA(funcB(funcC("omg"))))
console.log("res", res);   //omg
```


柯里化（Currying）

柯里化（英语：Currying），又译为卡瑞化或加里化，是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。所谓"柯里化"，就是把一个多参数的函数，转化为单参数函数。

```js
// 柯里化之前 
function add(x, y) { 
  return x + y; 
}
add(1, 2) // 3 

// 柯里化之后 
function addX(y) { 
  return function (x) { 
    return x + y; 
  }; 
}

addX(2)(1) // 3
```
了解了这两个概念之后，我们使用这个 compose函数来重构下刚才调用中间件的代码。

```js

function compose(...funcs) { 
  if (funcs.length === 0) { 
    return arg => arg; 
  } 
  if (funcs.length === 1) { 
    return funcs[0]; 
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args))); 
}
function thunk(){
  //todo
}
function logger(){
  //todo
}
function promise(){
  //todo
}
function dispatch(){
  //todo
}

//compose函数的作用只是让你在写深度嵌套的函数时，优雅的避免了代码的向右偏移.
compose(thunk, logger, promise)(dispatch) //thunk(logger(promise(dispatch())))

```

### applyMiddleware

上面代码演示了如何使用compose来优雅的调用我们的 Middleware 函数。但是实际项目中我们不知道具体会用到多少个 Middleware 。我们是否可以将这个compose方法放入到一个 applyMiddleware 的函数中，不管用户将来需要用到多少个 Middleware ，我们只需要把用户传入的 Middleware 按照序列执⾏就好了？这就是 applyMiddleware 函数的作用。

在src目录下的redux文件夹中新建一个 applyMiddleware.js 文件

```js
// src/redux/applyMiddleware.js

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

```
在src目录下新建utils文件夹，新建redux-thunk.js文件:

```js
// src/utils/redux-thunk.js
export default function thunk({ dispatch, getState }) {
    //此处的next参数指的是我们的“里层”的Middleware，如果不存在则代表store.dispatch
    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }
      return next(action);
    };
}
```

再加上一个打印日志的中间件，redux-logger.js：
```js
// src/utils/redux-logger.js
export default function logger({ dispatch, getState }) {
  return (next) => (action) => {
    console.log("old state", getState());
    const result = next(action);
    console.log("new state", getState());
    return result;
  };
}
```
修改下src目录下的redux文件夹里的index.js文件,导出applyMiddleware。

```js
// src/redux/index.js

import createStore from "./createStore";
import applyMiddleware from "./applyMiddleware";
export { createStore, applyMiddleware };
```

将 src/store/index.js 修改为使用我们自己手写的redux,并且引入 applyMiddleware 和刚才的 thunk 中间件

```js
// src/store/index.js

import { createStore, applyMiddleware } from "../redux/";
import thunk from "../utils/redux-thunk";
import logger from "../utils/redux-logger";

function counterReducer(state = 0, action) {
  switch (action.type) {
    case "increase":
      return state + 1;
    case "decrease":
      return state - 1;
    default:
      return state;
  }
}

const store = createStore(counterReducer, applyMiddleware(thunk, logger));
export default store;
```
修改 ReduxPage.js
```js
//  src/ReduxPage.js

import React, { Component } from "react";
import store from "./store";

export default class ReduxPage extends Component {
  componentDidMount() {
    store.subscribe(() => {
      this.forceUpdate();
    });
  }
  increase = () => {
    store.dispatch({ type: "increase" });
  };
  //模拟异步
  asyncIncrease = () => {
    let timeOut = () => {
      setTimeout(() => {
        store.dispatch({ type: "increase" });
      }, 1000);
    };
    store.dispatch(timeOut);
  };
  render() {
    return (
      <div>
        <h3>ReduxPage</h3>
        <p>{store.getState()}</p>
        <button onClick={this.increase}>increase</button>
        <button onClick={this.asyncIncrease} style={{ margin: "50px" }}>
          asyncIncrease
        </button>
      </div>
    );
  }
}
```

最后再来跑下刚才的异步action的例子：


![redux7.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e02083409594db684c76b5b19e88b65~tplv-k3u1fbpfcp-watermark.image)


可以看到我们的redux-thunk、redux-logger都可以了！

