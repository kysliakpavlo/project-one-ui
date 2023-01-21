import React, { lazy } from "react";
import _get from "lodash/get";
import _cloneDeep from "lodash/cloneDeep";
import socketIOClient from "socket.io-client";
import { preventEvent, screenWidth } from "../../../utils/helpers";
import { SOCKET, API_PATH } from "../../../utils/constants";

import "./LiveNotifications.scss";

const LiveNotificationsPanel = lazy(() => import("./LiveNotificationsPanel"));

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
    openLiveNotifications: false,
    notificationCount: sessionStorage.getItem("notification")
      ? sessionStorage.getItem("notification")
      : 0,
  };

  componentDidMount() {
    // initSocket();
    const { isLoggedIn } = this.props;
    if (isLoggedIn) {
      setTimeout(() => {
        this.openLiveNotificationChannel();
        this.getAllNotifications();
      }, 1000);
    }
  }

  componentDidUpdate(prevProps) {
    const { isLoggedIn, isLivePanelOpen } = this.props;
    if (
      prevProps.notificationsUpdate !== this.props.notificationsUpdate &&
      isLoggedIn
    ) {
      this.setState({ notificationCount: this.props.notificationsUpdate });
      this.openLiveNotificationChannel();
    }
    if (prevProps.isLoggedIn !== isLoggedIn && isLivePanelOpen) {
      if (isLoggedIn) {
        this.getAllNotifications();
        this.openLiveNotificationChannel();
      } else {
        this.setState({ notificationCount: 0 });
      }
    }
  }
  onClickLive = (e) => {
    preventEvent(e);
    const { isLoggedIn } = this.props;

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!isLoggedIn) {
      this.props.toggleLogin(true, () => {
        setTimeout(() => {
          document.body.style.overflow = "hidden";
          this.props.liveNotificationOpen(true);
        }, 100);
      });
    } else {
      document.body.style.overflow = "hidden";
      this.props.liveNotificationOpen(true);
    }
  };

  openLiveNotificationChannel() {
    const { loggedInUser, socket } = this.props;
    if (socket && socket.on) {
      socket.off(SOCKET.LIVE_NOTIFICATION);
      socket.on(
        `${SOCKET.LIVE_NOTIFICATION}${loggedInUser.accountId}`,
        (res) => {
          this.setState({ notificationCount: res.updatedNotificationCount });
          sessionStorage.setItem("notification", res.updatedNotificationCount);
        }
      );
    }
  }

  onChangeNotificationCount = (notificationCount) => {
    this.setState({ notificationCount });
  };

  getAllNotifications() {
    this.props.getAllNotifications().then((res) => {
      this.setState({ notificationCount: res.result ? res.result : 0 });
      return res.result;
    });
  }
  render() {
    const { isLoggedIn, isLivePanelOpen } = this.props;
    const { notificationCount } = this.state;
    return (
      <div className="live-notifications">
        <button onClick={this.onClickLive} className="btn-LiveNotify">
          <span className="span-notify">
            {isLoggedIn
              ? notificationCount?.notificationCount
                ? parseInt(notificationCount.notificationCount) > 99
                  ? "99+"
                  : notificationCount.notificationCount
                : 0
              : 0}
          </span>
          <div className="divLive">{(screenWidth() !== "sm") ? `Live Bidding` : `Live`}</div>
        </button>
        {isLivePanelOpen ? (
          <LiveNotificationsPanel
            onChangeCount={this.onChangeNotificationCount}
            socket={this.props.socket}
          />
        ) : null}
      </div>
    );
  }
}
export default LiveNotifications;
