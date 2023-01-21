import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import NewsView from "./NewsView";
import { setLoading, secureApi } from "../../../actions/app";
import { toggleLogin } from '../../../actions/auth';
import { getStaticPost, getNews } from '../../../utils/api';

const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
	const isLoading = _get(state, "app.isLoading", false);
    const pageConfigurations = _get(state, "app.pageConfigurations", {});
    return {
        vendor,
		isLoading,
        pageConfigurations
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    setLoading,
    getStaticPost: secureApi(getStaticPost),
    getNews: secureApi(getNews),
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(NewsView);
