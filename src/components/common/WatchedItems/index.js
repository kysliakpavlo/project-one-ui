import _get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import WatchedItems from "./WatchedItems";

import { secureApi } from "../../../actions/app";
import { toggleLogin } from "../../../actions/auth";
import { showMessage } from "../../../actions/toast";
import {
  buyNowAsset,
  getListAssetDetail,
  getRecentlyWatchedItems,
  getUserPanelWatchingAsset,
  removeFromWatchList,
} from "../../../utils/api";

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
      buyNowAsset: secureApi(buyNowAsset),
      getListAssetDetail: secureApi(getListAssetDetail),
      removeFromWatchList: secureApi(removeFromWatchList),
      getRecentlyWatchedItems: secureApi(getRecentlyWatchedItems),
      getUserPanelWatchingAsset: secureApi(getUserPanelWatchingAsset),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(WatchedItems);
