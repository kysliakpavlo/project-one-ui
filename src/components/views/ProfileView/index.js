import ProfileView from "./ProfileView";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";
import { validateLogin } from '../../../actions/auth';
import { setLoading, secureApi } from '../../../actions/app';
import { showMessage, removeMessage } from '../../../actions/toast';
import { getAccount } from '../../../utils/api';

const mapStateToProps = (state) => {
    const loggedInUser = _get(state, "auth.loggedInUser", null);
    return { loggedInUser };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    setLoading,
    showMessage,
    removeMessage,
    validateLogin,
    getAccount: secureApi(getAccount)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
