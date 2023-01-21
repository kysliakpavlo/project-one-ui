import Header from "./Header";
import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { toggleLogin, doLogout, submitLogin } from "../../../actions/auth";
import { liveNotificationOpen } from "../../../actions/app";

const mapStateToProps = (state) => {
  const categories = _get(state, "app.categories", []);
  const headerAssetTypes = _get(state, "app.headerAssetTypes", []);
  const assetTypes = _get(state, "app.assetTypes", []);
  const showLogin = _get(state, "auth.showLogin", false);
  const loggedInUser = _get(state, "auth.loggedInUser", null);
  const hidePublicHeader = _get(state, "adminConsole.hidePublicHeader", true);

  return {
    showLogin,
    categories,
    headerAssetTypes,
    assetTypes,
    loggedInUser,
    hidePublicHeader,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      submitLogin,
      toggleLogin,
      doLogout,
      liveNotificationOpen,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Header);
