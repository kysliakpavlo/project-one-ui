import React from "react";
import _get from "lodash/get";
import _cloneDeep from "lodash/cloneDeep";
import dayjs from "dayjs";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import _isFunction from "lodash/isFunction";
import Visible from "../Visible";
import { BidHistoryTable } from "../BidHistory";
import SvgComponent from "../SvgComponent";
import { ImageGalleryView } from "../ImageGallery";
import PlaceBid, { MobilePlaceBid, DetailedPlaceBid } from "../PlaceBid";
import Pagination from "../Pagination";
import { stringify, parse } from "qs";
import { TransportCalculatorTable } from "../TransportCalculator";
import { AssetItemGridCard, AssetItemListCard, AssetDetailSlider } from "../AssetItemCard";
import { ASSET_TYPE, SOCKET, DEFAULT_IMAGE, MESSAGES } from "../../../utils/constants";
import { preventEvent, scrollToTop, toUrlString } from "../../../utils/helpers";
import onClickOutside from "react-onclickoutside";
import "./AssetCards.scss";

let sortByOptions = [
    { key: "lotNo", label: "Lot No" },
    { key: "currentBidAmount/asc", label: "Price -- Low to High" },
    { key: "currentBidAmount/desc", label: "Price -- High to Low" },
    { key: "createdDate/desc", label: "Recently Added" },
    { key: "datetimeClose/desc", label: "Closing Soon" },
];

const pageSizeOptions = [
    { key: 12, label: "12" },
    { key: 36, label: "36" },
    { key: 60, label: "60" },
    { key: 96, label: "96" },
];

class AssetCards extends React.Component {
    detailsContentRef = [];

    constructor(props) {
        super(props);
        this.state = {
            width: window.innerWidth,
            activeView: props.activeView || "grid",
            assetCardHilight: null,
            showDetails: {
                asset: null,
                name: null,
            },
        };
    }

    componentDidMount() {
        this.openAssetChannel();
        window.addEventListener("resize", this.updateDimensions);
    }
    componentWillUnmount() {
        this.closeAssetChannel();
        window.removeEventListener("resize", this.updateDimensions);
    }

    openAssetChannel() {
        const { socket, updateItems } = this.props;
        if (socket && socket.on) {
            socket.on(SOCKET.ON_ASSET_CHANGE, ({ asset }) => {
                const { items, loggedInUser } = this.props;
                const cloned = _cloneDeep(items);
                const accountId = _get(loggedInUser, "accountId");

                const item = cloned.find((i) => i.assetId === asset.assetId);
                cloned.forEach((j) => {
                    if (j.auctionData.auctionId === asset.auctionId) {
                        j.termsAgreed = true;
                    }
                });

                if (item) {
                    item.accountId = asset.accountId;
                    item.highestBidder = asset.accountId === accountId;
                    item.currentBidAmount = asset.currentBidAmount;
                    item.datetimeClose = asset.datetimeClose;
                    item.isExtended = asset.isExtended;
                    let { showDetails } = this.state;
                    if (showDetails?.asset?.assetId === asset.assetId) {
                        showDetails = {
                            ...showDetails,
                            asset: { ...showDetails.asset, ...item },
                        };
                    }
                    this.setState({ assetCardHilight: asset.assetId, showDetails });
                    setTimeout(() => {
                        this.setState({ assetCardHilight: null });
                    }, 3000);
                    updateItems(cloned);
                }
            });
        }
    }

    onClickNotifyMe = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.props.toggleLogin(true);
    };
    handleClickOutside = (evt) => {
        if (evt.target?.nodeName !== "HTML") {
            const placeBidModal = document.getElementById("place-bid-modal")?.className?.includes("modal-dialog");
            if (!placeBidModal) {
                this.onCloseDetails();
            }
        }
    };
    closeAssetChannel() {
        const { socket } = this.props;
        if (socket && socket.off) {
            socket.off(SOCKET.ON_ASSET_CHANGE);
        }
    }

    navigateToAsset = (e, consignmentNum, auctionNum, isEOI) => {
        e.preventDefault();
        e.stopPropagation();
        this.props.onAssetClick(consignmentNum, auctionNum, isEOI);
    };

    updateDimensions = () => {
        this.setState({ width: window.innerWidth });
    };

    onCardShowAction = async (e, name, asset) => {
        preventEvent(e);
        if (name === "notifyme") {
            if (e) {
                this.setState({ showDetails: { name, asset } });
            } else {
                this.onCloseDetails();
            }
        } else {
            if (name === "placebid") {
                this.onPlaceBidClick(asset);
            } else if (name === "spin-car") {
                let images = [{ original: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE }];
                if (asset.assetImages !== asset.totalAssetImages) {
                    images = await this.props.getAssetImages(asset.assetId).then((res) => {
                        return res.result?.map(({ imageUrl }) => ({
                            original: imageUrl,
                            thumbnail: imageUrl,
                        }));
                    });
                }
                this.setState({ showDetails: { name, asset, images } });
            } else {
                this.setState({ showDetails: { name, asset } });
            }
        }
    };

    onCloseDetails = (e) => {
        preventEvent(e);
        this.setState({ showDetails: { name: null, asset: null } });
    };

    onPlaceBidClick = (asset) => {
        const { loggedInUser } = this.props;

        if (!loggedInUser) {
            this.props.toggleLogin(true, () => {
                this.setState({ showDetails: { name: "placebid", asset } });
            });
        } else if (loggedInUser && (!loggedInUser.cardExist || (loggedInUser.overrideCardCheck && loggedInUser.cardExist))) {
            this.props.showMessage({ message: MESSAGES.CARD_MISSING, type: "error" });
            this.props.history.push("/profile?onComplete");
        } else {
            this.setState({ showDetails: { name: "placebid", asset } });
        }
    };

    openAssetDetails = (item) => {
        const { history, searchCrietria, setDetailsAsset } = this.props;
        const groupName = _get(item, "assetCategory.categoryGroup.groupName");
        history.push({
            pathname: `/asset`,
            search: stringify({
                auctionNum: item?.auctionData?.auctionNum,
                consignmentNo: item?.consignmentNo,
            }),
            state: {
                searchCrietria,
                groupName,
            },
        });
        setDetailsAsset(item.assetId);
    };
    onPlaceBidConfirm = (data) => {
        this.props
            .confirmBid(data)
            .then((res) => {
                this.props.showMessage({
                    message: (
                        <div>
                            <div>
                                {data.bidType === "absentee-bid" ? (
                                    <span>{MESSAGES.ABSENTEE_BID}</span>
                                ) : data.bidType === "auto" ? (
                                    <span>{MESSAGES.AUTO_BID}</span>
                                ) : (
                                    <span>{MESSAGES.BID_PLACED}</span>
                                )}
                            </div>
                        </div>
                    ),
                    messageId: "absenteeBid",
                });
                this.setState({ showDetails: { name: "placebid", asset: null } });
            })
            .catch((err) => {
                this.props.showMessage({ message: err.message, type: "error" });
            });
    };

    // toggleView = () => {
    //     const { activeView } = this.state;
    //     const nextView = activeView === "grid" ? "list" : "grid";
    //     this.setState({ activeView: nextView });
    //     this.props.updateActiveView(nextView);
    // };

    onAddToWatchList = ({ assetId, auctionId }) => {
        const req = {
            assetId,
        };
        if (auctionId) {
            req.auctionId = auctionId;
        }
        this.props
            .addToWatchlist(req)
            .then((res) => {
                const { items, updateItems, showMessage } = this.props;

                const cloned = _cloneDeep(items);
                const item = cloned.find((i) => i.assetId === assetId);
                item.isWatchListed = !item.isWatchListed;

                updateItems(cloned);
                showMessage({
                    message: item.isWatchListed ? MESSAGES.ADD_WATCHLIST : MESSAGES.REMOVE_WATCHLIST,
                });
            })
            .catch((err) => {
                this.props.showMessage({ message: err.message, type: "error" });
            });
    };

    notificationUpdate = (message, assetId) => {
        const { showMessage, items, updateItems } = this.props;
        showMessage({ message });
        const cloned = _cloneDeep(items);
        const item = cloned.find((i) => i.assetId === assetId);
        if (item) {
            item.isNotified = true;
            updateItems(cloned);
            if (this.state.showDetails?.asset?.assetId === assetId) {
                const asset = { ...item, isNotified: true };
                setTimeout(() => {
                    this.setState({
                        showDetails: { asset, name: this.state.showDetails?.name },
                    });
                }, 10);
            }
        }
    };

    onCompleteTimer = () => {
        const { items, updateItems } = this.props;
        const { showDetails } = this.props;
        const cloned = _cloneDeep(items);
        if (showDetails?.name === "placebid") {
            this.setState({ name: null, asset: null });
        }
        updateItems(cloned);
    };

    downloadDocument = (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        const link = document.createElement("a");
        link.href = item.auctionImages[0].imageUrl;
        link.download = "file.pdf";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    render() {
        
        const { items = [], activeView, total, sortPaging, onChange, loggedInUser, toggleLogin, itemWonPage, onPayClick, paymentPage, creditCardPercentage } = this.props;

        const { width, showDetails, assetCardHilight } = this.state;
        const isLoggedIn = !!loggedInUser;
        const { sortBy, pageSize, activePage } = sortPaging;
        let cardsPerRow;
        if (width >= 1024 && width <= 1200) {
            cardsPerRow = 4;
        } else if (width > 767) {
            cardsPerRow = 3;
        } else {
            cardsPerRow = 1;
        }
        const assetGridItems = [];
        let assets = items;
        // if (!sortBy || sortBy === "lotNo") {
        //   const closedAssets = [];
        //   const bonusTimeAssets = [];
        //   const otherAssets = [];
        //   items.forEach((item) => {
        //     if (dayjs(item.datetimeClose) <= dayjs()) {
        //       closedAssets.push(item);
        //     } else if (item.isExtended) {
        //       bonusTimeAssets.push(item);
        //     } else {
        //       otherAssets.push(item);
        //     }
        //   });
        //   assets = bonusTimeAssets.concat(otherAssets).concat(closedAssets);
        // }
        if (items && (activeView === "grid" || width < 1200)) {
            for (let i = 0; i < assets.length; i += cardsPerRow) {
                const cards = assets.slice(i, i + cardsPerRow);
                assetGridItems.push({
                    uniqueId: cards.map((card) => card.assetId).join(),
                    assetIds: cards.map((card) => card.assetId),
                    items: cards,
                });
            }
        }
        if (this.props.isEOI) {
            sortByOptions = [
                { key: "lotNo", label: "Lot No" },
                { key: "createdDate/desc", label: "Recently Added" },
            ];
        } else if (this.props.groupName === ASSET_TYPE.BUY_NOW) {
            sortByOptions = [
                { key: "currentBidAmount/asc", label: "Price -- Low to High" },
                { key: "currentBidAmount/desc", label: "Price -- High to Low" },
                { key: "createdDate/desc", label: "Recently Added" },
            ];
        } else {
            sortByOptions = [
                { key: "lotNo", label: "Lot No" },
                { key: "currentBidAmount/asc", label: "Price -- Low to High" },
                { key: "currentBidAmount/desc", label: "Price -- High to Low" },
                { key: "createdDate/desc", label: "Recently Added" },
                { key: "datetimeClose/asc", label: "Closing Soon" },
            ];
        }
        const onPaginationChange = (pagination, isBottom) => {
            if (_isFunction(onChange)) {
                onChange({ ...pagination });
                if (isBottom && (pageSize > pagination.pageSize || activePage !== pagination.activePage || sortBy !== pagination.sortBy)) {
                    scrollToTop();
                }
            }
        };

        const PaginationEle = ({ bottom }) => (
            <div className="sort-block">
                <Pagination
                    total={total}
                    pageSize={pageSize}
                    active={activePage}
                    sortBy={sortBy}
                    onChange={(args) => onPaginationChange(args, bottom)}
                    sortByOptions={sortByOptions}
                    pageSizeOptions={pageSizeOptions}
                />
            </div>
        );

        const PlaceBidComponent = width <= 767 ? MobilePlaceBid : activeView === "list" ? PlaceBid : DetailedPlaceBid;

        return (
            <div className="asset-cards">
                {assets && assets.length > 0 && (
                    <>
                        {/* <PaginationEle />
                        <div className="list-grid-btn">
                            <ButtonGroup>
                                <Button onClick={this.toggleView} className={activeView === "list" ? "active" : ""}>
                                    <SvgComponent path="table_rows"></SvgComponent> List
                                </Button>
                                <Button onClick={this.toggleView} className={activeView === "grid" ? "active" : ""}>
                                    <SvgComponent path="grid_view"></SvgComponent> Grid
                                </Button>
                            </ButtonGroup>
                        </div> */}
                        {/* <FilterComponant filterObj={filter} onChange={onChangeFilters} auctionId={auctionId} /> not required any more*/}
                        <Row className="card-row justify-content-start">
                            <Visible when={activeView === "list" && width > 767}>
                                {assets.map((item, index) => (
                                    <Col id={`asset_${item.assetId}`} xs={12} key={item.assetId} className="asset-item-card">
                                        <AssetItemListCard
                                            item={item}
                                            isLoggedIn={isLoggedIn}
                                            toggleLogin={toggleLogin}
                                            loggedInUser={loggedInUser}
                                            showMessage={this.props.showMessage}
                                            onPlaceBidConfirm={this.onPlaceBidConfirm}
                                            openAssetDetails={() => this.openAssetDetails(item)}
                                            notificationUpdate={(message) => this.notificationUpdate(message, item.assetId)}
                                            onCompleteTimer={this.onCompleteTimer.bind(null, item)}
                                            className={`${assetCardHilight === item.assetId ? "hilight" : ""}`}
                                            onAddToWatchList={(data) =>
                                                this.onAddToWatchList({
                                                    ...data,
                                                    auctionId: item?.auctionData.auctionId,
                                                })
                                            }
                                            isPbReq={dayjs() >= dayjs(item.datetimeOpen) && dayjs() <= dayjs(item.datetimeClose) ? true : false}
                                            currentDetails={showDetails.asset?.assetId === item.assetId && showDetails.name}
                                            onCardShowAction={this.onCardShowAction}
                                            onCardHideAction={this.onCardHideAction}
                                            notifyMeContainer={this.detailsContentRef[index]}
                                            searchCrietria={this.props.searchCrietria}
                                            groupName={_get(item, "assetCategory.categoryGroup.groupName")}
                                            setDetailsAsset={this.props.setDetailsAsset}
                                            handleClickOutside={this.handleClickOutside}
                                        />
                                        <div className="detail-view" ref={(reff) => (this.detailsContentRef[index] = reff)}>
                                            <Visible when={showDetails.name === "placebid" && showDetails?.asset?.assetId === item.assetId}>
                                                <PlaceBidComponent
                                                    asset={showDetails?.asset}
                                                    creditCardPercentage={creditCardPercentage}
                                                    showMessage={this.props.showMessage}
                                                    onPlaceBidConfirm={this.onPlaceBidConfirm}
                                                    onCloseClick={this.onCloseDetails}
                                                    loggedInUser={loggedInUser}
                                                    toggleLogin={toggleLogin}
                                                    closebutton
                                                    notificationUpdate={(message) => this.notificationUpdate(message, showDetails?.asset.assetId)}
                                                />
                                            </Visible>
                                            <Visible when={showDetails.name === "bid-history" && showDetails?.asset?.assetId === item.assetId}>
                                                <Card className="bid-history-card">
                                                    <BidHistoryTable
                                                        loggedInUser={loggedInUser}
                                                        onClose={this.onCloseDetails}
                                                        status={showDetails?.asset?.status}
                                                        assetId={showDetails?.asset?.assetId}
                                                        auctionId={showDetails?.asset?.auctionData?.auctionId}
                                                    />
                                                </Card>
                                            </Visible>
                                            <Visible when={showDetails.name === "details" && showDetails?.asset?.assetId === item.assetId}>
                                                <Card className="bid-details-card">
                                                    <Button variant="warning" className="slt-dark close-btn" onClick={this.onCloseDetails}>
                                                        <SvgComponent path="close" />
                                                    </Button>
                                                    <Row>
                                                        <Col xs={6}>
                                                            <Card.Body>
                                                                <Card.Title className="detail-title">Description / Sales Notes</Card.Title>
                                                                <div className="details-content">
                                                                    <Visible when={showDetails?.asset?.description}>
                                                                        <p
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: showDetails?.asset?.description,
                                                                            }}
                                                                        />
                                                                    </Visible>
                                                                    <Visible when={showDetails?.asset?.auctionData?.saleNote}>
                                                                        <p
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: showDetails?.asset?.auctionData.saleNote,
                                                                            }}
                                                                        />
                                                                    </Visible>
                                                                </div>
                                                            </Card.Body>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <Card.Body>
                                                                <Card.Title className="detail-title">Item Details</Card.Title>
                                                                <AssetDetailSlider assetId={showDetails?.asset?.assetId} auctionId={showDetails?.asset?.auctionData?.auctionId} />
                                                            </Card.Body>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </Visible>
                                            <Visible when={showDetails.name === "freight-cal" && showDetails?.asset?.assetId === item.assetId}>
                                                <Card className="bid-transport-calc-card">
                                                    <TransportCalculatorTable
                                                        enquiry={true}
                                                        loggedInUser={loggedInUser}
                                                        onClose={this.onCloseDetails}
                                                        assetDetail={showDetails?.asset}
                                                        fromLocation={showDetails?.asset?.city?.cityId}
                                                        showMessage={this.props.showMessage}
                                                        assetType={showDetails?.asset?.assetCategory?.recordTypeId}
                                                    />
                                                </Card>
                                            </Visible>
                                            {showDetails.name === "spin-car" && showDetails?.asset?.assetId === item.assetId && (
                                                <ImageGalleryView
                                                    show
                                                    activeView="spin-car"
                                                    loggedInUser={loggedInUser}
                                                    images={showDetails?.images}
                                                    assetDetail={showDetails?.asset}
                                                    handleClose={this.onCloseDetails}
                                                    showMessage={this.props.showMessage}
                                                />
                                            )}
                                        </div>
                                    </Col>
                                ))}
                            </Visible>
                            <Visible when={activeView === "grid" || width <= 767}>
                                {assetGridItems.map((rowData) => (
                                    <React.Fragment key={rowData.uniqueId}>
                                        {rowData.items.map((item) => (
                                            <Col
                                                id={`asset_${item.assetId}`}
                                                className={`AssetCard asset-item-card ${
                                                    item.assetId === showDetails?.asset?.assetId || !showDetails?.asset?.assetId ? "" : "card-overlay"
                                                }`}
                                                key={item.assetId}
                                                xs={12}
                                                sm={12 / cardsPerRow}
                                            >
                                                <AssetItemGridCard
                                                    item={item}
                                                    isLoggedIn={isLoggedIn}
                                                    toggleLogin={toggleLogin}
                                                    loggedInUser={loggedInUser}
                                                    showMessage={this.props.showMessage}
                                                    onCardShowAction={this.onCardShowAction}
                                                    openAssetDetails={() => this.openAssetDetails(item)}
                                                    paymentHistoryPage={this.props.paymentHistoryPage}
                                                    onCompleteTimer={this.onCompleteTimer.bind(null, item)}
                                                    className={`${assetCardHilight === item.assetId ? "hilight" : ""}`}
                                                    notificationUpdate={(message) => this.notificationUpdate(message, item.assetId)}
                                                    onAddToWatchList={(data) =>
                                                        this.onAddToWatchList({
                                                            ...data,
                                                            auctionId: item?.auctionData.auctionId,
                                                        })
                                                    }
                                                    itemWonPage={itemWonPage}
                                                    onPayClick={onPayClick}
                                                    searchCrietria={this.props.searchCrietria}
                                                    groupName={_get(item, "assetCategory.categoryGroup.groupName")}
                                                    setDetailsAsset={this.props.setDetailsAsset}
                                                />
                                            </Col>
                                        ))}
                                        <Visible when={rowData.assetIds.includes(showDetails?.asset?.assetId)}>
                                            {showDetails.name === "spin-car" && (
                                                <ImageGalleryView
                                                    show
                                                    activeView="spin-car"
                                                    loggedInUser={loggedInUser}
                                                    images={showDetails?.images}
                                                    assetDetail={showDetails?.asset}
                                                    handleClose={this.onCloseDetails}
                                                    showMessage={this.props.showMessage}
                                                />
                                            )}
                                            {showDetails.name === "placebid" && (
                                                <Col lg={12} className={activeView === "list" ? "list-block placebid-col" : "placebid-col"}>
                                                    <PlaceBidComponent
                                                        closebutton
                                                        setDetailsAsset={this.props.setDetailsAsset}
                                                        creditCardPercentage={creditCardPercentage}
                                                        toggleLogin={toggleLogin}
                                                        asset={showDetails?.asset}
                                                        loggedInUser={loggedInUser}
                                                        onCloseClick={this.onCloseDetails}
                                                        showMessage={this.props.showMessage}
                                                        onPlaceBidConfirm={this.onPlaceBidConfirm}
                                                        notificationUpdate={(message) => this.notificationUpdate(message, showDetails?.asset.assetId)}
                                                    />
                                                </Col>
                                            )}
                                        </Visible>
                                    </React.Fragment>
                                ))}
                            </Visible>
                        </Row>
                        {/* <PaginationEle bottom /> */}
                    </>
                )}
            </div>
        );
    }
}

export default onClickOutside(AssetCards);
