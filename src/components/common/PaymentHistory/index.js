import PaymentHistory from "./PaymentHistory";
import _get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi, setLoading } from "../../../actions/app";
import { showMessage } from "../../../actions/toast";
import { toggleLogin } from "../../../actions/auth";
import { getPaidItems } from "../../../utils/api";

const mapStateToProps = (state) => {
  const loggedInUser = _get(state, "auth.loggedInUser", null);

  return { isLoggedIn: !!loggedInUser, loggedInUser };
};
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      toggleLogin,
      setLoading,
      showMessage,
      getPaidItems: secureApi(getPaidItems),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(PaymentHistory);
