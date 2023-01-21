import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import ValuationView from "./ValuationView";
import { getStaticPage } from '../../../utils/api';
import { toggleLogin } from '../../../actions/auth';
import { setLoading, secureApi } from "../../../actions/app";

const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
    const pageConfigurations = _get(state, "app.pageConfigurations", {});

    return {
        vendor,
        pageConfigurations
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    setLoading,
    getStaticPage: secureApi(getStaticPage, true)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ValuationView);
