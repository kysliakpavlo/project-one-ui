import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _get from 'lodash/get';
import _values from 'lodash/values';

import Main from './Main';

import { validateLogin, fetchVendor } from '../../actions/auth';
import { subscribeToNewsLetter, getStaticPage } from '../../utils/api';
import { showMessage, removeMessage } from '../../actions/toast';
import { loadAppData, setLoading, setBrowserId, secureApi, actionNetworkConnection } from '../../actions/app';

const mapStateToProps = (state) => {
	const vendor = _get(state, 'auth.vendor', {});
	const vendorId = _get(state, 'auth.vendor.vendorId', '');
	const partnerId = _get(state, 'auth.vendor.partnerId', '');
	const isLoading = _get(state, 'app.isLoading', false);
	const loggedInUser = _get(state, 'auth.loggedInUser', false);
	const toastMessages = _values(_get(state, 'toast.messages', {})) || [];
	const categories = _get(state, 'app.categories', []);
	const locations = _get(state, 'app.locations', []);
	const showLogin = _get(state, 'auth.showLogin', false);
	const pageConfigurations = _get(state, 'app.pageConfigurations', {});
	const isConnected = _get(state, 'app.isConnected', false);

	const vendorLogo = _get(state, 'auth.vendor.vendorLogo', '');
	const footerVendorLogo = _get(state, 'auth.vendor.footerVendorLogo', '');
	const headingFontFamily = _get(state, 'auth.vendor.headingFontFamily', 'Ubuntu');
	const headingFontSize = _get(state, 'auth.vendor.headingFontSize', '18');
	const paragraphFontColor = _get(state, 'auth.vendor.paragraphFontColor', '#000000');
	const paragraphFontFamily = _get(state, 'auth.vendor.paragraphFontFamily', 'Roboto');
	const iconColor = _get(state, 'auth.vendor.iconColor', '#EF8354');
	const instagramUrl = _get(state, 'auth.vendor.instagramUrl', '');
	const facebookUrl = _get(state, 'auth.vendor.facebookUrl', '');
	const linkedinUrl = _get(state, 'auth.vendor.linkedinUrl', '');
	const headingFontColor = _get(state, 'auth.vendor.headingFontColor', '#2D3142');
	const primaryColor = _get(state, 'auth.vendor.primaryColor', '#2D3142');
	const secondaryColor = _get(state, 'auth.vendor.secondaryColor', '#BFC0C0');
	const ctaColor1 = _get(state, 'auth.vendor.ctaColor1', '#EF8354');
	const ctaColor2 = _get(state, 'auth.vendor.ctaColor2', '#4F5D75');
	const openingSoonTagColor = _get(state, 'auth.vendor.openingSoonTagColor', '#BFC0C0');
	const featuredTagColor = _get(state, 'auth.vendor.featuredTagColor', '#BFC0C0');
	const expressionOfInterestTagColor = _get(state, 'auth.vendor.expressionofInterestTagColor', 'green');
	const closedTagColor = _get(state, 'auth.vendor.closedTagColor', '#BFC0C0');

	return {
		showLogin,
		vendor,
		isLoading,
		toastMessages,
		locations,
		categories,
		loggedInUser,
		vendorId,
		partnerId,
		pageConfigurations,
		isConnected,
		vendorLogo,
		footerVendorLogo,
		headingFontFamily,
		headingFontSize,
		paragraphFontColor,
		paragraphFontFamily,
		iconColor,
		instagramUrl,
		facebookUrl,
		linkedinUrl,
		headingFontColor,
		primaryColor,
		secondaryColor,
		ctaColor1,
		ctaColor2,
		openingSoonTagColor,
		featuredTagColor,
		expressionOfInterestTagColor,
		closedTagColor,
	};
};

const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{
			fetchVendor,
			loadAppData,
			setBrowserId,
			setLoading,
			removeMessage,
			showMessage,
			validateLogin,
			subscribeToNewsLetter: secureApi(subscribeToNewsLetter),
			getStaticPage: secureApi(getStaticPage),
			actionNetworkConnection,
		},
		dispatch
	);

export default connect(mapStateToProps, mapDispatchToProps)(Main);
