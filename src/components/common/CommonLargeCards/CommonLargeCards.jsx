import React from "react";
import dayjs from "dayjs";
import { withRouter } from "react-router";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Visible from "../Visible";
import PlaceBid from "../PlaceBid";
import SvgComponent from "../SvgComponent";
import CountdownTimer from "../CountdownTimer";
import { BidHistoryTable } from "../BidHistory";
import { ImageGalleryView } from "../ImageGallery";
import BidHistoryComponent from "../BidHistory/BidHistory";
import DownloadAuctionDocuments from "../DownloadAuctionDocuments";
import {
  ASSET_LIST_TYPE,
  ASSET_STATUS,
  ASSET_TYPE,
  DEFAULT_IMAGE,
  ONE_YEAR,
  MESSAGES,
} from "../../../utils/constants";
import { stringify } from "qs";
import {
  constructImageUrl,
  encrypt,
  isInRoom,
  preventEvent,
  toUrlString,
  getTimezoneName,
} from "../../../utils/helpers";

import "./CommonLargeCards.scss";

class CommonLargeCards extends React.Component {
  state = {
    showBid: false,
    showBidHistory: false,
    closebutton: false,
    placebidToggle: false,
    absenteeCurrentBidAmount: "",
    isAssetClosed: true,
    handleError: false,
    assetType: "",
    showBuyNowModal: false,
    pathName: "",
    buyNowTerms: false,
    isTermsAgreed: false,
    watchList: this.props.assetInfo.isWatchListed,
    showSpinCar: false,
    showDetails: {
      asset: null,
      name: null,
    },
  };
  componentDidMount() {
    this.props.openSocket();
  }
  navigateToAsset = () => {
    const { history, assetInfo } = this.props;
    const auctionNum = assetInfo.auctionData?.auctionNum;
    const consignmentNo = assetInfo.consignmentNo;
    const obj = stringify({ auctionNum, consignmentNo });
    history.push(`/asset?${obj}`);
  };
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
  navigateToPlacebid = () => {
    this.setState({ showBid: true, showBidHistory: false });
  };
  showBidHistoryPanel = () => {
    this.setState({ showBidHistory: true, showBid: false });
  };
  closeBidHistory = () => {
    this.setState({ showBidHistory: false });
  };
  onPlaceBidConfirm = (data) => {
    const { showMessage } = this.props;
    this.props
      .confirmBid(data)
      .then((res) => {
        if (res && res.statusCode !== 200) {
          showMessage({ message: res.message });
          return false;
        } else {
          this.setState({ assetCardHilight: data.assetId });
          setTimeout(() => {
            this.setState({ assetCardHilight: null });
          }, 5000);
          showMessage({
            message: (
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
            ),
            messageId: "absenteBidOne",
          });
          this.onPlaceBidClose();
          this.setState({
            placebidToggle: !this.state.placebidToggle,
          });
        }
      })
      .catch((err) => {
        showMessage({ message: err.message });
      });
  };

  onPlaceBidClose = () => {
    this.setState({ showBid: false });
  };
  onAddToWatchList = (e, assetId, key, auctionId) => {
    const { showMessage } = this.props;
    if (!this.props.watchedItemPage) {
      this.setState({ watchList: !key });
    }
    let watchedItem = this.state.watchList;
    this.props
      .addToWatchlist({ assetId, watchedItem, auctionId })
      .then((res) => {
        showMessage({
          message: !key ? MESSAGES.ADD_WATCHLIST : MESSAGES.REMOVE_WATCHLIST,
        });
      });
    if (this.props.watchedItemPage) {
      this.props.fetchWatchList({ sortBy: "", pageSize: 12, activePage: 0 });
    }
  };
  spincarClick = async (e, assetInfo) => {
    let images = [{ original: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE }];
    if (assetInfo.assetImages !== assetInfo.totalAssetImages) {
      images = await this.props
        .getAssetImages(assetInfo.assetId)
        .then((res) => {
          return res.result?.map(({ imageUrl }) => ({
            original: imageUrl,
            thumbnail: imageUrl,
          }));
        });
    }
    this.setState({
      showDetails: { asset: assetInfo, images },
      showSpinCar: true,
    });
  };
  onCloseDetails = (e) => {
    preventEvent(e);
    this.setState({
      showDetails: { name: null, asset: null },
      showSpinCar: false,
    });
  };

  render() {
    const {
      assetInfo,
      loggedInUser,
      toggleLogin,
      showMessage,
      assetListType,
      paymentHistoryPage,
      selectedItems,
      watchedItemPage,
      highlightAsset,
      onPayClick,
      creditCardPercentage,
    } = this.props;
    const { closebutton, showBid, showBidHistory, showSpinCar, showDetails } =
      this.state;
    let { watchList } = this.state;
    const closeTime = dayjs(assetInfo?.datetimeClose);
    const startTime = dayjs(assetInfo.auctionData?.datetimeOpen);
    const now = dayjs().add(2, "seconds");
    const assetStatusClosed =
      assetInfo.status === ASSET_STATUS.SOLD ||
      assetInfo.status === ASSET_STATUS.PASSED_IN ||
      assetInfo.status === ASSET_STATUS.REFERRED;
    return (
      <div className="container">
        <div
          className={`${
            assetInfo.isExtended && !assetStatusClosed
              ? "highlight-card large-card-layout"
              : "large-card-layout"
          } ${
            ASSET_LIST_TYPE.AUCTION_WINNING === assetListType &&
            "item-won-layout"
          } ${watchedItemPage && "watch-list-layout"} ${
            showBid
              ? "height-auto"
              : highlightAsset
              ? assetInfo.assetId === highlightAsset
                ? "hilight"
                : `${assetInfo.assetId === highlightAsset ? "hilight" : ""}`
              : ""
          }`}
        >
          <Row>
            <Col xs={8}>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{assetInfo.title}</Tooltip>}
              >
                <div className="card-label">{assetInfo.title}</div>
              </OverlayTrigger>
            </Col>
          </Row>
          <Row>
            <Col xs={8}>
              <div className="left-block">
                <Visible when={!assetStatusClosed}>
                  <Button
                    variant="outline-primary"
                    className={`watch-list ${watchList === true && "active"}`}
                    onClick={(e) =>
                      this.onAddToWatchList(
                        e,
                        assetInfo?.assetId,
                        watchList,
                        assetInfo?.auctionData?.auctionId
                      )
                    }
                  >
                    {watchList === true ? (
                      <SvgComponent path="star-filled" />
                    ) : (
                      <SvgComponent path="star_border" />
                    )}
                  </Button>
                </Visible>
                <Visible when={!!assetInfo.spincar}>
                  <Button
                    variant="outline-warning"
                    className="spin-car"
                    onClick={(e) => this.spincarClick(e, assetInfo)}
                  >
                    <SvgComponent path="spin-car" />
                  </Button>
                </Visible>
                <img
                  onClick={this.navigateToAsset}
                  className="image-container"
                  src={DEFAULT_IMAGE}
                  onLoad={(e) =>
                    constructImageUrl(assetInfo.assetImageUrl, e.target)
                  }
                />

                <div
                  className={
                    assetInfo.highestBidder
                      ? "highest-bidder-block"
                      : "highest-bidder-block no-background"
                  }
                >
                  <Visible when={!paymentHistoryPage}>
                    <div className="label">Highest Bidder</div>
                    <div
                      className={
                        assetListType === ASSET_LIST_TYPE.AUCTION_WINNING
                          ? "winning-icon gavel-icon"
                          : "gavel-icon"
                      }
                    >
                      {" "}
                      {assetListType === ASSET_LIST_TYPE.AUCTION_WINNING ? (
                        <SvgComponent path="emoji_events_black_24dp" />
                      ) : (
                        <SvgComponent
                          path={
                            assetInfo.highestBidder
                              ? "gavel_white_24dp"
                              : "cancel_black"
                          }
                        />
                      )}{" "}
                    </div>
                  </Visible>
                  <Visible when={paymentHistoryPage}>
                    <div className="current-bid-block">
                      <div className="key">Sale</div>
                      <div className="value">
                        {assetInfo.auctionData?.auctionId}
                      </div>
                    </div>
                  </Visible>
                  <div className="my-bid-block">
                    <div className="key">My Highest Bid</div>
                    <div className="value">
                      {assetInfo.myHighestBid
                        ? assetInfo.myHighestBid.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                          })
                        : 0}{" "}
                    </div>
                  </div>
                </div>
                {!isInRoom(assetInfo.auctionData.auctionType?.name) &&
                  ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType &&
                  !paymentHistoryPage && (
                    <div className="current-bid-block">
                      {/* <div className="key">{assetInfo.assetType === ASSET_TYPE.BUY_NOW ? 'Listed Price' : 'Current Bid'}</div> {assetInfo.assetType === ASSET_TYPE.BUY_NOW ? <span className="value">{assetInfo.listedPrice ? assetInfo.listedPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }) : 0}</span> : <span className="value">{assetInfo.currentBidAmount ? assetInfo.currentBidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }) : 0} </span>} */}
                      <div className="key">No of Bids</div>
                      <div className="value">
                        <BidHistoryComponent
                          forListView={true}
                          loggedInUser={loggedInUser}
                          auctionId={assetInfo?.auctionData?.auctionId}
                          count={assetInfo.totalBidsPlaced}
                          assetId={assetInfo.assetId}
                          hideText={true}
                          className="bid-history-link"
                          key={assetInfo.assetId}
                        />{" "}
                      </div>

                      <div className="my-bid-block">
                        {/* <div className="key">No of Bids</div>
                                        <div className="value">{assetInfo.totalBidsPlaced ? assetInfo.totalBidsPlaced : 0} </div> */}
                      </div>
                    </div>
                  )}
              </div>
            </Col>
            <Col xs={4}>
              <div className="right-block">
                {(assetInfo.status === ASSET_STATUS.RELEASED ||
                  assetInfo.status === ASSET_STATUS.REFERRED) &&
                  assetInfo.assetType !== ASSET_TYPE.BUY_NOW &&
                  !assetInfo?.auctionData?.isEOI && (
                    <>
                      <Visible when={!assetInfo.isExtended}>
                        <div className="timing-label">
                          Time Remaining
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                This auction will close at{" "}
                                {dayjs(
                                  assetInfo.auctionData?.datetimeClose
                                ).format("hh:mm A")}{" "}
                                {getTimezoneName(
                                  assetInfo.auctionData?.datetimeClose
                                )}{" "}
                                {dayjs(
                                  assetInfo.auctionData?.datetimeClose
                                ).format("DD MMM YYYY")}{" "}
                              </Tooltip>
                            }
                          >
                            <SvgComponent path="help_outline" />
                          </OverlayTrigger>
                        </div>
                      </Visible>
                      <Visible when={assetInfo.isExtended}>
                        <div className="timing-label">
                          {closeTime <= now || assetStatusClosed
                            ? "Time Remmaining"
                            : "Bonus Time"}{" "}
                        </div>
                      </Visible>
                      <CountdownTimer
                        bonusTime={assetInfo.isExtended}
                        time={
                          !assetStatusClosed ? assetInfo.datetimeClose : dayjs()
                        }
                      />
                    </>
                  )}
                {assetInfo?.auctionData?.isEOI &&
                  !(dayjs(assetInfo.datetimeClose) - dayjs() > ONE_YEAR) && (
                    <>
                      <Visible when={!assetInfo.isExtended}>
                        <div className="timing-label">
                          Time Remaining
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                This auction will close at{" "}
                                {dayjs(
                                  assetInfo.auctionData?.datetimeClose
                                ).format("hh:mm A")}{" "}
                                {getTimezoneName(
                                  assetInfo.auctionData?.datetimeClose
                                )}{" "}
                                {dayjs(
                                  assetInfo.auctionData?.datetimeClose
                                ).format("DD MMM YYYY")}{" "}
                              </Tooltip>
                            }
                          >
                            <SvgComponent path="help_outline" />
                          </OverlayTrigger>
                        </div>
                      </Visible>
                      <Visible when={assetInfo.isExtended}>
                        <div className="timing-label">Bonus Time </div>
                      </Visible>
                      <CountdownTimer
                        bonusTime={assetInfo.isExtended}
                        time={assetInfo.datetimeClose}
                      />
                    </>
                  )}
                {assetInfo.assetType !== ASSET_TYPE.EOI &&
                  assetInfo.status !== ASSET_STATUS.UNDER_OFFER && (
                    <div className="current-bid-block">
                      {assetListType === ASSET_LIST_TYPE.AUCTION_WINNING ||
                      paymentHistoryPage ? (
                        <>
                          {" "}
                          <span className="key">
                            {paymentHistoryPage
                              ? "Current Bid:"
                              : "My Highest Bid:"}{" "}
                          </span>{" "}
                          <span className="value">
                            {assetInfo.myHighestBid
                              ? assetInfo.myHighestBid.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  minimumFractionDigits: 0,
                                })
                              : 0}
                          </span>{" "}
                        </>
                      ) : (
                        <>
                          {" "}
                          <span
                            className={closeTime <= now ? "strong-font" : "key"}
                          >
                            {closeTime <= now ? (
                              <>
                                Bidding Closed{" "}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      This auction was closed at{" "}
                                      {dayjs(
                                        assetInfo.auctionData?.datetimeClose
                                      ).format("hh:mm A")}{" "}
                                      {getTimezoneName(
                                        assetInfo.auctionData?.datetimeClose
                                      )}{" "}
                                      {dayjs(
                                        assetInfo.auctionData?.datetimeClose
                                      ).format("DD MMM YYYY")}{" "}
                                    </Tooltip>
                                  }
                                >
                                  <SvgComponent path="help_outline" />
                                </OverlayTrigger>
                              </>
                            ) : assetInfo.assetType === ASSET_TYPE.BUY_NOW ? (
                              "Listed Price: "
                            ) : assetStatusClosed ? (
                              "My Bid: "
                            ) : assetInfo.currentBidAmount > 0 ? (
                              "Current Bid: "
                            ) : (
                              "Starting Bid: "
                            )}
                          </span>
                          {closeTime <= now ? (
                            ""
                          ) : assetInfo.assetType === ASSET_TYPE.BUY_NOW ? (
                            <span className="value">
                              {assetInfo.listedPrice
                                ? assetInfo.listedPrice.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 0,
                                    }
                                  )
                                : 0}
                            </span>
                          ) : (
                            <span className="value">
                              {assetInfo.currentBidAmount &&
                              !assetStatusClosed &&
                              assetInfo.currentBidAmount > 0
                                ? assetInfo.currentBidAmount.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 0,
                                    }
                                  )
                                : assetStatusClosed
                                ? assetInfo.myHighestBid.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 0,
                                    }
                                  )
                                : assetInfo.startingBid.toLocaleString(
                                    "en-US",
                                    {
                                      style: "currency",
                                      currency: "USD",
                                      minimumFractionDigits: 0,
                                    }
                                  )}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                {/* commented below code due to payment tab is removed */}
                {/* {paymentHistoryPage && (
                  <div className="paid-info">
                    <div className="overdue-info">
                      {assetInfo.paymentStatus
                        ? assetInfo.paymentStatus
                        : "UNPAID"}
                    </div>
                  </div>
                )} */}
                {ASSET_LIST_TYPE.AUCTION_WINNING === assetListType &&
                  !paymentHistoryPage && (
                    <>
                      <Visible when={assetInfo.paymentStatus}>
                        <div
                          className={
                            assetInfo.paymentStatus === "PAID"
                              ? "paid-info payment-info"
                              : "payment-info"
                          }
                        >
                          <div className="overdue-info">
                            {"Payment status : "}
                            {assetInfo.paymentStatus
                              ? assetInfo.paymentStatus
                              : "UNPAID"}
                          </div>
                        </div>
                      </Visible>
                      <div className="contact-info">
                        {" "}
                        <SvgComponent path="picture_as_pdf_white_24dp" />{" "}
                        <DownloadAuctionDocuments
                          auctionId={assetInfo?.auctionData?.auctionId}
                          assetId={assetInfo?.assetId}
                          consignmentNo={assetInfo?.consignmentNo}
                          auctionNum={assetInfo?.auctionData?.auctionNum}
                          invoice={true}
                        />
                        {assetInfo.auctionData.auctionAdmin?.mobile && (
                          <a
                            className="invoice-link"
                            href={`tel:${assetInfo.auctionData.auctionAdmin?.mobile}`}
                          >
                            <span>
                              <SvgComponent path="call_white_24dp" />{" "}
                            </span>
                          </a>
                        )}
                        <a
                          className="invoice-link"
                          href={`mailto:${assetInfo.auctionData.auctionAdmin?.email}?subject=Consignment No: ${assetInfo.consignmentNo}`}
                        >
                          <span>
                            <SvgComponent path="email_white_24dp" />{" "}
                          </span>
                        </a>
                      </div>
                    </>
                  )}
              </div>
            </Col>
          </Row>
          <Row>
            <div className="button-block">
              {assetInfo.assetType === ASSET_TYPE.BUY_NOW ? (
                <>
                  {assetInfo.status === ASSET_STATUS.UNDER_OFFER && (
                    <Button disabled={true} className="btn-outline-warning">
                      <SvgComponent path="shopping-cart" />{" "}
                      {ASSET_STATUS.UNDER_OFFER}
                    </Button>
                  )}
                  {assetInfo.status === ASSET_STATUS.RELEASED && (
                    <Button
                      className="btn-outline-warning"
                      onClick={this.navigateToAsset}
                    >
                      <SvgComponent path="shopping-cart" /> Buy Now
                    </Button>
                  )}
                  <Button
                    className="btn-primary"
                    onClick={this.navigateToAsset}
                  >
                    Full Details
                  </Button>
                </>
              ) : assetInfo.assetType === ASSET_TYPE.EOI ? (
                <>
                  <DownloadAuctionDocuments
                    assetId={assetInfo.assetId}
                    auctionId={assetInfo.auctionData?.auctionId}
                  />
                  <Button
                    className="btn-primary"
                    onClick={this.navigateToAsset}
                  >
                    Full Details
                  </Button>
                </>
              ) : (
                <>
                  {!isInRoom(assetInfo.auctionData.auctionType.name) &&
                    ASSET_LIST_TYPE.AUCTION_WINNING !== assetListType &&
                    !paymentHistoryPage && (
                      <Button
                        className={`${
                          showBidHistory
                            ? "dark-grey-button extra-height-bidhistory"
                            : "dark-grey-button"
                        }`}
                        onClick={this.showBidHistoryPanel}
                      >
                        Bid History
                      </Button>
                    )}
                  <Button
                    className="btn-primary"
                    onClick={this.navigateToAsset}
                  >
                    Full Details
                  </Button>
                  <Visible
                    when={
                      !assetStatusClosed &&
                      !isInRoom(assetInfo.auctionData.auctionType.name) &&
                      startTime <= now &&
                      closeTime >= now
                    }
                  >
                    <Button
                      className={`${
                        showBid
                          ? "btn-outline-warning extra-height"
                          : "btn-outline-warning"
                      }`}
                      onClick={this.navigateToPlacebid}
                    >
                      {" "}
                      Bid Now
                    </Button>
                  </Visible>
                  <Visible
                    when={
                      !assetStatusClosed &&
                      isInRoom(assetInfo.auctionData.auctionType.name) &&
                      closeTime >= now
                    }
                  >
                    <div className="place-bid">
                      <Visible when={assetInfo?.displayJoinAuction}>
                        <Button
                          className="join-live-btn"
                          variant="warning"
                          onClick={(e) => this.validateUser(e, assetInfo)}
                        >
                          <SvgComponent path="gavel" />
                          Join Live
                        </Button>
                      </Visible>
                      <Visible when={startTime > now}>
                        <Button
                          variant="warning"
                          className="absentee-bid"
                          onClick={this.navigateToPlacebid}
                        >
                          Absentee Bid
                        </Button>
                      </Visible>
                    </div>
                  </Visible>
                  {/* {assetListType !== ASSET_LIST_TYPE.AUCTION_WINNING && <Button className={`${showBid ? "btn-outline-warning extra-height" : "btn-outline-warning"}`} onClick={this.navigateToPlacebid}>Bid Now</Button>} */}
                </>
              )}
              {paymentHistoryPage && (
                <>
                  <div className="receipt-button">
                    <DownloadAuctionDocuments
                      auctionId={assetInfo?.auctionData?.auctionId}
                      assetId={assetInfo?.assetId}
                      consignmentNo={assetInfo?.consignmentNo}
                      auctionNum={assetInfo?.auctionData?.auctionNum}
                      invoice={true}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="location-detail">
              <Visible when={assetInfo.lotNo}>
                <div className="card-icons">
                  <span className="sub-header">
                    <SvgComponent path="emoji_transportation" /> Lot:{" "}
                    {assetInfo.lotNo}
                  </span>
                </div>
              </Visible>
              <div className="card-icons">
                <span className="sub-header">
                  {/* <SvgComponent path="location_on_white_18dp" />{" "}
                  {assetInfo.city?.name}, {assetInfo.state?.name} */}
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>
                        {assetInfo?.assetSuburbState ? (
                          assetInfo?.assetSuburbState
                        ) : (
                          <>
                            {assetInfo?.city ? assetInfo?.city.name : ""},{" "}
                            {assetInfo?.state ? assetInfo?.state.name : ""}
                          </>
                        )}
                      </Tooltip>
                    }
                  >
                    <td>
                      <SvgComponent path="location_on_white_18dp" />{" "}
                      {assetInfo?.assetSuburbState ? (
                        assetInfo?.assetSuburbState
                      ) : (
                        <>
                          {assetInfo?.city ? assetInfo?.city.name : ""},{" "}
                          {assetInfo?.state ? assetInfo?.state.name : ""}
                        </>
                      )}
                    </td>
                  </OverlayTrigger>
                </span>
              </div>
            </div>
          </Row>
        </div>
        {watchedItemPage && (
          <div className="checkbox-custom-css">
            <Form.Check
              type="checkbox"
              custom
              id={`watchAsset${assetInfo.assetId}`}
            >
              <Form.Check.Input
                value={true}
                type="checkbox"
                checked={selectedItems[assetInfo.assetId] ? true : false}
                name={`watchAsset${assetInfo.assetId}`}
                onChange={(e) => this.props.onChangeSelection(e, assetInfo)}
              />
              <Form.Check.Label></Form.Check.Label>
            </Form.Check>
          </div>
        )}

        <Visible when={showBid}>
          <div className="bidnow-expand-block">
            <PlaceBid
              className="asset-page-placebid"
              asset={assetInfo}
              onPlaceBidConfirm={this.onPlaceBidConfirm}
              onCloseClick={this.onPlaceBidClose}
              loggedInUser={loggedInUser}
              toggleLogin={toggleLogin}
              showMessage={showMessage}
              toggleEnquire={this.toggleEnquire}
              closebutton={closebutton}
              fromMyAccountPage={true}
              creditCardPercentage={creditCardPercentage}
            />
          </div>
        </Visible>
        <Visible when={showBidHistory}>
          <div className="bidHistory-expand-block">
            <Button
              variant="warning"
              className="close-btn"
              onClick={this.closeBidHistory}
            >
              {" "}
              <SvgComponent path="close" />
            </Button>
            <BidHistoryTable
              loggedInUser={loggedInUser}
              assetId={assetInfo?.assetId}
              auctionId={assetInfo?.auctionData?.auctionId}
              status={assetInfo?.status}
            />
          </div>
        </Visible>
        {showSpinCar && (
          <ImageGalleryView
            show
            activeView="spin-car"
            loggedInUser={loggedInUser}
            images={showDetails?.images}
            assetDetail={showDetails?.asset}
            handleClose={this.onCloseDetails}
            showMessage={this.props.showMessage}
          />
        )}
      </div>
    );
  }
}
export default withRouter(CommonLargeCards);
