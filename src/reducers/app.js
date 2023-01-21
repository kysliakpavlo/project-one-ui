const initialState = {
	isLoading: false,
	categories: [],
	locations: [],
	auctionTypes: [],
	headerAssetTypes: [],
	pageConfigurations: {},
	subCategories: {},
	manufacturers: {},
	models: {},
	cities: [],
	sideBar: false,
	browserId: null,
	isLivePanelOpen: false,
	isConnected: false,
};

const app = (state = initialState, action) => {
	switch (action.type) {
		case "APP_NETWORK_CONNECTION":
			return {
				...state,
				isConnected: action.payload,
			};
		case "APP_SET_LOADING":
			return {
				...state,
				isLoading: action.payload,
			};

		case "APP_SET_APP_DATA":
			const { categories = [], homepageCategories = [], assetTypes = [], locations = [], auctionTypes = [], headerAssetTypes = [], pageConfigurations = {} } = action.payload;
			return {
				...state,
				categories,
				homepageCategories,
				locations,
				assetTypes,
				auctionTypes,
				headerAssetTypes,
				pageConfigurations,
				subCategories: {},
				manufacturers: {},
				models: {},
				// isLoading: false,
			};
		case "APP_SET_SUB_CATEGORIES":
			return {
				...state,
				subCategories: {
					...state.subCategories,
					[action.categoryId]: action.subCategories,
				},
			};
		case "APP_SET_CITIES":
			const cities = action.cities;
			return {
				...state,
				cities,
			};
		case "APP_SET_MANUFACTURERS":
			return {
				...state,
				manufacturers: {
					...state.manufacturers,
					[action.subCategoryId]: action.manufacturers,
				},
			};
		case "APP_SET_MODELS":
			return {
				...state,
				models: {
					...state.models,
					[`${action.subCategoryId}_${action.manufacturerId}`]: action.models,
				},
			};
		case "APP_SET_COUNTRIES":
			return {
				...state,
				countries: action.countries,
			};
		case "APP_SIDE_BAR":
			return {
				...state,
				sideBar: action.value,
			};
		case "APP_SET_BROWSER_ID":
			return {
				...state,
				browserId: action.browserId,
			};
		case "APP_SET_LIVE_NOTIFICATION":
			return {
				...state,
				isLivePanelOpen: action.isOpen,
			};

		default:
			return state;
	}
};

export default app;
