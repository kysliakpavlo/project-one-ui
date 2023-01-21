import RegistrationForm from "./RegistrationForm";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";

import { toggleLogin } from "../../../actions/auth";
import { showMessage, removeMessage } from "../../../actions/toast";
import { loadCountries, setLoading, secureApi } from "../../../actions/app";
import {
  isMobileExist,
  isEmailExist,
  postRegister,
  sendOtp,
  verifyCard,
  verifyOtp,
} from "../../../utils/api";

const mapStateToProps = (state) => {
  const locations = _get(state, "app.locations", []);
  const countries = _get(state, "app.countries", []);
  const publishKey = _get(state, "auth.vendor.publishableKey", "");
  return { locations, countries, publishKey };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      loadCountries,
      setLoading,
      showMessage,
      removeMessage,
      toggleLogin,
      sendOtp: secureApi(sendOtp),
      verifyOtp: secureApi(verifyOtp),
      verifyCard: secureApi(verifyCard),
      isEmailExist: secureApi(isEmailExist),
      isMobileExist: secureApi(isMobileExist),
      postRegister: secureApi(postRegister),
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationForm);
