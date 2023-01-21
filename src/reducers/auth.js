import _isBoolean from "lodash/isBoolean";

const initialState = {
  vendor: {},
  showLogin: true,
  loggedInUser: null,
  liveNotifications: {},
};

const auth = (state = initialState, action) => {
  switch (action.type) {
    case "AUTH_SET_VENDOR":
      const { vendor } = action.payload;
      return {
        ...state,
        vendor,
      };
    case "AUTH_TOGGLE_LOGIN":
      const showLogin = _isBoolean(action.showLogin)
        ? action.showLogin
        : !state.showLogin;
      return {
        ...state,
        showLogin,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        loggedInUser: null,
        liveNotifications: null,
      };
    case "AUTH_SET_LOGGEDIN_USER":
      return {
        ...state,
        showLogin: false,
        loggedInUser: action.payload,
      };
    case "USER_NOTIFICATIONS":
      return {
        ...state,
        liveNotifications: action.notifications,
      };
    default:
      return state;
  }
};

export default auth;
