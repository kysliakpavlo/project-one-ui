// Using heroku env vars to determine api url
// note that for React apps we cant modify  process.env.NODE_ENV
// it is always set to production
// as per react documentation
// use REACT_APP_QA_ENV - QA
// use REACT_APP_STAGING_ENV - STAGING

let getEnv = function (key) {
  const staging = process.env.REACT_APP_STAGING_ENV;
  const qa = process.env.REACT_APP_QA_ENV;

  if (staging === "TRUE") {
      console.log('Env: Staging');
      return "https://slattery-api-staging.herokuapp.com";
  } else if (qa == "TRUE") {
      return "https://slattery-api-qa.herokuapp.com";
  } else if (key == "development") {
    console.log('Env: development');
      return "http://localhost:4000";
  } else {
      return "https://slatteryauction-api.herokuapp.com";
  }
};

export const API_PATH = getEnv(process.env.NODE_ENV);

export const FACEBOOK_APP_ID = "303950611078232"; // "700531023889622";
export const GOOGLE_CLIENT_ID =
    "875164102794-pduegntn4j3q7u0qg7bodgn067i8l5oa.apps.googleusercontent.com";
export const GOOGLE_API_KEY = "AIzaSyDmpkNhbSXKpTkcfq0ROLvGkb_wpXo1Qzg";
export const PRE_RENDER_TOKEN = "Awz6QA4WTjPNMhfDFSdL";
export const GOOGLE_RECAPTCHA_SITE_KEY = window.location.origin.includes(
    "slatteryauctions"
)
    ? "6LeXJpgdAAAAAFa99aOgGWKdTydPMcGhBI2wASw5"
    : "6Lf1L4EaAAAAAGg91K0uW8zPdqeNbiKj0LVSROcB";
export const PAYPAL_CLIENT_ID =
    "AV080b3FOHisowhtS1m7VQG6qT5r3J7P0vaW2W7Y0LiEmo2RYXsm2Q0b_xND_2iIs12YN6_SrAwvUu6H";
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
export const ONE_MINUTE = 60 * 1000;
export const AUCTION_CATALOGUE = "Auction_Catalogue_";
export const BANNER_CAROUSEL_INTERVAL = 5 * 1000;
export const IT_AND_COMPUTERS = "IT & Computers";
export const DEF_COUNTRY = "Australia";
export const LIVE = "Live";
export const DEFAULT_IMAGE =
    "https://s3.ap-southeast-2.amazonaws.com/slattery.sams-2022/slattery/Consignments/119901/Flx7TBFmEKOJJgq5pEQiiZmzPepdJ45e02QUurJB.jpg";
export const DATE_FORMAT = {
    DATE: "DD-MMM-YYYY",
    DATETIME: "DD-MMM-YYYY hh:mm A",
    MON_DATETIME: "MMMM DD YYYY, h:mm:ss a",
    TIME: "hh:mm:ss",
    YEAR: "YYYY",
};

export const SOCKET = {
    ON_ASSET_CHANGE: "onAssetChange",
    OUTBID_FUNCTIONALITY: "Outbid-functionality-",
    ASSET_DETAIL: "onAssetDetail-",
    BIDDINGLOG_ON_ASSETID: "bidding-log-on-asset-id-",
    REQUEST_LOWER_BID_INCREMENT: "request-lower-bid-increment-",
    IMPORTANT_NOTE_AUCTION: "important_note-",
    ADMIN_ASSET: "Admin-Asset-",
    BID_ADMTTED_RESPONSE: "Bid-Admit-Response",
    ADMIN_CONSOLE: "Admin-Console",
    CHANGE_BID_INC_REQUEST: "Change-bid-inc-request-",
    ON_AUCTION_CHANGE: "on-auction-change",
    ENABLE_LOW_BID_BTN: "Enable-Low-Bid-Btn",
    USER_PANEL_CHANGE: "User-Panel-Change-",
    LIVE_NOTIFICATION: "OnUser-Notification-CountChange-",
    CREDIT_CARD_VALIDATED: "Credit-Card-Validated-",
    LAST_CALL: "Last-Call-",
    AUCTION_STATISTICS_CHANGE: "Auction-Statistics-Change-",
    BUY_NOW_STATUS_CHANGE: "Buy-Now-Status-Change-",
    ADMIN_ALERT: "Admin-In-Auction-",
    ADMIN_ON_ASSET_CHANGE: "Admin-On-Asset-Change-",
};
export const SUBSCRIPTION_SOURCE = {
    REGISTRATION: "registration",
    ENQUIRY: "enquiry",
    MARKETING_PREFERENCES: "marketing_preferences",
    NEWS_LETTER: "news_letter",
    FIRST_TIME_VISITOR: "first_time_visitor",
};

export const ASSET_TYPE = {
    AVIATION: "Aviation",
    AUCTION: "Auction",
    EOI: "EOI",
    BUY_NOW: "Buy Now",
    MOTOR_VEHICLE: "Motor Vehicle",
};

export const AUCTION_TYPES = {
    ONLINE: "Online",
    TENDER: "Tender",
    BUY_NOW: "Buy Now",
    IN_ROOM: "In Room",
    EOI: "EOI",
};

export const AUCTION_TYPES_MAP = {
    Online: AUCTION_TYPES.ONLINE,
    "Traditional / Simulcast": AUCTION_TYPES.IN_ROOM, // TODO Revisit this value
    "Traditional only": AUCTION_TYPES.IN_ROOM,
    EOI: AUCTION_TYPES.EOI,
};

export const AUCTION_SITE_TYPE = {
    SITE_BASE: "Site Based",
    NATIONAL: "National",
    DISPLAY_NATIONAL: "SLATTERY, NATIONAL",
};

export const ASSET_STATUS = {
    RELEASED: "Released",
    PASSED_IN: "Passed In",
    REFERRED: "Referred",
    SOLD: "Sold",
    UNDER_OFFER: "Under Offer",
    BUY_NOW: "Buy Now",
};

export const ASSET_LIST_TYPE = {
    AUCTION_WINNING: "winning list",
};

export const STATIC_PAGE_LISTS = [
    "valuation",
    "quarterly-reports",
    "finance",
    "forgot-password",
    "profile",
    "contact-us",
    "sitemap",
    "terms-conditions",
    "valuations",
    "search-results",
    "auctions",
    "tenders",
    "watching",
    "registration",
    "my-account",
    "active-bids",
    "payments",
    "items-won",
    "privacy-policy",
    "news",
    "reports",
    "faq",
    "site-map",
    "about-us",
    "career",
    "accept-terms-conditions",
    "sell-with-us",
    "sell-with-us-campaign",
];

export const AUTH_REQ_PAGES = [
    "my-account",
    "active-bid",
    "profile",
    "watching",
    "items-won",
    "payments",
    "watchlist",
];

export const carouselResponsive = (
    { superLargeDesktop = 1, desktop = 1, tablet = 1, mobile = 1 },
    partialVisibilityGutter
) => ({
    superLargeDesktop: {
        // the naming can be any, depends on you.
        breakpoint: { max: 4000, min: 3000 },
        items: superLargeDesktop,
        slidesToSlide: 1,
        partialVisibilityGutter: partialVisibilityGutter ? 40 : undefined,
    },
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: desktop,
        slidesToSlide: 1, // optional, default to 1.
        partialVisibilityGutter: partialVisibilityGutter ? 40 : undefined,
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: tablet,
        slidesToSlide: 1, // optional, default to 1.
        partialVisibilityGutter: partialVisibilityGutter ? 30 : undefined,
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: mobile,
        slidesToSlide: 1, // optional, default to 1.
        partialVisibilityGutter: partialVisibilityGutter ? 30 : undefined,
    },
});

export const RELATED_ASSET_NAVIGATION_PAGE = {
    SEARCH_RESULT: "search-results",
    AUCTION_CATALOGUE: "auction-catalogue",
};

export const MESSAGES = {
    LOGOUT: "You have been successfully logged out!",
    SESSION_EXPIRE: "Your last session has been expired!",
    CARD_MISSING: "Credit Card details missing, Please update to bid.",
    ADD_WATCHLIST: "Added to watchlist.",
    REMOVE_WATCHLIST: "Removed from watchlist",
    COPY_URL: "Page Url copied to Clipboard",
    ASSET_BOUGHT: "Buy now request has been submitted.",
    NO_DOCUMENT: "No documents attached to download",
    ENQUIRY_SUBMIT:
        "Thank you for getting in touch. One of our friendly team will be in touch soon.",
    ABSENTEE_BID: "Absentee Bid confirmed Successfully.",
    AUTO_BID: "Auto Bid Request Placed Successfully.",
    BID_PLACED: "Bid Placed Successfully, You are now the Highest Bidder.",
    SUBSCRIPTION_SUCCESS: "Subscription Updated Successfully",
    SUBSCRIPTION_FAILURE: "Subscription Failed",
    SELECT_CATERGORY: "Please select atleast one category",
    ANOTHER_ADMIN: "Another user with same user id joined this auction",
    PLACE_BID_CURRENT_BID:
        "Place Bid Amount should be more than current bid amount.",
    AUCTION_LOT_WON: "You have won the auction of Lot No #",
    AUCTION_LAST_CALL: "Last call for lot no",
    AUCTION_SUSPEND:
        "Auction has been suspended due to some reason. It will be resumed soon.",
    AUCTION_RESUME: "Auction has been Resumed",
    AUCTION_HIGHEST_BID: "You are the highest bidder with",
    AUCTION_OUTBID: "You have been Outbid on",
    AUCTION_LOWER_BID:
        "Lower Bid increment request sent to Admin successfully For",
    MOBILE_VERIFICATION:
        "Mobile verification is mandatory to complete registration",
    CARD_FAILED: "Card Verification Failed",
    SAVED_SEARCHED_MESSAGE: "Please enter a name to save the search",
    THANKS_SUBSCRIBE:
        "Thank you for subscribing to Slattery Auction's newsletter",
    ACCOUNT_SUSPEND:
        "Your account has been suspended. If you have any questions please contact your local team",
};
