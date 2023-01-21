import thunkMiddleware from "redux-thunk";
import { createStore, compose, combineReducers, applyMiddleware } from "redux";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import app from "./reducers/app";
import auth from "./reducers/auth";
import toast from "./reducers/toast";
import adminConsole from "./reducers/adminConsole";
import advanceSearch from "./reducers/advanceSearch";

const persistedAuthReducer = persistReducer({
  key: 'auth',
  storage,
}, auth);

const adminConsoleReducer = persistReducer({
  key: 'adminConsole',
  storage,
}, adminConsole);

const rootReducer = combineReducers({
  app,
  auth: persistedAuthReducer,
  toast,
  adminConsole: adminConsoleReducer,
  advanceSearch
});

const middlewareEnhancer = applyMiddleware(thunkMiddleware);
const composedEnhancers = compose(
  middlewareEnhancer,
  window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : arg => arg
);

const store = createStore(rootReducer, undefined, composedEnhancers);
const persistor = persistStore(store);
export default store;
export { persistor };
