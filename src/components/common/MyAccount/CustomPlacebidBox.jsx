import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Visible from "../Visible";
import { AUCTION_TYPES, AUCTION_TYPES_MAP } from "../../../utils/constants";
import _get from "lodash/get";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import "./CustomPlacebidBox.scss";
import SvgComponent from "../SvgComponent";
import { toAmount } from "../../../utils/helpers";
import Confirmation from "../Confirmation";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import dayjs from "dayjs";

const CustomPlacebidBox = (props) => {
  const [bidValue, setBidValue] = useState(null);
  const [baseValue, setBaseValue] = useState(null);
  const [incerementValue, setIncrementValue] = useState(null);
  const [bidType, setBidType] = useState(
    props.incrementBy !== null && props.incrementBy !== 0 ? "auto" : "current"
  );
  const [nextBidAmount, setNextBidAmount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { assetId, assetDetail } = props;
  const [isTermsAgreed, setIsTermsAgreed] = useState(assetDetail?.termsAgreed);
  const [myHighestBidAmount, setMyHighestBid] = useState(
    assetDetail.myHighestBid ? assetDetail.myHighestBid : 0
  );
  let [buyersPremiumList, setBuyersPremiumList] = useState([]);
  let nextMinBid = props.currentBid ? props.currentBid : 0;
  useEffect(() => {
    setBidValue(props.currentBid);
    setBaseValue(props.currentAmt);
    setIncrementValue(props.incrementBy);
    setBidType(props.incrementBy === null ? "current" : "auto");
    setMyHighestBid(props.assetDetail.myHighestBid);
  }, [props.incrementBy, props.currentAmt]);

  useEffect(() => {
    setBidType(props.incrementBy === null ? "current" : bidType);
  }, [bidType]);
  const getBuyerPremium = () => {
    props
      .getBidValues({
        assetId: props.assetDetail.assetId,
        auctionId: props.assetDetail.auctionData.auctionId,
      })
      .then((response) => {
        props.gstHandler(
          props.assetDetail.assetId,
          response.result.gstApplicable
        );
        setBuyersPremiumList(response.result.buyersPremium);
        callParentFunction(response.result.buyersPremium);
      });
  };
  const callParentFunction = (buyersPremiumList) => {
    if (props.currentBid > 0) {
      if (Number(bidValue) === 0) {
        setBidValue(props.currentBid);
        props.customBidHandler(
          props.currentBid + props.incrementBy,
          assetId,
          assetDetail,
          buyersPremiumList
        );
      } else {
        props.customBidHandler(
          Number(bidValue) + props.incrementBy,
          assetId,
          assetDetail,
          buyersPremiumList
        );
        setBidValue(Number(bidValue) + props.incrementBy);
        setNextBidAmount(bidValue);
      }
    } else {
      setNextBidAmount(props.startingBid);
      if (Number(bidValue) === 0) {
        setBidValue(props.startingBid);
        props.customBidHandler(
          props.startingBid,
          assetId,
          assetDetail,
          buyersPremiumList
        );
      } else {
        props.customBidHandler(
          Number(bidValue) + props.incrementBy,
          assetId,
          assetDetail,
          buyersPremiumList
        );
        setBidValue(Number(bidValue) + props.incrementBy);
        setNextBidAmount(bidValue);
      }
    }
  };
  const onIncrement = () => {
    if (bidValue === props.currentBid) {
      getBuyerPremium();
    } else {
      callParentFunction(buyersPremiumList);
    }
  };

  const onDecrement = () => {
    if (bidValue > incerementValue) {
      if (baseValue < bidValue) {
        props.customBidHandler(
          bidValue - incerementValue,
          assetId,
          assetDetail,
          buyersPremiumList
        );
        setBidValue(bidValue - incerementValue);
      }
    }
  };

  const onChangeAmount = (e) => {
    let start = e.target.selectionStart;
    let val = e.target.value;
    let value = val.replace(/\$|,/g, "");
    setBidValue(Number(value));
    setNextBidAmount(Number(value));
    if (value.length > 0) {
      e.target.value = parseFloat(value);
      e.target.setSelectionRange(start, start);
      setBidValue(parseFloat(value));
    }
    if (buyersPremiumList.length === 0) {
      props
        .getBidValues({
          assetId: props.assetDetail.assetId,
          auctionId: props.assetDetail.auctionData.auctionId,
        })
        .then((response) => {
          props.gstHandler(
            props.assetDetail.assetId,
            response.result.gstApplicable
          );
          props.customBidHandler(
            Number(value),
            assetId,
            assetDetail,
            response.result.buyersPremium
          );
          setBuyersPremiumList(response.result.buyersPremium);
        });
    } else {
      props.customBidHandler(
        Number(value),
        assetId,
        assetDetail,
        buyersPremiumList
      );
    }
  };

  const placeBid = (e, replaceHighestBid = false) => {
    if (
      replaceHighestBid ||
      props.loggedInUser.accountId !== assetDetail.accountId ||
      bidType === "auto"
    ) {
      const obj = {
        assetId: assetDetail.assetId,
        bidType:
          AUCTION_TYPES_MAP[
            _get(assetDetail, "auctionData.auctionType.name")
          ] === AUCTION_TYPES.IN_ROOM
            ? "absentee-bid"
            : bidType,
        auctionId: assetDetail.auctionData.auctionId,
        termsAgreed: assetDetail.termsAgreed
          ? assetDetail.termsAgreed
          : isTermsAgreed,
        bidAmount: bidValue,
      };
      props.onPlaceBidConfirm(obj);
      setShowConfirmation(false);
      setMyHighestBid(bidValue);
      setTimeout(() => {
        setNextBidAmount(0);
      }, 1000);
    } else {
      setShowConfirmation(true);
    }
  };

  const onChangeTermsAgreed = (e) => {
    setIsTermsAgreed(e.target.checked);
  };
  const onClickBidType = (e) => {
    setBidType(bidType === "auto" ? "current" : "auto");
  };

  return (
    <Row className={"placebid-row public-console"}>
      <Col xs={12} className="current-bid-detail">
        {props.currentBid > 0 ? (
          <>
            Current bid :{" "}
            <strong>
              {props.currentBid &&
                props.currentBid.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                })}
            </strong>
          </>
        ) : (
          <>
            Starting bid :{" "}
            <strong>
              {props.startingBid &&
                props.startingBid.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                })}
            </strong>
          </>
        )}
      </Col>
      <Col xs={12} className="my-bid-detail">
        My last bid :{" "}
        <strong>
          {myHighestBidAmount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
          })}
        </strong>
      </Col>
      <Visible when={!assetDetail?.auctionData?.currentlyLive}>
        <Col className="placebid-content">
          <InputGroup className="bid-input">
            <InputGroup.Prepend className="">
              <Button
                type="button"
                className="bid-append"
                variant="outline-secondary"
                size="xs"
                onClick={onDecrement}
              >
                <SvgComponent path="remove" />
              </Button>
            </InputGroup.Prepend>
            <Form.Group
              controlId={`placebidAmount${Math.random()}`}
              className="w-100 mb-0"
            >
              <Form.Control
                placeholder={`Enter ${toAmount(nextMinBid)} or more`}
                value={
                  nextBidAmount > 0
                    ? toAmount(bidValue).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      })
                    : ""
                }
                disabled={props.disable}
                label={
                  bidValue &&
                  `more than ${bidValue.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  })} `
                }
                onChange={onChangeAmount}
              />
            </Form.Group>
            <InputGroup.Append className="">
              <Button
                type="button"
                className="bid-append"
                variant="outline-secondary"
                size="xs"
                onClick={onIncrement}
              >
                <SvgComponent path="add" />
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Col>
      </Visible>
      <Col className="placebid-radio">
        <Visible
          when={
            AUCTION_TYPES_MAP[
              _get(assetDetail, "auctionData.auctionType.name")
            ] !== AUCTION_TYPES.IN_ROOM
          }
        >
          <ButtonGroup className="w-100 btn-type" onClick={onClickBidType}>
            <Button
              block
              variant="light"
              disabled={!props.incrementBy}
              className={
                bidType === "auto" && props.incrementBy > 0
                  ? "slt-dark"
                  : "slt-white"
              }
            >
              Auto
            </Button>
            <Button
              block
              variant="light"
              className={bidType === "current" ? "slt-dark" : "slt-white"}
            >
              Current
            </Button>
          </ButtonGroup>
        </Visible>

        <Form.Group
          controlId={`termsNconditions${assetId}`}
          className={"terms-div mr-bottom"}
        >
          <Form.Check
            value={true}
            name={`termsAgreed${assetId}`}
            type="checkbox"
            checked={isTermsAgreed}
            onChange={onChangeTermsAgreed}
            label={
              <>
                <div className="accept">I have Read and Accepted </div>
                <Link
                  to="/accept-terms-conditions"
                  target="_blank"
                  className="terms-link"
                >
                  Terms and Conditions
                </Link>
                <div>
                  <a
                    className="terms-link-security"
                    href={
                      window.location.origin +
                      "/files/Slattery_Information_Security_Policy.pdf"
                    }
                    target="_blank"
                  >
                    <div>View our Information</div> Security Policy
                  </a>
                </div>
              </>
            }
          />
        </Form.Group>
        <Visible
          when={
            AUCTION_TYPES_MAP[
              _get(assetDetail, "auctionData.auctionType.name")
            ] !== AUCTION_TYPES.IN_ROOM && assetDetail.status !== "Sold"
          }
        >
          <Button
            className="place-bid"
            variant="warning"
            disabled={
              bidValue > props.currentBid && isTermsAgreed ? false : true
            }
            onClick={placeBid}
          >
            {" "}
            <SvgComponent path="gavel" />
            Place Bid
          </Button>
        </Visible>
        <Visible
          when={
            AUCTION_TYPES_MAP[
              _get(assetDetail, "auctionData.auctionType.name")
            ] === AUCTION_TYPES.IN_ROOM &&
            dayjs(_get(assetDetail, "auctionData.datetimeOpen")) >
              dayjs().add(2, "seconds")
          }
        >
          <Button
            variant="warning"
            className="place-bid absentee-bid"
            disabled={
              nextBidAmount > 0 && bidValue > props.currentBid && isTermsAgreed
                ? false
                : true
            }
            onClick={placeBid}
          >
            Place Absentee Bid
          </Button>
        </Visible>
      </Col>
      <Visible when={showConfirmation}>
        <Confirmation
          onConfirm={(e) => placeBid(e, true)}
          onClose={() => setShowConfirmation(false)}
          message=" You are the highest bidder on this asset, are you sure you still want to place a bid?"
        />
      </Visible>
    </Row>
  );
};

export default CustomPlacebidBox;
