import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";

import { showMessage } from '../../../actions/toast';
import { toggleLogin } from '../../../actions/auth';
import AssetDetailView from './AssetDetailView';

const mapStateToProps = (state) => {
    const loggedInUser = _get(state, "auth.loggedInUser", false);
    return {
        loggedInUser
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    showMessage,
    toggleLogin
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AssetDetailView)