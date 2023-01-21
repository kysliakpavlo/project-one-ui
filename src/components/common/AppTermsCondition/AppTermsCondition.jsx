import React, { useState, useEffect } from "react";
import _isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Visible from "../Visible";
import SvgComponent from "../../common/SvgComponent";
import { DATE_FORMAT } from "../../../utils/constants";
import { fromUrlString, encrypt, setAppTitle } from "../../../utils/helpers";

import "./AppTermsCondition.scss";

const AppTermsCondition = ({
  vendor,
  location,
  history,
  updateTermsCondition,
}) => {
  const auctionDetails = fromUrlString(location.search.substr(1));
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const {
    auctionName,
    auctionNumber,
    startDate,
    location: locationName,
  } = auctionDetails;
  useEffect(() => {
    if (!_isEmpty(vendor)) {
      setAppTitle("Terms & Conditions", vendor.name);
    }
  }, [vendor]);
  const onChangeTermsAgreed = (e) => {
    setIsTermsAgreed(e.target.checked);
  };

  const submitTerms = () => {
    if (isTermsAgreed) {
      updateTermsCondition({ auctionId: auctionDetails.auctionId }).then(
        (res) => {
          history.push(
            `/simulcast-auction/${encrypt(auctionDetails.auctionId)}`
          );
        }
      );
    }
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="term-condition-block">
      <div className="auction-detail">
        <div className="plain-bar">
          <SvgComponent path="slattery-logo" />
        </div>
        <Visible when={auctionDetails.auctionId}>
          <div className="header">
            <div className="title">
              Auction: #{auctionNumber} - {auctionName} - {locationName}
            </div>
            <div className="auction-time">
              Auction Starts:{" "}
              {dayjs(startDate).format(DATE_FORMAT.MON_DATETIME)}{" "}
              {auctionDetails.timeZone}
            </div>
          </div>
        </Visible>
        <div className="head-lines">
          Slattery Auctions <i>Interactive</i> Fast - Facts
        </div>
        <div className="head-lines-small">
          What are the minimum computer system requirements?
        </div>
        <p>
          To bid using Slattery Auctions <i>interactive</i> your computer meets
          the following requirements
          <ul>
            <li>Internet Exploser 7 or above</li>
            <li>Firefox 3.6.3 or above</li>
            <li>
              Firefox and Chrome browsers are recommended for improved
              performance
            </li>
            <li>Sound Card and speakers (if using Web sound)</li>
            <li>
              Minimum 65kbps internet connection (fast broadband is the best
            </li>
            <li>Minimum 800x600 screen resolution</li>
          </ul>
        </p>
        <div className="head-lines-small">
          How much deposit do i need to leave if I'm Successful?
        </div>
        <p>
          At each auction, a deposit percentage or amount is set. This is
          clearly displyed in the "Auction Profile" at the top of the screen. If
          u do not see the full "Auction Profile" Please select the "Full
          Profile" Button at the top of screen.
        </p>
        <div className="head-lines-small">How do I get sound?</div>
        <p>
          Slattery Auctions <i>interactive</i> uses "GoToWebinar" to host the
          audio feed. Each auction has a unique ID that need to be enter in
          order to access the live audio. In addition to this your e-mail must
          be entered if you choose the web based audio option. If you prefer to
          call the Slattery Auctions <i>interactive</i> audio line refer direct
          to the phone number that will be advertised in the "Auction Profile"
          on the auction listing area of the website. Note that each auction
          have different number and will be answered by a "GoToWebinar" computer
          that will prompt you for your ID. Enter the ID and press # when the
          system asks you for an audio pin. After that the system will transfer
          you to the audio feed where you can listen directly to the auctioneer.
          Note that this is adirect feed only. you cannot speak to the
          auctioneer.
        </p>
        <div className="head-lines-small">
          Can I watch live video of the auction?
        </div>
        <p>No, currently there is no facility for live video</p>
        <div className="head-lines-small">My screen has frozen?</div>
        <p>
          Depending on your browser some users will need to hit the "refresh"
          button at various times throughtout our longer auctions to ensure that
          you don't miss any lots. The "refresh" button is located towards the
          top right hand side of the screen.
        </p>
        <div className="head-lines-small">
          How much does it cost to use slattery Auctions <i>interactive</i>?
        </div>
        <p>
          Slattery Auctions does not charge any additional fees for using{" "}
          <i>interactive</i>. Normal buyers premium & credit card fees only.
        </p>
        <div className="head-lines-small">
          How do I register for slattery Auctions <i>interactive</i>?
        </div>
        <p>
          Simple! You hit "Register to Bid" to the left of screen on each page
          and complete the details.
        </p>
        <div className="head-lines-small">
          I've hit the "Bid" button bit my bid was not acknowledgeed by the
          auctioneer?
        </div>
        <p>
          As per the live auction scenario the auctioneer can accept bids at his
          discretion. Generally the first person in the auctioneer's line of
          site is awarded with the current bid. If you have bid a certain amount
          and it was not accepted t could be because a room bidder has been
          accepted in that perticular increment before your bid has registered
          in our system or the bid increment in the room has surpassed your bid
          prior to the auctioneer receiving your bid or the lock has been
          knocked to a floor bidder prior to your bid appearing in our system.
        </p>
        <div className="head-lines-small">
          What do I do if slattery auction <i>interactive</i> is experiencing
          technical difficulties?
        </div>
        <p>
          Slattery Auctions provide <i>interactive</i> as a service to buyers
          and will attempt to ensure it is available at the started time and
          date. If we deem the system to have failed we will engage the fall
          back procedure. The fall back procedure involves theconsole operator
          pressing a button that will display the splash screen to the user
          notifying them to the system outage. At this point user must call the
          site in question to organise an alternative phone or absentee bid.
        </p>
        <div className="head-lines-small">I need more help!</div>
        <p>
          If you need any more aasistance you can either e-mail us at
          bris_interface@slatteryauctions.com.au or call the IT support team on
          02 4028 000.
        </p>
        <Visible when={auctionDetails.auctionId}>
          <div className="head-lines-small">
            <Col className="placebid-checkbox">
              <Form.Group
                controlId={`termsNconditions${auctionDetails.auctionId}`}
              >
                <Form.Check
                  value={true}
                  name={`termsAgreed${auctionDetails.auctionId}`}
                  type="checkbox"
                  checked={isTermsAgreed}
                  onChange={onChangeTermsAgreed}
                  label={
                    <>
                      <div className="accept">
                        I have Read and Accepted{" "}
                        <Link to="null" className="terms-link">
                          Terms and Conditions
                        </Link>
                      </div>
                      <div>
                        <a
                          href={
                            window.location.origin +
                            "/files/Slattery_Information_Security_Policy.pdf"
                          }
                          target="_blank"
                        >
                          View our Information Security Policy
                        </a>
                      </div>
                    </>
                  }
                />
              </Form.Group>
            </Col>
            <Button
              disabled={!isTermsAgreed}
              variant="primary"
              onClick={submitTerms}
            >
              Accept
            </Button>
            <Button className="ordinary-button" onClick={goBack}>
              Cancel
            </Button>
          </div>
        </Visible>
        <Visible when={!auctionDetails.auctionId}>
          <Button variant="primary" onClick={goBack}>
            Go Back
          </Button>
        </Visible>
      </div>
    </div>
  );
};

export default AppTermsCondition;
