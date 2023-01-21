import React, { useState, useEffect, useRef } from "react";
import Popover from "react-bootstrap/Popover";
import Button from "react-bootstrap/Button";
import Overlay from "react-bootstrap/Overlay";
import BidHistoryTable from "./BidHistoryTable";
import SvgComponent from "../SvgComponent";

import "./BidHistory.scss";

const BidHistoryComponent = ({
  bidHistories,
  assetId,
  auctionId,
  count,
  forListView = false,
  loggedInUser,
}) => {
  const [showBidderHistory, setShowBidderHistory] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);
  const onCloseClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowBidderHistory(false);
  };

  const onOpenClick = (e) => {
    document.body.click();
    e.stopPropagation();
    e.preventDefault();
    setShowBidderHistory(true);
    !showBidderHistory && setTarget(e.target);
  };

  useEffect(() => {
    if (assetId === bidHistories && bidHistories[0].assetId) {
      setShowBidderHistory(true);
    } else {
      setShowBidderHistory(false);
    }
  }, [assetId]);

  return (
    <>
      <Button
        variant="default"
        className="btn-bidHistory"
        onClick={(e) => onOpenClick(e)}
      >
        {forListView ? count : "Bid History"}
      </Button>
      <Overlay
        show={showBidderHistory}
        trigger="click"
        placement="bottom"
        rootClose
        target={target}
        container={ref.current}
        containerPadding={20}
        onHide={() => setShowBidderHistory(false)}
      >
        <Popover id="popover-basic" className="bid-history-popover">
          <Popover.Title as="h3">
            <strong>Bid History</strong>
            <SvgComponent path="close" onClick={(e) => onCloseClick(e)} />
          </Popover.Title>
          <Popover.Content>
            <BidHistoryTable
              assetId={assetId}
              auctionId={auctionId}
              loggedInUser={loggedInUser}
            />
          </Popover.Content>
        </Popover>
      </Overlay>
    </>
  );
};

export default BidHistoryComponent;
