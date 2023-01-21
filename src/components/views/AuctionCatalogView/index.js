import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";
import AuctionCatalogView from "./AuctionCatalogView";

import { secureApi, setLoading } from "../../../actions/app";
import { showMessage } from "../../../actions/toast";
import { toggleLogin } from "../../../actions/auth";
import { setDetailsAsset, setSearchFilterState } from "../../../actions/advanceSearch";
import { getAuctionDetails, searchAssets } from "../../../utils/api";

const mapStateToProps = (state) => {
	const vendor = _get(state, "auth.vendor", {});
	const loggedInUser = _get(state, "auth.loggedInUser", false);
	const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
	const isLoading = _get(state, "app.isLoading", false);
	const filtersState = _get(state, "advanceSearch.filtersState", {});
	const detailsAsset = _get(state, "advanceSearch.detailsAsset", false);
	const isLivePanelOpen = _get(state, "app.isLivePanelOpen", false);
	return {
		vendor,
		loggedInUser,
		isLoggedIn,
		isLoading,
		filtersState,
		detailsAsset,
		isLivePanelOpen,
	};
};

const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{
			setLoading,
			showMessage,
			toggleLogin,
			setDetailsAsset,
			setSearchFilterState,
			searchAssets: secureApi(searchAssets),
			getAuctionDetails: secureApi(getAuctionDetails),
		},
		dispatch
	);

export default connect(mapStateToProps, mapDispatchToProps)(AuctionCatalogView);
