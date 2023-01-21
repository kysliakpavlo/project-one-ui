import LiveNotifications from "./LiveNotifications";
import { showMessage } from "../../../actions/toast";
import _get from "lodash/get";
import { connect } from "react-redux";
import { toggleLogin } from "../../../actions/auth";
import { bindActionCreators } from "redux";
import { liveNotificationOpen, secureApi } from "../../../actions/app";
import { setLoading } from "../../../actions/app";
import {
  getUserPanelWatchingAsset,
  getAllNotifications,
  getResetAllNotifications,
  getUserActiveAsset,
} from "../../../utils/api";
const mapStateToProps = (state) => {
  const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
  const loggedInUser = _get(state, "auth.loggedInUser", null);
  const notificationsUpdate = _get(state, "auth.liveNotifications", null);
  const isLivePanelOpen = _get(state, "app.isLivePanelOpen", false);
  return {
    isLoggedIn,
    loggedInUser,
    isLivePanelOpen,
    notificationsUpdate,
  };
};
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      toggleLogin,
      showMessage,
      liveNotificationOpen,
      setLoading,
      getUserPanelWatchingAsset: secureApi(getUserPanelWatchingAsset),
      getAllNotifications: secureApi(getAllNotifications),
      getResetAllNotifications: secureApi(getResetAllNotifications),
      getUserActiveAsset: secureApi(getUserActiveAsset),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(LiveNotifications);
