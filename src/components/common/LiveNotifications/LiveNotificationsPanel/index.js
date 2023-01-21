import LiveNotificationsPanel from "./LiveNotificationsPanel";

import { showMessage } from "../../../../actions/toast";
import _get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { toggleLogin } from "../../../../actions/auth";
import {
  liveNotificationOpen,
  secureApi,
  setLoading,
} from "../../../../actions/app";
import {
  getUserPanelWatchingAsset,
  getAllNotifications,
  getResetAllNotifications,
  getUserActiveAsset,
  getUserPanelOutbiddenAsset,
} from "../../../../utils/api";

const mapStateToProps = (state) => {
  const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
  const loggedInUser = _get(state, "auth.loggedInUser", null);
  const isLivePanelOpen = _get(state, "app.isLivePanelOpen", false);

  return {
    isLoggedIn,
    loggedInUser,
    isLivePanelOpen,
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
      getUserPanelOutbiddenAsset: secureApi(getUserPanelOutbiddenAsset),
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LiveNotificationsPanel);
