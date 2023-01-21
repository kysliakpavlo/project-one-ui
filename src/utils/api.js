import { API_PATH } from "./constants";
import { toUrlString, getUserBrowserDetails } from "./helpers";
import { getItem } from "./storage";

const commonFetch = ({ uri, method, params = null, payload = null, headers, fullUrl }) => {
	const browserId = getItem("UNIQUE_BROWSER_ID");
	const userDeviceDetail = getUserBrowserDetails();
	let url = fullUrl ? fullUrl : `${API_PATH}/${uri}`;
	if (params) {
		url = `${url}?q=${toUrlString(params)}`;
	}

	let body;
	if (method !== "GET" && payload) {
		body = JSON.stringify(payload);
	}

	headers = {
		"Content-Type": "application/json",
		"cache-control": "no-cache",
		...headers,
	};

	if (browserId) {
		headers["browserId"] = browserId;
	}

	if (userDeviceDetail) {
		headers["User-Device-Detail"] = userDeviceDetail;
	}

	return new Promise((resolve, reject) => {
		fetch(url, {
			body,
			method,
			headers,
		})
			.then((res) => {
				if (res && res.status >= 400) {
					return res.json().then((err) =>
						reject({
							...err,
							status: res.status,
							statusText: res.statusText,
						})
					);
				} else {
					return res.json().then((res) => resolve(res));
				}
			})
			.catch((err) => {
				reject(err);
			});
	});
};

const get = (uri, params = null, headers = null) => {
	return commonFetch({
		uri,
		params,
		headers,
		method: "GET",
	});
};

const post = (uri, payload, params = null, headers = null) => {
	return commonFetch({
		uri,
		params,
		payload,
		headers,
		method: "POST",
	});
};

export const appCommonData = () => (headers) => get("common/get-app-load-data", null, headers);

export const getContent = (payload) => (headers) => post("common/get-content", payload, null, headers);

export const getAboutUsContent = () => (headers) => get("common/get-about-content", null, headers);

export const getContactContent = () => (headers) => get("common/get-contact-content", null, headers);

export const getVendor = (payload) => (headers) => post("onboard/get-vendor", payload, null, headers);

export const getAccount = () => (headers) => get("accounts", null, headers);

export const updateProfile = (payload) => (headers) => post("accounts/profile", payload, null, headers);

export const postLogin = (payload) => (headers) => post("accounts/authenticate", payload, null, headers);

export const validateLoginToken = (payload) => (headers) => post("accounts/validate", payload, null, headers);

export const postRegister = (payload) => (headers) => post("accounts/register", payload, null, headers);

export const updateShippingDetails = (payload) => (headers) => post("accounts/update-shipping-details", payload, null, headers);

export const verifyEmail = (payload) => (headers) => post("accounts/verify-email", payload, null, headers);

export const isEmailExist = (payload) => (headers) => post("accounts/is-email-exist", payload, null, headers);

export const isMobileExist = (payload) => (headers) => post("accounts/is-mobile-exist", payload, null, headers);

export const reSendEmail = (payload) => (headers) => post("accounts/resend-verification-email", payload, null, headers);

export const getForgotPassword = (payload) => (headers) => post("accounts/forgot-password", payload, null, headers);

export const validateChangePasswordToken = (payload) => (headers) => post("accounts/verify-forgot-pass-token", payload, null, headers);

export const resetPassword = (payload) => (headers) => post("accounts/reset-password", payload, null, headers);

export const sendOtp = (payload) => (headers) => post("accounts/send-otp", payload, null, headers);

export const verifyOtp = (payload) => (headers) => post("accounts/validate-otp", payload, null, headers);

export const subscribeToNewsLetter = (payload) => (headers) => post("accounts/subscribe-to-news-letter", payload, null, headers);

export const getAuctionMessages = (auctionId) => (headers) => get(`bid-message/${auctionId}`, headers);

export const getFeaturedAuctions = (params) => (headers) => get("auction/featured-auctions", params, headers);

export const getFeatured = (params) => (headers) => get("search/get-featured", params, headers);

export const getBannerImages = (params) => (headers) => get("auction/get-banner-featured-images", params, headers);

export const getFeaturedTerndors = () => (headers) => get("auction/featured-tendors", null, headers);

export const getCategoryGroups = () => (headers) => get("search/get-categories-groups", null, headers);

export const getSubCategories = (categoryGroupId) => (headers) => get("search/sub-categories", { categoryGroupId }, headers);

export const getManufacturers = (subCategory) => (headers) => get("manufacturer/get", { subCategory }, headers);

export const getModels = (options) => (headers) => get("manufacturer/get-model", options, headers);

export const getExpOfInterest = (params) => (headers) => get("auction/get-exp-of-interest", params, headers);

export const getAuctions = (params) => (headers) => get("auction/get-auctions", params, headers);

export const getAssetImages = (assetId) => (headers) => get("asset/get-asset-images", { assetId }, headers);

export const getAuctionDetails = (auctionNum) => (headers) => get("auction/get-auction-details", { auctionNum }, headers);

export const getPublicAuctionDetails = (auctionId) => (headers) => get("public-console/get-auction-detail", { auctionId }, headers);

export const getPublicAssetDetails = (params) => (headers) => get("public-console/get-asset-detail", params, headers);

export const getPublicBiddingLogs = (params) => (headers) => get("public-console/get-bidding-logs", params, headers);

export const addPublicBidddingLog = (params) => (headers) => post("public-console/add-bidding-log", params, null, headers);

export const getPublicLastBid = (params) => (headers) => get("public-console/get-my-last-bid", params, headers);

export const getAddedBidddingLog = (params) => (headers) => post("public-console/add-bidding-log", params, null, headers);

export const searchAssets = (params) => (headers) => get("search", params, headers);

export const getSavedSearch = (params) => (headers) => get("search/get-saved-search", params, headers);

export const isSavedSearchExists = (params) => (headers) => get("search/is-saved-search-exists", params, headers);

export const saveRemoveSearch = (payload) => (headers) => post("search/save-remove-my-search", payload, null, headers);

export const updateSavedSearchCrietria = (payload) => (headers) => post("search/update-search-crietria", payload, null, headers);

export const removeSavedSearch = (payload) => (headers) => post("search/remove-my-search", payload, null, headers);

export const updateSavedSearch = (payload) => (headers) => post("search/update-my-search", payload, null, headers);

export const getNextPrevAssets = (params) => (headers) => get("asset/get-next-previous-assets", params, headers);

export const getBidValues = (payload) => (headers) => post("asset/get-bid-formalities", payload, null, headers);

export const confirmBid = (payload) => (headers) => post("asset/confirm-bid", payload, null, headers);

export const addToWatchlist = (payload) => (headers) => post("asset/add-in-watchlist", payload, null, headers);

export const removeFromWatchList = (payload) => (headers) => post("asset/remove-in-watchlist", payload, null, headers);

export const notifyme = (notificationFor) => (headers) => get(`notification/get`, { notificationFor }, headers);

export const getNotifyMe = (params) => (headers) => get("notification/notify-me", params, headers);

export const getAllNotifyMe = (params) => (headers) => get("notification/all-notify-me", params, headers);

export const saveNotifyMe = (payload) => (headers) => post("notification/notify-me", payload, null, headers);

export const deleteNotifyme = (payload) => (headers) => post("notification/delete-notify-me", payload, null, headers);

export const addNotification = (params) => (headers) => post("notification/add", params, null, headers);

export const bidHistory = (params) => (headers) => get("asset/get-bid-history", params, headers);

export const getAssetDetails = (params) => (headers) => get("asset/get-asset-detail", params, headers);

export const getPartialAssetDetails = (params) => (headers) => get("asset/get-partial-asset-detail", params, headers);

export const getStaticPage = (pageId) => (headers) => get("static-page/get-page", { pageId }, headers);

export const getStaticPost = (postId) => (headers) => get("static-page/get-posts", { postId }, headers);

// Blog Routes
export const getNews = (payload) => (headers) => get("static-page/get-news", payload, headers);
export const getSinglePost = (postId) => (headers) => get("static-page/get-single-post", { postId }, headers);

export const getTransportFee = (params) => (headers) => get("transport-fee", params, headers);

export const getTransportAssetTypes = (params) => (headers) => get("transport-fee/get-asset-types", params, headers);

export const getCities = (params) => (headers) => get("location/get-cities", params, headers);

export const updateTermsCondition = (auctionId) => (headers) => post("auction/accept-terms", auctionId, null, headers);

export const getTransportFromCities = (params) => (headers) => get("transport-fee/from-cities", params, headers);

export const requestLowerBidIncrement = (params) => (headers) => post("public-console/lower-bid-inc-request", params, null, headers);

export const addAdminBidddingLog = (params) => (headers) => post("admin-console/add-bidding-log", params, null, headers);

export const getAdminBiddingLogs = (params) => (headers) => get("admin-console/get-bidding-logs", params, headers);

export const addAdminImpNotes = (params) => (headers) => post("admin-console/add-imp-notes", params, null, headers);

export const getAdminImpNotes = (params) => (headers) => get("admin-console/get-imp-notes", params, headers);

export const getAdminAssetDetails = (params) => (headers) => get("admin-console/get-asset-detail", params, headers);

export const getAdminOnlineBids = (params) => (headers) => get("admin-console/get-online-bids", params, headers);

export const adminInitiateBidding = (params) => (headers) => post("admin-console/initiate-bidding", params, null, headers);

export const adminPassInAsset = (params) => (headers) => post("admin-console/pass-in-asset", params, null, headers);

export const adminReferAsset = (params) => (headers) => post("admin-console/refer-asset", params, null, headers);

export const adminSoldAsset = (params) => (headers) => post("admin-console/sold-asset", params, null, headers);

export const adminAdmitBid = (params) => (headers) => post("admin-console/admit-bid", params, null, headers);

export const adminRejectBid = (params) => (headers) => post("admin-console/reject-bid", params, null, headers);

export const adminRollbackBid = (params) => (headers) => post("admin-console/rollback-bid", params, null, headers);

export const adminJumpToLotAsset = (params) => (headers) => post("admin-console/jump-to-lot", params, null, headers);

export const getImpNotes = (params) => (headers) => get("public-console/get-imp-notes", params, headers);

export const adminReopenAsset = (params) => (headers) => post("admin-console/reopen-asset", params, null, headers);

export const adminConfirmBid = (payload) => (headers) => post("admin-console/confirm-bid", payload, null, headers);

export const publicConfirmBid = (payload) => (headers) => post("public-console/confirm-bid", payload, null, headers);

export const getAdminAuctionDetails = (auctionId) => (headers) => get("admin-console/get-auction-detail", { auctionId }, headers);

export const getBidderHistory = (params) => (headers) => get("admin-console/bid-history", params, headers);

export const adminSuspendAuction = (payload) => (headers) => post("admin-console/suspend-auction", payload, null, headers);

export const adminResumeAuction = (payload) => (headers) => post("admin-console/resume-auction", payload, null, headers);

export const adminChangeAssetIncrement = (payload) => (headers) => post("admin-console/change-asset-increment", payload, null, headers);

export const adminLowerBidResponse = (payload) => (headers) => post("admin-console/accept-reject-lb-request", payload, null, headers);

export const adminEnableLowerBidButton = (payload) => (headers) => post("admin-console/allow-buyer-low-inc", payload, null, headers);

export const adminResetAsset = (payload) => (headers) => post("admin-console/reset-asset", payload, null, headers);

export const getUserPanelWinningAsset = (params) => (headers) => get("user/get-winning-assets", params, headers);

export const getUserPanelWatchingAsset = (params) => (headers) => get("user/get-currently-watching-assets", params, headers);

export const getReferredAsset = (params) => (headers) => get("user/get-my-referred-items", params, headers);

export const getUserPanelOutbiddenAsset = (params) => (headers) => get("user/get-currently-outbidden-assets", params, headers);

export const getUserActiveAsset = (params) => (headers) => get("user/get-currently-active-assets", params, headers);

export const getAuctionWonAssets = (params) => (headers) => get("user/get-won-items", params, headers);

export const getRecentlyWatchedItems = (params) => (headers) => get("asset/get-recently-viewed-asset", params, headers);

export const submitAssetEnquire = (payload) => (headers) => post("asset/enquire", payload, null, headers);

export const submitEnquire = (payload) => (headers) => post("financing-options/contact-transport-enquire", payload, null, headers);

export const submitFinancingEnquire = (payload) => (headers) => post("financing-options/enquire", payload, null, headers);

export const getAllNotifications = () => (headers) => get("user-notifications", null, headers);

export const getResetAllNotifications = (payload) => (headers) => post("user-notifications/reset", payload, null, headers);

export const verifyCard = (payload) => (headers) => post("payment/genrate-token", payload, null, headers);

export const generateConditionReport = (payload) => (headers) => post("asset/condition-report", payload, null, headers);

export const payUsingCard = (payload) => (headers) => post("payment/transaction", payload, null, headers);

export const updateCard = (payload) => (headers) => post("payment/update-user-card", payload, null, headers);

export const lastCallRequest = (payload) => (headers) => post("admin-console/place-last-call", payload, null, headers);

export const getAuctionDocuments = (params) => (headers) => get("auction/get-auction-documents", params, headers);

export const getAuctionActiveUsers = (params) => (headers) => get("auction-asset-summary/get-active-users-list", params, headers);

export const getAuctionStats = (params) => (headers) => get("auction-asset-summary/get-auction-statistics", params, headers);

export const getAuctionAssetsStats = (params) => (headers) => get("auction-asset-summary/get-auction-statistics-graph", params, headers);

export const buyNowAsset = (payload) => (headers) => post("asset/buy-now-asset", payload, null, headers);

export const getAssetWatchers = (assetId) => (headers) => get("asset/get-watchers", assetId, headers);

export const sellForm = (params) => (headers) => post("lead/add", params, null, headers);

export const auctionTerms = (params) => (headers) => get("auction/is-terms-accepted", params, headers);

export const getPublicConsoleAssets = (params) => (headers) => get("public-console/get-auction-assets", params, headers);

export const getAdminConsoleAssets = (params) => (headers) => get("admin-console/get-auction-assets", params, headers);

export const getHighestBidder = (params) => (headers) => get("admin-console/get-highest-bidder", params, headers);

export const getListAssetDetail = (params) => (headers) => get("asset/get-lite-asset-detail", params, headers);

export const getNotifiedAssets = (params) => (headers) => get("notification/all-notifed-assets", params, headers);

export const getNotifiedAuctions = (params) => (headers) => get("notification/all-notifed-auctions", params, headers);

export const clearSavedSearchCount = (params) => (headers) => post("search/clear-saved-search-count", params, null, headers);

export const notifyOtherAdmin = (payload) => (headers) => post("admin-console/notify-other-admin", payload, null, headers);

export const getCountries = (params) => (headers) => get("location/get-countries", params, headers);

export const getAuctionImages = (params) => (headers) => get("auction/get-auction-images", params, headers);

export const getPaidItems = (params) => (headers) => get("user/get-paid-items", params, headers);

export const getAssetInvoice = (params) => (headers) => get("asset/get-asset-invoice", params, headers);

export const deleteBid = (payload) => (headers) => post("sf-admin-console/delete-bid", payload, null, headers);
