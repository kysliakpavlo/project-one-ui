import React, { Component } from "react";
import { withRouter } from "react-router";
import { toUrlString } from "../../../utils/helpers";
import { SOCKET, ASSET_LIST_TYPE } from "../../../utils/constants";
import "./PaymentHistory.scss";
import _get from "lodash/get";
import CommonCards from "../CommonCards";
import CommonTable from "../CommonTable";
import _cloneDeep from "lodash/cloneDeep";
import { screenWidth } from "../../../utils/helpers";
import NoResults from "../../common/NoResults";
import Pagination from "../Pagination";
import AssetCards from "../AssetCards";
import CommonLargeCards from "../CommonLargeCards";

let sortByOptions = [
  { key: "lotNo", label: "Lot No" },
  { key: "myHighestBid/asc", label: "Price -- Low to High" },
  { key: "myHighestBid/desc", label: "Price -- High to Low" },
  { key: "createdDate/desc", label: "Recently Added" },
];

const pageSizeOptions = [
  { key: 12, label: "12" },
  { key: 36, label: "36" },
  { key: 60, label: "60" },
  { key: 96, label: "96" },
];
class PaymentHistory extends Component {
  state = {
    paidAssetItems: [],
    sortPaging: { sortBy: "lotNo", pageSize: 12, activePage: 0 },
    totalRecord: 0,
    paymentHistoryPage: true,
    loadingMessage: "Loading...",
  };
  componentDidMount() {
    if (!this.props.isLoggedIn) {
      this.props.history.push("/");
    } else {
      this.getPaidAssetItems(this.state.sortPaging);
      this.openSocket();
    }
  }
  getPaidAssetItems = (sortPaging) => {
    this.props.setLoading(true);
    const { sortBy, pageSize, activePage } = sortPaging;
    const offset = activePage * pageSize;
    const [sort, direction = "desc"] = sortBy.split("/");
    this.props
      .getPaidItems({
        limit: pageSize,
        offset,
        sort,
        direction,
        currentSection: "MY_ACCOUNT",
      })
      .then((res) => {
        this.setState({
          paidAssetItems: res.result,
          sortPaging,
          totalRecord: res.totalRecords,
        });
        this.props.setLoading(false);
        res.result.length === 0 &&
          this.setState({ loadingMessage: "No asset found" });
      })
      .catch((err) => {
        this.props.setLoading(false);
      });
  };
  openSocket = () => {
    const { socket } = this.props;
    if (socket && socket.on) {
      socket.on(SOCKET.ON_ASSET_CHANGE, ({ asset }) => {
        const { paidAssetItems } = this.state;
        const { loggedInUser } = this.props;
        const cloned = _cloneDeep(paidAssetItems);
        const accountId = _get(loggedInUser, "accountId");

        const item = cloned.find((i) => i.assetId === asset.assetId);
        cloned.forEach((j) => {
          if (j.auctionData.auctionId === asset.auctionId) {
            j.termsAgreed = true;
          }
        });
        if (item) {
          this.props
            .getListAssetDetail({
              assetId: asset.assetId,
              auctionId: asset.auctionId,
            })
            .then((res) => {
              item.accountId = res.result.accountId;
              item.highestBidder = asset.accountId === accountId;
              item.currentBidAmount = res.result.currentBidAmount;
              item.datetimeClose = res.result.datetimeClose;
              item.isExtended = res.result.isExtended;
              item.totalBidsPlaced = asset.totalBidsAsset;
              item.myHighestBid = res.result.myHighestBid;
              item.calculatedTotal = "";
              item.enteredAmt = "";
              item.creditCardFee = "";
              item.calPremiumAmt = "";
              item.premiumPercent = "";
              this.setState({
                paidAssetItems: cloned,
                highlightAsset: asset.assetId,
              });
              setTimeout(() => {
                this.setState({ highlightAsset: null });
              }, 3000);
            })
            .catch((err) => {
              this.props.showMessage({ message: err.message, type: "error" });
            });
        }
      });
    }
  };

  closeSocket = () => {
    const { socket } = this.props;
    socket.off(SOCKET.ON_ASSET_CHANGE);
  };
  onPaginationChange = (data) => {
    this.setState({ paidAssetItems: [] });
    this.getPaidAssetItems(data);
  };
  render() {
    const {
      showMessage,
      setLoading,
      activeView,
      loggedInUser,
      socket,
      toggleLogin,
      isLoggedIn,
    } = this.props;
    const {
      paidAssetItems,
      sortPaging,
      totalRecord,
      paymentHistoryPage,
      loadingMessage,
    } = this.state;
    const { sortBy, pageSize, activePage } = sortPaging;

    const sortPageViewSection = (
      <div className="sort-block">
        <Pagination
          total={totalRecord}
          pageSize={pageSize}
          active={activePage}
          sortBy={sortBy}
          onChange={this.onPaginationChange}
          sortByOptions={sortByOptions}
          pageSizeOptions={pageSizeOptions}
        />
      </div>
    );
    return (
      <div className="payment-history">
        {paidAssetItems.length !== 0 && sortPageViewSection}
        {paidAssetItems.length === 0 ? (
          <NoResults message={loadingMessage} />
        ) : (
          <>
            <div
              className={
                screenWidth() === "md" && activeView !== "grid"
                  ? "large-cards-block"
                  : "cards-block"
              }
            >
              {activeView === "grid" ? (
                <>
                  {paidAssetItems.map((paidAsset, index) => (
                    <CommonCards
                      key={index}
                      paymentHistoryPage={paymentHistoryPage}
                      openSocket={this.openSocket}
                      assetInfo={paidAsset}
                      loggedInUser={loggedInUser}
                      toggleLogin={toggleLogin}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}{" "}
                </>
              ) : screenWidth() === "md" ? (
                <>
                  {paidAssetItems.map((paidAsset, index) => (
                    <CommonLargeCards
                      key={index}
                      paymentHistoryPage={paymentHistoryPage}
                      openSocket={this.openSocket}
                      assetInfo={paidAsset}
                      loggedInUser={loggedInUser}
                      toggleLogin={toggleLogin}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
                </>
              ) : (
                <>
                  <CommonTable
                    sortBy={sortBy}
                    onSortClick={this.onPaginationChange}
                    openSocket={this.openSocket}
                    paymentHistoryPage={paymentHistoryPage}
                    assetList={paidAssetItems}
                    showMessage={this.props.showMessage}
                    loggedInUser={loggedInUser}
                    toggleLogin={toggleLogin}
                    isLoggedIn={isLoggedIn}
                  />
                </>
              )}
            </div>
            {activeView === "grid" && window.screen.width < 767 && (
              <div className="cards-block-mobile">
                <AssetCards
                  loggedInUser={loggedInUser}
                  socket={socket}
                  toggleLogin={toggleLogin}
                  items={paidAssetItems}
                  showMessage={showMessage}
                  total={paidAssetItems.totalRecords}
                  sortPaging={sortPaging}
                  history={this.props.history}
                  paymentHistoryPage={paymentHistoryPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}
export default withRouter(PaymentHistory);
