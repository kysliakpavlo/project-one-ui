import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import AboutView from "./AboutView";
import { setLoading, secureApi } from "../../../actions/app";
import { toggleLogin } from "../../../actions/auth";
import { getStaticPage, getCategoryGroups, getAboutUsContent } from "../../../utils/api";

const mapStateToProps = (state) => {
	const vendor = _get(state, "auth.vendor", {});
	const pageConfigurations = _get(state, "app.pageConfigurations", {});
	return {
		vendor,
		pageConfigurations,
	};
};

const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{
			toggleLogin,
			setLoading,
			getStaticPage: secureApi(getStaticPage),
			getCategoryGroups: secureApi(getCategoryGroups),
			getAboutUsContent: secureApi(getAboutUsContent),
		},
		dispatch
	);

export default connect(mapStateToProps, mapDispatchToProps)(AboutView);
