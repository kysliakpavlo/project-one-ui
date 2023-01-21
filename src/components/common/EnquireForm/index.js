import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EnquireForm from "./EnquireForm";
import { secureApi } from "../../../actions/app";
import _get from "lodash/get";
import { submitEnquire } from "../../../utils/api";

const mapSTP = (state, props) => {
	const loggedInUser = _get(state, "auth.loggedInUser", null);
	const enquireLocation = _get(props, "enquireLocation", null);

	return {
		loggedInUser,
		enquireLocation
	};
};

const mapDTP = (dispatch) =>
	bindActionCreators(
		{
			submitEnquire: secureApi(submitEnquire),
		},
		dispatch
	);

export default connect(mapSTP, mapDTP)(EnquireForm);
