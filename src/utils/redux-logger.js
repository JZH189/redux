export default function logger({ dispatch, getState }) {
  return (next) => (action) => {
    console.log("old state", getState());
    const result = next(action);
    console.log("new state", getState());
    return result;
  };
}
