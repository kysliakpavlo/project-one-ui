import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { setSideBar } from "../../../actions/app";
import SideHeaderBarView from './SideHeaderBarView';
import { liveNotificationOpen } from '../../../actions/app';
const mapStateToProps = (state) => {
    const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
    const vendor = _get(state, "auth.vendor", {});
    return {
        isLoggedIn,
        vendor
    };
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
    setSideBar,
    liveNotificationOpen
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SideHeaderBarView);
