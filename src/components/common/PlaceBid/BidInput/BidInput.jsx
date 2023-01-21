import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Visible from "../../Visible";
import SvgComponent from "../../SvgComponent";
import { isInRoom, toAmount } from "../../../../utils/helpers";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import "./BidInput.scss";

const BidInput = ({
  bidType,
  currentBidAmount,
  startingBid,
  showCurrentBid = true,
  showHighestBidder,
  auctionType,
  nextMinBid,
  nextBidAmount,
  incrementBy,
  onChangeAmount,
  onChangeBidType,
}) => {
  const [eventType, setEventType] = useState("");
  const onIncrement = (e) => {
    if (currentBidAmount || nextBidAmount > 0) {
      const newVal = (nextBidAmount || currentBidAmount) + incrementBy;
      onChangeAmount(newVal);
    } else {
      const newVal = startingBid;
      onChangeAmount(newVal);
    }
  };

  const onDecrement = (e) => {
    const newVal = (nextBidAmount || currentBidAmount) - incrementBy;
    if (newVal >= nextMinBid) {
      onChangeAmount(newVal);
    } else {
      onChangeAmount(nextMinBid);
    }
  };
  const setEventTypeFun = (event) => {
    setEventType(event.keyCode);
  };
  const onChangeAmountInput = (e) => {
    const start = e.target.selectionStart;
    let val = e.target.value;
    let value = val.replace(/\$|,/g, "");
    if (
      nextBidAmount &&
      value.length < nextBidAmount.toString().length &&
      eventType === 8
    ) {
      value = "";
    }
    e.target.value = value;
    if (val.length > 0) {
      e.target.value = parseFloat(value);
      e.target.setSelectionRange(start, start);
      onChangeAmount(parseFloat(value));
    } else {
      onChangeAmount(value);
    }
  };

  const onClickBidType = (e) => {
    onChangeBidType(bidType === "auto" ? "current" : "auto");
  };

  const placeholder = `Enter ${toAmount(nextMinBid)} or more`;

  return (
    <div className="bid-input">
      <Visible when={showCurrentBid}>
        <div className="current-bid-section">
          {currentBidAmount > 0 ? (
            <p className="current-bid">
              Current Bid:
              <strong> {toAmount(currentBidAmount)}</strong>
            </p>
          ) : (
            <p className="current-bid">
              Starting Bid:
              <strong> {toAmount(startingBid)}</strong>
            </p>
          )}
        </div>
      </Visible>
      <Form.Label>Place Bid</Form.Label>
      <InputGroup className="bid-input-group">
        <Form.Control
          placeholder={placeholder}
          onKeyDown={setEventTypeFun}
          onChange={onChangeAmountInput}
          value={nextBidAmount > 0 ? toAmount(nextBidAmount) : ""}
        />
        <InputGroup.Append>
          <Button type="button" variant="light" onClick={onIncrement}>
            <SvgComponent path="add" />
          </Button>
          <Button type="button" variant="light" onClick={onDecrement}>
            <SvgComponent path="remove" />
          </Button>
        </InputGroup.Append>
      </InputGroup>
      <Visible when={!isInRoom(auctionType)}>
        <Form.Label>
          Bid Type
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip className="fixed-tooltip">
                Autobid will bid for you automatically if you are outbid up to
                your maximum amount. Current bid will set the price to your
                entered bid.
              </Tooltip>
            }
          >
            <SvgComponent path="help_outline" />
          </OverlayTrigger>
        </Form.Label>
        <ButtonGroup className="w-100 btn-type" onClick={onClickBidType}>
          <Button
            block
            variant="light"
            disabled={!incrementBy}
            className={bidType === "auto" ? "primary-bg-color" : "slt-white"}
          >
            Auto Bid
          </Button>
          <Button
            block
            variant="light"
            disabled={!incrementBy}
            className={bidType === "current" ? "primary-bg-color" : "slt-white"}
          >
            Current Bid
          </Button>
        </ButtonGroup>
      </Visible>
    </div>
  );
};

export default BidInput;
