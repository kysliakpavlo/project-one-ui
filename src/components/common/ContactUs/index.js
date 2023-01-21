import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import ContactUs from "./ContactUs";
import { secureApi, setLoading } from "../../../actions/app";
import { toggleLogin } from "../../../actions/auth";
import { getCities, getContactContent } from "../../../utils/api";
import { showMessage } from "../../../actions/toast";
const mapStateToProps = (state) => {
	const vendor = _get(state, "auth.vendor", {});
	return {
		vendor,
	};
};

const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{
			toggleLogin,
			setLoading,
			showMessage,
			getCities: secureApi(getCities),
			getContactContent: secureApi(getContactContent),
		},
		dispatch
	);

export default connect(mapStateToProps, mapDispatchToProps)(ContactUs);
