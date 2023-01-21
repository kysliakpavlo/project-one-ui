import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Visible from "../../Visible";
import SvgComponent from "../../SvgComponent";
import { toAmount } from "../../../../utils/helpers";
import { ASSET_STATUS } from "../../../../utils/constants";

import "./BidHistoryTable.scss";

const BidHistoryTable = ({
  bidHistories,
  loggedInUser,
  auctionId,
  assetId,
  onClose,
  currentBidAmount,
  bidHistory,
  status,
}) => {
  const [data, setData] = useState(bidHistories || null);
  const [totlaSlides, setTotlaSlides] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [assetStatus, setAssetStatus] = useState(false);

  useEffect(() => {
    const offset =
      currentSlide === 1 ? currentSlide - 1 : (currentSlide - 1) * 50;
    const limit = 50;
    const req = {
      offset,
      limit,
      auctionId,
      assetId,
    };
    if (
      status === ASSET_STATUS.PASSED_IN ||
      status === ASSET_STATUS.SOLD ||
      status === ASSET_STATUS.REFERRED
    ) {
      setAssetStatus(true);
    } else {
      bidHistory(req).then((res) => {
        if (res.totalRecords) {
          setTotlaSlides(Math.ceil(res.totalRecords / 50).toFixed(0));
        } else {
          setTotlaSlides(1);
        }
        if (res.totalRecords < 50) {
          setTotlaSlides(1);
        }

        let result = res.result.map((item) => {
          if (item.accountId === loggedInUser?.accountId) {
            item.accountData.accountAlias = "Your Bid";
          }
          return item;
        });
        setData(result);
      });
    }
  }, [
    auctionId,
    assetId,
    setData,
    loggedInUser,
    bidHistories,
    currentSlide,
    currentBidAmount,
  ]);

  const onDecrement = () => setCurrentSlide(currentSlide - 1);
  const onIncrement = () => setCurrentSlide(currentSlide + 1);

  return (
    <div className="bid-history-table">
      {onClose && (
        <Button
          variant="warning"
          className="slt-dark close-btn"
          onClick={onClose}
        >
          <SvgComponent path="close" />
        </Button>
      )}
      <Row className="table-headers">
        <Col xs={4}>
          <span>Bidder's Name</span>
        </Col>
        <Col xs={4}>
          <span>Location</span>
        </Col>
        <Col xs={4}>
          <span>Amount</span>
        </Col>
      </Row>
      <div className="table-body">
        {data &&
          data.map((bid, index) => (
            <Row
              key={index}
              className={
                index === 0 && currentSlide === 1 ? "highest-bidder-row" : ""
              }
            >
              <Col xs={4}>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Highest bidder</Tooltip>}
                >
                  <Button className="indicator">
                    <SvgComponent path="gavel" />
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{bid.accountData.accountAlias}</Tooltip>}
                >
                  <span className="text-ellipsis">
                    <SvgComponent
                      path={
                        index === 0 && currentSlide === 1
                          ? "face_black"
                          : "account_circle_black"
                      }
                    />{" "}
                    {bid.accountData.accountAlias}
                  </span>
                </OverlayTrigger>
              </Col>
              <Col xs={4}>
                <span className="text-ellipsis">
                  {bid.accountData.billingState ? (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>{bid.accountData.billingState}</Tooltip>
                      }
                    >
                      <span>
                        <SvgComponent path="location_on" />
                        {bid.accountData.billingState}
                      </span>
                    </OverlayTrigger>
                  ) : null}
                </span>
              </Col>
              <Col xs={4}>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{toAmount(bid.amount)}</Tooltip>}
                >
                  <span className="text-ellipsis">{toAmount(bid.amount)}</span>
                </OverlayTrigger>
              </Col>
            </Row>
          ))}

        <Visible when={!assetStatus && data && data.length === 0}>
          <Row>
            <Col xs={12} className="text-center">
              <strong>No History Available</strong>
            </Col>
          </Row>
        </Visible>
        <Visible when={assetStatus}>
          <Row>
            <Col xs={12} className="text-center bid-closed">
              <strong>Bidding Closed</strong>
            </Col>
          </Row>
        </Visible>
      </div>
      <Visible when={totlaSlides}>
        <div className="mt-2">
          <ButtonGroup className="nav-btns">
            <Button onClick={onDecrement} disabled={currentSlide <= 1}>
              <SvgComponent path="arrow-prev" />
            </Button>
            <span>
              {currentSlide} / {totlaSlides}
            </span>
            <Button
              onClick={onIncrement}
              disabled={currentSlide >= totlaSlides}
            >
              <SvgComponent path="arrow-next" />
            </Button>
          </ButtonGroup>
        </div>
      </Visible>
    </div>
  );
};

export default BidHistoryTable;
