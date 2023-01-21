import { connect } from 'react-redux';
import _get from 'lodash/get';
import { bindActionCreators } from 'redux';

import { searchAssets } from '../../../utils/api';
import { setLoading, secureApi } from '../../../actions/app';
import { showMessage } from '../../../actions/toast';
import { toggleLogin } from '../../../actions/auth';
import { setSearchValues, setDetailsAsset, setSearchFilterState } from '../../../actions/advanceSearch';

import SearchResultsView from './SearchResultsView';

const mapStateToProps = (state) => {
	const vendor = _get(state, 'auth.vendor', {});
	const loggedInUser = _get(state, 'auth.loggedInUser', false);
	const filtersState = _get(state, 'advanceSearch.filtersState', {});
	const detailsAsset = _get(state, 'advanceSearch.detailsAsset', false);
	const categories = _get(state, 'app.categories', {});
	const isLivePanelOpen = _get(state, 'app.isLivePanelOpen', false);
	const auctionTypes = _get(state, 'app.auctionTypes', []);
	return {
		vendor,
		loggedInUser,
		detailsAsset,
		filtersState,
		categories,
		isLivePanelOpen,
		auctionTypes,
	};
};

const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{
			showMessage,
			toggleLogin,
			setLoading,
			setSearchValues,
			setDetailsAsset,
			setSearchFilterState,
			searchAssets: secureApi(searchAssets),
		},
		dispatch
	);

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultsView);
