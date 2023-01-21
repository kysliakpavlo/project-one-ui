import React, { useState, useEffect } from "react";
import _isEmpty from "lodash/isEmpty";
import { STATIC_PAGE_LISTS, AUTH_REQ_PAGES } from "../../../utils/constants";
import { setAppTitle, toUrlString, preventEvent } from "../../../utils/helpers";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import StaticHeader from "../../common/StaticHeader";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import "./SiteMapView.scss";

const SiteMapView = ({
  toggleLogin,
  isLoggedIn,
  vendor,
  setLoading,
  getStaticPage,
  pageConfigurations,
}) => {
  const [siteMapdetail, setSiteMapdetail] = useState([]);
  const history = useHistory();

  useEffect(() => {
    pageConfigurations?.siteMap &&
      getStaticPage(pageConfigurations?.siteMap)
        .then((response) => {
          setAppTitle(response.result.page.title);
          let tag = document.createElement("div");
          tag.innerHTML = response.result.page.content;
          let anchorTag = tag.getElementsByTagName("a");
          for (let aTag of anchorTag) {
            aTag.setAttribute("class", "anchor-link");
            let url = aTag.href;
            let title = aTag.innerText;
            if (url && url.split("/")[url.split("/").length - 1] !== "") {
              let item = STATIC_PAGE_LISTS.find(
                (item) => item === url.split("/")[url.split("/").length - 1]
              );
              if (item && aTag.className === "anchor-link") {
                item === "active-bids" ||
                item === "payments" ||
                item === "my-account"
                  ? (item = "active-bid")
                  : item === "watchlist" || item === "watching"
                  ? (item = "watchlist")
                  : (item = item);
                if (
                  AUTH_REQ_PAGES.some((page) => item === page) &&
                  isLoggedIn
                ) {
                  aTag.setAttribute("href", `my-account/${item}`);
                } else if (
                  AUTH_REQ_PAGES.some((page) => item === page) &&
                  !isLoggedIn
                ) {
                  aTag.setAttribute("href", `#`);
                  aTag.setAttribute("id", "site-map");
                } else {
                  item === "tenders"
                    ? aTag.setAttribute("href", `expression-of-interest`)
                    : aTag.setAttribute("href", `${item}`);
                }
              } else {
                const obj = toUrlString({ url, title: title });
                if (aTag.className === "anchor-link") {
                  aTag.setAttribute("href", `/content-page?${obj}`);
                }
              }
            } else if (
              url &&
              url.split("/")[url.split("/").length - 1] === ""
            ) {
              aTag.setAttribute("href", `/`);
            }
          }
          setSiteMapdetail(tag.innerHTML);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
  }, [pageConfigurations]);

  useEffect(() => {
    if (!_isEmpty(vendor)) {
      setAppTitle("Site map", vendor.name);
    }
  }, [vendor]);
  const navigateToRoute = (e) => {
    if (e.target.id === "site-map") {
      if (
        e.target.innerText === "Active Bids" ||
        e.target.innerText === "My Account" ||
        e.target.innerText === "Payments"
      ) {
        toggleLogin(true, () => history.push(`my-account/active-bid`));
      } else if (e.target.innerText === "Watching") {
        toggleLogin(true, () => history.push(`my-account/watchlist`));
      } else if (e.target.innerText === "Profile") {
        toggleLogin(true, () => history.push(`my-account/profile`));
      }
    }
  };
  useEffect(() => {
    document.addEventListener("click", navigateToRoute);
    return () => {
      document.removeEventListener("click", navigateToRoute);
    };
  }, []);

  return (
    <>
      <PredictiveSearchBar />
      <div className="content-page container">
        <StaticHeader header="Site Map" />
        {/* <a href="https://w3schools.com/" id="" */}
        <div
          className="container static-page"
          dangerouslySetInnerHTML={{ __html: siteMapdetail }}
        />
      </div>
    </>
  );
};

export default SiteMapView;
