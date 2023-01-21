import React, { Component } from "react";
import _map from "lodash/map";
import { Link } from "react-router-dom";
import _pickBy from "lodash/pickBy";
import _isEmpty from "lodash/isEmpty";
import _identity from "lodash/identity";
import _isEqual from "lodash/isEqual";
import _debounce from "lodash/debounce";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Visible from "../../common/Visible";
import SearchBar from "../../common/SearchBar";
import NoResults from "../../common/NoResults";
import AssetCards from "../../common/AssetCards";
import Breadcrumb from "../../common/Breadcrumb";
import SvgComponent from "../../common/SvgComponent";
import SearchFilters from "../../common/SearchFilters";
import onClickOutside from "react-onclickoutside";

import { stringify, parse } from "qs";
import { ASSET_TYPE, IT_AND_COMPUTERS } from "../../../utils/constants";
import { removeNumber, dynamicFilter, filterToChips, scrollToTop, filterKeyMap, setAppTitle, setSortObj, setBooleanFromString, preventEvent } from "../../../utils/helpers";

import "./PredictiveSearchResults.scss";

const pages = [{ label: "Home", path: "/" }];

class PredictiveSearchResults extends Component {
	constructor(props) {
		super(props);

		const { location, filtersState, searchQuery, values, auctionTypes } = props;

		this.state = {
			searchResults: null,
			searchCrietria: {},
			filters: [],
			filteredObj: filtersState.filteredObj,
			sortPaging: !_isEmpty(filtersState.sortPaging)
				? filtersState.sortPaging
				: {
						sortBy: "createdDate/desc",
						pageSize: 12,
						activePage: 0,
				  },
			activeView: "grid",
			refineSearch: false,
			isFilter: false,
			savedSearch: { label: "Save Search", name: "", id: null },
			//   searchResultsToggle: false,
		};

		// this.handleClick = this.handleClick.bind(this);
	}

	handleClickOutside = (evt) => {
		if (evt.target?.nodeName !== "HTML") {
			this.onCloseDetails();
		}
	};

	onCloseDetails = (e) => {
		preventEvent(e);
		this.setState({ searchResults: null });
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.searchQuery !== this.props.searchQuery) {
			if (this.props.searchQuery.length >= 2) {
				this.db();
				// _debounce(this.fetchResults(1), 250);
			}
		}
	}

	componentDidMount() {
		// const {
		//     setSearchValues,
		// } = this.props;
		// const filterobj = parse(this.props.location?.search.split("?")[1]);
		// if (filterobj.type && filterobj.type === "edit") {
		//     this.setState({
		//         savedSearch: {
		//             label: "Update Search",
		//             name: this.props.location.state.name,
		//             id: filterobj.savedSearchId,
		//         },
		//     });
		// } else {
		//     this.setState({ savedSearch: { label: "Save Search", id: null } });
		// }
		// setSearchValues({ searchQuery: filterobj.searchQuery });
		// // if (vendor) {
		// setAppTitle("Search Result", "", "Search Result: " + (filterobj.searchQuery ? filterobj.searchQuery : filterobj.title ? filterobj.title : ""));
		// //}
		// this.fetchResults(1);
	}

	db = _debounce(() => this.fetchResults(1), 450);

	advancedQuery = () => {
		let { auctionType, ...options } = this.props.values;
		if (auctionType && auctionType.length) {
			options["auctionType"] = auctionType.filter((item) => item !== "Buy Now").join();
			options["assetType"] = this.props.auctionTypes
				.filter((item) => auctionType.includes(item.recordTypeId))
				.map((item) => item.assetType)
				.join();
		}
		options["buyingMethod"] = "All";
		options["showAdvanced"] = true;
		if (options.category === "all") {
			delete options.category;
		}
		return stringify(options);
		// history.push(`/redirect/search-results?${query}`);
	};

	fetchResults = (filtersRequired = 0) => {
		const advSearch = this.advancedQuery();

		let query = stringify(advSearch);
		let urlParamsObj = parse(query.split("?")[1]);

		if (typeof urlParamsObj.showAdvanced !== Boolean) {
			urlParamsObj.showAdvanced && setBooleanFromString(urlParamsObj);
		}

		const { sortPaging, filteredObj, activeView } = this.state;
		const { sortBy, pageSize: limit, activePage } = urlParamsObj?.sortPaging ? setSortObj(urlParamsObj?.sortPaging) : sortPaging;
		const offset = activePage * limit;
		let [sort, direction = "asc"] = sortBy.split("/");
		if (urlParamsObj?.filteredObj && Object.keys(urlParamsObj?.filteredObj)?.length > 0) {
			this.setState({
				filteredObj: this.setMyAssetsValueToNumber(urlParamsObj?.filteredObj),
			});
		}
		if (urlParamsObj?.sortPaging) {
			this.setState({
				sortPaging: setSortObj(urlParamsObj?.sortPaging),
			});
		}
		const filterParams = {
			keyword: this.props.searchQuery,
			categoryId: urlParamsObj.category ? urlParamsObj.category : urlParamsObj.categoryId,
			subCategory: urlParamsObj.subCategory ? urlParamsObj.subCategory : urlParamsObj.subCategoryId,
			stateId: urlParamsObj.listLocation,
			cityId: urlParamsObj.cityId,
			make: urlParamsObj.manufacturer ? urlParamsObj.manufacturer : urlParamsObj.make,
			model: urlParamsObj.model,
			auctionTypeId: urlParamsObj.auctionType,
			assetType: urlParamsObj.assetType,
			isFeatured: urlParamsObj.isFeatured,
			buyingMethod: urlParamsObj.buyingMethod,
		};

		const refineStatus = urlParamsObj.refine;
		if (urlParamsObj.filtersRequired) {
			filtersRequired = Number(urlParamsObj.filtersRequired);
		}
		if (ASSET_TYPE.BUY_NOW === filterParams.assetType) {
			pages[1] = { label: "Buy" };
		} else {
			pages[1] = { label: "Search Results" };
		}

		if (filterParams.assetType === ASSET_TYPE.BUY_NOW && sort !== "createdDate") {
			sort = "listedPrice";
		}

		if (filteredObj?.subCategory === IT_AND_COMPUTERS || filterParams.subCategory === IT_AND_COMPUTERS) {
			filterParams.subCategory = IT_AND_COMPUTERS;
		} else {
			filterParams.subCategoryId = filterParams.subCategory;
			delete filterParams.subCategory;
		}

		if ((!filtersRequired || urlParamsObj.ignoreFilters) && (!_isEmpty(filteredObj) || !_isEmpty(urlParamsObj.filteredObj))) {
			let Obj = _isEmpty(filteredObj) ? urlParamsObj.filteredObj : filteredObj;
			Object.keys(Obj).forEach((key) => {
				if (dynamicFilter.directKeys.includes(key)) {
					if (Obj[key]) {
						filterParams[key] = 1;
					}
				} else if (!dynamicFilter.skipSearchKeys.includes(key)) {
					filterParams[key] = _map(Obj[key], (item) => item.val).join();
				}
			});
		}
		const { showAdvanced } = urlParamsObj;
		const searchCrietria = _pickBy(
			{
				sort,
				limit,
				offset,
				direction,
				filtersRequired,
				showAdvanced,
				...filterParams,
			},
			_identity
		);
		this.setState({ searchCrietria });
		this.props.setLoading(true);
		this.props.setSearchFilterState({ filteredObj, sortPaging, activeView });
		this.props.searchAssets(searchCrietria).then((res) => {
			const updatedState = { searchCrietria, searchResults: res };

			if (refineStatus) {
				updatedState.filters = JSON.parse(localStorage.getItem("filtersList"));
			}
			const { filters } = this.state;
			if (filters.length === 0) {
				updatedState.filters = JSON.parse(localStorage.getItem("filtersList"));
			}
			if (res.result.filters) {
				if (refineStatus) {
					updatedState.filters = JSON.parse(localStorage.getItem("filtersList"));
				} else {
					updatedState.filters = res.result.filters;
					localStorage.setItem("filtersList", JSON.stringify(res.result.filters));
				}
			}

			if (filtersRequired && !urlParamsObj.ignoreFilters) {
				updatedState.filteredObj = this.preselectQueryFilters(updatedState.filters, urlParamsObj);
			}

			if (this.props.detailsAsset) {
				setTimeout(() => {
					const assetEle = document.querySelector(`#asset_${this.props.detailsAsset}`);
					const container = document.querySelector(".search-result-view-content");
					if (assetEle) {
						scrollToTop(assetEle.offsetTop + container.offsetTop - 60);
						this.props.setDetailsAsset(null);
					}
				}, 100);
			}
			this.setState(updatedState);
			this.props.setLoading(false);
		});
	};

	getItemIdHandler = (item, urlParams, filterKey) => {
		if (item.itemId?.length >= 1 && urlParams.title !== "Browse by Asset Types") {
			if (filterKey === "listLocation" && item.stateId) {
				return urlParams[filterKey] === item.stateId;
			} else if (filterKey === "model" || filterKey === "manufacturer") {
				return urlParams[filterKey].toLowerCase() === item.name.toLowerCase();
			} else {
				return urlParams[filterKey].includes(item.itemId[0]);
			}
		}
	};

	preselectQueryFilters = (filters, urlParamsObj) => {
		const filteredObj = {};
		if (filters) {
			Object.keys(urlParamsObj).forEach((filterKey) => {
				const searchKey = filterKeyMap[filterKey];
				const keyFilterData = filters.find((item) => item.searchKey === searchKey);
				if (keyFilterData && keyFilterData?.subMenu?.length) {
					const item = keyFilterData.subMenu.find(
						(item) => item.slug === urlParamsObj[filterKey] || (item?.itemId && this.getItemIdHandler(item, urlParamsObj, filterKey))
					);
					if (item) filteredObj[searchKey] = [{ name: item.name, val: item.itemId }];
				}
				if (keyFilterData?.searchKey === "assetType" && keyFilterData?.subMenu?.length) {
					filteredObj[searchKey] = [];
					keyFilterData.subMenu.map((item) => {
						if (urlParamsObj[filterKey].toLowerCase().includes(item.itemId[0].toLowerCase())) {
							filteredObj[searchKey].push({
								name: item.name,
								val: item.itemId,
							});
						}
					});
				}
			});
		}
		if (urlParamsObj.title === "IT") {
			let generalGoodCategories = this.props.categories;
			generalGoodCategories = generalGoodCategories.filter((item) => item.categoryGroupId === "GENERAL_GOODS");
			filteredObj["categoryId"] = [
				{
					name: "General Goods",
					val: generalGoodCategories[0]?.categoryIdString,
				},
			];
			filteredObj["subCategory"] = [
				{
					name: "IT & Computers",
					val: "IT & Computers",
				},
			];
		}
		return filteredObj;
	};

	componentWillUnmount() {
		const { filteredObj, sortPaging, activeView } = this.state;
		this.props.setSearchFilterState({ filteredObj, sortPaging, activeView });
	}

	setMyAssetsValueToNumber = (myAssets) => {
		let { isWatchlisted, isNotified } = myAssets;
		isWatchlisted === "true" || isWatchlisted === "1" ? (myAssets.isWatchlisted = 1) : (myAssets.isWatchlisted = 0);
		isNotified === "true" || isNotified === "1" ? (myAssets.isNotified = 1) : (myAssets.isNotified = 0);
		return myAssets;
	};

	updateItems = (items) => {
		const { searchResults } = this.state;
		this.setState({
			searchResults: {
				...searchResults,
				result: {
					...searchResults.result,
					searchResult: items,
				},
			},
		});
	};

	createApiFilterParam = (params) => {
		const filterParams = {};
		Object.keys(params).forEach((key) => {
			if (dynamicFilter.directKeys.includes(key)) {
				if (params[key]) {
					filterParams[key] = 1;
				}
			} else if (!dynamicFilter.skipSearchKeys.includes(key)) {
				filterParams[key] = _map(params[key], (item) => item.val).join();
			}
		});
		return filterParams;
	};

	onChangeFilters = (filteredObj) => {
		const { sortBy } = this.state.sortPaging;
		let filterParams = this.createApiFilterParam(filteredObj);
		this.setState({
			filteredObj,
			refineSearch: false,
			sortPaging: { sortBy, pageSize: 12, activePage: 0 },
		});
		const { sortPaging } = this.state;
		let keyword = this.state.searchCrietria.keyword;
		const isEmpty = Object.values(filterParams).every((x) => x === null || x === "" || x === undefined);
		if (isEmpty) {
			filterParams.buyingMethod = "All";
		}
		let obj = stringify({
			...filterParams,
			filtersRequired: isEmpty ? 1 : 0,
			sortPaging,
			filteredObj,
			searchQuery: keyword,
		});
		this.props.history.push(`/search-results?${obj}`);
	};

	onChangeSortPaging = (sortPaging) => {
		const { filteredObj, searchCrietria } = this.state;
		let filterParams = this.createApiFilterParam(filteredObj);
		if (searchCrietria.stateId !== "") {
			filterParams["listLocation"] = searchCrietria.stateId;
		}
		let keyword = this.state.searchCrietria.keyword;
		let obj = stringify({
			...filterParams,
			filtersRequired: 0,
			sortPaging,
			filteredObj,
			searchQuery: keyword,
		});
		this.setState({ sortPaging });
		this.props.history.push(`/search-results?${obj}`);
	};

	updateActiveView = (activeView) => {
		this.setState({ activeView });
	};

	removeSelection = (item) => {
		const { filteredObj } = this.state;
		const { history, location } = this.props;

		if (item.type === "filter") {
			const data = filteredObj[item.key];
			const updated = data.filter((i) => i.name !== item.name);
			if (item.value) {
				this.onChangeFilters({
					...filteredObj,
					[item.key]: updated,
					[item?.value]: false,
				});
			} else {
				this.onChangeFilters({
					...filteredObj,
					[item.key]: updated,
				});
			}
		} else if (item.type === "url") {
			let queryObj = parse(this.props.location?.search.split("?")[1]);
			if (queryObj[item.key]?.split(",").length > 1) {
				queryObj[item.key] = queryObj[item.key]
					?.split(",")
					.filter((val) => val.toLowerCase() !== item.name.toLowerCase())
					.join(",");
			} else {
				delete queryObj[item.key];
			}
			queryObj["filtersRequired"] = 1;
			history.replace(`/search-results?${stringify(queryObj)}`);
		}
	};

	onAssetClick = (consignmentNo, auctionNum) => {
		const {
			location: { search },
			history,
		} = this.props;
		const filterobj = parse(this.props.location?.search.split("?")[1]);
		const groupName = filterobj.title;
		history.push({
			pathname: `/asset`,
			search: stringify({ auctionNum, consignmentNo }),
			state: { groupName },
		});
	};

	onRefineSearchClick = () => {
		this.setState({ refineSearch: !this.state.refineSearch });
	};

	getUrlForCard = (item) => {
		const { consignmentNo, auctionNum } = item;
		let query = {
			pathname: `/asset`,
			search: stringify({
				auctionNum: auctionNum,
				consignmentNo: consignmentNo,
			}),
			state: { isFeatured: 1, direction: "asc" },
		};
		return query;
	};

	//OUTSIDE CLICK FUNCTION START ********************

	//   handleClick = (evt) => {

	// 	// const predictiveSearchResultsContent = document.getElementById("predictiveSearchResultsContent");

	// 	if (evt.target?.nodeName !== "HTML") {

	// 		const predictiveSearchResultsContent = document.getElementById("predictiveSearchResultsContent")?.className?.includes("open");

	// 		if (predictiveSearchResultsContent) {
	// 			this.setState({ searchResultsToggle: false });
	// 			setTimeout(() => {
	// 				this.setState({ searchResultsToggle: true });
	// 			}, 1);
	// 		}
	// 	}

	// 	// Hide Visibility
	// 	// if (this.state.searchResultsToggle == false){
	// 	// 	predictiveSearchResultsContent.classList.add("visibility-hidden");
	// 	// 	this.setState({searchResultsToggle: true});
	// 	// }

	// 	console.log('search result toggle  ' , this.state.searchResultsToggle);
	//   };

	//OUTSIDE CLICK FUNCTION END ********************

	render() {
		const { socket, location, showMessage, loggedInUser, toggleLogin, history, isLoading } = this.props;
		const { searchResults, filters, filteredObj, sortPaging, activeView, searchCrietria, refineSearch, saveSearchLabel, savedSearch } = this.state;

		const filterobj = parse(this.props.location?.search.split("?")[1]);
		const groupName = filterobj.title;

		// console.log('searchQuery  ' , this.props.searchQuery);

		// searchResults && console.log("searchResults.result.searchResult: ", searchResults.result.searchResult);
		return (
			<>
				{/* <Container className="predictiveSearchResults"> */}
				<Container
					className={`predictiveSearchResults ${searchResults ? "open" : ""}`}
					id="predictiveSearchResultsContent"
				>
					<Visible when={searchResults}>
						{/* <p onClick={this.handleClick}>test</p> */}
						<Row className="predictiveSearchResults__content ">
							<Col
								// xl={window.screen.width < 1280 ? 12 : 9}
								className="predictiveSearchResults__wrapper"
							>
								{searchResults &&
									searchResults.result.searchResult.map((item) => (
										<Col
											id={`asset_${item.assetId}`}
											className={`predictiveSearchResults__item`}
											key={item.assetId}
											xs={12}
										>
											<Link to={this.getUrlForCard(item)}>{item.title}</Link>
										</Col>
									))}
								{/* {!_isEmpty(searchResults?.result?.searchResult) && (
                                    <AssetCards
                                        loggedInUser={loggedInUser}
                                        socket={socket}
                                        history={history}
                                        toggleLogin={toggleLogin}
                                        items={searchResults.result.searchResult}
                                        updateItems={this.updateItems}
                                        showMessage={showMessage}
                                        filter={filters}
                                        activeView={activeView}
                                        updateActiveView={this.updateActiveView}
                                        onChangeFilters={this.onChangeFilters}
                                        total={searchResults.totalRecords}
                                        sortPaging={sortPaging}
                                        onChange={this.onChangeSortPaging}
                                        onAssetClick={this.onAssetClick}
                                        groupName={groupName}
                                        searchCrietria={searchCrietria}
                                    />
                                )} */}
								<Visible when={!isLoading && _isEmpty(searchResults?.result?.searchResult)}>
									<NoResults />
								</Visible>
							</Col>
						</Row>
					</Visible>
				</Container>
			</>
		);
	}
}

export default onClickOutside(PredictiveSearchResults);
