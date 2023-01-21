import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { showMessage } from '../../../actions/toast';
import RegistrationView from "./RegistrationView";
import { hideLogin } from '../../../actions/auth';
const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
    return {
        vendor,

    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ showMessage, hideLogin }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationView);
