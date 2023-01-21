import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { toggleLogin } from "../../../actions/auth";
import CommonTable from "./CommonTable";
import { secureApi } from "../../../actions/app";
import { confirmBid, getBidValues } from "../../../utils/api";
import _get from "lodash/get";

const mapSTP = (state) => {
  const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
  const loggedInUser = _get(state, "auth.loggedInUser", {});
  const creditCardPercentage = _get(
    state,
    "auth.vendor.creditCardPercentage",
    0
  );
  return {
    isLoggedIn,
    loggedInUser,
    creditCardPercentage,
  };
};

const mapDTP = (dispatch) =>
  bindActionCreators(
    {
      toggleLogin,
      confirmBid: secureApi(confirmBid),
      getBidValues: secureApi(getBidValues),
    },
    dispatch
  );

export default connect(mapSTP, mapDTP)(CommonTable);
