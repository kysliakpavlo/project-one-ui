import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import SiteMapView from "./SiteMapView";
import { showMessage } from '../../../actions/toast';
import { toggleLogin } from '../../../actions/auth';
import { setLoading, secureApi } from "../../../actions/app";
import { getStaticPage } from '../../../utils/api';

const mapStateToProps = (state) => {
    const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
    const vendor = _get(state, "auth.vendor", {});
    const pageConfigurations = _get(state, "app.pageConfigurations", {});

    return {
        vendor,
        isLoggedIn,
        pageConfigurations
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    showMessage,
    setLoading,
    getStaticPage: secureApi(getStaticPage)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SiteMapView);
