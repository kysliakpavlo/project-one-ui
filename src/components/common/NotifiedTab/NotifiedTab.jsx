import React from "react";
import _get from "lodash/get";
import _cloneDeep from "lodash/cloneDeep";
import AuctionCard from "../AuctionCard";
import CommonCards from "../CommonCards";
import { SOCKET } from "../../../utils/constants";
import NoResults from "../NoResults";
import "./NotifiedTab.scss";

class NotifiedTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortPaging: { sortBy: "datetimeClose/asc", pageSize: 6, activePage: 0 },
      NotifiedAssets: [],
      NotifiedAuction: [],
      highlightAsset: null,
      loadingMessageAsset: "Loading...",
      loadingMessageAuction: "Loading...",
    };
  }
  componentDidMount() {
    this.props.setLoading(true);
    this.getNotifiedItems();
    this.openSocket();
    this.openLiveNotificationChannel();
  }
  componentWillUnmount() {
    this.closeSocket();
  }
  getNotifiedItems = () => {
    this.props
      .getNotifiedAssets(this.state.sortPaging)
      .then((response) => {
        this.setState({ NotifiedAssets: response.result });
        this.props.setLoading(false);
        response.result.length === 0 &&
          this.setState({ loadingMessageAsset: "No asset notified" });
      })
      .catch((err) => {
        this.props.showMessage({ message: err.message, type: "error" });
        this.props.setLoading(false);
      });
    this.props
      .getNotifiedAuctions(this.state.sortPaging)
      .then((response) => {
        this.setState({ NotifiedAuctions: response.result });
        this.props.setLoading(false);
        response.result.length === 0 &&
          this.setState({ loadingMessageAuction: "No Auction notified" });
      })
      .catch((err) => {
        this.props.showMessage({ message: err.message, type: "error" });
        this.props.setLoading(false);
      });
  };
  openSocket = () => {
    const { socket } = this.props;
    if (socket && socket.on) {
      socket.on(SOCKET.ON_ASSET_CHANGE, ({ asset }) => {
        const { loggedInUser } = this.props;
        const { NotifiedAssets } = this.state;
        const cloned = _cloneDeep(NotifiedAssets);
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
            NotifiedAssets: cloned,
            highlightAsset: asset.assetId,
          });
          setTimeout(() => {
            this.setState({ highlightAsset: null });
          }, 3000);
        }
      });
    }
  };
  openLiveNotificationChannel() {
    const { socket, loggedInUser } = this.props;
    if (socket && socket.on) {
      socket.on(
        `${SOCKET.LIVE_NOTIFICATION}${loggedInUser.accountId}`,
        (res) => {
          this.getNotifiedItems();
        }
      );
    }
  }
  closeSocket = () => {
    const { socket } = this.props;
    socket.off(SOCKET.ON_ASSET_CHANGE);
  };
  render() {
    const {
      showMessage,
      toggleLogin,
      isLoggedIn,
      liveComponent,
      handleScrollConflicts,
      showDetailHandler,
    } = this.props;
    const {
      NotifiedAssets,
      NotifiedAuctions,
      highlightAsset,
      loadingMessageAsset,
      loadingMessageAuction,
    } = this.state;
    return (
      <div className="notified-asset-layout">
        <section>
          <header className="notified-header"> Assets </header>
          <div className="notified-asset">
            {NotifiedAssets?.length === 0 ? (
              <NoResults message={loadingMessageAsset} />
            ) : (
              <>
                {NotifiedAssets.map((notifyAsset) => (
                  <CommonCards
                    assetInfo={notifyAsset}
                    showMessage={showMessage}
                    highlightAsset={highlightAsset}
                    liveComponent={liveComponent}
                    handleScrollConflicts={handleScrollConflicts}
                    showDetailHandler={showDetailHandler}
                    key={notifyAsset.assetId}
                  />
                ))}
              </>
            )}
          </div>
        </section>
        <section>
          <header className="notified-header"> Auctions </header>

          <div className="notified-auction">
            {NotifiedAuctions?.length === 0 ? (
              <NoResults message={loadingMessageAuction} />
            ) : (
              <>
                {NotifiedAuctions &&
                  NotifiedAuctions.map((notifyAuction) => (
                    <AuctionCard
                      auction={notifyAuction}
                      isLoggedIn={isLoggedIn}
                      toggleLogin={toggleLogin}
                      showMessage={showMessage}
                      liveComponent={liveComponent}
                      handleScrollConflicts={handleScrollConflicts}
                      key={notifyAuction.auctionId}
                    />
                  ))}
              </>
            )}
          </div>
        </section>
      </div>
    );
  }
}
export default NotifiedTab;
