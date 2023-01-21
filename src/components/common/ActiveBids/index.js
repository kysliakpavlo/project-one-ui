import ActiveBids from "./ActiveBids";

import { showMessage } from "../../../actions/toast";
import _get from "lodash/get";
import { connect } from "react-redux";
import { toggleLogin } from "../../../actions/auth";
import { bindActionCreators } from "redux";
import { setLoading, secureApi } from "../../../actions/app";
import { getUserActiveAsset, getListAssetDetail } from "../../../utils/api";

const mapStateToProps = (state) => {
	const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
	const loggedInUser = _get(state, "auth.loggedInUser", null);
	const isLivePanelOpen = _get(state, "app.isLivePanelOpen", false);
	const isConnected = _get(state, "app.isConnected", false);

	return {
		isLoggedIn,
		loggedInUser,
		isLivePanelOpen,
		isConnected
	};
};
const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{
			toggleLogin,
			showMessage,
			setLoading,
			getUserActiveAsset: secureApi(getUserActiveAsset),
			getListAssetDetail: secureApi(getListAssetDetail),
		},
		dispatch
	);

export default connect(mapStateToProps, mapDispatchToProps)(ActiveBids);
