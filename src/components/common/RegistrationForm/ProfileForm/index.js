import ProfileForm from "./ProfileForm";
import Westpac from "./Westpac";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";

import { loadCountries, secureApi, setLoading } from "../../../../actions/app";
import { showMessage, removeMessage } from "../../../../actions/toast";
import { toggleLogin, saveUserToken } from "../../../../actions/auth";

import {
  sendOtp,
  isEmailExist,
  verifyOtp,
  updateProfile,
  verifyCard,
  updateCard,
  updateShippingDetails
} from "../../../../utils/api";

const mapStateToProps = (state) => {
  const locations = _get(state, "app.locations", []);
  const countries = _get(state, "app.countries", []);
  const publishKey = _get(state, "auth.vendor.publishableKey", "");
  const loggedInUser = _get(state, "auth.loggedInUser", null);
  return { locations, countries, publishKey, loggedInUser };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      loadCountries,
      setLoading,
      showMessage,
      removeMessage,
      toggleLogin,
      saveUserToken,
      sendOtp: secureApi(sendOtp),
      verifyOtp: secureApi(verifyOtp),
      verifyCard: secureApi(verifyCard),
      updateCard: secureApi(updateCard),
      isEmailExist: secureApi(isEmailExist),
      updateProfile: secureApi(updateProfile),
      updateShipping:secureApi(updateShippingDetails)
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProfileForm);
