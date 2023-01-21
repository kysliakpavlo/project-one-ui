import React from "react";
import { withRouter } from "react-router";
import Table from "react-bootstrap/Table";
import CustomPlacebidBox from "../MyAccount/CustomPlacebidBox";
import { Link } from "react-router-dom";
import Visible from "../Visible";
import {
  encrypt,
  toUrlString,
  constructImageUrl,
  getTimezoneName,
} from "../../../utils/helpers";
import {
  ASSET_STATUS,
  ASSET_TYPE,
  AUCTION_TYPES,
  AUCTION_TYPES_MAP,
  ASSET_LIST_TYPE,
  DEFAULT_IMAGE,
  ONE_YEAR,
  MESSAGES,
} from "../../../utils/constants";
import { stringify } from "qs";
import Row from "react-bootstrap/Row";
import CountdownTimer from "../CountdownTimer";
import BidHistoryComponent from "../BidHistory/BidHistory";
import SvgComponent from "../SvgComponent";
import _get from "lodash/get";
import dayjs from "dayjs";
import "./CommonTable.scss";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import DownloadAuctionDocuments from "../DownloadAuctionDocuments";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import _cloneDeep from "lodash/cloneDeep";

class CommonTable extends React.Component {
  state = {
    bidPlacedForAsset: null,
    bidValue: null,
    updateCheckBox: {},
    sortPaging: { sortBy: "", pageSize: 12, activePage: 0 },
    sortName: "",
  };

  componentDidMount() {
    this.props.openSocket();
  }
  validateUser = (e, item) => {
    const { isLoggedIn, toggleLogin, loggedInUser, history } = this.props;
    e.stopPropagation();
    e.preventDefault();
    const itemObj = toUrlString({
      auctionId: item.auctionData.auctionId,
      timeZone: "",
      location: item.state.name,
      auctionName: item.auctionData.auctionName,
      auctionNumber: "",
      startDate: item.createdDate,
      endDate: item.datetimeClose,
    });
    if (loggedInUser && loggedInUser.role === "Admin") {
      history.push(`/admin-console/${encrypt(item.auctionData.auctionId)}`);
    } else if (isLoggedIn) {
      this.callTermsCondition(
        item.assetId,
        item.auctionData.auctionId,
        itemObj
      );
    } else if (!isLoggedIn) {
      toggleLogin(true, () =>
        this.callTermsCondition(
          item.assetId,
          item.auctionData.auctionId,
          itemObj
        )
      );
    }
  };

  callTermsCondition = (assetId, auctionId, item) => {
    const { history, loggedInUser } = this.props;
    this.props.getBidValues({ assetId, auctionId }).then((res) => {
      if (loggedInUser && !loggedInUser.cardExist) {
        this.props.showMessage({
          message: MESSAGES.CARD_MISSING,
          type: "error",
        });
        history.push(`/profile?onComplete=/terms-condition?${item}`);
      } else if (res.result.termsAgreed) {
        history.push({
          pathname: `/simulcast-auction/${encrypt(auctionId)}`,
          search: "",
          state: { asset: assetId },
        });
      } else {
        history.push(`/terms-condition?${item}`);
      }
    });
  };

  disableAbsenteeClosed = (auctionClose) => {
    const res = dayjs() <= dayjs(auctionClose) ? true : false;
    return res;
  };
  assetAvailForBid = (auctionOpenDAte, auctionClose) => {
    const r =
      dayjs() >= dayjs(auctionOpenDAte) && dayjs() <= dayjs(auctionClose)
        ? true
        : false;
    return r;
  };
  navigateToAsset = (event, consignmentNo, auctionNum) => {
    const { history } = this.props;
    document.body.style.overflow = "";
    event.preventDefault();
    event.stopPropagation();
    const obj = stringify({ auctionNum, consignmentNo });
    history.push(`/asset?${obj}`);
  };
  customBidHandler = (value, assetId, assetDetail, buyersPremiumList) => {
    const cloned = _cloneDeep(this.props.assetList);
    this.setState({ bidValue: value });
    let premiumPercent = 0;
    let flatCharge = 0;
    if (buyersPremiumList.length > 0) {
      for (let i = 0; i <= buyersPremiumList.length; i++) {
        if (
          value >= buyersPremiumList[i]?.salesPriceLowerBound &&
          ((value <= buyersPremiumList[i]?.salesPriceUpperBound &&
            buyersPremiumList[i]?.salesPriceUpperBound !== 0) ||
            buyersPremiumList[i]?.salesPriceUpperBound === 0)
        ) {
          premiumPercent = buyersPremiumList[i].chargeRate;
          flatCharge = buyersPremiumList[i].chargeRateFlat;
          break;
        }
      }
    }
    const calCreditfee = parseFloat(
      ((value +
        (flatCharge > 0
          ? flatCharge
          : parseFloat((value / 100) * premiumPercent))) /
        100) *
        this.props.creditCardPercentage
    );
    const total = parseFloat(
      (flatCharge > 0
        ? flatCharge
        : parseFloat((value / 100) * premiumPercent)) +
        parseFloat(calCreditfee) +
        parseFloat(value)
    );
    const item = cloned.find((i, index) => i.assetId === assetId);
    if (item && item.assetId === assetId) {
      item.calculatedTotal = total;
      item.enteredAmt = Number(value);
      item.creditCardFee = value === 0 ? "" : Number(calCreditfee);
      item.premiumPercent = value === 0 ? "-" : Number(premiumPercent);
      item.calPremiumAmt =
        flatCharge > 0
          ? flatCharge
          : value === 0
          ? ""
          : parseFloat((value / 100) * premiumPercent);
      item.flatCharge = Number(flatCharge);
    }
    this.props.updateItems(cloned);
  };
  gstHandler = (assetId, itemGst) => {
    const cloned = _cloneDeep(this.props.assetList);
    const item = cloned.find((i, index) => i.assetId === assetId);
    if (item) {
      item.gstApplicable = itemGst;
    }
    this.props.updateItems(cloned);
  };
  onPlaceBidConfirm = (data) => {
    const { showMessage, loggedInUser } = this.props;
    if (
      loggedInUser &&
      (!loggedInUser.cardExist ||
        (loggedInUser.overrideCardCheck && loggedInUser.cardExist))
    ) {
      this.props.showMessage({ message: MESSAGES.CARD_MISSING, type: "error" });
      this.props.history.push("/profile?onComplete");
    } else {
      this.props
        .confirmBid(data)
        .then((res) => {
          if (res && res.statusCode !== 200) {
            showMessage({ message: res.message });
            return false;
          } else {
            this.setState({ bidPlacedForAsset: data.assetId });
            const cloned = _cloneDeep(this.props.assetList);
            const item = cloned.find((i) => i.assetId === data.assetId);
            if (item && data.bidType === "current") {
              item.myHighestBid = data.bidAmount;
            }
            if (item) {
              item.calculatedTotal = "";
              item.enteredAmt = "";
              item.creditCardFee = "";
              item.calPremiumAmt = "";
              item.premiumPercent = "";
            }
            this.props.updateItems(cloned);
            showMessage({
              message: (
                <div>
                  <div>
                    <div>
                      {data.bidType === "absentee-bid" ? (
                        <span>{MESSAGES.ABSENTEE_BID}</span>
                      ) : data.bidType === "auto" ? (
                        <span>{MESSAGES.AUTO_BID}</span>
                      ) : (
                        <span>{MESSAGES.BID_PLACED}</span>
                      )}
                    </div>
                  </div>
                </div>
              ),
            });
          }
        })
        .catch((res) => {
          showMessage({ message: res.message });
        });
    }
  };
  onCompleteTimer = (item) => {
    const cloned = _cloneDeep(this.props.assetList);
    const asset = cloned.find((i) => i.assetId === item.assetId);
    if (asset) {
      asset.status = "Sold";
    }
    this.props.updateItems(cloned);
  };
  onSortClick = (sortType) => {
    let sort = this.props.sortBy.split("/");
    let order = sort[1] === "asc" ? "desc" : "asc";
    this.setState({ sortName: sortType });
    this.setState({
      sortPaging: {
        sortBy: sortType.concat("/").concat(order),
        pageSize: 12,
        activePage: 0,
      },
    });
    setTimeout(() => {
      this.props.onSortClick(this.state.sortPaging);
    }, 100);
  };
  getBuyerPremium = (myHighestBid, buyersPremium) => {
    let buyersPremiumAmt = {
      flatCharge: 0,
      buyerPremiumPercentage: 0,
    };
    if (buyersPremium?.length > 0 && myHighestBid > 0) {
      for (let i = 0; i <= buyersPremium.length; i++) {
        if (
          myHighestBid >= buyersPremium[i]?.salesPriceLowerBound &&
          ((myHighestBid <= buyersPremium[i]?.salesPriceUpperBound &&
            buyersPremium[i]?.salesPriceUpperBound !== 0) ||
            buyersPremium[i]?.salesPriceUpperBound === 0)
        ) {
          buyersPremiumAmt.buyerPremiumPercentage = buyersPremium[i].chargeRate;
          buyersPremiumAmt.flatCharge = buyersPremium[i].chargeRateFlat;
          break;
        }
      }
    }
    return buyersPremiumAmt;
  };
  isAssetStatusClosed = (status) => {
    if (
      status === ASSET_STATUS.SOLD ||
      status === ASSET_STATUS.REFERRED ||
      status === ASSET_STATUS.PASSED_IN
    ) {
      return true;
    } else {
      return false;
    }
  };
  render() {
    const {
      assetList,
      highlightAsset,
      loggedInUser,
      selectedItems,
      selectAll,
      watchedItemPage,
      assetListType,
      paymentHistoryPage,
      onPayClick,
      creditCardPercentage,
    } = this.props;
    let sortName = this.props.sortBy.split("/")[0];
    let sortType = this.props.sortBy.split("/")[1];
    return (
      <>
        <Table responsive="sm" className="list-view-table">
          <thead className="table-header">
            <tr>
              <th onClick={(e) => this.onSortClick("consignmentNo")}>
                Item No{" "}
                {sortType === "desc" && sortName === "consignmentNo" ? (
                  <SvgComponent path="sort-down-solid" />
                ) : sortType === "asc" && sortName === "consignmentNo" ? (
                  <SvgComponent path="sort-up-solid" />
                ) : (
                  <SvgComponent path="sort" />
                )}
              </th>
              <th onClick={(e) => this.onSortClick("lotNo")}>
                Lot No{" "}
                {sortType === "desc" && sortName === "lotNo" ? (
                  <SvgComponent path="sort-down-solid" />
                ) : sortType === "asc" && sortName === "lotNo" ? (
                  <SvgComponent path="sort-up-solid" />
                ) : (
                  <SvgComponent path="sort" />
                )}
              </th>
              <th onClick={(e) => this.onSortClick("title")}>
                Image{" "}
                {sortType === "desc" && sortName === "title" ? (
                  <SvgComponent path="sort-down-solid" />
                ) : sortType === "asc" && sortName === "title" ? (
                  <SvgComponent path="sort-up-solid" />
                ) : (
                  <SvgComponent path="sort" />
                )}
              </th>
              {paymentHistoryPage && (
                <th
                  className="payment-title"
                  onClick={(e) => this.onSortClick("title")}
                >
                  Title{" "}
                  {sortType === "desc" ? (
                    <SvgComponent path="sort-down-solid" />
                  ) : (
                    <SvgComponent path="sort-up-solid" />
                  )}
                </th>
              )}
              {!paymentHistoryPage && (
                <th className="highest-bid-header">Highest Bidder </th>
              )}
              <th onClick={(e) => this.onSortClick("auctionNum")}>
                Sale{" "}
                {sortType === "desc" && sortName === "auctionNum" ? (
                  <SvgComponent path="sort-down-solid" />
                ) : sortType === "asc" && sortName === "auctionNum" ? (
                  <SvgComponent path="sort-up-solid" />
                ) : (
                  <SvgComponent path="sort" />
                )}
              </th>
              {paymentHistoryPage && (
                <th onClick={(e) => this.onSortClick("price")}>
                  Current Price{" "}
                  {sortType === "desc" && sortName === "price" ? (
                    <SvgComponent path="sort-down-solid" />
                  ) : sortType === "asc" && sortName === "price" ? (
                    <SvgComponent path="sort-up-solid" />
                  ) : (
                    <SvgComponent path="sort" />
                  )}
                </th>
              )}
              {!paymentHistoryPage &&
                ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType && (
                  <th
                    className="Nos-bid-header"
                    onClick={(e) => this.onSortClick("totalBidsPlaced")}
                  >
                    No of Bids{" "}
                    {sortType === "desc" && sortName === "totalBidsPlaced" ? (
                      <SvgComponent path="sort-down-solid" />
                    ) : sortType === "asc" && sortName === "totalBidsPlaced" ? (
                      <SvgComponent path="sort-up-solid" />
                    ) : (
                      <SvgComponent path="sort" />
                    )}
                  </th>
                )}
              {!paymentHistoryPage && (
                <th
                  className="my-bid-header"
                  onClick={(e) => this.onSortClick("myHighestBid")}
                >
                  Bid{" "}
                  {sortType === "desc" && sortName === "myHighestBid" ? (
                    <SvgComponent path="sort-down-solid" />
                  ) : sortType === "asc" && sortName === "myHighestBid" ? (
                    <SvgComponent path="sort-up-solid" />
                  ) : (
                    <SvgComponent path="sort" />
                  )}
                </th>
              )}
              <th>{paymentHistoryPage ? "Amount Paid" : "Fees & Premiums"} </th>
              {ASSET_LIST_TYPE.AUCTION_WINNING === assetListType ||
              paymentHistoryPage ? (
                <th> Status </th>
              ) : (
                <th onClick={(e) => this.onSortClick("datetimeClose")}>
                  Auction ending{" "}
                  {sortType === "desc" && sortName === "datetimeClose" ? (
                    <SvgComponent path="sort-down-solid" />
                  ) : sortType === "asc" && sortName === "datetimeClose" ? (
                    <SvgComponent path="sort-up-solid" />
                  ) : (
                    <SvgComponent path="sort" />
                  )}
                </th>
              )}
              {watchedItemPage && (
                <th className="check-box-column">
                  <div className="checkbox-custom-css">
                    <Form.Check
                      type="checkbox"
                      custom
                      id={`watchAsset${assetList.length}`}
                    >
                      <Form.Check.Input
                        value={true}
                        type="checkbox"
                        checked={selectAll}
                        name={`watchAsset${assetList.length}`}
                        onChange={(e) =>
                          this.props.onChangeSelection(e, "allAsset")
                        }
                      />
                      <Form.Check.Label></Form.Check.Label>
                    </Form.Check>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {assetList &&
              assetList.map((assetObj, index) => (
                <tr
                  key={index}
                  className={
                    highlightAsset
                      ? assetObj.assetId === highlightAsset
                        ? "hilight"
                        : `${
                            assetObj.assetId === highlightAsset
                              ? "outbid-highlight"
                              : ""
                          }`
                      : selectedItems && selectedItems[assetObj?.assetId]
                      ? "selected-row"
                      : null
                  }
                >
                  <td
                    className={
                      assetObj.isExtended &&
                      !this.isAssetStatusClosed(assetObj.status)
                        ? "highlight-card-border item-num-col"
                        : "item-num-col"
                    }
                  >
                    <Link
                      to={`/asset?${stringify({
                        auctionNum: assetObj?.auctionData?.auctionNum,
                        consignmentNo: assetObj.consignmentNo,
                      })}`}
                    >
                      {assetObj.consignmentNo}
                    </Link>
                  </td>
                  <td
                    className={
                      assetObj.isExtended &&
                      !this.isAssetStatusClosed(assetObj.status)
                        ? "highlight-card-border"
                        : null
                    }
                  >
                    {assetObj.lotNo}
                  </td>
                  <td
                    className={
                      assetObj.isExtended &&
                      !this.isAssetStatusClosed(assetObj.status)
                        ? "highlight-card-border"
                        : null
                    }
                  >
                    <div
                      className="img-with-caption"
                      onClick={(e) =>
                        this.navigateToAsset(
                          e,
                          assetObj.consignmentNo,
                          assetObj?.auctionData?.auctionNum
                        )
                      }
                    >
                      <img
                        src={DEFAULT_IMAGE}
                        onLoad={(e) =>
                          constructImageUrl(assetObj.assetImageUrl, e.target)
                        }
                      />
                      {!paymentHistoryPage && (
                        <Link
                          className="item-title"
                          to={`/asset?${stringify({
                            auctionNum: assetObj?.auctionData?.auctionNum,
                            consignmentNo: assetObj.consignmentNo,
                          })}`}
                        >
                          {assetObj.title}
                        </Link>
                      )}
                    </div>
                  </td>
                  {paymentHistoryPage && (
                    <td
                      className={
                        assetObj.isExtended &&
                        !this.isAssetStatusClosed(assetObj.status)
                          ? "highlight-card-border"
                          : null
                      }
                    >
                      <Link
                        to={`/asset?${stringify({
                          auctionNum: assetObj?.auctionData?.auctionNum,
                          consignmentNo: assetObj.consignmentNo,
                        })}`}
                      >
                        {assetObj.title}
                      </Link>
                    </td>
                  )}
                  {!paymentHistoryPage && (
                    <td
                      className={`${" "}${
                        assetObj.isExtended &&
                        !this.isAssetStatusClosed(assetObj.status) &&
                        "highlight-card-border"
                      }${" "} ${
                        assetObj.highestBidder
                          ? "bidder-icon-gavel"
                          : "text-danger bidder-icon-cross"
                      }${" "}${
                        ASSET_LIST_TYPE.AUCTION_WINNING === assetListType &&
                        "winner-cup"
                      }`}
                    >
                      {ASSET_LIST_TYPE.AUCTION_WINNING === assetListType ? (
                        <SvgComponent path="emoji_events_black_24dp" />
                      ) : assetObj.highestBidder ? (
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip className="fixed-tooltip">
                              You are the highest bidder.{" "}
                            </Tooltip>
                          }
                        >
                          <SvgComponent path="gavel" />
                        </OverlayTrigger>
                      ) : (
                        <SvgComponent path="cancel_black" />
                      )}
                    </td>
                  )}
                  <td
                    className={
                      assetObj.isExtended &&
                      !this.isAssetStatusClosed(assetObj.status)
                        ? "highlight-card-border link-label sale-num"
                        : "link-label sale-num"
                    }
                  >
                    <Link
                      className="auction-header-link"
                      to={`/auction-catalogue/${assetObj?.auctionData?.auctionNum}`}
                    >
                      {assetObj?.auctionData?.auctionNum}
                    </Link>
                  </td>
                  {/* Below code is commented for payment tab */}
                  {/* {paymentHistoryPage && (
                    <td
                      className={
                        assetObj.isExtended
                          ? "highlight-card-border link-label"
                          : "link-label"
                      }
                    >
                      {assetObj.myHighestBid?.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      })}
                    </td>
                  )} */}
                  {!paymentHistoryPage && (
                    <>
                      {ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType && (
                        <td
                          className={
                            assetObj.isExtended &&
                            !this.isAssetStatusClosed(assetObj.status)
                              ? "highlight-card-border link-label-lite"
                              : "link-label-lite"
                          }
                        >
                          {!this.assetAvailForBid(
                            assetObj.auctionData?.datetimeOpen,
                            assetObj.datetimeClose
                          ) ||
                          assetObj.status === ASSET_STATUS.SOLD ||
                          assetObj.status === ASSET_STATUS.PASSED_IN ||
                          assetObj.status === ASSET_STATUS.REFERRED ? (
                            assetObj.assetType !== ASSET_TYPE.BUY_NOW && (
                              <span>Bidding closed</span>
                            )
                          ) : (
                            <Visible
                              when={
                                AUCTION_TYPES_MAP[
                                  _get(assetObj, "auctionData.auctionType.name")
                                ] !== AUCTION_TYPES.IN_ROOM
                              }
                            >
                              <BidHistoryComponent
                                forListView={true}
                                loggedInUser={loggedInUser}
                                auctionId={assetObj?.auctionData?.auctionId}
                                count={assetObj.totalBidsPlaced}
                                assetId={assetObj.assetId}
                                hideText={true}
                                className="bid-history-link"
                                key={assetObj.assetId}
                              />
                            </Visible>
                          )}
                        </td>
                      )}
                      <td
                        className={
                          assetObj.isExtended &&
                          !this.isAssetStatusClosed(assetObj.status)
                            ? "highlight-card-border place-bid-column"
                            : "place-bid-column"
                        }
                      >
                        <Visible
                          when={assetObj.assetType === ASSET_TYPE.BUY_NOW}
                        >
                          {assetObj.status === ASSET_STATUS.UNDER_OFFER && (
                            <Button
                              disabled={true}
                              className="btn-outline-warning buy-now"
                            >
                              {" "}
                              <SvgComponent path="shopping-cart" />{" "}
                              {ASSET_STATUS.UNDER_OFFER}
                            </Button>
                          )}
                          {assetObj.status === ASSET_STATUS.RELEASED && (
                            <Button
                              className="btn-outline-warning buy-now"
                              onClick={(e) =>
                                this.navigateToAsset(
                                  e,
                                  assetObj.consignmentNo,
                                  assetObj?.auctionData?.auctionNum
                                )
                              }
                            >
                              <SvgComponent path="shopping-cart" /> Buy Now
                            </Button>
                          )}
                        </Visible>
                        <Visible
                          when={
                            this.assetAvailForBid(
                              assetObj.auctionData?.datetimeOpen,
                              assetObj.datetimeClose
                            ) &&
                            AUCTION_TYPES_MAP[
                              _get(assetObj, "auctionData.auctionType.name")
                            ] !== AUCTION_TYPES.IN_ROOM &&
                            assetObj.assetType !== ASSET_TYPE.BUY_NOW &&
                            ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType &&
                            assetObj.assetType !== ASSET_TYPE.EOI &&
                            assetObj.status !== ASSET_STATUS.SOLD &&
                            assetObj.status !== ASSET_STATUS.PASSED_IN &&
                            assetObj.status !== ASSET_STATUS.REFERRED
                          }
                        >
                          <CustomPlacebidBox
                            getBidValues={this.props.getBidValues}
                            startingBid={assetObj.startingBid}
                            currentBid={assetObj.currentBidAmount}
                            currentAmt={assetObj.myHighestBid}
                            incrementBy={assetObj.incrementBy}
                            customBidHandler={this.customBidHandler}
                            gstHandler={this.gstHandler}
                            disable={false}
                            getAssetId={this.getAssetId}
                            assetId={assetObj.assetId}
                            btnShow={true}
                            onPlaceBidConfirm={this.onPlaceBidConfirm}
                            assetDetail={assetObj}
                            uniqueKey="activeBid"
                            loggedInUser={loggedInUser}
                            creditCardPercentage={creditCardPercentage}
                          />
                        </Visible>
                        <Visible
                          when={
                            !this.assetAvailForBid(
                              assetObj.auctionData?.datetimeOpen,
                              assetObj.datetimeClose
                            ) &&
                            AUCTION_TYPES_MAP[
                              _get(assetObj, "auctionData.auctionType.name")
                            ] === AUCTION_TYPES.IN_ROOM &&
                            assetObj.assetType !== ASSET_TYPE.BUY_NOW &&
                            ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType &&
                            assetObj.status !== ASSET_STATUS.SOLD &&
                            assetObj.status !== ASSET_STATUS.PASSED_IN &&
                            assetObj.status !== ASSET_STATUS.REFERRED
                          }
                        >
                          <CustomPlacebidBox
                            getBidValues={this.props.getBidValues}
                            startingBid={assetObj.startingBid}
                            currentBid={assetObj.currentBidAmount}
                            currentAmt={assetObj.myHighestBid}
                            incrementBy={assetObj.incrementBy}
                            customBidHandler={this.customBidHandler}
                            gstHandler={this.gstHandler}
                            disable={false}
                            getAssetId={this.getAssetId}
                            assetId={assetObj.assetId}
                            btnShow={true}
                            onPlaceBidConfirm={this.onPlaceBidConfirm}
                            assetDetail={assetObj}
                            loggedInUser={loggedInUser}
                          />
                        </Visible>
                        <Visible
                          when={
                            (!this.assetAvailForBid(
                              assetObj.auctionData?.datetimeOpen,
                              assetObj.datetimeClose
                            ) ||
                              assetObj.status === ASSET_STATUS.SOLD ||
                              assetObj.status === ASSET_STATUS.PASSED_IN ||
                              assetObj.status === ASSET_STATUS.REFERRED) &&
                            assetObj.assetType !== ASSET_TYPE.BUY_NOW
                          }
                        >
                          <div className="my-bid-detail ">
                            My Bid :{" "}
                            <strong>
                              {assetObj?.myHighestBid &&
                                assetObj?.myHighestBid.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  minimumFractionDigits: 0,
                                })}
                            </strong>
                          </div>
                        </Visible>
                        <Visible when={_get(assetObj, "displayJoinAuction")}>
                          <Link
                            to={""}
                            size="md"
                            variant="warning"
                            className="join-auction-div"
                            onClick={(e) => this.validateUser(e, assetObj)}
                          >
                            <SvgComponent path="gavel" /> Join the auction
                          </Link>
                        </Visible>
                      </td>
                    </>
                  )}
                  <td
                    className={
                      assetObj.isExtended &&
                      !this.isAssetStatusClosed(assetObj.status)
                        ? "highlight-card-border fee-premium-colomn"
                        : "fee-premium-colomn"
                    }
                  >
                    {/* Below logic is only for EOI asset and asset which were not sold and auction is still open to place bid */}
                    {assetObj.assetType === ASSET_TYPE.EOI ? (
                      <DownloadAuctionDocuments
                        auctionId={assetObj.auctionData?.auctionId}
                        assetId={assetObj.assetId}
                      />
                    ) : (
                      this.assetAvailForBid(
                        assetObj.auctionData?.datetimeOpen,
                        assetObj.datetimeClose
                      ) &&
                      assetObj.status !== ASSET_STATUS.SOLD &&
                      assetObj.status !== ASSET_STATUS.PASSED_IN &&
                      assetObj.status !== ASSET_STATUS.REFERRED &&
                      AUCTION_TYPES_MAP[
                        _get(assetObj, "auctionData.auctionType.name")
                      ] !== AUCTION_TYPES.IN_ROOM && (
                        <>
                          <Row>
                            <span className="fees-detail">Current Price</span>{" "}
                            <span className="amount-detail">
                              {ASSET_LIST_TYPE.AUCTION_WINNING ===
                                assetListType || paymentHistoryPage
                                ? assetObj.myHighestBid.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 0,
                                    }
                                  )
                                : assetObj.enteredAmt
                                ? assetObj.enteredAmt.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 0,
                                  })
                                : 0}
                            </span>
                          </Row>
                          <Row className="d-none">
                            <span className="fees-detail">
                              Buyer's Premium %
                            </span>{" "}
                            <span className="amount-detail">
                              {" "}
                              {assetObj.flatCharge > 0
                                ? "-"
                                : assetObj.premiumPercent > 0
                                ? assetObj.premiumPercent + "%"
                                : "0%"}
                            </span>
                          </Row>
                          <Row>
                            <span className="fees-detail">Buyer's Premium</span>{" "}
                            <span className="amount-detail">
                              {assetObj.calPremiumAmt > 0 &&
                              assetObj.enteredAmt > 0
                                ? assetObj.calPremiumAmt.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 2,
                                    }
                                  )
                                : "-"}
                            </span>
                          </Row>
                          <Row>
                            <span className="fees-detail">Credit Card Fee</span>{" "}
                            <span className="amount-detail">
                              {paymentHistoryPage
                                ? (
                                    (assetObj.myHighestBid / 100) *
                                    this.props.creditCardPercentage
                                  ).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 2,
                                  })
                                : assetObj.creditCardFee
                                ? assetObj.creditCardFee.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 2,
                                    }
                                  )
                                : "-"}
                            </span>
                          </Row>
                          <Row>
                            <span className="total-cost">
                              Total:{" "}
                              <span className="amount-detail">
                                {ASSET_LIST_TYPE.AUCTION_WINNING ===
                                  assetListType || paymentHistoryPage
                                  ? assetObj.myHighestBid.toLocaleString(
                                      "en-US",
                                      {
                                        style: "currency",
                                        currency: "USD",
                                        minimumFractionDigits: 2,
                                      }
                                    )
                                  : assetObj.enteredAmt > 0 &&
                                    parseFloat(assetObj.calculatedTotal)
                                  ? parseFloat(
                                      assetObj.calculatedTotal
                                    ).toLocaleString("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 2,
                                    })
                                  : 0}
                              </span>{" "}
                            </span>
                          </Row>
                          <Row>
                            <span className="gst-inc">
                              {assetObj.gstApplicable ? "Inc." : "Excl."} GST
                            </span>
                          </Row>
                        </>
                      )
                    )}
                    {/* Below logic is only for Buy now asset */}
                    {assetObj.assetType === ASSET_TYPE.BUY_NOW && (
                      <>
                        <Row>
                          <span className="fees-detail">Current Price</span>{" "}
                          <span className="amount-detail">
                            {assetObj.listedPrice.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                            })}
                          </span>
                        </Row>
                        <Row>
                          <span className="fees-detail">Buyer's Premium %</span>{" "}
                          <span className="amount-detail">
                            {" "}
                            {this.getBuyerPremium(
                              assetObj.assetType === ASSET_TYPE.BUY_NOW
                                ? assetObj.listedPrice
                                : assetObj.myHighestBid,
                              assetObj.buyersPremium
                            ).buyerPremiumPercentage === 0
                              ? "0%"
                              : this.getBuyerPremium(
                                  assetObj.assetType === ASSET_TYPE.BUY_NOW
                                    ? assetObj.listedPrice
                                    : assetObj.myHighestBid,
                                  assetObj.buyersPremium
                                ).buyerPremiumPercentage + "%"}
                          </span>
                        </Row>
                        <Row>
                          <span className="fees-detail">Buyer's Premium</span>{" "}
                          <span className="amount-detail">
                            {this.getBuyerPremium(
                              assetObj.assetType === ASSET_TYPE.BUY_NOW
                                ? assetObj.listedPrice
                                : assetObj.myHighestBid,
                              assetObj.buyersPremium
                            ).flatCharge > 0
                              ? this.getBuyerPremium(
                                  assetObj.assetType === ASSET_TYPE.BUY_NOW
                                    ? assetObj.listedPrice
                                    : assetObj.myHighestBid,
                                  assetObj.buyersPremium
                                ).flatCharge.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  minimumFractionDigits: 2,
                                })
                              : parseFloat(
                                  (assetObj.listedPrice / 100) *
                                    this.getBuyerPremium(
                                      assetObj.assetType === ASSET_TYPE.BUY_NOW
                                        ? assetObj.listedPrice
                                        : assetObj.myHighestBid,
                                      assetObj.buyersPremium
                                    ).buyerPremiumPercentage
                                ).toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  minimumFractionDigits: 2,
                                })}
                          </span>
                        </Row>
                        <Row>
                          <span className="fees-detail">Credit Card Fee</span>{" "}
                          <span className="amount-detail">
                            {(
                              ((assetObj.listedPrice +
                                (this.getBuyerPremium(
                                  assetObj.assetType === ASSET_TYPE.BUY_NOW
                                    ? assetObj.listedPrice
                                    : assetObj.myHighestBid,
                                  assetObj.buyersPremium
                                ).flatCharge > 0
                                  ? this.getBuyerPremium(
                                      assetObj.assetType === ASSET_TYPE.BUY_NOW
                                        ? assetObj.listedPrice
                                        : assetObj.myHighestBid,
                                      assetObj.buyersPremium
                                    ).flatCharge
                                  : (assetObj.listedPrice / 100) *
                                    this.getBuyerPremium(
                                      assetObj.assetType === ASSET_TYPE.BUY_NOW
                                        ? assetObj.listedPrice
                                        : assetObj.myHighestBid,
                                      assetObj.buyersPremium
                                    ).buyerPremiumPercentage)) /
                                100) *
                              this.props.creditCardPercentage
                            ).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </Row>
                        <Row>
                          <span className="total-cost">
                            Total:{" "}
                            <span className="amount-detail">
                              {(
                                parseFloat(assetObj.listedPrice) +
                                (this.getBuyerPremium(
                                  assetObj.listedPrice,
                                  assetObj.buyersPremium
                                ).flatCharge > 0
                                  ? this.getBuyerPremium(
                                      assetObj.listedPrice,
                                      assetObj.buyersPremium
                                    ).flatCharge
                                  : parseFloat(
                                      (assetObj.listedPrice / 100) *
                                        this.getBuyerPremium(
                                          assetObj.listedPrice,
                                          assetObj.buyersPremium
                                        ).buyerPremiumPercentage
                                    )) +
                                ((assetObj.listedPrice +
                                  (this.getBuyerPremium(
                                    assetObj.listedPrice,
                                    assetObj.buyersPremium
                                  ).flatCharge > 0
                                    ? this.getBuyerPremium(
                                        assetObj.listedPrice,
                                        assetObj.buyersPremium
                                      ).flatCharge
                                    : parseFloat(
                                        (assetObj.listedPrice / 100) *
                                          this.getBuyerPremium(
                                            assetObj.listedPrice,
                                            assetObj.buyersPremium
                                          ).buyerPremiumPercentage
                                      ))) /
                                  100) *
                                  this.props.creditCardPercentage
                              ).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 2,
                              })}
                            </span>{" "}
                          </span>
                        </Row>
                        <Row>
                          <span className="gst-inc">
                            {assetObj.gstApplicable ? "Inc." : "Excl."} GST{" "}
                          </span>
                        </Row>{" "}
                      </>
                    )}
                    {/* Below logic will display only in Item Won tab or asset should sold, referred or passed In */}
                    {assetObj.assetType !== ASSET_TYPE.BUY_NOW &&
                      (!this.assetAvailForBid(
                        assetObj.auctionData?.datetimeOpen,
                        assetObj.datetimeClose
                      ) ||
                        ASSET_LIST_TYPE.AUCTION_WINNING === assetListType ||
                        assetObj.status === ASSET_STATUS.SOLD ||
                        assetObj.status === ASSET_STATUS.PASSED_IN ||
                        assetObj.status === ASSET_STATUS.REFERRED) && (
                        <>
                          <Row>
                            <span className="fees-detail">Current Price</span>{" "}
                            <span className="amount-detail">
                              {assetObj.myHighestBid.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 0,
                              })}
                            </span>
                          </Row>
                          <Row>
                            <span className="fees-detail">
                              Buyer's Premium %
                            </span>{" "}
                            <span className="amount-detail">
                              {" "}
                              {this.getBuyerPremium(
                                assetObj.myHighestBid,
                                assetObj.buyersPremium
                              ).buyerPremiumPercentage === 0
                                ? "0%"
                                : this.getBuyerPremium(
                                    assetObj.myHighestBid,
                                    assetObj.buyersPremium
                                  ).buyerPremiumPercentage + "%"}
                            </span>
                          </Row>
                          <Row>
                            <span className="fees-detail">Buyer's Premium</span>{" "}
                            <span className="amount-detail">
                              {this.getBuyerPremium(
                                assetObj.myHighestBid,
                                assetObj.buyersPremium
                              ).flatCharge > 0
                                ? this.getBuyerPremium(
                                    assetObj.myHighestBid,
                                    assetObj.buyersPremium
                                  ).flatCharge.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 2,
                                  })
                                : assetObj.myHighestBid > 0
                                ? parseFloat(
                                    (assetObj.myHighestBid / 100) *
                                      this.getBuyerPremium(
                                        assetObj.myHighestBid,
                                        assetObj.buyersPremium
                                      ).buyerPremiumPercentage
                                  ).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 2,
                                  })
                                : "-"}
                            </span>
                          </Row>
                          <Row>
                            <span className="fees-detail">Credit Card Fee</span>{" "}
                            <span className="amount-detail">
                              {assetObj.myHighestBid > 0
                                ? (
                                    ((assetObj.myHighestBid +
                                      (this.getBuyerPremium(
                                        assetObj.myHighestBid,
                                        assetObj.buyersPremium
                                      ).flatCharge > 0
                                        ? this.getBuyerPremium(
                                            assetObj.myHighestBid,
                                            assetObj.buyersPremium
                                          ).flatCharge
                                        : (assetObj.myHighestBid / 100) *
                                          this.getBuyerPremium(
                                            assetObj.myHighestBid,
                                            assetObj.buyersPremium
                                          ).buyerPremiumPercentage)) /
                                      100) *
                                    this.props.creditCardPercentage
                                  ).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 2,
                                  })
                                : "-"}
                            </span>
                          </Row>
                          <Row>
                            <span className="total-cost">
                              Total:{" "}
                              <span className="amount-detail">
                                {(
                                  parseFloat(assetObj.myHighestBid) +
                                  (this.getBuyerPremium(
                                    assetObj.myHighestBid,
                                    assetObj.buyersPremium
                                  ).flatCharge > 0
                                    ? this.getBuyerPremium(
                                        assetObj.myHighestBid,
                                        assetObj.buyersPremium
                                      ).flatCharge
                                    : parseFloat(
                                        (assetObj.myHighestBid / 100) *
                                          this.getBuyerPremium(
                                            assetObj.myHighestBid,
                                            assetObj.buyersPremium
                                          ).buyerPremiumPercentage
                                      )) +
                                  ((assetObj.myHighestBid +
                                    (this.getBuyerPremium(
                                      assetObj.myHighestBid,
                                      assetObj.buyersPremium
                                    ).flatCharge > 0
                                      ? this.getBuyerPremium(
                                          assetObj.myHighestBid,
                                          assetObj.buyersPremium
                                        ).flatCharge
                                      : parseFloat(
                                          (assetObj.myHighestBid / 100) *
                                            this.getBuyerPremium(
                                              assetObj.myHighestBid,
                                              assetObj.buyersPremium
                                            ).buyerPremiumPercentage
                                        ))) /
                                    100) *
                                    this.props.creditCardPercentage
                                ).toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  minimumFractionDigits: 2,
                                })}
                              </span>{" "}
                            </span>
                          </Row>
                          <Row>
                            <span className="gst-inc">
                              {assetObj.gstApplicable ? "Inc." : "Excl."} GST{" "}
                            </span>
                          </Row>{" "}
                        </>
                      )}
                    {/* Below logic is only for In room auctions  */}
                    {!this.assetAvailForBid(
                      assetObj.auctionData?.datetimeOpen,
                      assetObj.datetimeClose
                    ) &&
                      AUCTION_TYPES_MAP[
                        _get(assetObj, "auctionData.auctionType.name")
                      ] === AUCTION_TYPES.IN_ROOM && (
                        <>
                          <Row>
                            <span className="fees-detail">Current Price</span>{" "}
                            <span className="amount-detail">
                              {ASSET_LIST_TYPE.AUCTION_WINNING ===
                                assetListType || paymentHistoryPage
                                ? assetObj.myHighestBid.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 0,
                                    }
                                  )
                                : assetObj.enteredAmt
                                ? assetObj.enteredAmt.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 0,
                                  })
                                : 0}
                            </span>
                          </Row>
                          <Row>
                            <span className="fees-detail">
                              Buyer's Premium %
                            </span>{" "}
                            <span className="amount-detail">
                              {" "}
                              {assetObj.flatCharge > 0
                                ? "-"
                                : assetObj.premiumPercent > 0
                                ? assetObj.premiumPercent + "%"
                                : "0%"}
                            </span>
                          </Row>
                          <Row>
                            <span className="fees-detail">Buyer's Premium</span>{" "}
                            <span className="amount-detail">
                              {assetObj.calPremiumAmt > 0 &&
                              assetObj.enteredAmt > 0
                                ? assetObj.calPremiumAmt.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 2,
                                    }
                                  )
                                : "-"}
                            </span>
                          </Row>
                          <Row>
                            <span className="fees-detail">Credit Card Fee</span>{" "}
                            <span className="amount-detail">
                              {paymentHistoryPage
                                ? (
                                    (assetObj.myHighestBid / 100) *
                                    this.props.creditCardPercentage
                                  ).toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 2,
                                  })
                                : assetObj.creditCardFee
                                ? assetObj.creditCardFee.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 2,
                                    }
                                  )
                                : "-"}
                            </span>
                          </Row>
                          <Row>
                            <span className="total-cost">
                              Total:{" "}
                              <span className="amount-detail">
                                {ASSET_LIST_TYPE.AUCTION_WINNING ===
                                  assetListType || paymentHistoryPage
                                  ? assetObj.myHighestBid.toLocaleString(
                                      "en-US",
                                      {
                                        style: "currency",
                                        currency: "USD",
                                        minimumFractionDigits: 2,
                                      }
                                    )
                                  : assetObj.enteredAmt > 0 &&
                                    parseFloat(assetObj.calculatedTotal)
                                  ? parseFloat(
                                      assetObj.calculatedTotal
                                    ).toLocaleString("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 2,
                                    })
                                  : 0}
                              </span>{" "}
                            </span>
                          </Row>
                          <Row>
                            <span className="gst-inc">
                              {assetObj.gstApplicable ? "Inc." : "Excl."} GST
                            </span>
                          </Row>
                        </>
                      )}
                  </td>

                  <td
                    className={
                      assetObj.isExtended &&
                      !this.isAssetStatusClosed(assetObj.status)
                        ? "highlight-card-border"
                        : null
                    }
                  >
                    {assetObj.assetType !== ASSET_TYPE.BUY_NOW &&
                      ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType &&
                      !paymentHistoryPage && (
                        <div className="date-time-align">
                          <Visible
                            when={
                              !assetObj?.auctionData?.isEOI ||
                              (assetObj?.auctionData?.isEOI &&
                                !(
                                  dayjs(assetObj.datetimeClose) - dayjs() >
                                  ONE_YEAR
                                ))
                            }
                          >
                            <Visible when={!assetObj.isExtended}>
                              <div className="date-time-label">
                                Time Remaining
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      This auction will close at{" "}
                                      {dayjs(
                                        assetObj.auctionData?.datetimeClose
                                      ).format("hh:mm A")}{" "}
                                      {getTimezoneName(
                                        assetObj.auctionData?.datetimeClose
                                      )}{" "}
                                      {dayjs(
                                        assetObj.auctionData?.datetimeClose
                                      ).format("DD MMM YYYY")}{" "}
                                    </Tooltip>
                                  }
                                >
                                  <SvgComponent path="help_outline" />
                                </OverlayTrigger>
                              </div>
                            </Visible>
                            <Visible when={assetObj.isExtended}>
                              <div className="date-time-label">
                                {!this.assetAvailForBid(
                                  assetObj.auctionData?.datetimeOpen,
                                  assetObj.datetimeClose
                                )
                                  ? "Time Remmaining"
                                  : "Bonus Time"}{" "}
                              </div>
                            </Visible>
                            <CountdownTimer
                              bonusTime={assetObj.isExtended}
                              time={
                                assetObj.status !== ASSET_STATUS.SOLD &&
                                (assetObj.status !== ASSET_STATUS.PASSED_IN) &
                                  (assetObj.status !== ASSET_STATUS.REFERRED)
                                  ? assetObj.datetimeClose
                                  : dayjs()
                              }
                              onComplete={this.onCompleteTimer.bind(
                                null,
                                assetObj
                              )}
                            />
                          </Visible>
                          {!this.assetAvailForBid(
                            assetObj.auctionData?.datetimeOpen,
                            assetObj.datetimeClose
                          ) &&
                            AUCTION_TYPES_MAP[
                              _get(assetObj, "auctionData.auctionType.name")
                            ] !== AUCTION_TYPES.IN_ROOM && (
                              <div className="my-bid-detail mr-bottom">
                                <strong>
                                  Bidding Closed{" "}
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This auction was closed at{" "}
                                        {dayjs(
                                          assetObj.auctionData?.datetimeClose
                                        ).format("hh:mm A")}{" "}
                                        {getTimezoneName(
                                          assetObj.auctionData?.datetimeClose
                                        )}{" "}
                                        {dayjs(
                                          assetObj.auctionData?.datetimeClose
                                        ).format("DD MMM YYYY")}{" "}
                                      </Tooltip>
                                    }
                                  >
                                    <SvgComponent path="help_outline" />
                                  </OverlayTrigger>
                                </strong>
                              </div>
                            )}
                        </div>
                      )}
                    {ASSET_LIST_TYPE.AUCTION_WINNING === assetListType &&
                      !paymentHistoryPage && (
                        <>
                          <Visible when={assetObj.paymentStatus}>
                            <div
                              className={
                                assetObj.paymentStatus === "PAID"
                                  ? "paid-status payment-info"
                                  : "payment-info"
                              }
                            >
                              <div className="overdue-info">
                                {assetObj.paymentStatus
                                  ? assetObj.paymentStatus
                                  : "UNPAID"}
                              </div>
                            </div>
                          </Visible>
                          <div className="invoice-block">
                            <DownloadAuctionDocuments
                              auctionId={assetObj?.auctionData?.auctionId}
                              assetId={assetObj?.assetId}
                              consignmentNo={assetObj?.consignmentNo}
                              auctionNum={assetObj?.auctionData?.auctionNum}
                              invoice={true}
                            />
                          </div>
                          <div className="contact-info">
                            {assetObj.auctionData.auctionAdmin?.mobile && (
                              <a
                                className="invoice-link"
                                href={`tel:${assetObj.auctionData.auctionAdmin?.mobile}`}
                              >
                                <span>
                                  <SvgComponent path="call_white_24dp" />{" "}
                                </span>
                              </a>
                            )}
                            <a
                              className="invoice-link"
                              href={`mailto:${assetObj.auctionData.auctionAdmin?.email}?subject=Consignment No: ${assetObj.consignmentNo}`}
                            >
                              <span>
                                <SvgComponent path="email_white_24dp" />{" "}
                              </span>
                            </a>
                          </div>
                          {/* below code is commented as per the requirment */}
                          {/* <div className="pay-block" onClick={onPayClick}>
                            <Button
                              className="pay-buttom"
                              variant="outline-warning"
                            >
                              {" "}
                              <SvgComponent path="paid_white_24dp" />
                              Pay{" "}
                            </Button>
                          </div> */}
                        </>
                      )}
                    {/* commented below code due to payment tab is removed */}
                    {/* {paymentHistoryPage && (
                      <>
                        <div className="paid-info">
                          <div className="overdue-info">
                            {" "}
                            {assetObj.paymentStatus
                              ? assetObj.paymentStatus
                              : "UNPAID"}
                          </div>
                        </div>
                        <DownloadAuctionDocuments
                          auctionId={assetObj?.auctionData?.auctionId}
                          assetId={assetObj?.assetId}
                          consignmentNo={assetObj?.consignmentNo}
                          auctionNum={assetObj?.auctionData?.auctionNum}
                          invoice={true}
                        />
                      </>
                    )} */}
                  </td>
                  {watchedItemPage && (
                    <td
                      className={
                        assetObj.isExtended &&
                        !this.isAssetStatusClosed(assetObj.status)
                          ? "highlight-card-border check-box-column"
                          : "check-box-column"
                      }
                    >
                      <div className="checkbox-custom-css">
                        <Form.Check
                          type="checkbox"
                          custom
                          id={`watchAsset${assetObj.assetId}`}
                        >
                          <Form.Check.Input
                            value={true}
                            type="checkbox"
                            checked={
                              selectedItems[assetObj.assetId] ? true : false
                            }
                            name={`watchAsset${assetObj.assetId}`}
                            onChange={(e) =>
                              this.props.onChangeSelection(e, assetObj)
                            }
                          />
                          <Form.Check.Label></Form.Check.Label>
                        </Form.Check>
                      </div>
                      <div
                        className="delet-row"
                        onClick={(e) =>
                          this.props.deletetedFromRow(e, assetObj)
                        }
                      >
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip> Remove from watchlist </Tooltip>}
                        >
                          <SvgComponent path="delete_black_24dp" />
                        </OverlayTrigger>
                      </div>
                    </td>
                  )}
                  {/* below code is commented as per the requirment */}
                  {/* {ASSET_LIST_TYPE.AUCTION_WINNING === assetListType && (
                    <td
                      className={
                        assetObj.isExtended
                          ? "highlight-card-border check-box-column"
                          : "check-box-column"
                      }
                    >
                      <div className="checkbox-custom-css">
                        <Form.Check
                          type="checkbox"
                          custom
                          id={`watchAsset${assetObj.assetId}`}
                        >
                          <Form.Check.Input
                            value={true}
                            type="checkbox"
                            checked={
                              selectedItems[assetObj.assetId] ? true : false
                            }
                            name={`watchAsset${assetObj.assetId}`}
                            onChange={(e) =>
                              this.props.onChangeSelection(e, assetObj)
                            }
                          />
                          <Form.Check.Label></Form.Check.Label>
                        </Form.Check>
                      </div>
                    </td>
                  )} */}
                </tr>
              ))}
          </tbody>
        </Table>

        <div className="list-view-mobile">
          {assetList &&
            assetList.map((assetObj, index) => (
              <div
                key={index}
                className={
                  highlightAsset
                    ? assetObj.assetId === highlightAsset
                      ? "hilight card"
                      : `${
                          assetObj.assetId === highlightAsset
                            ? "outbid-highlight card"
                            : "card"
                        }`
                    : selectedItems && selectedItems[assetObj?.assetId]
                    ? "selected-row card"
                    : "card"
                }
              >
                <Row>
                  <Col xs={7}>
                    <div className="item-block">
                      <div className="label">Item No.</div>
                      <div className="value">
                        {" "}
                        <Link
                          to={`/asset?${stringify({
                            auctionNum: assetObj?.auctionData?.auctionNum,
                            consignmentNo: assetObj.consignmentNo,
                          })}`}
                        >
                          {assetObj.consignmentNo}
                        </Link>
                      </div>
                    </div>
                    {assetObj.assetType !== ASSET_TYPE.BUY_NOW && (
                      <div className="item-block-inline">
                        <div className="label">Lot No.</div>
                        <div className="value no-underline">
                          {" "}
                          {assetObj.lotNo}
                        </div>
                      </div>
                    )}
                    <div className="item-block-inline">
                      <div className="label">Highest Bidder</div>
                      {!paymentHistoryPage && (
                        <div
                          className={
                            ASSET_LIST_TYPE.AUCTION_WINNING === assetListType
                              ? "winner-cup"
                              : assetObj.highestBidder
                              ? "bidder-icon-gavel"
                              : "text-danger bidder-icon-cross"
                          }
                        >
                          {ASSET_LIST_TYPE.AUCTION_WINNING === assetListType ? (
                            <SvgComponent path="emoji_events_black_24dp" />
                          ) : assetObj.highestBidder ? (
                            <OverlayTrigger
                              placement="bottom"
                              overlay={
                                <Tooltip className="fixed-tooltip">
                                  You are the highest bidder.{" "}
                                </Tooltip>
                              }
                            >
                              <SvgComponent path="gavel" />
                            </OverlayTrigger>
                          ) : (
                            <SvgComponent path="cancel_black" />
                          )}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col xs={5}>
                    <div className="label">Image</div>
                    <div
                      className="img-with-caption"
                      onClick={(e) =>
                        this.navigateToAsset(
                          e,
                          assetObj.consignmentNo,
                          assetObj?.auctionData?.auctionNum
                        )
                      }
                    >
                      <img
                        className="list-view-image"
                        src={DEFAULT_IMAGE}
                        onLoad={(e) =>
                          constructImageUrl(assetObj.assetImageUrl, e.target)
                        }
                      />
                      {!paymentHistoryPage && (
                        <Link
                          to={`/asset?${stringify({
                            auctionNum: assetObj?.auctionData?.auctionNum,
                            consignmentNo: assetObj.consignmentNo,
                          })}`}
                        >
                          {assetObj.title}
                        </Link>
                      )}
                    </div>
                  </Col>
                </Row>
                {assetObj.assetType !== ASSET_TYPE.BUY_NOW && (
                  <Row>
                    <Col xs={7}>
                      <div className="item-block">
                        <div className="label">Sale</div>
                        <div className="value">
                          {" "}
                          <Link
                            className="auction-header-link"
                            to={`/auction-catalogue/${assetObj?.auctionData?.auctionNum}`}
                          >
                            {assetObj?.auctionData?.auctionNum}
                          </Link>
                        </div>
                      </div>
                    </Col>

                    <Col xs={5}>
                      <>
                        <div className="item-block">
                          <div className="label">No of Bids</div>
                          {!this.assetAvailForBid(
                            assetObj.auctionData?.datetimeOpen,
                            assetObj.datetimeClose
                          ) ||
                          assetObj.status === ASSET_STATUS.SOLD ||
                          assetObj.status === ASSET_STATUS.PASSED_IN ||
                          assetObj.status === ASSET_STATUS.REFERRED ? (
                            <div className="value"> Bidding Closed </div>
                          ) : (
                            <div className="value">
                              {assetObj.assetType !== ASSET_TYPE.EOI &&
                              assetObj.assetType !== ASSET_TYPE.BUY_NOW &&
                              AUCTION_TYPES_MAP[
                                _get(assetObj, "auctionData.auctionType.name")
                              ] !== AUCTION_TYPES.IN_ROOM ? (
                                <BidHistoryComponent
                                  forListView={true}
                                  loggedInUser={loggedInUser}
                                  auctionId={assetObj?.auctionData?.auctionId}
                                  count={assetObj.totalBidsPlaced}
                                  assetId={assetObj.assetId}
                                  hideText={true}
                                  className="bid-history-link"
                                  key={assetObj.assetId}
                                />
                              ) : (
                                "NA"
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    </Col>
                  </Row>
                )}
                <Visible
                  when={
                    AUCTION_TYPES_MAP[
                      _get(assetObj, "auctionData.auctionType.name")
                    ] !== AUCTION_TYPES.IN_ROOM &&
                    ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType
                  }
                >
                  <Row>
                    <Col xs={7}>
                      {assetObj.assetType !== ASSET_TYPE.EOI && (
                        <div className="item-block">
                          <div className="label">Current price</div>
                          <div className="value no-underline light-font">
                            {" "}
                            {(assetObj.assetType === ASSET_TYPE.BUY_NOW
                              ? assetObj.listedPrice
                              : assetObj.currentBidAmount
                            )?.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                      )}
                    </Col>
                    {paymentHistoryPage && (
                      <Col xs={7}>
                        <div className="item-block">
                          <div className="label">Current Price</div>
                          <div className="value no-underline">
                            {" "}
                            {assetObj.myHighestBid?.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                      </Col>
                    )}
                    <Col xs={5}>
                      {!paymentHistoryPage &&
                        assetObj.assetType !== ASSET_TYPE.EOI &&
                        assetObj.assetType !== ASSET_TYPE.BUY_NOW && (
                          <>
                            <div className="item-block">
                              <div className="label">My last bid</div>
                              <div className="value no-underline">
                                {" "}
                                {assetObj.myHighestBid?.toLocaleString(
                                  "en-US",
                                  {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 2,
                                  }
                                )}
                              </div>
                            </div>
                          </>
                        )}
                    </Col>
                  </Row>
                </Visible>
                <Row>
                  {assetObj.assetType === ASSET_TYPE.EOI ? (
                    <Col xs={7}>
                      {" "}
                      <DownloadAuctionDocuments
                        auctionId={assetObj.auctionData?.auctionId}
                        assetId={assetObj.assetId}
                      />
                    </Col>
                  ) : (
                    <Col xs={7}>
                      <div className="item-block">
                        <div className="value no-underline light-font">
                          {" "}
                          <div className="place-bid-column">
                            <Visible
                              when={
                                (ASSET_LIST_TYPE.AUCTION_WINNING ===
                                  assetListType ||
                                  assetObj.status === ASSET_STATUS.SOLD ||
                                  assetObj.status === ASSET_STATUS.PASSED_IN ||
                                  assetObj.status === ASSET_STATUS.REFERRED) &&
                                assetObj.assetType !== ASSET_TYPE.BUY_NOW
                              }
                            >
                              <div className="my-bid-detail ">
                                My Bid :{" "}
                                <strong>
                                  {assetObj?.myHighestBid &&
                                    assetObj?.myHighestBid.toLocaleString(
                                      "en-US",
                                      {
                                        style: "currency",
                                        currency: "USD",
                                        minimumFractionDigits: 0,
                                      }
                                    )}
                                </strong>
                              </div>
                              <div className="item-block fee-premium-colomn item-closed">
                                <Row>
                                  <span className="fees-detail">
                                    Buyer's Premium %{" "}
                                  </span>{" "}
                                  <span className="amount-detail">
                                    {" "}
                                    {this.getBuyerPremium(
                                      assetObj.myHighestBid,
                                      assetObj.buyersPremium
                                    ).buyerPremiumPercentage === 0
                                      ? "0%"
                                      : this.getBuyerPremium(
                                          assetObj.myHighestBid,
                                          assetObj.buyersPremium
                                        ).buyerPremiumPercentage + "%"}
                                  </span>
                                </Row>
                                <Row>
                                  <span className="fees-detail">
                                    Buyer's Premium
                                  </span>{" "}
                                  <span className="amount-detail">
                                    {this.getBuyerPremium(
                                      assetObj.myHighestBid,
                                      assetObj.buyersPremium
                                    ).flatCharge > 0
                                      ? this.getBuyerPremium(
                                          assetObj.myHighestBid,
                                          assetObj.buyersPremium
                                        ).flatCharge.toLocaleString("en-US", {
                                          style: "currency",
                                          currency: "USD",
                                          minimumFractionDigits: 2,
                                        })
                                      : assetObj.myHighestBid > 0
                                      ? parseFloat(
                                          (assetObj.myHighestBid / 100) *
                                            this.getBuyerPremium(
                                              assetObj.myHighestBid,
                                              assetObj.buyersPremium
                                            ).buyerPremiumPercentage
                                        ).toLocaleString("en-US", {
                                          style: "currency",
                                          currency: "USD",
                                          minimumFractionDigits: 2,
                                        })
                                      : "-"}
                                  </span>
                                </Row>
                                <Row>
                                  <span className="fees-detail">
                                    Credit Card Fee
                                  </span>{" "}
                                  <span className="amount-detail">
                                    {assetObj.myHighestBid > 0
                                      ? (
                                          ((assetObj.myHighestBid +
                                            (this.getBuyerPremium(
                                              assetObj.myHighestBid,
                                              assetObj.buyersPremium
                                            ).flatCharge > 0
                                              ? this.getBuyerPremium(
                                                  assetObj.myHighestBid,
                                                  assetObj.buyersPremium
                                                ).flatCharge
                                              : (assetObj.myHighestBid / 100) *
                                                this.getBuyerPremium(
                                                  assetObj.myHighestBid,
                                                  assetObj.buyersPremium
                                                ).buyerPremiumPercentage)) /
                                            100) *
                                          this.props.creditCardPercentage
                                        ).toLocaleString("en-US", {
                                          style: "currency",
                                          currency: "USD",
                                          minimumFractionDigits: 2,
                                        })
                                      : "-"}
                                  </span>
                                </Row>
                                <Row>
                                  <span className="total-cost">
                                    Total:{" "}
                                    <span className="amount-detail">
                                      {(
                                        parseFloat(assetObj.myHighestBid) +
                                        (this.getBuyerPremium(
                                          assetObj.myHighestBid,
                                          assetObj.buyersPremium
                                        ).flatCharge > 0
                                          ? this.getBuyerPremium(
                                              assetObj.myHighestBid,
                                              assetObj.buyersPremium
                                            ).flatCharge
                                          : parseFloat(
                                              (assetObj.myHighestBid / 100) *
                                                this.getBuyerPremium(
                                                  assetObj.myHighestBid,
                                                  assetObj.buyersPremium
                                                ).buyerPremiumPercentage
                                            )) +
                                        ((assetObj.myHighestBid +
                                          (this.getBuyerPremium(
                                            assetObj.myHighestBid,
                                            assetObj.buyersPremium
                                          ).flatCharge > 0
                                            ? this.getBuyerPremium(
                                                assetObj.myHighestBid,
                                                assetObj.buyersPremium
                                              ).flatCharge
                                            : parseFloat(
                                                (assetObj.myHighestBid / 100) *
                                                  this.getBuyerPremium(
                                                    assetObj.myHighestBid,
                                                    assetObj.buyersPremium
                                                  ).buyerPremiumPercentage
                                              ))) /
                                          100) *
                                          this.props.creditCardPercentage
                                      ).toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        minimumFractionDigits: 2,
                                      })}
                                    </span>{" "}
                                  </span>
                                </Row>
                                <Row>
                                  <span className="gst-inc">
                                    {assetObj.gstApplicable ? "Inc." : "Excl."}{" "}
                                    GST
                                  </span>
                                </Row>
                              </div>
                            </Visible>
                            <Visible
                              when={assetObj.assetType === ASSET_TYPE.BUY_NOW}
                            >
                              {assetObj.status === ASSET_STATUS.UNDER_OFFER && (
                                <Button
                                  disabled={true}
                                  className="btn-outline-warning buy-now"
                                >
                                  <SvgComponent path="shopping-cart" />{" "}
                                  {ASSET_STATUS.UNDER_OFFER}
                                </Button>
                              )}
                              {assetObj.status === ASSET_STATUS.RELEASED && (
                                <Button
                                  className="btn-outline-warning buy-now"
                                  onClick={(e) =>
                                    this.navigateToAsset(
                                      e,
                                      assetObj.consignmentNo,
                                      assetObj?.auctionData?.auctionNum
                                    )
                                  }
                                >
                                  {" "}
                                  <SvgComponent path="shopping-cart" /> Buy Now
                                </Button>
                              )}
                            </Visible>
                            <Visible
                              when={
                                this.assetAvailForBid(
                                  assetObj.auctionData?.datetimeOpen,
                                  assetObj.datetimeClose
                                ) &&
                                AUCTION_TYPES_MAP[
                                  _get(assetObj, "auctionData.auctionType.name")
                                ] !== AUCTION_TYPES.IN_ROOM &&
                                assetObj.assetType !== ASSET_TYPE.BUY_NOW &&
                                ASSET_LIST_TYPE.AUCTION_WINNING !==
                                  assetListType &&
                                assetObj.status !== ASSET_STATUS.SOLD &&
                                assetObj.status !== ASSET_STATUS.PASSED_IN &&
                                assetObj.status !== ASSET_STATUS.REFERRED
                              }
                            >
                              <div className={"action-allowed"}>
                                <CustomPlacebidBox
                                  getBidValues={this.props.getBidValues}
                                  startingBid={assetObj.startingBid}
                                  currentBid={assetObj.currentBidAmount}
                                  currentAmt={assetObj.myHighestBid}
                                  incrementBy={assetObj.incrementBy}
                                  customBidHandler={this.customBidHandler}
                                  gstHandler={this.gstHandler}
                                  disable={false}
                                  getAssetId={this.getAssetId}
                                  assetId={assetObj.assetId}
                                  btnShow={true}
                                  onPlaceBidConfirm={this.onPlaceBidConfirm}
                                  assetDetail={assetObj}
                                  uniqueKey="activeBid"
                                  loggedInUser={loggedInUser}
                                  isTermsAgreed={assetObj.termsAgreed}
                                />
                                <div className="item-block fee-premium-colomn">
                                  <Row>
                                    <span className="fees-detail">
                                      Buyer's Premium %{" "}
                                    </span>{" "}
                                    <span className="amount-detail">
                                      {" "}
                                      {assetObj.flatCharge > 0
                                        ? "0%"
                                        : assetObj.premiumPercent > 0
                                        ? assetObj.premiumPercent + "%"
                                        : "0%"}
                                    </span>
                                  </Row>
                                  <Row>
                                    <span className="fees-detail">
                                      Buyer's Premium
                                    </span>{" "}
                                    <span className="amount-detail">
                                      {assetObj.calPremiumAmt > 0 &&
                                      assetObj.enteredAmt > 0
                                        ? assetObj.calPremiumAmt.toLocaleString(
                                            "en-US",
                                            {
                                              style: "currency",
                                              currency: "USD",
                                              minimumFractionDigits: 2,
                                            }
                                          )
                                        : "-"}
                                    </span>
                                  </Row>
                                  <Row>
                                    <span className="fees-detail">
                                      Credit Card Fee
                                    </span>{" "}
                                    <span className="amount-detail">
                                      {paymentHistoryPage
                                        ? (
                                            (assetObj.myHighestBid / 100) *
                                            this.props.creditCardPercentage
                                          ).toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            minimumFractionDigits: 2,
                                          })
                                        : assetObj.creditCardFee
                                        ? assetObj.creditCardFee.toLocaleString(
                                            "en-US",
                                            {
                                              style: "currency",
                                              currency: "USD",
                                              minimumFractionDigits: 2,
                                            }
                                          )
                                        : "-"}
                                    </span>
                                  </Row>
                                  <Row>
                                    <span className="total-cost">
                                      Total:{" "}
                                      <span className="amount-detail">
                                        {parseFloat(assetObj.calculatedTotal)
                                          ? parseFloat(
                                              assetObj.calculatedTotal
                                            ).toLocaleString("en-US", {
                                              style: "currency",
                                              currency: "USD",
                                              minimumFractionDigits: 2,
                                            })
                                          : 0}
                                      </span>{" "}
                                    </span>
                                  </Row>
                                  <Row>
                                    <span className="gst-inc">
                                      {assetObj.gstApplicable
                                        ? "Inc."
                                        : "Excl."}{" "}
                                      GST
                                    </span>
                                  </Row>
                                </div>
                              </div>
                            </Visible>
                            <Visible
                              when={
                                !this.assetAvailForBid(
                                  assetObj.auctionData?.datetimeOpen,
                                  assetObj.datetimeClose
                                ) &&
                                AUCTION_TYPES_MAP[
                                  _get(assetObj, "auctionData.auctionType.name")
                                ] === AUCTION_TYPES.IN_ROOM &&
                                assetObj.assetType !== ASSET_TYPE.BUY_NOW &&
                                ASSET_LIST_TYPE.AUCTION_WINNING !==
                                  assetListType &&
                                assetObj.status !== ASSET_STATUS.SOLD &&
                                assetObj.status !== ASSET_STATUS.PASSED_IN &&
                                assetObj.status !== ASSET_STATUS.REFERRED
                              }
                            >
                              <div className={"action-allowed"}>
                                <CustomPlacebidBox
                                  getBidValues={this.props.getBidValues}
                                  startingBid={assetObj.startingBid}
                                  currentBid={assetObj.currentBidAmount}
                                  currentAmt={assetObj.myHighestBid}
                                  incrementBy={assetObj.incrementBy}
                                  customBidHandler={this.customBidHandler}
                                  gstHandler={this.gstHandler}
                                  disable={false}
                                  getAssetId={this.getAssetId}
                                  assetId={assetObj.assetId}
                                  btnShow={true}
                                  onPlaceBidConfirm={this.onPlaceBidConfirm}
                                  assetDetail={assetObj}
                                  loggedInUser={loggedInUser}
                                />
                                <div className="item-block fee-premium-colomn">
                                  <Row>
                                    <span className="fees-detail">
                                      Buyer's Premium %{" "}
                                    </span>{" "}
                                    <span className="amount-detail">
                                      {" "}
                                      {assetObj.flatCharge > 0
                                        ? "0%"
                                        : assetObj.premiumPercent > 0
                                        ? assetObj.premiumPercent + "%"
                                        : "0%"}
                                    </span>
                                  </Row>
                                  <Row>
                                    <span className="fees-detail">
                                      Buyer's Premium
                                    </span>{" "}
                                    <span className="amount-detail">
                                      {assetObj.calPremiumAmt > 0 &&
                                      assetObj.enteredAmt > 0
                                        ? assetObj.calPremiumAmt.toLocaleString(
                                            "en-US",
                                            {
                                              style: "currency",
                                              currency: "USD",
                                              minimumFractionDigits: 2,
                                            }
                                          )
                                        : "-"}
                                    </span>
                                  </Row>
                                  <Row>
                                    <span className="fees-detail">
                                      Credit Card Fee
                                    </span>{" "}
                                    <span className="amount-detail">
                                      {paymentHistoryPage
                                        ? (
                                            (assetObj.myHighestBid / 100) *
                                            this.props.creditCardPercentage
                                          ).toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                            minimumFractionDigits: 2,
                                          })
                                        : assetObj.creditCardFee
                                        ? assetObj.creditCardFee.toLocaleString(
                                            "en-US",
                                            {
                                              style: "currency",
                                              currency: "USD",
                                              minimumFractionDigits: 2,
                                            }
                                          )
                                        : "-"}
                                    </span>
                                  </Row>
                                  <Row>
                                    <span className="total-cost">
                                      Total:{" "}
                                      <span className="amount-detail">
                                        {parseFloat(assetObj.calculatedTotal)
                                          ? parseFloat(
                                              assetObj.calculatedTotal
                                            ).toLocaleString("en-US", {
                                              style: "currency",
                                              currency: "USD",
                                              minimumFractionDigits: 2,
                                            })
                                          : 0}
                                      </span>{" "}
                                    </span>
                                  </Row>
                                  <Row>
                                    <span className="gst-inc">
                                      {assetObj.gstApplicable
                                        ? "Inc."
                                        : "Excl."}{" "}
                                      GST
                                    </span>
                                  </Row>
                                </div>
                              </div>
                            </Visible>
                            <Visible
                              when={_get(assetObj, "displayJoinAuction")}
                            >
                              <Link
                                to={""}
                                size="md"
                                variant="warning"
                                className="join-auction-div"
                                onClick={(e) => this.validateUser(e, assetObj)}
                              >
                                <SvgComponent path="gavel" /> Join the auction
                              </Link>
                            </Visible>
                          </div>
                        </div>
                      </div>
                    </Col>
                  )}

                  <Col
                    xs={5}
                    className={
                      ASSET_LIST_TYPE.AUCTION_WINNING === assetListType &&
                      "item-won-section"
                    }
                  >
                    <div className="item-block">
                      {assetObj.assetType !== ASSET_TYPE.BUY_NOW &&
                        ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType &&
                        !paymentHistoryPage && (
                          <div className="label">Auction ending</div>
                        )}
                      {assetObj.assetType !== ASSET_TYPE.BUY_NOW &&
                        ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType &&
                        !paymentHistoryPage && (
                          <div className="date-time-align">
                            <Visible
                              when={
                                !assetObj?.auctionData?.isEOI ||
                                (assetObj?.auctionData?.isEOI &&
                                  !(
                                    dayjs(assetObj.datetimeClose) - dayjs() >
                                    ONE_YEAR
                                  ))
                              }
                            >
                              <Visible when={!assetObj.isExtended}>
                                <div className="date-time-label">
                                  Time Remaining
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip>
                                        This auction will close at{" "}
                                        {dayjs(
                                          assetObj.auctionData?.datetimeClose
                                        ).format("hh:mm A")}{" "}
                                        {getTimezoneName(
                                          assetObj.auctionData?.datetimeClose
                                        )}{" "}
                                        {dayjs(
                                          assetObj.auctionData?.datetimeClose
                                        ).format("DD MMM YYYY")}{" "}
                                      </Tooltip>
                                    }
                                  >
                                    <SvgComponent path="help_outline" />
                                  </OverlayTrigger>
                                </div>
                              </Visible>
                              <Visible when={assetObj.isExtended}>
                                <div className="date-time-label">
                                  {this.assetAvailForBid(
                                    assetObj.auctionData?.datetimeOpen,
                                    assetObj.datetimeClose
                                  )
                                    ? "Time Remmaining"
                                    : "Bonus Time"}{" "}
                                </div>
                              </Visible>
                              <CountdownTimer
                                bonusTime={assetObj.isExtended}
                                time={
                                  assetObj.status !== ASSET_STATUS.SOLD &&
                                  (assetObj.status !== ASSET_STATUS.PASSED_IN) &
                                    (assetObj.status !== ASSET_STATUS.REFERRED)
                                    ? assetObj.datetimeClose
                                    : dayjs()
                                }
                                onComplete={this.onCompleteTimer.bind(
                                  null,
                                  assetObj
                                )}
                              />
                              {!this.assetAvailForBid(
                                assetObj.auctionData?.datetimeOpen,
                                assetObj.datetimeClose
                              ) &&
                                AUCTION_TYPES_MAP[
                                  _get(assetObj, "auctionData.auctionType.name")
                                ] !== AUCTION_TYPES.IN_ROOM && (
                                  <div className="my-bid-detail mr-bottom">
                                    <strong>
                                      Bidding Closed{" "}
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={
                                          <Tooltip>
                                            This auction was closed at{" "}
                                            {dayjs(
                                              assetObj.auctionData
                                                ?.datetimeClose
                                            ).format("hh:mm A")}{" "}
                                            {getTimezoneName(
                                              assetObj.auctionData
                                                ?.datetimeClose
                                            )}{" "}
                                            {dayjs(
                                              assetObj.auctionData
                                                ?.datetimeClose
                                            ).format("DD MMM YYYY")}{" "}
                                          </Tooltip>
                                        }
                                      >
                                        <SvgComponent path="help_outline" />
                                      </OverlayTrigger>
                                    </strong>
                                  </div>
                                )}
                            </Visible>
                          </div>
                        )}
                      {ASSET_LIST_TYPE.AUCTION_WINNING === assetListType &&
                        !paymentHistoryPage && (
                          <>
                            <Visible when={assetObj.paymentStatus}>
                              <div
                                className={
                                  assetObj.paymentStatus === "PAID"
                                    ? "paid-status payment-info"
                                    : "payment-info"
                                }
                              >
                                <div className="overdue-info">
                                  {assetObj.paymentStatus
                                    ? assetObj.paymentStatus
                                    : "UNPAID"}
                                </div>
                              </div>
                            </Visible>
                            {/* <div className="invoice-link"> */}
                            <DownloadAuctionDocuments
                              auctionId={assetObj?.auctionData?.auctionId}
                              assetId={assetObj?.assetId}
                              consignmentNo={assetObj?.consignmentNo}
                              auctionNum={assetObj?.auctionData?.auctionNum}
                              invoice={true}
                            />
                            {/* </div> */}
                            <div className="contact-info">
                              {assetObj.auctionData.auctionAdmin?.mobile && (
                                <a
                                  className="invoice-link"
                                  href={`tel:${assetObj.auctionData.auctionAdmin?.mobile}`}
                                >
                                  <span>
                                    <SvgComponent path="call_white_24dp" />{" "}
                                  </span>
                                </a>
                              )}
                              <a
                                className="invoice-link"
                                href={`mailto:${assetObj.auctionData.auctionAdmin?.email}?subject=Consignment No: ${assetObj.consignmentNo}`}
                              >
                                <span>
                                  <SvgComponent path="email_white_24dp" />{" "}
                                </span>
                              </a>
                            </div>
                          </>
                        )}
                      {/* commented below code due to payment tab is removed */}
                      {/* {paymentHistoryPage && (
                        <>
                          <div className="paid-info">
                            <div className="overdue-info">
                              {assetObj.paymentStatus
                                ? assetObj.paymentStatus
                                : "UNPAID"}
                            </div>
                          </div>
                          <DownloadAuctionDocuments
                            auctionId={assetObj?.auctionData?.auctionId}
                            assetId={assetObj?.assetId}
                            consignmentNo={assetObj?.consignmentNo}
                            auctionNum={assetObj?.auctionData?.auctionNum}
                            invoice={true}
                          />
                        </>
                      )} */}
                      {watchedItemPage && (
                        <div className="check-box-column">
                          <div
                            className="delet-row"
                            onClick={(e) =>
                              this.props.deletetedFromRow(e, assetObj)
                            }
                          >
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip> Remove from watchlist </Tooltip>
                              }
                            >
                              <SvgComponent path="delete_black_24dp" />
                            </OverlayTrigger>
                          </div>
                          <div className="checkbox-custom-css">
                            <Form.Check
                              type="checkbox"
                              custom
                              id={`watchAsset${assetObj.assetId}`}
                            >
                              <Form.Check.Input
                                value={true}
                                type="checkbox"
                                checked={
                                  selectedItems[assetObj.assetId] ? true : false
                                }
                                name={`watchAsset${assetObj.assetId}`}
                                onChange={(e) =>
                                  this.props.onChangeSelection(e, assetObj)
                                }
                              />
                              <Form.Check.Label></Form.Check.Label>
                            </Form.Check>
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
        </div>
      </>
    );
  }
}

export default withRouter(CommonTable);
