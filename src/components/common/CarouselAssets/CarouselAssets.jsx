import React from 'react';
import _get from 'lodash/get';
import Carousel from 'react-multi-carousel';
import Button from 'react-bootstrap/Button';
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Visible from '../Visible';
import { constructImageUrl } from '../../../utils/helpers';
import { carouselResponsive, DEFAULT_IMAGE, ASSET_STATUS } from '../../../utils/constants';

import './CarouselAssets.scss';

const responsive = carouselResponsive({ desktop: 3, tablet: 3, mobile: 2 });

class CarouselAssets extends React.Component {
    render() {
        const { assetList, isAdmin = false } = this.props;
        return (
            <div className="carousel-assets">
                <Carousel
                    swipeable={true}
                    draggable={true}
                    infinite={false}
                    responsive={responsive}
                    keyBoardControl={false}
                    containerClass="carousel-container currentitem-carousel"
                    removeArrowOnDeviceType={[]}
                    deviceType={this.props.deviceType}
                    dotListClass="custom-dot-list-container"
                    itemClass="carousel-item-padding-40-px"
                    customTransition={"transform 1ms"}
                    transitionDuration={1}
                >
                    {Array.isArray(assetList) &&
                        assetList.map((asset, index) => (
                            <div key={asset.assetId} className={`asset-details ${asset.nextAsset ? 'next-asset' : ''}`}>
                                <Visible when={asset.nextAsset}>
                                    <Button className="up-next-btn slt-dark">Up Next</Button>
                                </Visible>
                                {/* <img className="asset-image" loading="lazy" src={DEFAULT_IMAGE} onLoad={(e) => constructImageUrl(_get(asset?.assetImageUrl, 'imageUrl'), e.target)} /> */}
                                <img className="asset-image" loading="lazy" src={DEFAULT_IMAGE} onLoad={(e) => {e.target.src = asset?.assetImageUrl ?? constructImageUrl(_get(asset?.assetImages[0], 'imageUrl'), e.target)}} />
                                <Visible when={asset.status !== ASSET_STATUS.RELEASED}>
                                    <div className="status-label">{isAdmin ? asset.status : 'CLOSED'}</div>
                                </Visible>
                                <div className="asset-info">
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>{asset.title}</Tooltip>
                                        }
                                    >
                                        <div className="title">{asset.title}</div>
                                    </OverlayTrigger>
                                    <div className="my-1">
                                        <span>Lot No. </span><span className="font-weight-bold">{asset.lotNo}</span>
                                    </div>
                                    <Visible when={!isAdmin}>
                                        <div>Consignment No.</div>
                                        <div className="font-weight-bold">{asset.consignmentNo}</div>
                                    </Visible>
                                    <div className="item-no">No. {index + 1} of {assetList.length}</div>
                                    <Visible when={isAdmin}>
                                        <Visible when={asset.status === ASSET_STATUS.RELEASED}>
                                            <Button onClick={() => this.props.jumpToLot(asset)} className="jump-btn" variant="outline-warning">Jump to Lot</Button>
                                        </Visible>
                                        <Visible when={asset.status === ASSET_STATUS.PASSED_IN || asset.status === ASSET_STATUS.REFERRED || asset.status === ASSET_STATUS.SOLD}>
                                            <Button onClick={() => this.props.reopenAsset(asset)} className="jump-btn">Reopen</Button>
                                        </Visible>
                                    </Visible>
                                </div>
                            </div>
                        ))
                    }
                </Carousel>
            </div >
        )
    }
}

export default CarouselAssets;
