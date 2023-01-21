import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import FaqView from "./FaqView";
import { setLoading, secureApi } from "../../../actions/app";
import { toggleLogin } from "../../../actions/auth";
import { getContent } from "../../../utils/api";

const mapStateToProps = (state) => {
	const vendor = _get(state, "auth.vendor", {});
	const isLoading = _get(state, "app.isLoading", false);

	return {
		vendor,
		isLoading
	};
};

const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{
			toggleLogin,
			setLoading,
			getContent: secureApi(getContent),
		},
		dispatch
	);

export default connect(mapStateToProps, mapDispatchToProps)(FaqView);
