import VerifyUser from "./VerifyUser";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";
import { secureApi, setLoading } from "../../../actions/app";
import { verifyEmail, reSendEmail } from "../../../utils/api";
import { saveUserToken } from "../../../actions/auth";

const mapStateToProps = (state) => {
  const loggedInUser = _get(state, "auth.loggedInUser", null);
  return { isLoggedIn: !!loggedInUser };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      saveUserToken,
      setLoading,
      verifyEmail: secureApi(verifyEmail),
      reSendEmail: secureApi(reSendEmail),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VerifyUser);
