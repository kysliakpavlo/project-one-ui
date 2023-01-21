import { secureApi, actionSetError } from "./app";
import { Link } from "react-router-dom";
import { showMessage } from "./toast";
import { getVendor, postLogin, validateLoginToken, getAllNotifications } from "../utils/api";
import { isBrowserReloaded } from "../utils/helpers";
import { MESSAGES } from "../utils/constants";
import { getItem, removeItem, setItem } from "../utils/storage";

let loginSuccessCallback = null;
export const actionToggleLogin = (showLogin) => ({
    type: "AUTH_TOGGLE_LOGIN",
    showLogin,
});

export const actionSetLoggedInUser = (payload) => ({
    type: "AUTH_SET_LOGGEDIN_USER",
    payload,
});

export const actionSetLoutout = () => ({
    type: "AUTH_LOGOUT",
});

export const actionSetVendor = (payload) => ({
    type: "AUTH_SET_VENDOR",
    payload,
});
export const setLiveNotificationCount = (notifications) => ({
    type: "USER_NOTIFICATIONS",
    notifications,
});

export const hideLogin = () => (dispatch) => {
    dispatch(actionToggleLogin(false));
};

export const toggleLogin = (showLogin, callback) => (dispatch) => {
    loginSuccessCallback = callback;
    if (typeof showLogin === "boolean") dispatch(actionToggleLogin(Boolean(showLogin)));
    else dispatch(actionToggleLogin());
};

export const fetchVendor = () => async (dispatch) => {
    // Set current tabs count based on opened windows
    setItem("webisteOpenCount", (parseInt(getItem("webisteOpenCount")) || 0) + 1);

    // reduce current tabs count based on opened windows
    window.onbeforeunload = () => {
        setItem("webisteOpenCount", (parseInt(getItem("webisteOpenCount")) || 0) - 1);
    };

    const res = await getVendor({ hostName: window.location.hostname })(null);
    if (res && res.statusCode === 200) {
        dispatch(actionSetVendor({ vendor: res.result }));
    } else {
        dispatch(actionSetError({ err: res }));
    }
};

export const fetchPartner = () => async (dispatch) => {
    const res = await getVendor({ hostName: window.location.hostname })(null);
    if (res && res.statusCode === 200) {
        dispatch(actionSetVendor({ vendor: res.result }));
    } else {
        dispatch(actionSetError({ err: res }));
    }
};

export const getNotifications = () => async (dispatch) => {
    await dispatch(secureApi(getAllNotifications)())
        .then((res) => {
            dispatch(setLiveNotificationCount(res.result));
        })
        .catch((err) => {
            dispatch(showMessage({ message: err.message }));
        });
};
export const doLogout = (message) => async (dispatch) => {
    await dispatch(actionSetLoutout());
    dispatch(
        showMessage({
            message: message ? (
                <div>
                    {message}{" "}
                    <Link className="clickable-text" to="/contact-us">
                        here
                    </Link>
                </div>
            ) : (
                MESSAGES.LOGOUT
            ),
            type: message ? "error" : "success",
        })
    );
};

export const validateLogin = () => (dispatch, getState) => {
    const { auth } = getState();
    dispatch(actionToggleLogin(false));
    if (auth?.loggedInUser?.jwtToken) {
        const currentTabs = parseInt(getItem("webisteOpenCount")) || 0;
        if (auth?.loggedInUser?.rememberMe || isBrowserReloaded() || getItem("logoClick") || currentTabs > 0) {
            removeItem("logoClick");
            dispatch(secureApi(validateLoginToken)())
                .then((res) => {
                    dispatch(actionSetLoggedInUser(res.result));
                })
                .catch((err) => {
                    dispatch(actionSetLoutout());
                    dispatch(showMessage({ message: MESSAGES.SESSION_EXPIRE }));
                });
        } else {
            // Not keep me loggedIn user;
            dispatch(actionSetLoutout());
        }
    }
};

export const submitLogin =
    ({ profilePicURL, ...data }) =>
    async (dispatch) => {
        const loginRes = await dispatch(secureApi(postLogin)(data));
        if (loginRes && loginRes.result && loginRes.result.jwtToken) {
            dispatch(saveUserToken(loginRes, profilePicURL));
            loginSuccessCallback && loginSuccessCallback(loginRes.result);
        } else {
            dispatch(showMessage(loginRes));
        }
        return loginRes;
    };

export const saveUserToken = (loginRes, profilePicURL) => async (dispatch) => {
    dispatch(actionSetLoggedInUser({ ...loginRes.result, profilePicURL }));
};
