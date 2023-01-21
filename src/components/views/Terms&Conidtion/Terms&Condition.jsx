import React, { useState, useEffect } from 'react';
import _isEmpty from 'lodash/isEmpty';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { useHistory } from 'react-router-dom';
import { setAppTitle, fromUrlString } from '../../../utils/helpers';
import './Terms&Condition.scss';
import PredictiveSearchBar from '../../common/PredictiveSearchBar';
import StaticHeader from '../../common/StaticHeader';
import Visible from '../../common/Visible';

const TermsCondition = ({
  vendor,
  location,
  setLoading,
  getStaticPage,
  updateTermsCondition,
  pageConfigurations,
}) => {
  const history = useHistory();
  const [termDetail, setTermDetail] = useState([]);
  const auctionDetails = fromUrlString(location.search.substr(1));
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);

  const onChangeTermsAgreed = (e) => {
    setIsTermsAgreed(e.target.checked);
  };

  useEffect(() => {
    if (!_isEmpty(vendor)) {
      // setAppTitle('Terms & Conditions', vendor.name);
    }
  }, [vendor]);

  useEffect(() => {
    pageConfigurations?.termsCondition &&
      getStaticPage(pageConfigurations?.termsCondition).then((response) => {
        setAppTitle(response.result.page.title);
        setTermDetail(response.result.page.content.replace(/\u00a0/g, ' '));
        setLoading(false);
      });
  }, [pageConfigurations]);

  const submitTerms = () => {
    updateTermsCondition({ auctionId: auctionDetails.auctionId }).then(
      (res) => {
        history.push(`/buyer-card/${auctionDetails.auctionId}`);
      }
    );
  };
  const goBack = () => {
    window.history.back();
  };

  return (
    <>
      <div className="terms-condition container">
        {/* <StaticHeader header="Terms & Conditons"></StaticHeader> */}
        <h1 style={{ textAlign: 'center' }}>Terms & Conditions</h1>
        <div
          className="container terms-content"
          dangerouslySetInnerHTML={{ __html: termDetail }}
        ></div>
        <div className="container terms-content">
          <a
            href={
              window.location.origin +
              '/files/Slattery_Information_Security_Policy.pdf'
            }
            target="_blank"
          >
            View our Information Security Policy
          </a>
        </div>
        <Visible when={!_isEmpty(auctionDetails)}>
          <div>
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
                        I have Read and Accepted Terms and Conditions
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
            <Button
              className="ordinary-button"
              onClick={goBack}
            >
              Cancel
            </Button>
          </div>
        </Visible>
      </div>
    </>
  );
};

export default TermsCondition;
