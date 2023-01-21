import React, { useEffect, useRef } from "react";
import dayjs from "dayjs";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import SvgComponent from "../SvgComponent";
import Visible from "../Visible";
import "./BiddingLogs.scss";

const BiddingLogs = ({
  logs,
  isAdmin = false,
  accountId,
  onScrollToEnd,
  loggedInUser,
}) => {
  const biddingLogRef = useRef(null);

  // useEffect(() => {
  //     scrollToMyRef();
  // }, [logs]);

  useEffect(() => {
    biddingLogRef.current?.addEventListener("scroll", loadMore);
    return () => {
      biddingLogRef.current?.removeEventListener("scroll", loadMore);
    };
  }, []);

  const loadMore = () => {
    const scrolled =
      biddingLogRef.current.scrollLeft + biddingLogRef.current.clientWidth;
    const scroll = biddingLogRef.current.scrollWidth;

    if (scrolled >= scroll - 1.5) {
      onScrollToEnd();
    }
  };

  // const scrollToMyRef = () => {
  //     const scroll = biddingLogRef.current.scrollHeight - biddingLogRef.current.clientHeight;
  //     biddingLogRef.current.scrollTo(0, scroll);
  // };

  return (
    <div className="bidding-logs" ref={biddingLogRef}>
      {Array.isArray(logs) &&
        logs.map((log, index) => {
          if (
            log.isBiddingLog &&
            log.type !== "adminMsg" &&
            log.type !== "AdminAction" &&
            log.type !== "changeBidInc"
          ) {
            return (
              <div key={index} className="log-container">
                <Visible when={isAdmin && log.bidderType !== "Room Bidder"}>
                  <div className="bid-type">{`${
                    log?.biddingLogAccount?.firstName
                      ? log?.biddingLogAccount.firstName
                      : " "
                  } ${
                    log?.biddingLogAccount?.lastName
                      ? log?.biddingLogAccount.lastName
                      : " "
                  } `}</div>
                </Visible>
                <Visible when={!isAdmin && log.bidderType !== "Room Bidder"}>
                  <div className="bid-type">
                    {accountId === log?.accountId
                      ? `${
                          loggedInUser?.firstName
                            ? loggedInUser?.firstName
                            : " "
                        } ${
                          loggedInUser?.lastName ? loggedInUser?.lastName : " "
                        }`
                      : "Online"}
                  </div>
                </Visible>
                <Visible when={log.bidderType === "Room Bidder"}>
                  <div className="bid-type">Room Bidder</div>
                </Visible>
                <div className="d-flex">
                  <SvgComponent path="account_circle_black" />
                  <Visible when={log.type !== "bidder-msg"}>
                    <span className="label pt-3px">
                      {log.label && `${log.label}: `}
                    </span>
                  </Visible>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>{log.message}</Tooltip>}
                  >
                    <span className="amount pt-3px">{log.message}</span>
                  </OverlayTrigger>
                </div>
                <div className="alias-container">
                  <Visible when={log.bidderType !== "Room Bidder"}>
                    <span className="alias-name">{log.accountAlias}</span>
                  </Visible>
                  <span
                    className={`log-posting-time ${
                      log.bidderType === "Room Bidder" ? "ml-20" : ""
                    }`}
                  >
                    {dayjs(log.createdAt).format("HH:mm A")}
                  </span>
                </div>
              </div>
            );
          } else if (
            log.isBiddingLog &&
            (log.type === "adminMsg" || log.type === "changeBidInc")
          ) {
            return (
              <div key={index} className="log-container">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{log.message}</Tooltip>}
                >
                  <div className="bid-type">{log.message}</div>
                </OverlayTrigger>
                <div>
                  <SvgComponent path="account_circle_black" />
                  <span className="label pt-3px">
                    {log.label && `${log.label}`}
                  </span>
                </div>
                <div className="alias-container">
                  <span className="admin-posting-time">
                    {dayjs(log.createdAt).format("HH:mm A")}
                  </span>
                </div>
              </div>
            );
          } else if (log.isBiddingLog && log.type === "AdminAction") {
            return (
              <div key={index} className="log-container">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{log.message}</Tooltip>}
                >
                  <div className="bid-type text-orange">{log.message}</div>
                </OverlayTrigger>
                <div>
                  <SvgComponent path="account_circle_black" />
                  <span className="label text-orange">
                    {log.label && `${log.label}`}
                  </span>
                </div>
                <div className="alias-container">
                  <span className="admin-posting-time">
                    {dayjs(log.createdAt).format("HH:mm A")}
                  </span>
                </div>
              </div>
            );
          }
        })}
    </div>
  );
};

export default BiddingLogs;
