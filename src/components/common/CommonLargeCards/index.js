import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import CommonLargeCards from "./CommonLargeCards";
import { secureApi } from "../../../actions/app";
import {
  addToWatchlist,
  confirmBid,
  getAssetImages,
  getBidValues,
} from "../../../utils/api";
import _get from "lodash/get";

const mapSTP = (state) => {
  const creditCardPercentage = _get(
    state,
    "auth.vendor.creditCardPercentage",
    0
  );
  return { creditCardPercentage };
};

const mapDTP = (dispatch) =>
  bindActionCreators(
    {
      confirmBid: secureApi(confirmBid),
      getBidValues: secureApi(getBidValues),
      addToWatchlist: secureApi(addToWatchlist),
      getAssetImages: secureApi(getAssetImages),
    },
    dispatch
  );

export default connect(mapSTP, mapDTP)(CommonLargeCards);
