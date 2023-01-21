import ReferredItems from "./ReferredItems";

import _get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi } from "../../../actions/app";
import { toggleLogin } from "../../../actions/auth";
import { showMessage } from "../../../actions/toast";
import {
  confirmBid,
  getBidValues,
  removeFromWatchList,
  getReferredAsset,
  getListAssetDetail,
} from "../../../utils/api";

const mapStateToProps = (state) => {
  const loggedInUser = _get(state, "auth.loggedInUser", null);
  const isLivePanelOpen = _get(state, "app.isLivePanelOpen", false);

  const isLoggedIn = !!loggedInUser;
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
      confirmBid: secureApi(confirmBid),
      getBidValues: secureApi(getBidValues),
      getReferredAsset: secureApi(getReferredAsset),
      getListAssetDetail: secureApi(getListAssetDetail),
      removeFromWatchList: secureApi(removeFromWatchList),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ReferredItems);
