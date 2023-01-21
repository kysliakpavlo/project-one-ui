import React, { useEffect, useState } from "react";
import _get from "lodash/get";
import _map from "lodash/map";
import _isEmpty from "lodash/isEmpty";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import SvgComponent from "../../common/SvgComponent";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import NoResults from "../../common/NoResults";
import AssetCards from "../../common/AssetCards";
import Breadcrumb from "../../common/Breadcrumb";
import AuctionAssetDetails from "../../common/AuctionAssetDetails";
import _identity from "lodash/identity";
import _pickBy from "lodash/pickBy";
import SearchFilters from "../../common/SearchFilters";
import Visible from "../../common/Visible";
import RefineSearch from "../../common/RefineSearch";
import { IT_AND_COMPUTERS } from "../../../utils/constants";
import { parse, stringify } from "qs";
import { dynamicFilter, setAppTitle, toUrlString, filterToChips, removeNumber, fromUrlString, scrollToTop, setSortObj } from "../../../utils/helpers";

import "./AuctionCatalogView.scss";

const pages = [
	{ label: "Home", path: "/" },
	{ label: "Auctions", path: "/auctions" },
];

const AuctionCatalogView = ({
	vendor,
	location,
	socket,
	match,
	setLoading,
	showMessage,
	loggedInUser,
	toggleLogin,
	history,
	isLoggedIn,
	isLoading,
	detailsAsset,
	setDetailsAsset,
	filtersState,
	setSearchFilterState,
	getAuctionDetails,
	searchAssets,
	isLivePanelOpen,
}) => {
	const auctionNum = match.params.auctionNum;
	let urlParam = location.search ? parse(location.search.split("?")[1]) : "";
	let sortData = urlParam?.data ? urlParam?.data : urlParam?.sortPaging;
	const { action } = history;
	const isBack = action === "POP";
	const [auction, setAuction] = useState({});
	const [searchCrietria, setSearchCrietria] = useState({});
	const [assetsResponse, setAssetsResponse] = useState(null);
	const [filters, setFilters] = useState([]);
	const [refineSearch, setRefineSearch] = useState(false);
	const [filteredObj, setFilteredObj] = useState(
		urlParam && urlParam?.filteredObj && Object.keys(urlParam?.filteredObj).length > 0
			? urlParam?.filteredObj
			: isBack
			? filtersState.filteredObj || {}
			: location.state?.filteredObj || {}
	);
	const [sortPaging, setSortPaging] = useState(
		sortData ? setSortObj(sortData) : isBack && !_isEmpty(filtersState.sortPaging) ? filtersState.sortPaging : { sortBy: "lotNo", pageSize: 12, activePage: 0 }
	);
	const [activeView, setActiveView] = useState(isBack && filtersState.activeView ? filtersState.activeView : "grid");

	let searchQuery = "";
	let subCategory = "";
	let listLocation = "";
	let manufacturer = "";
	let model = "";
	let city = "";
	let auctionType = "";
	let filtersRequired = 1;
	let assetType = "";
	let isFeatured = 0;
	let refineStatus = false;

	let checkQueryParam = (params) => {
		if (params !== "") {
			const filterobj = fromUrlString(params.split("?")[1]);
			searchQuery = filterobj.searchQuery;
			subCategory = filterobj.subCategory;
			listLocation = filterobj.listLocation;
			manufacturer = filterobj.manufacturer;
			model = filterobj.model;
			auctionType = filterobj.auctionType;
			assetType = filterobj.assetType;
			isFeatured = filterobj.isFeatured;
			filtersRequired = filterobj.filtersRequired;
			refineStatus = filterobj.refine;
			return filterobj.category;
		} else {
			return "";
		}
	};
	let { category = checkQueryParam(location.search) } = location.values || {};
	const { sortBy, pageSize, activePage } = sortPaging;
	useEffect(() => {}, [vendor]);

	// Get Auction Deatils
	useEffect(() => {
		getAuctionDetails(auctionNum).then((res) => {
			setAuction(res.result);
			if (vendor) {
				setAppTitle(
					"Auction Catalogue",
					vendor.name,
					_get(res.result, "auctionName"),
					_get(res.result, "auctionImageUrl"),
					_get(res.result, "auctionAddress") + " " + _get(res.result, "delivery") + " " + _get(res.result, "inspection") + " " + _get(res.result, "longDesc")
				);
			}
		});
	}, [auctionNum]);

	// Live Panel
	useEffect(() => {
		if (!isLivePanelOpen && Object.keys(searchCrietria).length > 0) {
			setLoading(true);
			setAssetsResponse([]);
			getAutcionData(searchCrietria);
		}
	}, [isLivePanelOpen]);

	useEffect(() => {
		const offset = activePage * pageSize;
		const [sort, direction = "asc"] = sortBy.split("/");

		refineStatus = location && location?.state?.filteredObj?.refine;

		setLoading(true);

		const subCategoryParam = {};

		if (filteredObj?.subCategory === IT_AND_COMPUTERS || subCategory === IT_AND_COMPUTERS) {
			subCategoryParam.subCategory = IT_AND_COMPUTERS;
		} else {
			subCategoryParam.subCategoryId = filteredObj?.subCategoryId ?? subCategory;
		}

		const filterParams = {};
		if (!_isEmpty(filteredObj)) {
			Object.keys(filteredObj).forEach((key) => {
				if (dynamicFilter.directKeys.includes(key)) {
					if (filteredObj[key]) {
						filterParams[key] = 1;
					}
				} else if (!dynamicFilter.skipSearchKeys.includes(key)) {
					filterParams[key] = _map(filteredObj[key], (item) => item.val).join();
				}
			});
		}

		let searchObj = {
			auctionNum,
			...subCategoryParam,
			keyword: searchQuery,
			categoryId: category,
			cityId: city,
			make: manufacturer,
			model,
			auctionTypeId: auctionType,
			limit: pageSize,
			offset,
			sort,
			direction,
			filtersRequired: _isEmpty(assetsResponse) ? 1 : 0,
			assetType,
			isFeatured,
			...filterParams,
		};

		searchObj = _pickBy(searchObj, _identity);

		setSearchCrietria(searchObj);
		getAutcionData(searchObj);
	}, [
		searchQuery,
		category,
		subCategory,
		listLocation,
		manufacturer,
		model,
		auctionType,
		pageSize,
		activePage,
		sortBy,
		setLoading,
		filtersRequired,
		loggedInUser,
		filteredObj,
		assetType,
		isFeatured,
		auctionNum,
	]);

	useEffect(() => {
		return () => {
			setSearchFilterState({ filteredObj, sortPaging, activeView });
		};
	}, [filteredObj, activeView, sortPaging, setSearchFilterState]);

	const getAutcionData = (request) => {
		searchAssets(request).then((res) => {
			if (refineStatus) {
				setFilters(JSON.parse(localStorage.getItem("filtersList")));
			}
			if (res.result.filters) {
				if (refineStatus) {
					setFilters(JSON.parse(localStorage.getItem("filtersList")));
				} else {
					setFilters(res.result.filters);
					localStorage.setItem("filtersList", JSON.stringify(res.result.filters));
				}
				if (detailsAsset) {
					setTimeout(() => {
						const assetEle = document.querySelector(`#asset_${detailsAsset}`);
						const container = document.querySelector(".search-result-view-content");
						if (assetEle) {
							scrollToTop(assetEle.offsetTop + container.offsetTop - 60);
							setDetailsAsset(null);
						}
					}, 100);
				}
			}
			console.log("reeees", res);
			setAssetsResponse(res);
			setLoading(false);
		});
	};

	const updateItems = (items) => {
		setAssetsResponse({
			...assetsResponse,
			result: {
				...assetsResponse.result,
				searchResult: items,
			},
		});
	};

	const onChangeSortPaging = (data) => {
		setSortPaging({ ...data });
		const searchParam = {
			filteredObj,
			data,
		};
		history.push({
			pathname: `/auction-catalogue/${auctionNum}`,
			search: stringify(searchParam),
			state: { searchParam },
		});
	};

	const onAssetClick = (consignmentNum, auctionNum) => {
		let groupName = "Auctions";
		history.push({
			pathname: `/asset`,
			search: stringify({ auctionNum, consignmentNum }),
			state: { groupName },
		});
	};

	const onChangeFilters = (filteredObj) => {
		setSortPaging({ sortBy, pageSize: 12, activePage: 0 });
		setFilteredObj(filteredObj);
		setRefineSearch(false);
		const searchParam = {
			filteredObj,
			sortPaging,
		};
		history.push({
			pathname: `/auction-catalogue/${auctionNum}`,
			search: stringify(searchParam),
			state: { searchParam },
		});
	};

	const removeSelection = (item) => {
		const data = filteredObj[item.key];
		const updated = data.filter((i) => i.name !== item.name);
		setFilteredObj({
			...filteredObj,
			[item.key]: updated,
			[item?.value]: false,
		});

		const searchParam = {
			filteredObj: {
				...filteredObj,
				[item.key]: updated,
				[item?.value]: false,
			},
			sortPaging,
		};
		history.push({
			pathname: `/auction-catalogue/${auctionNum}`,
			search: stringify(searchParam),
			state: { searchParam },
		});
	};

	const onRefineSearchClick = () => {
		setRefineSearch(!refineSearch);
		scrollToTop();
	};

	const updateAuction = (data) => {
		setAuction(data);
	};

	const filterListArray = filterToChips(filteredObj);

	const auctionsList = [...pages, { label: _get(auction, "auctionName") }];

	if (refineSearch) {
		return (
			<RefineSearch
				className="auction-catalog"
				showMessage={showMessage}
				toggleLogin={toggleLogin}
				onApply={onChangeFilters}
				loggedInUser={loggedInUser}
				onBack={onRefineSearchClick}
				state={{
					filteredObj,
					searchCrietria,
					filters,
					searchResults: assetsResponse,
				}}
			/>
		);
	}

	return (
		<>
			{/* <Container>
                <Row className="title-search-bar">
                    <h1>Browse By Assets</h1>
                    <PredictiveSearchBar isOpen={false} />
                </Row>
            </Container> */}

			<Container className="title-search">
				<Breadcrumb items={auctionsList} />

				<Row>
					<h1>Auction</h1>
					<PredictiveSearchBar />
				</Row>
			</Container>
			{/* <PredictiveSearchBar isOpen={false} /> */}

			<Container className="auction-catalog">
				{!_isEmpty(auction) && (
					<AuctionAssetDetails
						isExtended={false}
						auctionData={auction}
						assetTitle={auction?.title}
						city={auction?.city}
						state={auction?.state}
						description={auction?.longDesc}
						status={auction?.status}
						toggleLogin={toggleLogin}
						isLoggedIn={isLoggedIn}
						history={history}
						socket={socket}
						updateAuction={updateAuction}
						className={"assetDetails__infoPanel--vertical"}
					/>
				)}

				<div className="selected-filters">
					<p>Search Filters: </p>
					{/* TODO Replace with selected data chips */}
					{filterListArray.map((item, index) => (
						<div
							className="filtered-list"
							key={index}
						>
							{removeNumber(item.name)?.trim("") === "eoi" ? removeNumber(item.name)?.trim("").toUpperCase() : removeNumber(item.name)?.trim("")}
							<span onClick={() => removeSelection(item)}>
								<SvgComponent
									className="close-icon-svg"
									path="close_black_24dp"
								/>
							</span>
						</div>
					))}
				</div>

				<div className="refine-search">
					<Button
						className="refine-search-btn"
						variant="primary"
						size="sm"
						onClick={onRefineSearchClick}
						block
					>
						Refine Search
					</Button>
				</div>

				<div className="search-result-view-content">
					<div className="search-filter-available">
						<SearchFilters
							filters={filters}
							showMessage={showMessage}
							toggleLogin={toggleLogin}
							filteredObj={filteredObj}
							loggedInUser={loggedInUser}
							onChangeFilters={onChangeFilters}
						/>
					</div>

					<div className="search-result-cards-wrapper">
						{assetsResponse && assetsResponse.result && assetsResponse.result.searchResult && (
							<AssetCards
								loggedInUser={loggedInUser}
								socket={socket}
								history={history}
								toggleLogin={toggleLogin}
								items={assetsResponse.result.searchResult}
								updateItems={updateItems}
								showMessage={showMessage}
								filter={filters}
								filteredObj={setFilteredObj}
								onChangeFilters={onChangeFilters}
								total={assetsResponse.totalRecords}
								sortPaging={sortPaging}
								onChange={onChangeSortPaging}
								onAssetClick={onAssetClick}
								pageSize={pageSize}
								activeView={activeView}
								updateActiveView={setActiveView}
								searchCrietria={searchCrietria}
							/>
						)}
						<Visible when={!isLoading && _isEmpty(assetsResponse?.result?.searchResult)}>
							<NoResults />
						</Visible>
					</div>
				</div>
			</Container>
		</>
	);
};
export default AuctionCatalogView;
