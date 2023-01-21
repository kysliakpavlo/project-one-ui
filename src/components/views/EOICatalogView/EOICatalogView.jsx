import React, { useEffect, useState } from "react";
import _get from "lodash/get";
import _map from "lodash/map";
import _isEmpty from "lodash/isEmpty";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import NoResults from "../../common/NoResults";
import Container from "react-bootstrap/Container";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import SvgComponent from "../../common/SvgComponent";
import AssetCards from "../../common/AssetCards";
import Breadcrumb from "../../common/Breadcrumb";
import AuctionAssetDetails from "../../common/AuctionAssetDetails";
import _identity from "lodash/identity";
import _pickBy from "lodash/pickBy";
import Visible from "../../common/Visible";
import SearchFilters from "../../common/SearchFilters";
import RefineSearch from "../../common/RefineSearch";
import { IT_AND_COMPUTERS, MESSAGES } from "../../../utils/constants";
import {
  dynamicFilter,
  setAppTitle,
  toUrlString,
  removeNumber,
  filterToChips,
  fromUrlString,
  scrollToTop,
  setSortObj,
} from "../../../utils/helpers";
import { parse, stringify } from "qs";
import "./EOICatalogView.scss";

const pages = [
  { label: "Home", path: "/" },
  { label: "Expression of Interest", path: "/expression-of-interest" },
];

const EOICatalogView = ({
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
  const [auction, setAuction] = useState(null);
  const [searchCrietria, setSearchCrietria] = useState({});
  const [assetsResponse, setAssetsResponse] = useState(null);
  const [filters, setFilters] = useState([]);
  const [refineSearch, setRefineSearch] = useState(false);
  const [filteredObj, setFilteredObj] = useState(
    urlParam &&
      urlParam?.filteredObj &&
      Object.keys(urlParam?.filteredObj).length > 0
      ? urlParam?.filteredObj
      : isBack
      ? filtersState.filteredObj || {}
      : location.state?.filteredObj || {}
  );
  const [sortPaging, setSortPaging] = useState(
    urlParam?.data
      ? setSortObj(urlParam.data)
      : isBack && !_isEmpty(filtersState.sortPaging)
      ? filtersState.sortPaging
      : { sortBy: "lotNo", pageSize: 12, activePage: 0 }
  );
  const [activeView, setActiveView] = useState(
    isBack && filtersState.activeView ? filtersState.activeView : "grid"
  );

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

  useEffect(() => {
    if (vendor) {
      setAppTitle(
        "Expression of Interest Catalogue",
        vendor.name,
        _get(auction, "auctionName")
      );
    }
  }, [vendor]);

  useEffect(() => {
    return () => {
      setSearchFilterState({ filteredObj, sortPaging, activeView });
    };
  }, [filteredObj, activeView, sortPaging, setSearchFilterState]);

  useEffect(() => {
    getAuctionDetails(auctionNum).then((res) => {
      setAuction(res.result);
      const data = res.result;
      data.isEOI = true;
      // setAppTitle('Expression of Interest Catalogue', vendor.name, _get(auction, 'auctionName'));
      if (vendor) {
        setAppTitle(
          "Expression of Interest Catalogue",
          vendor.name,
          _get(res.result, "auctionName"),
          _get(res.result, "auctionImageUrl"),
          _get(res.result, "auctionAddress") +
            " " +
            _get(res.result, "delivery") +
            " " +
            _get(res.result, "inspection") +
            " " +
            _get(res.result, "longDesc")
        );
      }
    });
  }, [auctionNum]);
  useEffect(() => {
    if (!isLivePanelOpen && Object.keys(searchCrietria).length > 0) {
      setLoading(true);
      setAssetsResponse([]);
      getAuctionsAssets(searchCrietria);
    }
  }, [isLivePanelOpen]);
  useEffect(() => {
    const offset = activePage * pageSize;
    const [sort, direction = "asc"] = sortBy.split("/");
    refineStatus = location && location?.state?.filteredObj?.refine;
    setLoading(true);
    const subCategoryParam = {};
    if (
      filteredObj?.subCategory === IT_AND_COMPUTERS ||
      subCategory === IT_AND_COMPUTERS
    ) {
      subCategoryParam.subCategory = IT_AND_COMPUTERS;
    } else {
      subCategoryParam.subCategoryId =
        filteredObj?.subCategoryId ?? subCategory;
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
    getAuctionsAssets(searchObj);
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

  const getAuctionsAssets = (request) => {
    searchAssets(request).then((res) => {
      if (refineStatus) {
        setFilters(JSON.parse(localStorage.getItem("filtersList")));
      }
      if (res.result.filters) {
        if (refineStatus) {
          setFilters(JSON.parse(localStorage.getItem("filtersList")));
        } else {
          setFilters(res.result.filters);
          localStorage.setItem(
            "filtersList",
            JSON.stringify(res.result.filters)
          );
        }
        if (detailsAsset) {
          setTimeout(() => {
            const assetEle = document.querySelector(`#asset_${detailsAsset}`);
            const container = document.querySelector(
              ".search-result-view-content"
            );
            if (assetEle) {
              scrollToTop(assetEle.offsetTop + container.offsetTop - 60);
              setDetailsAsset(null);
            }
          }, 100);
        }
      }
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
    // history.push(
    //   `/expression-of-interest-catalogue/${auctionNum}/${stringify(
    //     searchParam
    //   )}`
    // );

    history.push({
      pathname: `/expression-of-interest-catalogue/${auctionNum}`,
      search: stringify(searchParam),
      state: { searchParam },
    });
  };

  const onAssetClick = (consignmentNo, auctionNum, isEOI) => {
    let groupName = "Expression of Interest";
    history.push({
      pathname: `/asset`,
      search: stringify({ auctionNum, consignmentNo }),
      state: { groupName },
    });
  };

  const printBuyerCard = (item) => {
    if (isLoggedIn) {
      const itemObj = toUrlString({
        auctionId: item.auctionId,
        auctionName: item.auctionName,
        auctionNumber: item.auctionNum,
        startDate: item.datetimeOpen,
        endDate: item.datetimeClose,
      });
      if (item.termsAgreed) {
        history.push(`/buyer-card/${item.auctionId}`);
      } else {
        callAppTermsCondition(itemObj, item.termsAgreed);
      }
    } else {
      toggleLogin(true, () => printBuyerCard(item));
    }
  };

  const onChangeFilters = (filteredObj) => {
    setSortPaging({ sortBy, pageSize: 12, activePage: 0 });
    setFilteredObj(filteredObj);
    setRefineSearch(false);
    const searchParam = {
      filteredObj,
      sortPaging,
    };
    // history.push(
    //   `/expression-of-interest-catalogue/${auctionNum}/${stringify(
    //     searchParam
    //   )}`
    // );
    history.push({
      pathname: `/expression-of-interest-catalogue/${auctionNum}`,
      search: stringify(searchParam),
      state: { searchParam },
    });
  };

  const callAppTermsCondition = (item, terms) => {
    if (!terms) {
      history.push(`/accept-terms-conditions?${item}`);
    } else if (this.props.isLoggedIn) {
      history.push(`/buyer-card/${item.auctionId}`);
    }
  };

  const printPage = () => {
    window.print();
  };

  const copyToClipboard = () => {
    const dummy = document.createElement("input"),
      text = window.location.href;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    showMessage({ message: MESSAGES.COPY_URL });
  };

  const updateAuction = (data) => {
    setAuction(data);
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
    // history.push(
    //   `/expression-of-interest-catalogue/${auctionNum}/${stringify(
    //     searchParam
    //   )}`
    // );
    history.push({
      pathname: `/expression-of-interest-catalogue/${auctionNum}`,
      search: stringify(searchParam),
      state: { searchParam },
    });
  };

  const onRefineSearchClick = () => {
    setRefineSearch(!refineSearch);
    scrollToTop();
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
    <Container className="auction-catalog">
      <PredictiveSearchBar />
      <Breadcrumb items={auctionsList} />
      <div className="social-icon-list">
        <div className="buttons">
          <span className="pt social-icon" title="Print" onClick={printPage}>
            <SvgComponent path="print" />
          </span>
          <a
            className="fb social-icon"
            title="Join us on Facebook"
            rel="noopener noreferrer"
            href={`https://www.facebook.com/sharer.php?u=${window.location.href}`}
            target="_blank"
          >
            <SvgComponent path="facebook" />
          </a>
          <a
            className="tw social-icon"
            title="Join us on Twitter"
            rel="noopener noreferrer"
            href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
            target="_blank"
          >
            <SvgComponent path="twitter" />
          </a>
          <a
            className="in social-icon"
            title="Join us on Linked In"
            rel="noopener noreferrer"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
            target="_blank"
          >
            <SvgComponent path="linkedin" />
          </a>
          <span
            className="lk social-icon"
            title="Link"
            onClick={copyToClipboard}
          >
            <SvgComponent path="link" />
          </span>
        </div>
      </div>
      {!_isEmpty(auction) ? (
        <AuctionAssetDetails
          isExtended={false}
          auctionData={auction}
          printBuyerCard={printBuyerCard}
          city={auction?.city}
          state={auction?.state}
          description={auction?.longDesc}
          status={auction?.status}
          history={history}
          isLoggedIn={isLoggedIn}
          toggleLogin={toggleLogin}
          socket={socket}
          updateAuction={updateAuction}
        />
      ) : null}

      <div className="selected-filters">
        <p>Search Filters: </p>
        {/* TODO Replace with selected data chips */}
        {filterListArray.map((item, index) => (
          <div key={index} className="filtered-list">
            {removeNumber(item.name)?.trim("") === "eoi"
              ? removeNumber(item.name)?.trim("").toUpperCase()
              : removeNumber(item.name)?.trim("")}
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

      <Row className="search-result-view-content">
        <Col xl={3} className="search-filter-available">
          <SearchFilters
            filters={filters}
            showMessage={showMessage}
            toggleLogin={toggleLogin}
            filteredObj={filteredObj}
            loggedInUser={loggedInUser}
            onChangeFilters={onChangeFilters}
          />
        </Col>

        <Col xl={9} className="search-result-cards-wrapper">
          {assetsResponse &&
            assetsResponse.result &&
            assetsResponse.result.searchResult && (
              <AssetCards
                loggedInUser={loggedInUser}
                socket={socket}
                history={history}
                toggleLogin={toggleLogin}
                items={assetsResponse.result.searchResult}
                updateItems={updateItems}
                showMessage={showMessage}
                filter={filters}
                activeView={activeView}
                updateActiveView={setActiveView}
                filteredObj={setFilteredObj}
                onChangeFilters={onChangeFilters}
                total={assetsResponse.totalRecords}
                sortPaging={sortPaging}
                onChange={onChangeSortPaging}
                onAssetClick={onAssetClick}
                pageSize={pageSize}
                searchCrietria={searchCrietria}
              />
            )}
          <Visible
            when={!isLoading && _isEmpty(assetsResponse?.result?.searchResult)}
          >
            <NoResults />
          </Visible>
        </Col>
      </Row>
    </Container>
  );
};
export default EOICatalogView;
