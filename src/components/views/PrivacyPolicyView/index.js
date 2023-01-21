import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { setLoading, secureApi } from "../../../actions/app";
import PolicyView from "./PrivacyPolicyView";
import { showMessage } from '../../../actions/toast';
import { getStaticPage } from '../../../utils/api';

const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
    const locations = _get(state, "app.locations", []);
    const pageConfigurations = _get(state, "app.pageConfigurations", {});
    return {
        vendor,
        locations,
        pageConfigurations
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    showMessage,
    setLoading,
    getStaticPage: secureApi(getStaticPage)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PolicyView);
