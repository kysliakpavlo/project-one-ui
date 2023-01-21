import UID from "uniquebrowserid";
import _get from "lodash/get";
import { appCommonData, getSubCategories, getManufacturers, getModels, getCountries, getCities } from "../utils/api";
import { setItem } from "../utils/storage";
import { removeNumber } from "../utils/helpers";
import { MESSAGES } from "../utils/constants";
import { doLogout } from "../actions/auth";
import { showMessage } from "./toast";

export const actionNetworkConnection = (payload) => ({
	type: "APP_NETWORK_CONNECTION",
	payload,
});

export const actionSetLoading = (payload) => ({
	type: "APP_SET_LOADING",
	payload,
});

export const actionSetSideBar = (value) => ({
	type: "APP_SIDE_BAR",
	value,
});

export const actionSetAppData = (payload) => ({
	type: "APP_SET_APP_DATA",
	payload,
});

export const actionSetSubCategories = (categoryId, subCategories) => ({
	type: "APP_SET_SUB_CATEGORIES",
	categoryId,
	subCategories,
});

export const actionSetManufacturers = (subCategoryId, manufacturers) => ({
	type: "APP_SET_MANUFACTURERS",
	subCategoryId,
	manufacturers,
});

export const actionSetModels = (manufacturerId, subCategoryId, models) => ({
	type: "APP_SET_MODELS",
	manufacturerId,
	subCategoryId,
	models,
});

export const actionSetCities = (cities) => ({
	type: "APP_SET_CITIES",
	cities,
});

export const actionSetCountries = (countries) => ({
	type: "APP_SET_COUNTRIES",
	countries,
});

export const actionSetBrowserId = (payload) => ({
	type: "APP_SET_BROWSER_ID",
	payload,
});

export const actionSetError = (error) => ({
	type: "APP_SET_ERROR",
	error,
});

export const disableLowerBidInc = (islowerBidDisabled) => ({
	type: "DISABLE_LOWER_BID_INC",
	islowerBidDisabled,
});

export const setLiveNotificationOpen = (isOpen) => ({
	type: "APP_SET_LIVE_NOTIFICATION",
	isOpen,
});

export const setLoading = (isLoading) => (dispatch) => {
	dispatch(actionSetLoading(isLoading));
};

export const setSideBar = (value) => (dispatch) => {
	dispatch(actionSetSideBar(value));
};

export const loadAppData = () => async (dispatch) => {
	dispatch(actionSetLoading(true));

	const {
		result: { categoryGroups = [], homepageCategories = [], states: locations = [], auctionTypes = [], headerAssetTypes = [], pageConfigurations = {} },
	} = await dispatch(secureApi(appCommonData)());

	let assetTypes = [];

	const updatedAuctionTypes = auctionTypes
		.filter((item) => item.name !== "Traditional only")
		.map((item) => {
			const label = item.name === "Traditional / Simulcast" ? "Live" : item.name;
			return {
				...item,
				label,
				assetType: label === "Live" || label === "Online" ? "Auction" : label,
			};
		});

	updatedAuctionTypes.push({
		recordTypeId: "Buy Now",
		label: "Buy Now",
		assetType: "Buy Now",
	});

	// app.categories
	const categories = categoryGroups.map((item) => {
		const categoryIdString = item.groupCategories.map((item) => item.recordTypeId).join();
		assetTypes = assetTypes.concat(item.groupCategories);
		assetTypes.forEach((element, index) => {
			let name = element.name.split(".");
			if (name.length > 1) {
				assetTypes[index].name = name[1];
			}
		});
		return {
			...item,
			categoryIdString,
		};
	});

	dispatch(
		actionSetAppData({
			categories,
			homepageCategories,
			locations,
			assetTypes,
			headerAssetTypes,
			pageConfigurations,
			auctionTypes: updatedAuctionTypes,
		})
	);
};

export const loadSubCategories = (categoryId) => async (dispatch, getState) => {
	const state = getState();
	let subCategories = _get(state, `app.subCategories.${categoryId}`, null);
	if (!subCategories) {
		const res = await dispatch(secureApi(getSubCategories)(categoryId));
		res.result.forEach((element) => {
			element.name = removeNumber(element.name).trim("");
		});
		subCategories = res.result;
		await dispatch(actionSetSubCategories(categoryId, subCategories));
	}
	return subCategories;
};

export const loadManufacturers = (subCategoryId) => async (dispatch, getState) => {
	const state = getState();
	let manufacturers = _get(state, `app.manufacturers.${subCategoryId}`, null);
	if (!manufacturers) {
		const res = await dispatch(secureApi(getManufacturers)(subCategoryId));
		manufacturers = res.result;
		await dispatch(actionSetManufacturers(subCategoryId, manufacturers));
	}
	return manufacturers;
};

export const loadModels = (manufacturerId, subCategoryId) => async (dispatch, getState) => {
	const state = getState();
	let models = _get(state, `app.models.${subCategoryId}_${manufacturerId}`, null);
	if (!models && manufacturerId && subCategoryId) {
		const res = await dispatch(
			secureApi(getModels)({
				make: manufacturerId,
				subCategory: subCategoryId,
			})
		);
		models = res.result;
		await dispatch(actionSetModels(manufacturerId, subCategoryId, models));
	}
	return models;
};

export const loadCities = () => async (dispatch, getState) => {
	const state = getState();
	let cities = _get(state, "app.cities", []);
	if (!cities || !cities.length) {
		const res = await dispatch(secureApi(getCities)());
		cities = res.result;
		await dispatch(actionSetCities(cities));
	}
	return cities;
};

export const loadCountries = () => async (dispatch, getState) => {
	const state = getState();
	let countries = _get(state, `app.countries`, []);
	if (!countries || !countries.length) {
		const res = await dispatch(secureApi(getCountries)());
		const countries = Object.keys(res.result).map((item) => ({
			item,
			key: res.result[item].country,
			label: res.result[item].country,
		}));
		await dispatch(actionSetCountries(countries.sort((item1, item2) => (item1.key > item2.key ? 1 : -1))));
	}
	return countries;
};

export const setBrowserId = () => (async) => {
	const uniqueBrowserId = new UID().completeID();
	setItem("UNIQUE_BROWSER_ID", uniqueBrowserId);
	return true;
};

export const liveNotificationOpen = (isOpen) => (dispatch) => {
	dispatch(setLiveNotificationOpen(isOpen));
};

export const secureApi =
	(apiFn, loader = false) =>
	(params, headers) =>
	(dispatch, getState) => {
		loader && dispatch(actionSetLoading(true));
		const { auth } = getState();
		const vendorToken = _get(auth, "vendor.vendorToken");
		const authorization = _get(auth, "loggedInUser.jwtToken");
		headers = { vendorToken, authorization, ...headers };
		return apiFn(params)(headers).then(
			(res) => {
				loader && dispatch(actionSetLoading(false));
				return res;
			},
			(err) => {
				console.error(err);
				err.status === 401 && dispatch(doLogout(MESSAGES.ACCOUNT_SUSPEND));
				loader && dispatch(actionSetLoading(false));
				throw err;
			}
		);
	};
