import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";
import AssetCardsPagination from "./AssetCardsPagination";
import { secureApi } from "../../../actions/app";
import { setDetailsAsset } from "../../../actions/advanceSearch";
import { addToWatchlist, confirmBid, getAssetImages } from "../../../utils/api";

const mapStateToProps = (state) => {
  const creditCardPercentage = _get(
    state,
    "auth.vendor.creditCardPercentage",
    0
  );
  return { creditCardPercentage };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setDetailsAsset,
      confirmBid: secureApi(confirmBid),
      getAssetImages: secureApi(getAssetImages),
      addToWatchlist: secureApi(addToWatchlist),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(AssetCardsPagination);
