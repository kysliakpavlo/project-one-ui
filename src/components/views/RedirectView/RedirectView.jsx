import React, { useEffect, useState } from "react";
import { toUrlString } from "../../../utils/helpers";
import { STATIC_PAGE_LISTS, AUTH_REQ_PAGES } from "../../../utils/constants";

const RedirectView = ({ match, pageConfigurations, getStaticPage, ...props }) => {
  const url = 'https://static.slatteryauctions.com.au' + match.url;
  const history = props.history;
  const [routes, setRoutes] = useState([]);
  useEffect(() => {
    pageConfigurations?.siteMap &&
      getStaticPage(pageConfigurations?.siteMap).then((response) => {
        const constUrlArray = [];
        let tag = document.createElement("div");
        tag.innerHTML = response.result.page.content;
        let anchorTag = tag.getElementsByTagName("a");
        for (let aTag of anchorTag) {
          aTag.setAttribute("class", "anchor-link");
          let url = aTag.href;

          if (url && url.split("/")[url.split("/").length - 1] !== "") {
            let item = STATIC_PAGE_LISTS.find(
              (item) => item === url.split("/")[url.split("/").length - 1]
            );
            if (item) {
              item === "active-bids" ||
                item === "payments" ||
                item === "my-account"
                ? (item = "active-bid")
                : item === "watchlist" || item === "watching"
                  ? (item = "watchlist")
                  : (item = item);
              if (
                AUTH_REQ_PAGES.some((page) => item === page) ||
                AUTH_REQ_PAGES.some((page) => item === page)
              ) {
              } else if (AUTH_REQ_PAGES.some((page) => item === page)) {
              } else if (item === "tenders") {
              }
            } else {
              let constUrl = {
                toUrl: `/content-page?`,
                fromUrl: url
                  .replace("http://static.slatteryauctions.com.au", "")
                  .replace("https://static.slatteryauctions.com.au", ""),
                pageUrl: `/content-page?${toUrlString({ url })}`,
              };
              constUrlArray.push(constUrl);
            }
          } else if (url && url.split("/")[url.split("/").length - 1] === "") {
          }
        }
        setRoutes(constUrlArray);
      });
  }, [pageConfigurations, getStaticPage]);

  useEffect(() => {
    let constUrl = {
      pageUrl: `/content-page?${toUrlString({ url })}`,
    }
    if (routes && routes.length > 0) {
      if (routes.some((c) => c.pageUrl === constUrl.pageUrl))
        history.push(constUrl.pageUrl);
      else
        history.push('/');
    }
  }, [routes, props]);
  return <></>
};

export default RedirectView;
