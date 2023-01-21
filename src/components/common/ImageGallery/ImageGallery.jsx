import React, { useState, useCallback } from "react";
import ImageGalleryComp from "react-image-gallery";
import ImageRenderer from "./ImageRenderer";
import VideoRenderer from "./VideoRenderer";
import "react-image-gallery/styles/scss/image-gallery.scss";

const ImageGallery = ({ items, isModal, onSlide, ...props }) => {
    const [swipable, setSwipable] = useState(false);

    const onZoom = useCallback(
        (e, zoom) => {
            setSwipable(!!zoom);
        },
        [setSwipable]
    );

    const RenderImage = useCallback(
        (props) => (
            <ImageRenderer
                image={{
                    src: props?.original,
                }}
                onZoom={onZoom}
            />
        ),
        [onZoom]
    );

    const RenderVideo = useCallback((props) => <VideoRenderer src={props?.original} />, []);

    const updatedImages = items.map((item) => {
        const updatedItem = {
            thumbnail: `https://res.cloudinary.com/slattery-auctions-and-valuations/image/fetch/q_auto,f_auto,w_180,c_fill/${item.thumbnail}`,
            original: `https://res.cloudinary.com/slattery-auctions-and-valuations/image/fetch/q_auto,f_auto,w_1200,h_900,c_fill/${item.original}`,
        };
        if (item.original.includes(".mp4")) {
            updatedItem.renderItem = RenderVideo;
            updatedItem.original = item.original;
            updatedItem.thumbnail = "/assets/video.png";
        }
        return updatedItem;
    });

    const onSlideChange = (...args) => {
        onSlide && onSlide(...args);
        document.querySelector("video")?.pause();
    };
    return <ImageGalleryComp disableSwipe={swipable} items={updatedImages} renderItem={isModal ? RenderImage : null} onSlide={onSlideChange} {...props} />;
};

export default ImageGallery;
