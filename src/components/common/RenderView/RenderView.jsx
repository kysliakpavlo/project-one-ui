import React, { lazy, Suspense } from "react";
import { SavedSearches } from "../Preferences";
const ActiveBids = lazy(() => import("../../common/ActiveBids"));
const AuctionWonItems = lazy(() => import("../../common/AuctionWonItems"));
const WatchedItems = lazy(() => import("../../common/WatchedItems"));
const PaymentHistory = lazy(() => import("../../common/PaymentHistory"));
const ProfileView = lazy(() => import("../../views/ProfileView"));
const ReferredItems = lazy(() => import("../../common/ReferredItems"));
const RecentlyViewedView = lazy(() => import("../../views/RecentlyViewedView"));
const MarketingPreferencesView = lazy(() =>
  import("../../views/MarketingPreferencesView")
);

class RenderView extends React.Component {
  state = {
    renderView: "",
    socket: null,
    highlightAsset: null,
    activeView: null,
    setLoading: false,
    showMessage: null,
  };

  render() {
    const {
      renderView,
      socket,
      highlightAsset,
      activeView,
      setLoading,
      showMessage,
      history,
      isLivePanelOpen,
    } = this.props;
    switch (renderView) {
      case "active-bid":
        return (
          <Suspense>
            <ActiveBids
              socket={socket}
              highlightAsset={highlightAsset}
              activeView={activeView}
            />
          </Suspense>
        );
      case "watchlist":
        return (
          <Suspense>
            <WatchedItems
              socket={socket}
              setLoading={setLoading}
              activeView={activeView}
              watchedItemPage={true}
            />
          </Suspense>
        );
      case "recently-viewed":
        return (
          <Suspense>
            <RecentlyViewedView
              socket={socket}
              setLoading={setLoading}
              activeView={activeView}
            />
          </Suspense>
        );
      case "items-won":
        return (
          <Suspense>
            <AuctionWonItems
              setLoading={setLoading}
              showMessage={showMessage}
              activeView={activeView}
            />
          </Suspense>
        );
      case "referred-assets":
        return (
          <Suspense>
            <ReferredItems
              setLoading={setLoading}
              socket={socket}
              activeView={activeView}
            />
          </Suspense>
        );
      case "payment-history":
        return (
          <Suspense>
            <PaymentHistory
              activeView={activeView}
              history={history}
              setLoading={setLoading}
            />
          </Suspense>
        );
      case "profile":
        return (
          <Suspense>
            <ProfileView socket={socket} setLoading={setLoading} />
          </Suspense>
        );
      case "preferences":
        return (
          <Suspense>
            <MarketingPreferencesView setLoading={setLoading} />
          </Suspense>
        );
      case "saved-searches":
        return (
          <Suspense>
            {!isLivePanelOpen && (
              <SavedSearches
                showMessage={showMessage}
                setLoading={setLoading}
              />
            )}
          </Suspense>
        );
      default:
        return (
          <Suspense>
            <ActiveBids
              socket={socket}
              highlightAsset={highlightAsset}
              activeView={activeView}
            />
          </Suspense>
        );
    }
  }
}
export default RenderView;
