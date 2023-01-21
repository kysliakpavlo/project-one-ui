import React, { lazy } from "react";
import dayjs from "dayjs";
import _get from "lodash/get";
import socketIOClient from "socket.io-client";
import _cloneDeep from "lodash/cloneDeep";
import { withRouter } from "react-router";
import SlidingPane from "react-sliding-pane";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import NotifiedTab from "../../NotifiedTab";
import SvgComponent from "../../SvgComponent";
import { SavedSearches } from "../../Preferences";
import { SOCKET, API_PATH } from "../../../../utils/constants";
import { preventEvent, isInRoom } from "../../../../utils/helpers";
import NoResults from "../../NoResults";
import "./LiveNotificationsPanel.scss";

const CommonCards = lazy(() => import("../../CommonCards"));

// let socket = null;
// let socketConnected = false;

// const initSocket = () => {
//   if (socketConnected) {
//     return;
//   }
//   socketConnected = true;
//   const options = {
//     transports: ["websocket"],
//   };
//   socket = socketIOClient(API_PATH, options);
// };
class LiveNotifications extends React.Component {
  state = {
    watchingAssets: [],
    activeBids: [],
    highestBids: [],
    outBidAssets: [],
    notificationCount: sessionStorage.getItem("notification")
      ? sessionStorage.getItem("notification")
      : 0,
    placebidToggle: false,
    currentAsset: {},
    openOutbid: false,
    closebutton: true,
    openWatchbid: false,
    now: dayjs(),
    showBuyNowModal: false,
    buyNowTerms: false,
    selectedBuyNowItem: {},
    highlightAsset: null,
    isVisible: false,
    resetTypes: ["notificationCount", "watchlistCount"],
    activeTab: "watchlist",
    liveComponent: true,
    isLiveWatchlist: true,
    savedSearchApiCall: false,
    loadingMessage: "loading...",
    showDetails: {
      name: null,
      asset: null,
    },
  };

  componentDidMount() {
    // initSocket();
    const { isLoggedIn } = this.props;
    if (isLoggedIn) {
      this.openLiveNotificationChannel();
      this.getAllNotifications();
      this.setState({ activeTab: "watchlist" });
      this.getWatchAsset();
    }
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  componentDidUpdate(prevProps) {
    const { isLoggedIn } = this.props;
    if (prevProps.isLoggedIn !== isLoggedIn && this.props.isLivePanelOpen) {
      if (isLoggedIn) {
        this.getAllNotifications();
        this.openLiveNotificationChannel();
        this.getWatchAsset();
      } else {
        this.setState({ notificationCount: 0 });
      }
    }
  }

  showDetailHandler = (asset) => {
    this.setState({ showDetails: { name: "placebid", asset } });
  };
  onClickLive = (e) => {
    preventEvent(e);
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.setState({ activeTab: "watchlist" });
    const { isLoggedIn } = this.props;
    if (!isLoggedIn) {
      this.props.toggleLogin(true, () => {
        setTimeout(() => {
          document.body.style.overflow = "hidden";
          this.loadAssets();
          this.props.liveNotificationOpen(true);
        }, 100);
      });
    } else {
      this.openSocket();
      document.body.style.overflow = "hidden";
      this.loadAssets();
      this.props.liveNotificationOpen(true);
      if (
        document.getElementById("basic-nav-dropdown-account")
          .nextElementSibling &&
        document
          .getElementById("basic-nav-dropdown-account")
          .nextElementSibling.className.includes("show")
      ) {
        document
          .getElementById("basic-nav-dropdown-account")
          .nextElementSibling.classList.remove("show");
      }
      if (
        document.getElementById("basic-nav-dropdown-account-tablet")
          .nextElementSibling &&
        document
          .getElementById("basic-nav-dropdown-account-tablet")
          .nextElementSibling.className.includes("show")
      ) {
        document
          .getElementById("basic-nav-dropdown-account-tablet")
          .nextElementSibling.classList.remove("show");
      }
      if (
        document.getElementById("basic-nav-dropdown-account-mobile")
          .nextElementSibling &&
        document
          .getElementById("basic-nav-dropdown-account-mobile")
          .nextElementSibling.className.includes("show")
      ) {
        document
          .getElementById("basic-nav-dropdown-account-mobile")
          .nextElementSibling.classList.remove("show");
      }
    }
  };
  handleScroll = (event) => {
    let scrollTop = event.srcElement.body.scrollTop,
      itemTranslate = Math.min(0, scrollTop / 3 - 125);
    this.setState({
      isVisible: itemTranslate,
    });
  };

  openSocket = () => {
    const { socket } = this.props;
    if (socket && socket.on) {
      socket.on(SOCKET.ON_ASSET_CHANGE, ({ asset }) => {
        const { activeTab } = this.state;
        if (activeTab === "watchlist") {
          const { watchingAssets } = this.state;
          const { loggedInUser } = this.props;
          const cloned = _cloneDeep(watchingAssets);
          const accountId = _get(loggedInUser, "accountId");

          const item = cloned.find((i) => i.assetId === asset.assetId);
          cloned.forEach((j) => {
            if (j.auctionData.auctionId === asset.auctionId) {
              j.termsAgreed = true;
            }
          });
          if (item) {
            item.accountId = asset.accountId;
            item.highestBidder = asset.accountId === accountId;
            item.currentBidAmount = asset.currentBidAmount;
            item.datetimeClose = asset.datetimeClose;
            item.isExtended = asset.isExtended;
            this.setState({
              watchingAssets: cloned,
              highlightAsset: asset.assetId,
            });
            setTimeout(() => {
              this.setState({ highlightAsset: null });
            }, 3000);
          }
        } else if (activeTab === "activelist") {
          const { highestBids, outBidAssets } = this.state;
          const { loggedInUser } = this.props;
          const accountId = _get(loggedInUser, "accountId");
          let clonedOutBid = _cloneDeep(outBidAssets);
          let clonedHighBids = _cloneDeep(highestBids);
          clonedOutBid.forEach((j) => {
            if (j.auctionData.auctionId === asset.auctionId) {
              j.termsAgreed = true;
            }
          });
          clonedHighBids.forEach((ele) => {
            if (ele.auctionData.auctionId === asset.auctionId) {
              ele.termsAgreed = true;
            }
          });
          if (asset.accountId === accountId) {
            const item = clonedOutBid.find((i) => i.assetId === asset.assetId);
            if (item) {
              item.accountId = asset.accountId;
              item.highestBidder = asset.accountId === accountId;
              item.currentBidAmount = asset.currentBidAmount;
              item.datetimeClose = asset.datetimeClose;
              item.isExtended = asset.isExtended;
              clonedHighBids.push(item);
              clonedOutBid = clonedOutBid.filter(
                (element) => element.assetId !== asset.assetId
              );
              this.setState({
                highestBids: clonedHighBids,
                outBidAssets: clonedOutBid,
                highlightAsset: asset.assetId,
              });
              setTimeout(() => {
                this.setState({ highlightAsset: null });
              }, 3000);
            }
          } else {
            const item = clonedHighBids.find(
              (i) => i.assetId === asset.assetId
            );
            if (item) {
              item.accountId = asset.accountId;
              item.highestBidder = asset.accountId === accountId;
              item.currentBidAmount = asset.currentBidAmount;
              item.datetimeClose = asset.datetimeClose;
              item.isExtended = asset.isExtended;
              clonedOutBid.push(item);
              clonedHighBids = clonedHighBids.filter(
                (element) => element.assetId !== asset.assetId
              );
              this.setState({
                highestBids: clonedHighBids,
                outBidAssets: clonedOutBid,
                highlightAsset: asset.assetId,
              });
              setTimeout(() => {
                this.setState({ highlightAsset: null });
              }, 3000);
            }
          }
        }
      });
    }
  };

  openLiveNotificationChannel() {
    const { loggedInUser, socket } = this.props;
    if (socket && socket.on) {
      socket.on(
        `${SOCKET.LIVE_NOTIFICATION}${loggedInUser.accountId}`,
        (res) => {
          this.setState({ notificationCount: res.updatedNotificationCount });
          sessionStorage.setItem("notification", res.updatedNotificationCount);
          if (
            this.state.activeTab === "activelist" &&
            this.props.isLivePanelOpen
          ) {
            this.getActiveBids();
          } else if (
            this.state.activeTab === "watchlist" &&
            this.props.isLivePanelOpen
          ) {
            this.getWatchAsset();
          }
        }
      );
    }
    this.openSocket();
  }

  getActiveBids(asset) {
    this.props.setLoading(true);
    this.setState({ highestBids: [] });
    this.getOutBidAssets();
    this.props
      .getUserActiveAsset({
        offset: 0,
        limit: 6,
        sort: "datetimeClose",
        direction: "asc",
        currentSection: "USER_PANEL",
      })
      .then((res) => {
        // const tempHighestBids = [];
        // const tempOutbids = [];
        if (res.result && res.result.length) {
          // res.result.forEach((item) => {
          //   if (item.highestBidder) {
          //     tempHighestBids.push(item);
          //   } else {
          //     tempOutbids.push(item);
          //   }
          // });
          this.setState({
            highestBids: res.result,
            highlightAsset: asset?.assetId,
          });
          this.props
            .getResetAllNotifications({
              types: ["activeBidsCount", "outbidCount", "notificationCount"],
            })
            .then((res) => {
              this.setState({ notificationCount: res.result });
              sessionStorage.setItem(
                "notification",
                res.result.notificationCount
              );
            });
        } else {
          this.setState({
            loadingMessage: "No asset found with highest bidder",
          });
        }
        this.props.setLoading(false);
      })
      .catch((err) => {
        this.props.setLoading(false);
      });
  }

  getOutBidAssets = () => {
    this.props.setLoading(true);
    this.setState({ outBidAssets: [] });
    this.props
      .getUserPanelOutbiddenAsset({
        offset: 0,
        limit: 6,
        sort: "datetimeClose",
        direction: "asc",
        currentSection: "USER_PANEL",
      })
      .then((res) => {
        if (res.result && res.result.length) {
          this.setState({ outBidAssets: res.result });
        } else {
          this.setState({ loadingMessage: "No asset found" });
        }
      })
      .catch((err) => {
        this.props.setLoading(false);
        this.props.showMessage({ message: err.message, type: "error" });
      });
  };
  getWatchAsset = () => {
    this.props.setLoading(true);
    this.setState({ watchingAssets: [] });
    this.props
      .getUserPanelWatchingAsset({
        offset: 0,
        limit: 6,
        sort: "datetimeClose",
        direction: "asc",
        currentSection: "USER_PANEL",
      })
      .then((res) => {
        this.setState({ watchingAssets: res.result });
        if (res.result.length === 0) {
          this.setState({
            loadingMessage: "You have not added any asset to watchlist",
          });
        }
        this.props
          .getResetAllNotifications({
            types: ["watchlistCount", "notificationCount"],
          })
          .then((res) => {
            this.setState({ notificationCount: res.result });
          });
        this.props.setLoading(false);
        setTimeout(() => {
          this.setState({ highlightAsset: null });
        }, 3000);
      })
      .catch((err) => {
        this.props.setLoading(false);
      });
  };

  getAllNotifications() {
    this.props.getAllNotifications().then((res) => {
      this.setState({ notificationCount: res.result ? res.result : 0 });
      return res.result;
    });
  }

  loadAssets = () => {
    this.clearNotification(this.state.resetTypes, "watchlist");
  };

  clearNotification = (types, tabType, e) => {
    this.setState({ resetTypes: types, activeTab: tabType });
    if (tabType === "activelist") {
      this.getActiveBids();
      this.setState({ watchingAssets: [] });
    } else if (tabType === "watchlist") {
      this.getWatchAsset();
      this.setState({ activeBids: [] });
    } else if (tabType === "savedSearch") {
    } else if (tabType === "NotifyItem") {
      this.props
        .getResetAllNotifications({
          types: ["notifiedItems", "notificationCount"],
        })
        .then((res) => {
          this.setState({ notificationCount: res.result });
          sessionStorage.setItem("notification", res.result.notificationCount);
        });
    }
    this.showDetailHandler(null);
  };

  handleScrollConflicts = () => {
    const { socket } = this.props;
    document.body.style.overflow = "";
    let tabName = [];
    this.props.liveNotificationOpen(false);
    tabName = this.getNotificationName(this.state.activeTab);
    this.props.getResetAllNotifications({ types: tabName }).then((res) => {
      this.setState({ notificationCount: res.result });
      this.props.onChangeCount(res.result);
    });
    // socket.off(SOCKET.ON_ASSET_CHANGE);
    this.setState({ activeTab: null });
  };

  getNotificationName = (activeTab) => {
    switch (activeTab) {
      case "watchlist":
        return ["watchlistCount", "notificationCount"];
      case "activelist":
        return ["activeBidsCount", "outbidCount", "notificationCount"];
      case "savedSearch":
        return ["savedSearchCount", "notificationCount"];
      case "NotifyItem":
        return ["notifiedItems", "notificationCount"];
      default:
        return ["watchlistCount", "notificationCount"];
    }
  };

  navigateToMyaccount = (tabNme) => {
    this.handleScrollConflicts();
    this.props.history.push(`/my-account/${tabNme}`);
  };

  render() {
    const {
      isLoggedIn,
      loggedInUser,
      showMessage,
      isLivePanelOpen,
      setLoading,
      toggleLogin,
    } = this.props;
    const {
      isVisible,
      watchingAssets,
      highestBids,
      outBidAssets,
      notificationCount,
      highlightAsset,
      liveComponent,
      isLiveWatchlist,
      activeTab,
      savedSearchApiCall,
      showDetails,
      loadingMessage,
    } = this.state;
    return (
      <SlidingPane
        className={` ${isVisible ? "less-margin" : "more-margin"}`}
        overlayClassName="some-custom-overlay-class"
        isOpen={isLivePanelOpen}
        title={
          <div className="slideHead-title">
            Live Bidding Panel
            <button className="live-btn">
              <span className="circle"></span>Live
            </button>
          </div>
        }
        from="left"
        onRequestClose={this.handleScrollConflicts}
      >
        {isLivePanelOpen && (
          <Tabs>
            <Tab
              eventKey="watchlist"
              title={
                <div
                  className="watchlist-tab-title"
                  onClick={(e) =>
                    this.clearNotification(
                      ["watchlistCount", "notificationCount"],
                      "watchlist",
                      e
                    )
                  }
                >
                  Watchlist{" "}
                  {notificationCount.watchlistCount > 99 ? (
                    <span className="count-circle">"99+"</span>
                  ) : (
                    notificationCount.watchlistCount > 0 &&
                    notificationCount.watchlistCount < 99 && (
                      <>
                        <span className="count-circle">
                          {notificationCount.watchlistCount}
                        </span>{" "}
                      </>
                    )
                  )}{" "}
                  <SvgComponent path="star_white_24dp" />
                </div>
              }
            >
              <div className="live-tab-content live-notifications-panel">
                <div className="pre-text">
                  Your Favourites / Watchlist items where the auction has begun.{" "}
                  <span
                    className="navigation-link"
                    onClick={(e) => this.navigateToMyaccount("watchlist")}
                  >
                    {" "}
                    View more
                  </span>
                </div>
                <div className="cards-block">
                  {watchingAssets.length === 0 ? (
                    <NoResults message={loadingMessage} />
                  ) : (
                    <>
                      {watchingAssets.map((watchingAsset, index) => (
                        <div
                          key={index}
                          className={`card-block ${
                            watchingAsset.assetId ===
                              showDetails?.asset?.assetId ||
                            !showDetails?.asset?.assetId
                              ? ""
                              : "card-overlay"
                          }`}
                        >
                          <div className="auction-title">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {watchingAsset.auctionData?.auctionName}
                                </Tooltip>
                              }
                            >
                              <>
                                <div
                                  className={
                                    isInRoom(
                                      watchingAsset.auctionData?.auctionType
                                        ?.name
                                    )
                                      ? "card-labels w-adjust"
                                      : "card-labels"
                                  }
                                >
                                  {watchingAsset.auctionData?.auctionName}{" "}
                                </div>
                                {isInRoom(
                                  watchingAsset.auctionData?.auctionType?.name
                                ) && (
                                  <button className="live-btn">
                                    <span className="circle"></span>Bidding
                                    Console
                                  </button>
                                )}
                              </>
                            </OverlayTrigger>
                          </div>

                          <CommonCards
                            isLoggedIn={isLoggedIn}
                            toggleLogin={toggleLogin}
                            isLiveWatchlist={isLiveWatchlist}
                            highlightAsset={highlightAsset}
                            handleScrollConflicts={this.handleScrollConflicts}
                            liveComponent={liveComponent}
                            assetInfo={watchingAsset}
                            showMessage={showMessage}
                            loggedInUser={loggedInUser}
                            showDetailHandler={this.showDetailHandler}
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </Tab>
            <Tab
              eventKey="activeBids"
              className="activeBids-tab"
              title={
                <div
                  className="activeBids-tab-title"
                  onClick={(e) =>
                    this.clearNotification(
                      ["activeBidsCount", "outbidCount", "notificationCount"],
                      "activelist",
                      e
                    )
                  }
                >
                  {/* TODO */}
                  Active Bids{" "}
                  {notificationCount.activeBidsCount +
                    notificationCount.outbidCount >
                  99 ? (
                    <span className="count-circle">"99+"</span>
                  ) : (
                    notificationCount.activeBidsCount +
                      notificationCount.outbidCount >
                      0 &&
                    notificationCount.activeBidsCount +
                      notificationCount.outbidCount <
                      99 && (
                      <>
                        <span className="count-circle">
                          {notificationCount.activeBidsCount +
                            notificationCount.outbidCount}
                        </span>{" "}
                      </>
                    )
                  )}{" "}
                  <SvgComponent path="cast_white_24dp" />
                </div>
              }
            >
              <div
                className="live-tab-content live-notifications-panel"
                id="live-tab-content"
              >
                <div className="pre-text">
                  Assets you have bid on where the live auction has begun.{" "}
                </div>
                <div className="highest-bidder-header">
                  {" "}
                  <span className="gavel-icon">
                    {" "}
                    <SvgComponent path="gavel_white_24dp" />
                  </span>{" "}
                  Highest Bidder{" "}
                  <span
                    className="navigation-link"
                    onClick={(e) => this.navigateToMyaccount("active-bid")}
                  >
                    {" "}
                    View more
                  </span>
                </div>
                <div className="cards-block">
                  {highestBids.length === 0 ? (
                    <NoResults message={loadingMessage} />
                  ) : (
                    <>
                      {highestBids.map((highestBid, index) => (
                        <div
                          key={index}
                          className={`card-block ${
                            highestBid.assetId ===
                              showDetails?.asset?.assetId ||
                            !showDetails?.asset?.assetId
                              ? ""
                              : "card-overlay"
                          }`}
                        >
                          <div className="auction-title">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {highestBid.auctionData?.auctionName}
                                </Tooltip>
                              }
                            >
                              <div className="card-labels">
                                {highestBid.auctionData?.auctionName}{" "}
                              </div>
                            </OverlayTrigger>
                          </div>
                          <CommonCards
                            isLiveWatchlist={false}
                            assetInfo={highestBid}
                            liveComponent={liveComponent}
                            handleScrollConflicts={this.handleScrollConflicts}
                            highlightAsset={highlightAsset}
                            showMessage={showMessage}
                            loggedInUser={loggedInUser}
                            showDetailHandler={this.showDetailHandler}
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="highest-bidder-header">
                  {" "}
                  <span className="trending-down-icon">
                    {" "}
                    <SvgComponent path="trending-down" />
                  </span>{" "}
                  Outbid{" "}
                  <span
                    className="navigation-link"
                    onClick={(e) => this.navigateToMyaccount("active-bid")}
                  >
                    {" "}
                    View more
                  </span>
                </div>
                <div className="cards-block">
                  {outBidAssets.length === 0 ? (
                    <NoResults message={loadingMessage} />
                  ) : (
                    <>
                      {outBidAssets.map((outBid, index) => (
                        <div
                          key={index}
                          className={`card-block ${
                            outBid.assetId === showDetails?.asset?.assetId ||
                            !showDetails?.asset?.assetId
                              ? ""
                              : "card-overlay"
                          }`}
                        >
                          <div className="auction-title">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {outBid.auctionData?.auctionName}
                                </Tooltip>
                              }
                            >
                              <div className="card-labels">
                                {outBid.auctionData?.auctionName}
                              </div>
                            </OverlayTrigger>
                          </div>
                          <CommonCards
                            isLiveWatchlist={false}
                            assetInfo={outBid}
                            liveComponent={liveComponent}
                            handleScrollConflicts={this.handleScrollConflicts}
                            highlightAsset={highlightAsset}
                            showMessage={showMessage}
                            loggedInUser={loggedInUser}
                            showDetailHandler={this.showDetailHandler}
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </Tab>
            <Tab
              eventKey="savedSearch"
              title={
                <div
                  className="saved-search-tab-title"
                  onClick={(e) =>
                    this.clearNotification(
                      ["savedSearchCount", "notificationCount"],
                      "savedSearch",
                      e
                    )
                  }
                >
                  Saved search{" "}
                  {notificationCount.savedSearchCount > 99 ? (
                    <span className="count-circle">"99+"</span>
                  ) : (
                    notificationCount.savedSearchCount > 0 &&
                    notificationCount.savedSearchCount < 99 && (
                      <>
                        <span className="count-circle">
                          {notificationCount.savedSearchCount}
                        </span>{" "}
                      </>
                    )
                  )}
                </div>
              }
            >
              <div className="live-tab-content live-notifications-panel">
                {activeTab === "savedSearch" && (
                  <SavedSearches
                    socket={this.props.socket}
                    loggedInUser={loggedInUser}
                    savedSearchApiCall={savedSearchApiCall}
                    activeTab={activeTab}
                    liveComponent={liveComponent}
                    showMessage={showMessage}
                    setLoading={setLoading}
                    liveNotification={true}
                    handleScrollConflicts={this.handleScrollConflicts}
                  />
                )}
              </div>
            </Tab>
            <Tab
              eventKey="NotifyItem"
              title={
                <div
                  className="notify-items"
                  onClick={(e) =>
                    this.clearNotification(
                      ["notifiedItems", "notificationCount"],
                      "NotifyItem",
                      e
                    )
                  }
                >
                  Notified items{" "}
                  {notificationCount.notifiedItems > 99 ? (
                    <span className="count-circle">"99+"</span>
                  ) : (
                    notificationCount.notifiedItems > 0 &&
                    notificationCount.notifiedItems < 99 && (
                      <>
                        <span className="count-circle">
                          {notificationCount.notifiedItems}
                        </span>{" "}
                      </>
                    )
                  )}
                </div>
              }
            >
              <div className="live-tab-content live-notifications-panel">
                {activeTab === "NotifyItem" && (
                  <NotifiedTab
                    socket={this.props.socket}
                    loggedInUser={loggedInUser}
                    showMessage={showMessage}
                    setLoading={setLoading}
                    liveComponent={liveComponent}
                    showDetailHandler={this.showDetailHandler}
                    handleScrollConflicts={this.handleScrollConflicts}
                  />
                )}
              </div>
            </Tab>
          </Tabs>
        )}
      </SlidingPane>
    );
  }
}
export default withRouter(LiveNotifications);
