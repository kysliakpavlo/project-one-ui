import _get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi, setLoading } from "../../../actions/app";
import { showMessage } from "../../../actions/toast";
import {
  confirmBid,
  addToWatchlist,
  buyNowAsset,
  getAssetDetails,
  getNextPrevAssets,
} from "../../../utils/api";
import AssetDetail from "./AssetDetail";

const mapStateToProps = (state) => {
  const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
  const vendor = _get(state, "auth.vendor", {});
  const isLoading = _get(state, "app.isLoading", false);
  const isLivePanelOpen = _get(state, "app.isLivePanelOpen", false);
  const creditCardPercentage = _get(
    state,
    "auth.vendor.creditCardPercentage",
    0
  );
  const isConnected = _get(state, "app.isConnected", false);
  return {
    isLoggedIn,
    vendor,
    isLoading,
    creditCardPercentage,
    isLivePanelOpen,
    isConnected,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading,
      showMessage,
      confirmBid: secureApi(confirmBid),
      buyNowAsset: secureApi(buyNowAsset),
      addToWatchlist: secureApi(addToWatchlist),
      getAssetDetails: secureApi(getAssetDetails),
      getNextPrevAssets: secureApi(getNextPrevAssets),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(AssetDetail);
