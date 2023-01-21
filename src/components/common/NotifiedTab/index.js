import NotifiedTab from "./NotifiedTab";
import { showMessage } from "../../../actions/toast";
import { secureApi, setLoading } from "../../../actions/app";
import { getNotifiedAssets, getNotifiedAuctions } from "../../../utils/api";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { toggleLogin } from "../../../actions/auth";
import { connect } from "react-redux";

const mapStateToProps = (state) => {
  const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
  const loggedInUser = _get(state, "auth.loggedInUser", null);
  return {
    isLoggedIn,
    loggedInUser,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      toggleLogin,
      showMessage,
      setLoading,
      getNotifiedAssets: secureApi(getNotifiedAssets),
      getNotifiedAuctions: secureApi(getNotifiedAuctions),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(NotifiedTab);
