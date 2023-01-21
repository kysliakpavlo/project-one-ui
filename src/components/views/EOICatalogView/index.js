import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";
import EOICatalogView from "./EOICatalogView";
import { setLoading, secureApi } from "../../../actions/app";
import { showMessage } from "../../../actions/toast";
import { toggleLogin } from "../../../actions/auth";
import { getAuctionDetails, searchAssets } from "../../../utils/api";
import {
  setDetailsAsset,
  setSearchFilterState,
} from "../../../actions/advanceSearch";

const mapStateToProps = (state) => {
  const vendor = _get(state, "auth.vendor", {});
  const loggedInUser = _get(state, "auth.loggedInUser", false);
  const isLoading = _get(state, "app.isLoading", false);
  const filtersState = _get(state, "advanceSearch.filtersState", {});
  const detailsAsset = _get(state, "advanceSearch.detailsAsset", false);
  const isLivePanelOpen = _get(state, "app.isLivePanelOpen", false);
  return {
    vendor,
    loggedInUser,
    isLoading,
    filtersState,
    detailsAsset,
    isLivePanelOpen,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading,
      showMessage,
      toggleLogin,
      setDetailsAsset,
      setSearchFilterState,
      getAuctionDetails: secureApi(getAuctionDetails),
      searchAssets: secureApi(searchAssets),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EOICatalogView);
