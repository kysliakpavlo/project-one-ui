import ChangePassword from "./ChangePassword";
import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { showMessage } from '../../../actions/toast';
import { secureApi, setLoading } from '../../../actions/app';
import { toggleLogin, submitLogin, saveUserToken } from '../../../actions/auth';
import { resetPassword, validateChangePasswordToken } from "../../../utils/api";

const mapStateToProps = (state) => {
    const categories = _get(state, "app.categories", []);
    const assetTypes = _get(state, "app.assetTypes", []);
    const showLogin = _get(state, "auth.showLogin", null);
    const loggedInUser = _get(state, "auth.loggedInUser", null);
    const isLoading = _get(state, 'app.isLoading', false);

    return {
        showLogin,
        categories,
        assetTypes,
        loggedInUser,
        isLoading
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    submitLogin,
    toggleLogin,
    showMessage,
    setLoading,
    saveUserToken,
    resetPassword: secureApi(resetPassword),
    validateChangePasswordToken: secureApi(validateChangePasswordToken)
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
