import _get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi } from "../../../actions/app";
import { toggleLogin } from '../../../actions/auth';
import { getNotifyMe, saveNotifyMe } from '../../../utils/api';

import NotifyMe from './NotifyMe';

const mapStateToProps = (state) => {
    const loggedInUser = _get(state, "auth.loggedInUser", false);
    return {
        loggedInUser
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    getNotifyMe: secureApi(getNotifyMe),
    saveNotifyMe: secureApi(saveNotifyMe)
}, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(NotifyMe);
