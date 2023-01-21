import React, { useEffect, useState } from "react";
import _isEmpty from "lodash/isEmpty";
import { setAppTitle, toUrlString } from "../../../utils/helpers";
import StaticHeader from "../../common/StaticHeader";
import "./FinancePageView.scss";
import FinancialEnquiry from "../../common/FinancialEnquiry";
import { useHistory } from "react-router-dom";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";

const FinancePage = ({
  vendor,
  showMessage,
  locations,
  setLoading,
  getStaticPage,
  pageConfigurations,
}) => {
  const [financeDetail, setFinanceDetail] = useState([]);
  const [title, setTitle] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (!_isEmpty(vendor)) {
      // loadCities();
      setAppTitle("Finance", vendor.name);
    }
  }, [vendor]);

  useEffect(() => {
    pageConfigurations?.financeId &&
      getStaticPage(pageConfigurations?.financeId).then((response) => {
        setTitle(response.result.page.title);
        let tag = document.createElement("div");
        tag.innerHTML = response.result.page.content;
        let anchorTag = tag.getElementsByTagName("a");
        for (let aTag of anchorTag) {
          aTag.setAttribute("class", "anchor-link");
          aTag.setAttribute("id", "finance");
          let url = aTag.href;
          url = url
            .split("/")
            .map((x) =>
              x.replace(
                /www.slatteryauctions.com.au/g,
                "static.slatteryauctions.com.au"
              )
            )
            .join("/");
          const obj = toUrlString({ url, title: response.result.page.title });
          aTag.setAttribute("href", `/content-page?${obj}`);
        }
        setFinanceDetail(tag.innerHTML);
        setLoading(false);
      });
  }, [pageConfigurations]);

  const onSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <>
      <div className="finance-view container">

        <StaticHeader header={title} ></StaticHeader>
        <div
          className="containers"
          dangerouslySetInnerHTML={{ __html: financeDetail }}
        />
        {isSubmitted ? (
          <p>
            <strong>
              Thanks for your enquiry. One of our Finance Consultants will be in
              contact with you to discuss your requirements shortly.
            </strong>
          </p>
        ) : (
          <FinancialEnquiry
            locations={locations}
            onSubmit={onSubmit}
            showMessage={showMessage}
          />
        )}
      </div>
    </>
  );
};

export default FinancePage;
