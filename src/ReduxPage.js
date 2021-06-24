/* eslint-disable*/
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
