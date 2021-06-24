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
