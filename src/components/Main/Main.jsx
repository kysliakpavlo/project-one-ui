import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import _isEmpty from 'lodash/isEmpty';
import socketIOClient from 'socket.io-client';
import { Switch, Route, useLocation, Redirect } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Visible from '../common/Visible';
import AppSpinner from '../common/AppSpinner';
import ToastMessages from '../common/ToastMessages';
import { API_PATH } from '../../utils/constants';
import { scrollToTop, toUrlString } from '../../utils/helpers';
import Redirector from '../common/Redirector';
import RedirectorView from '../views/RedirectView/RedirectView';

const HomeView = lazy(() => import('../views/HomeView'));
const AuctionsView = lazy(() => import('../views/AuctionsView'));
const RegistrationView = lazy(() => import('../views/RegistrationView'));
const ValuationView = lazy(() => import('../views/ValuationView'));
const EOIView = lazy(() => import('../views/EOIView'));
const FaqView = lazy(() => import('../views/FaqView'));
const AboutView = lazy(() => import('../views/AboutUsView'));
const TransportView = lazy(() => import('../views/TransportView'));
const PublicConsoleView = lazy(() => import('../views/PublicConsoleView'));
const AdminConsoleView = lazy(() => import('../views/AdminConsoleView'));
const AuctionCatalogView = lazy(() => import('../views/AuctionCatalogView'));
const SearchResultsView = lazy(() => import('../views/SearchResultsView'));
const CareerView = lazy(() => import('../views/CareerView'));
const FinancePage = lazy(() => import('../views/FinanceView'));
const AuctionTender = lazy(() =>
	import('../views/AuctionTenderView/AuctionTender')
);
const AssetDetailView = lazy(() => import('../views/AssetDetailView'));
const AppTermsCondition = lazy(() => import('../common/AppTermsCondition'));
const Webinar = lazy(() =>
	import('../common/WebinarComponent/WebinarComponent')
);
const Westpac = lazy(() =>
	import('../common/RegistrationForm/ProfileForm/Westpac')
);
const ChangePassword = lazy(() => import('../common/ChangePassword'));
const BidderHistories = lazy(() => import('../common/BidderHistories'));
const LiveNotifications = lazy(() => import('../common/LiveNotifications'));
const Subscription = lazy(() => import('../common/Subscription'));
const Subscribe = lazy(() => import('../common/Subscription/Subscribe'));
const PolicyView = lazy(() => import('../views/PrivacyPolicyView'));
const TermsCondition = lazy(() => import('../views/Terms&Conidtion'));
const QuarterlyReportsView = lazy(() => import('../views/QuarterlyReports'));
const MyAccount = lazy(() => import('../common/MyAccount'));
const NewsView = lazy(() => import('../views/NewsView'));
const PostView = lazy(() => import('../views/PostView'));
const VerifyUser = lazy(() => import('../views/VerifyUser'));
const ProfileView = lazy(() => import('../views/ProfileView'));
const PreferencesView = lazy(() => import('../views/PreferencesView'));
const EOICatalogView = lazy(() => import('../views/EOICatalogView'));
const IframComponent = lazy(() => import('../common/WordPressPage'));
const ContactUs = lazy(() => import('../common/ContactUs'));
const AuctionStatisticsView = lazy(() =>
	import('../views/AuctionStatisticsView')
);
const SellWithUs = lazy(() => import('../common/SellWithUs'));
const BuyerCardView = lazy(() => import('../views/BuyerCardView'));
const SiteMapView = lazy(() => import('../views/SiteMapView'));
const ForgotPassword = lazy(() => import('../common/ForgotPassword'));
const AssetWatchers = lazy(() => import('../common/AssetWatchers'));
const ConditionReportView = lazy(() => import('../views/ConditionReportView'));
const MarketingPreferencesView = lazy(() =>
	import('../views/MarketingPreferencesView')
);

let socket = null;
let socketConnected = false;

const App = ({
	showLogin,
	vendor,
	vendorId,
	partnerId,
	showMessage,
	toastMessages,
	fetchVendor,
	loadAppData,
	removeMessage,
	loggedInUser,
	validateLogin,
	setBrowserId,
	isLoading,
	locations,
	categories,
	subscribeToNewsLetter,
	setLoading,
	pageConfigurations,
	getStaticPage,
	actionNetworkConnection,
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
}) => {
	const [displayPopup, setDisplayPopup] = useState(false);
	const handleClose = () => setDisplayPopup(false);
	const location = useLocation();
	const { pathname } = location;
	const isSFPage =
		pathname.includes('bidder-history') ||
		pathname.includes('buyer-card') ||
		pathname.includes('watchers');
	const [pageUrl, setPageUrl] = useState([]);
	const [showSearch, setShowSearch] = useState(false);

	useEffect(() => {
		const root = document.querySelector('#root');
		if (isSFPage) {
			root.style.paddingBottom = 0;
		} else {
			root.style.paddingBottom = null;
		}
	}, [isSFPage]);

	useEffect(() => {
		scrollToTop();
	}, [pathname]);

	useEffect(async () => {
		await setBrowserId();
		validateLogin();
		fetchVendor();
		initSocket();
		initVendor();
	}, [fetchVendor, validateLogin]);

	useEffect(() => {
		if (!_isEmpty(vendorId)) {
			loadAppData();
		}
	}, [vendorId, loadAppData]);

	const commonProps = useMemo(() => {
		const isLoggedIn = !!loggedInUser;
		return {
			socket,
			isLoggedIn,
		};
	}, [loggedInUser, socket]);

	const initVendor = () => {
		if (headingFontFamily) {
			document.documentElement.style.setProperty(
				'--heading-font-family',
				headingFontFamily
			);
		}
		if (headingFontSize) {
			document.documentElement.style.setProperty(
				'--heading-font-size',
				headingFontSize
			);
		}
		if (paragraphFontColor) {
			document.documentElement.style.setProperty(
				'--paragraph-font-color',
				paragraphFontColor
			);
		}
		if (paragraphFontFamily) {
			document.documentElement.style.setProperty(
				'--paragraph-font-family',
				paragraphFontFamily
			);
		}
		if (iconColor) {
			document.documentElement.style.setProperty(
				'--icon-color',
				iconColor
			);
		}
		if (headingFontColor) {
			document.documentElement.style.setProperty(
				'--heading-font-color',
				headingFontColor
			);
		}
		if (primaryColor) {
			document.documentElement.style.setProperty(
				'--primary--color',
				primaryColor
			);
		}
		if (secondaryColor) {
			document.documentElement.style.setProperty(
				'--secondary-color',
				secondaryColor
			);
		}
		if (ctaColor1) {
			document.documentElement.style.setProperty(
				'--cta-color-1',
				ctaColor1
			);
		}
		if (ctaColor2) {
			document.documentElement.style.setProperty(
				'--cta-color-2',
				ctaColor2
			);
		}
		if (openingSoonTagColor) {
			document.documentElement.style.setProperty(
				'--opening-soon-tag-color',
				openingSoonTagColor
			);
		}
		if (featuredTagColor) {
			document.documentElement.style.setProperty(
				'--featured-tag-color',
				featuredTagColor
			);
		}
		if (expressionOfInterestTagColor) {
			document.documentElement.style.setProperty(
				'--expression-of-interest-primary-color',
				expressionOfInterestTagColor
			);
		}
		if (closedTagColor) {
			document.documentElement.style.setProperty(
				'--closed-tag-color',
				closedTagColor
			);
		}

		if (headingFontFamily || paragraphFontFamily) {
			initGFont([headingFontFamily, paragraphFontFamily]);
		}
	};

	const initGFont = (fonts) => {
		// default font if none set
		let fontString = 'family=Roboto';

		// by default we are trying to load google fonts
		// if you are using a local font
		// please add the font to the ignore list
		let ignoreFonts = ['Karbon']; // always lower case pls
		let fontWeights = ['300', '400', '500', '600', '700'];
		let weightsString = ':wght@';
		weightsString = weightsString.concat(fontWeights.join(';'));

		// check if fonts are an array and not empty
		if (Array.isArray(fonts) && fonts.length > 0) {
			// only unique values pls
			// p and h can be the same font family
			fonts = [...new Set(fonts)];

			// make a Set to hold values from namesToDeleteArr
			const ignoreFontsSet = new Set(ignoreFonts);
			// use filter() method
			// to filter only those elements
			// that need not to be deleted from the array
			fonts = fonts.filter((font) => {
				// return those elements not in the namesToDeleteSet
				return !ignoreFontsSet.has(font.toLowerCase());
			});
		}

		// if none of the fonts are in ignore list
		// assume these are google fonts
		// and load them as such
		if (fonts.length > 0) {
			// prepend with family, become family=Roboto
			fonts = fonts.map((i) => `family=${i}${weightsString}`);

			// turn array into a string
			fontString = fonts.join('&');

			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = encodeURI(
				`https://fonts.googleapis.com/css2?${fontString}`
			);
			link.media = 'all';

			document.getElementsByTagName('head')[0].appendChild(link);
		}
	};

	const initSocket = () => {
		if (socketConnected) {
			return;
		}
		const options = {
			transports: ['websocket', 'polling'],
		};
		socket = socketIOClient(API_PATH, options);

		socket.on('connect', () => {
			actionNetworkConnection(true);
		});
		socket.on('disconnect', () => {
			actionNetworkConnection(false);
		});
		socket.on('connect_error', () => {
			socket.connect();
		});
	};

	if (_isEmpty(vendor)) {
		return (
			<div className="full-page-loader">
				<img
					width="200"
					src="./slattery-logo-dark.svg"
					alt="Slattery logo"
				/>
			</div>
		);
	}

	// const showSearchBar = (showSearch) => {
	//     if(showSearch){
	//         console.log('showSeach been set to true');
	//     }
	// }

	// showSearchBar(showSearch);

	const wrapperSetShowSearch = (val) => {
		// console.log('showSearch = ' + showSearch)
		setShowSearch(val);
	};

	//   console.log('show search - ' + showSearch);

	// console.log('vendorId', vendorId);
	// console.log('partnerId', partnerId);
	// console.log('paragraphFontColor', paragraphFontColor);

	return (
		<Suspense fallback={<AppSpinner />}>
			<Header
				{...commonProps}
				showMessage={showMessage}
				loggedInUser={loggedInUser}
				vendorLogo={vendorLogo}
			/>
			<div
				className={
					showLogin ? 'page-content backdrop-content' : 'page-content'
				}
			>
				<Suspense fallback={<AppSpinner variant="overlay" />}>
					<Switch>
						<Route
							exact
							path="/news"
							component={NewsView}
						/>
						<Route
							path="/news/:postName?/:urlParam?"
							render={(props) => (
								<PostView
									{...props}
									{...commonProps}
								/>
							)}
						/>
						<Route
							path="/quarterly-reports"
							component={QuarterlyReportsView}
						/>
						<Route
							path="/auctions"
							component={AuctionsView}
						/>
						<Route
							path="/registration"
							render={(props) => (
								<RegistrationView
									{...props}
									{...commonProps}
								/>
							)}
						/>
						<Route
							path="/valuations"
							component={ValuationView}
						/>
						<Route
							path="/privacy-policy"
							component={PolicyView}
						/>
						<Route
							path="/expression-of-interest"
							component={EOIView}
						/>
						{/* <Route path='/faq' component={FaqView} isLoading={isLoading} setLoading={setLoading}/> */}
						<Route
							path="/faq"
							component={FaqView}
						/>
						<Route
							path="/sitemap"
							component={SiteMapView}
						/>
						<Route
							path="/about-us"
							component={AboutView}
							showSearchSetter={wrapperSetShowSearch}
						/>
						<Route
							path="/contact-us"
							component={ContactUs}
						/>
						<Route
							path="/auction-catalogue/:auctionNum?/:urlParam?"
							render={(props) => (
								<AuctionCatalogView
									{...props}
									{...commonProps}
								/>
							)}
						/>
						<Route
							path="/search-results"
							render={(props) => (
								<SearchResultsView
									{...props}
									{...commonProps}
								/>
							)}
						/>
						<Route
							path="/sell-with-us"
							component={SellWithUs}
						/>
						<Route
							path="/sell-with-us-campaign"
							component={SellWithUs}
						/>
						<Route
							path="/career"
							component={CareerView}
						/>
						<Route
							path="/content-page"
							component={IframComponent}
						/>
						<Route
							path="/transport"
							component={TransportView}
						/>
						<Route
							path="/finance"
							component={FinancePage}
						/>
						<Route
							path="/tenders"
							component={AuctionTender}
						/>
						<Route
							path="/forgot-password"
							component={ForgotPassword}
						/>
						<Route
							path="/accept-terms-conditions"
							component={TermsCondition}
						/>
						<Route
							path="/terms-conditions"
							component={TermsCondition}
						/>
						<Route
							path="/terms-condition"
							component={AppTermsCondition}
						/>
						<Route
							path="/condition-report"
							component={ConditionReportView}
						/>
						<Route
							path="/webinar-audio"
							component={Webinar}
						/>
						<Route
							path="/westpac"
							render={(props) => (
								<Westpac
									{...props}
									setLoading={setLoading}
								/>
							)}
						/>
						<Route
							path="/bidder-history/:auctionId/:assetId"
							render={(props) => (
								<BidderHistories
									{...props}
									{...commonProps}
								/>
							)}
						/>

						{/*
						 * Single Asset Auction
						 */}
						<Route
							path="/asset"
							render={(props) => (
								<AssetDetailView
									{...props}
									{...commonProps}
								/>
							)}
						/>
						<Route
							path="/simulcast-auction/:auctionId"
							render={(props) => (
								<PublicConsoleView
									{...props}
									{...commonProps}
									loggedInUser={loggedInUser}
								/>
							)}
						/>
						<Route
							path="/admin-console/:auctionId"
							render={(props) => (
								<AdminConsoleView
									{...props}
									{...commonProps}
									loggedInUser={loggedInUser}
								/>
							)}
						/>

						<Route
							path="/my-account/:tabView"
							render={(props) => (
								<MyAccount
									{...props}
									{...commonProps}
								/>
							)}
						/>
						<Route
							path="/profile"
							render={(props) => (
								<ProfileView
									{...props}
									{...commonProps}
								/>
							)}
						/>
						<Route
							path="/preferences"
							render={(props) => (
								<PreferencesView
									{...props}
									{...commonProps}
									loggedInUser={loggedInUser}
								/>
							)}
						/>
						<Route
							path="/marketing-preferences"
							render={(props) => (
								<MarketingPreferencesView
									{...props}
									{...commonProps}
									loggedInUser={loggedInUser}
								/>
							)}
						/>

						<Route
							path="/change-password/:resetToken"
							component={ChangePassword}
						/>
						<Route
							path="/verify-user/:token"
							component={VerifyUser}
						/>
						<Route
							path="/expression-of-interest-catalogue/:auctionNum?/:urlParam?"
							render={(props) => (
								<EOICatalogView
									{...props}
									{...commonProps}
								/>
							)}
						/>

						<Route
							path="/auction-statistics"
							render={(props) => (
								<AuctionStatisticsView
									{...props}
									{...commonProps}
									loggedInUser={loggedInUser}
								/>
							)}
						/>
						<Route
							path="/buyer-card/:auctionId"
							render={(props) => (
								<BuyerCardView
									{...props}
									{...commonProps}
									loggedInUser={loggedInUser}
								/>
							)}
						/>

						<Route
							path="/watchers/:assetId"
							render={(props) => (
								<AssetWatchers
									{...props}
									{...commonProps}
								/>
							)}
						/>
						<Route
							path="/redirect/:to"
							component={Redirector}
						/>

						{
							<Route
								path="/:match"
								render={(props) => {
									return (
										<RedirectorView
											{...props}
											{...commonProps}
											pageConfigurations={
												pageConfigurations
											}
											getStaticPage={getStaticPage}
										/>
									);
								}}
							></Route>
						}

						{/* Keep this as the last route line */}
						<Route
							path="/"
							component={HomeView}
						/>
					</Switch>
				</Suspense>
			</div>

			<Visible when={!isSFPage}>
				<Subscribe
					locations={locations}
					categories={categories}
					onPopup={setDisplayPopup}
					show={displayPopup}
					showMessage={showMessage}
					onClose={handleClose}
					subscribeToNewsLetter={subscribeToNewsLetter}
				/>
			</Visible>
			{/* <Visible when={!loggedInUser && !isSFPage}> */}
			<Subscription
				loggedIn={loggedInUser}
				SFPage={isSFPage}
			/>
			{/* </Visible> */}
			<Visible when={!isSFPage}>
				<LiveNotifications {...commonProps} />
			</Visible>
			<Footer
				isLoggedIn={!!loggedInUser}
				showLogin={showLogin}
				footerVendorLogo={footerVendorLogo}
			/>
			<Visible when={isLoading}>
				<AppSpinner variant="overlay" />
			</Visible>
			<ToastMessages
				messages={toastMessages}
				onClose={removeMessage}
			/>
		</Suspense>
	);
};

export default App;
