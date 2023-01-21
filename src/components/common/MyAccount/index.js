import _get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { setLoading } from "../../../actions/app";
import { showMessage } from "../../../actions/toast";
import { getBidValues } from "../../../utils/api";
import MyAccount from "./MyAccount";
import { secureApi } from "../../../actions/app";
import CustomPlacebidBox from "./CustomPlacebidBox";
const mapStateToProps = (state) => {
  const loggedInUser = _get(state, "auth.loggedInUser", null);
  const isLivePanelOpen = _get(state, "app.isLivePanelOpen", false);
  return { isLoggedIn: !!loggedInUser, isLivePanelOpen };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading,
      showMessage,
      getBidValues: secureApi(getBidValues),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MyAccount);
export const CustomPlacebid = connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomPlacebidBox);
