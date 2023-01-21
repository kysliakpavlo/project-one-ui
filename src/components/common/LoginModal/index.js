import _get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { secureApi } from "../../../actions/app";
import { hideLogin, getNotifications } from "../../../actions/auth";
import { isEmailExist, reSendEmail } from "../../../utils/api";
import { showMessage, removeMessage } from "../../../actions/toast";

import LoginModal from "./LoginModal";

const mapStateToProps = (state) => {
  const vendor = _get(state, "auth.vendor", null);
  return {
    vendor,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      hideLogin,
      getNotifications,
      showMessage,
      removeMessage,
      isEmailExist: secureApi(isEmailExist),
      reSendEmail: secureApi(reSendEmail),
    },
    dispatch
  );

export { TextField } from "./../FloatingField/TextField";
export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
export { default as SocialButton } from "./SocialButton";
