import { stringify, parse } from "qs";
import { verify } from "jsonwebtoken";
import _uniqBy from "lodash/uniqBy";
import _isFunction from "lodash/isFunction";
import { AUCTION_TYPES, AUCTION_TYPES_MAP } from "./constants";
import _isEqual from "lodash/isEqual";
import _isArray from "lodash/isArray";

export const screenWidth = () => {
    let width = window.screen.width;
    let value;
    width > 767 && width < 1280 ? (value = "md") : width < 768 ? (value = "sm") : (value = "lg");
    return value;
};
export const setPostValue = (postObj) => {
    const posts = {
        title: postObj.pageName,
        description: "This is the first post",
        thumbnail: postObj.image,
    };
    return posts;
};
export const setAppTitle = (pageName, appName, assetName, image, description) => {
    try {
        if (assetName === "Search Result: Buy Now") {
            assetName = "Buy Now";
        }
        const keywords = [description ? description.split(" ") : "", pageName ? pageName : "", assetName ? assetName : "", image ? image : ""].concat().join(", ");
        if (pageName === "Home Page") {
            pageName = "Slattery Auctions";
        }
        document.title = assetName
            ? `${assetName} - Slattery Auctions`
            : `${pageName} - Truck, Machinery, Car & General Auctions in Sydney, Newcastle, Melbourne, Brisbane & Perth | Slattery Auctions & Valuations`;
        document
            .querySelector('meta[property="og:title"]')
            ?.setAttribute(
                "content",
                assetName
                    ? `${assetName} - Slattery Auctions`
                    : `${pageName} - Truck, Machinery, Car & General Auctions in Sydney, Newcastle, Melbourne, Brisbane & Perth | Slattery Auctions & Valuations`
            );
        document.querySelector('meta[property="og:image"]')?.setAttribute("content", image ? image : window.location.origin + "/slattery-logo-dark.jpg");
        document
            .querySelector('meta[property="og:description"]')
            ?.setAttribute(
                "content",
                description
                    ? description
                    : "A firm of professional auctioneers and valuers who provide a wide variety of general & specialised auction sales for trucks, machinery, cars & more. Browse now."
            );
        document
            .querySelector('meta[name="description"]')
            ?.setAttribute(
                "content",
                description
                    ? description
                    : "A firm of professional auctioneers and valuers who provide a wide variety of general & specialised auction sales for trucks, machinery, cars & more. Browse now."
            );
        document
            .querySelector('meta[name="twitter:title"]')
            ?.setAttribute("content", `${pageName} - Truck, Machinery, Car & General Auctions in Sydney, Newcastle, Melbourne, Brisbane & Perth | Slattery Auctions & Valuations`);
        document
            .querySelector('meta[name="twitter:description"]')
            ?.setAttribute(
                "content",
                description
                    ? description
                    : "A firm of professional auctioneers and valuers who provide a wide variety of general & specialised auction sales for trucks, machinery, cars & more. Browse now."
            );
        document.querySelector('meta[property="og:url"]')?.setAttribute("content", window.location);
        document.querySelector('meta[name="keywords"]')?.setAttribute("content", keywords);
    } catch (error) {}
};

// Lets update if more secure way required
export const encrypt = (str) => {
    return btoa(str);
};

export const decrypt = (str) => {
    return atob(str);
};

export const toUrlString = (obj) => {
    return encrypt(stringify(obj));
};

export const fromUrlString = (str) => {
    try {
        return parse(decrypt(str));
    } catch {
        return {};
    }
};
export const setSortObj = (sortObj) => {
    if (sortObj) {
        sortObj.pageSize = Number(sortObj.pageSize);
        sortObj.activePage = Number(sortObj.activePage);
        return sortObj;
    }
};
export const setBooleanFromString = (obj) => {
    if (obj.showAdvanced.toLowerCase() === "true" || obj.showAdvanced.toLowerCase() === "1") {
        obj.showAdvanced = true;
    } else {
        obj.showAdvanced = false;
    }
    return obj;
};
export const offset = (el) => {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
};

export const getUserBrowserDetails = () => {
    var platform = require("platform");
    var userBrowserDetail = {
        browserName: platform.name,
        browserVersion: platform.version,
        product: platform.product,
        manufacturer: platform.manufacturer,
        layout: platform.layout,
        os: platform.os,
        description: platform.description,
        pageUrl: window.location.href,
        prerelease: platform.prerelease,
    };
    return stringify(userBrowserDetail);
};

export const toTimeStr = (mins) => {
    let timeStr = "";
    const hr = parseInt(mins / 60);
    const min = mins % 60;
    if (hr > 0) {
        timeStr = `${hr} Hr${hr > 1 ? "s" : ""}`;
    }
    if (!timeStr || min > 0) {
        timeStr = `${min} Min${min > 1 ? "s" : ""}`;
    }
    return timeStr;
};

export const validateToken = (token, callback) => {
    if (token) {
        return verify(token, "slatteryAuction", (err, data) => {
            if (_isFunction(callback)) {
                callback(err);
            }
        });
    }
};

export const share = (url, imageUrl, action) => {
    document.querySelector('meta[name="og:image"]').setAttribute("content", imageUrl);
    switch (action) {
        case "facebook":
            window.open("http://www.facebook.com/sharer.php?u=" + url);
            break;
        case "twitter":
            document.querySelector('meta[name="twitter:image"]').setAttribute("content", imageUrl);
            window.open("https://twitter.com/intent/tweet?url=" + url);
            break;
        case "linkedin":
            window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + url);
            break;
        case "instagram":
            window.open("http://www.instagram.com/sharer.php?u=" + url);
            break;
        default:
    }
};

export const FBShare = () => {
    if(!window.FB) {
        return false;
    }
    const FB = window.FB;
    console.log({
        method: 'share',
        link: window.location.href, 
        title:  document.querySelector('meta[property="og:title"]').getAttribute('content'),
        picture: document.querySelector('meta[property="og:image"]').getAttribute('content'),
        description:  document.querySelector('meta[property="og:description"]').getAttribute('content')
      });
    FB.ui({
        method: 'share',
        href: window.location.href, 
        title:  document.querySelector('meta[property="og:title"]').getAttribute('content'),
        meida: document.querySelector('meta[property="og:image"]').getAttribute('content'),
        description:  document.querySelector('meta[property="og:description"]').getAttribute('content')
      }, function(response){
          console.log(response);
      }
  );
}

export const preventEvent = (e) => {
    if (e && e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
    }
};

export const isInRoom = (auctionType) => {
    const type = AUCTION_TYPES_MAP[auctionType];
    return AUCTION_TYPES.IN_ROOM === type;
};

export const isTendor = (auctionType) => {
    const type = AUCTION_TYPES_MAP[auctionType];
    return AUCTION_TYPES.TENDER === type;
};

export const isBuyNow = (auctionType) => {
    const type = AUCTION_TYPES_MAP[auctionType];
    return AUCTION_TYPES.BUY_NOW === type;
};

export const isOnline = (auctionType) => {
    const type = AUCTION_TYPES_MAP[auctionType];
    return AUCTION_TYPES.ONLINE === type;
};

export const removeNumber = (value) => {
    if (value) {
        let name = value.split(".");
        if (name.length > 1) {
            return (name = name[1]);
        } else {
            return (name = name[0]);
        }
    }
};

export const lpad = (number) => {
    return `${number}`.padStart(2, "0");
};

export const toAmount = (value) => {
    if (value !== null) {
        return value?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        });
    } else {
        return value || 0;
    }
};

export const toAmountDecimal = (value) => {
    if (value !== null) {
        return value?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        });
    } else {
        return value || 0;
    }
};

export const scrollToTop = (top = 0) => {
    window.scrollTo({ top, behavior: "smooth" });
};

export const scrollIntoView = (ele, block = "start") => {
    ele && ele.scrollIntoView({ behavior: "smooth", block });
};

export const splitWord = (text = "") => {

    let splitWord = false;

    for (var i = 0; i < text.length; i++) {
        if(text.charAt(i) != text.charAt(i).toUpperCase()) {
            splitWord = true;
            break;
        }
    }

    if( splitWord ) {
        const result = text.replace(/([A-Z])/g, " $1");
        return result.charAt(0).toUpperCase() + result.slice(1);
    } 
    
    return text;
};

export const constructImageUrl = (url, image) => {
    if (url && url !== "" && image && image.src.indexOf("cloudinary") === -1) {
        image.src = "https://res.cloudinary.com/slattery-auctions-and-valuations/image/fetch/q_auto,f_auto,w_" + image.width + ",h_" + image.height + ",c_fill/" + url;
    }
};

export const getTimezoneName = (timeZoneDate) => {
    if (timeZoneDate) {
        try {
            var time = new Date(timeZoneDate);
            var zone = String(String(time).split("(")[1]).split(")")[0];
            var matches = zone.match(/\b(\w)/g);
            var shortZone = matches.join("");
            return shortZone;
        } catch (err) {}
    }
    return "";
};

export const dynamicFilter = {
    skipSearchKeys: ["MY_ASSETS"],
    directKeys: ["isNotified", "isWatchlisted"],
};

export const filterKeyMap = {
    category: "categoryId",
    subCategory: "subCategoryId",
    listLocation: "cityId",
    manufacturer: "make",
    model: "model",
    auctionType: "auctionTypeId",
    assetType: "assetType",
};

export const filterToChips = (filters, searchQuery, filterData = []) => {
    let chipsData = [];

    const searchQueryObj = parse(searchQuery?.split("?")[1]);
    if (searchQueryObj.searchQuery) {
        chipsData.push({
            name: searchQueryObj.searchQuery,
            key: "searchQuery",
            type: "url",
        });
    }

    Object.keys(searchQueryObj).forEach((filterKey) => {
        const searchKey = filterKeyMap[filterKey];
        const keyFilterData = filterData.find((item) => item.searchKey === searchKey);
        if (keyFilterData && keyFilterData?.subMenu?.length && keyFilterData?.searchKey !== "assetType") {
            const item = keyFilterData.subMenu.find(
                (item) =>
                    item.slug === searchQueryObj[filterKey] ||
                    (item.itemId &&
                        _isEqual(item.stateId && item.stateId !== "" ? item.stateId?.split(",")?.sort() : item.itemId?.sort(), searchQueryObj[filterKey]?.split(",")?.sort()))
            );
            if (item) chipsData.push({ name: item.name, key: filterKey, type: "url" });
        }
        if (keyFilterData?.searchKey === "assetType" && keyFilterData?.subMenu?.length) {
            keyFilterData.subMenu.map((item) => {
                if ((_isArray(searchQueryObj[filterKey]) ? searchQueryObj[filterKey].join(",") : searchQueryObj[filterKey].toLowerCase()).includes(item.itemId[0].toLowerCase())) {
                    chipsData.push({ name: item.name, key: filterKey, type: "url" });
                } else {
                    chipsData = chipsData.filter((val) => val.name.toLowerCase() === item.name.toLowerCase());
                }
            });
        }
    });
    if (filters) {
        Object.keys(filters).forEach((key) => {
            if (!dynamicFilter.directKeys.includes(key)) {
                const data = filters[key];
                if (data && data.map) {
                    chipsData = chipsData.concat(data.map((item) => ({ ...item, type: "filter", key })));
                }
            }
        });
    }
    return _uniqBy(chipsData, "name");
};
export const validateEmail = (email) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
};
export const getClientXY = (e) => {
    if (e.type.includes("touch")) {
        const theTouch = e.changedTouches[0];
        return { x: theTouch.clientX, y: theTouch.clientY };
    } else if (e.type.includes("mouse")) {
        return { x: e.clientX, y: e.clientY };
    }
};

export const isBrowserReloaded = () => {
    return window.performance && window.performance.navigation && window.performance.navigation.type && performance.navigation.type == performance.navigation.TYPE_RELOAD;
};

export const getCalculatedBuyersPremiumFee = (buyersPremiumList, nextBidAmount, nextMinBid) => {

    let charge = 0;

    if (buyersPremiumList.length > 0) {
        for (let i = 0; i <= buyersPremiumList.length; i++) {
            if (
                nextBidAmount >= buyersPremiumList[i]?.salesPriceLowerBound &&
                ((nextBidAmount <= buyersPremiumList[i]?.salesPriceUpperBound && buyersPremiumList[i]?.salesPriceUpperBound !== 0) ||
                    buyersPremiumList[i]?.salesPriceUpperBound === 0)
            ) {
                // possible to use !isNaN when testing for null
                if( ! buyersPremiumList[i].isStandard && buyersPremiumList[i].priority < 4 ) {
                    if(buyersPremiumList[i].chargeRateNoGst !== null) {
                        return parseFloat((nextBidAmount || nextMinBid) / 100) * buyersPremiumList[i].chargeRate;
                    }
                    if(buyersPremiumList[i].chargeRateFlatNoGst !== null) {
                        return buyersPremiumList[i].chargeRateFlat;
                    }
                } else {
                    if(buyersPremiumList[i].chargeRate > 0) {
                        charge = charge + parseFloat((nextBidAmount || nextMinBid) / 100) * buyersPremiumList[i].chargeRate;
                    }
                    if(buyersPremiumList[i].chargeRateFlat > 0) {
                        charge = charge + buyersPremiumList[i].chargeRateFlat;
                    }
                }
            }
        }
    }
    return charge;
};

export const getCalculatedCardFee = (nextBidAmount, calculatedPremium, nextMinBid, creditCardPercentage) => {
    if (nextBidAmount + calculatedPremium <= 5000) {
        return parseFloat(((nextBidAmount + calculatedPremium || nextMinBid + calculatedPremium) / 100) * creditCardPercentage);
    }
    return 0;
};

export const getAssetLocation = (relatedAsset) => {
    let location = [];
    if( relatedAsset && relatedAsset.assetAddress ) {
        return relatedAsset.assetAddress;
    }
    if( relatedAsset && relatedAsset.city && relatedAsset.city.name ) {
        location.push(relatedAsset.city.name);
    }
    if( relatedAsset && relatedAsset.state && relatedAsset.state.name ) {
        location.push(relatedAsset.state.name);
    }
    return location.join(', ');
}

const helpers = {
    encrypt,
    toUrlString,
    screenWidth,
    setAppTitle,
    fromUrlString,
    isInRoom,
    isTendor,
    isBuyNow,
    isOnline,
    splitWord,
    getClientXY,
    removeNumber,
    filterToChips,
    constructImageUrl,
    getCalculatedBuyersPremiumFee,
    getCalculatedCardFee
};

export default helpers;
