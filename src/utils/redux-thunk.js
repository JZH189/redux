export default function thunk({ dispatch, getState }) {
    //此处的next参数指的是我们的“里层”的Middleware，如果不存在则代表store.dispatch
    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }
      return next(action);
    };
}