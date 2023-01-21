import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import SvgComponent from '../SvgComponent';
import { getClientXY } from '../../../utils/helpers';

export const ZOOM_LEVEL = {
    MIN: 0,
    MAX: 4
};
const OFFSET_DEFAULT = {
    x: 0,
    y: 0
};

const ZoomableImage = ({ zoomIn, zoomOut, resetTransform, state, centerView, image, ...rest }) => {
    const onChange = (e) => {
        centerView(e.target.value);
    };

    return (
        <React.Fragment>
            <div className="tools">
                <div className='tools-inner'>
                    <Button onClick={() => zoomOut()}>
                        <SvgComponent path="zoom_out" />
                    </Button>
                    <input type="range" min={1} max={10} step={0.1} value={state.scale} onChange={onChange} />
                    <Button onClick={() => zoomIn()}>
                        <SvgComponent path="zoom_in" />
                    </Button>
                </div>
            </div>
            <TransformComponent>
                <img src={image.src} alt="test" />
            </TransformComponent>
        </React.Fragment>
    )
};

class ImageRenderer extends Component {
    imageOuter;
    image;
    draggable;
    src;
    clientOffset;
    offsetRange;

    mounted;

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            onload: false,
            zoom: 0,
            offset: OFFSET_DEFAULT
        }
        this.draggable = false;
        this.offsetRange = OFFSET_DEFAULT;
        this.clientOffset = {
            x: undefined,
            y: undefined
        };
    }

    loadImage = (src) => {
        this.setState({ loading: true });

        this.src = new Image();
        this.src.src = src;
        this.src.onload = () => {
            if (!this.src) return;
            this.setState({ loading: false, onload: true });
        }
        this.src.onerror = () => {
            if (!this.src) return;
            this.setState({ loading: false, onload: false });
        }
    }

    resetOffset = () => {
        const offset = OFFSET_DEFAULT;
        this.setState({ offset });
    }

    setOffsetRange = () => {
        if (this.imageOuter) {
            const zoom = this.state.zoom;
            const dx = this.image?.scrollWidth * (1 + zoom / 2) - this.imageOuter.clientWidth;
            const dy = this.image?.scrollHeight * (1 + zoom / 2) - this.imageOuter.clientHeight;
            this.offsetRange = {
                x: Math.max(0, dx / 2),
                y: Math.max(0, dy / 2)
            }
        }
    }

    // zoomIn = () => {
    //     if (!this.state.onload) return;
    //     const zoom = Math.min(this.state.zoom + 1, ZOOM_LEVEL.MAX);
    //     this.setState({ zoom });
    //     this.setOffsetRange();
    // }

    // zoomOut = () => {
    //     if (!this.state.onload) return;
    //     const zoom = Math.max(0, this.state.zoom - 1);
    //     this.setState({ zoom });
    //     this.resetOffset();
    // }

    onZoomChange = (e) => {
        const zoom = Math.min(ZOOM_LEVEL.MAX, Math.max(ZOOM_LEVEL.MIN, e.target.value));
        this.setState({ zoom }, this.setOffsetRange);
        this.props.onZoom && this.props.onZoom(e, zoom);
        if (zoom < this.state.zoom) {
            this.resetOffset();
        }
    }

    onMoveStart = (e) => {
        if (!this.offsetRange.x && !this.offsetRange.y) {
            return;
        }

        // e.preventDefault();
        e.stopPropagation();

        this.clientOffset = getClientXY(e);
        this.draggable = true;
    }

    onMove = (e) => {
        const { x, y } = getClientXY(e);

        if (!x && !y || !this.draggable) {
            return;
        }
        // e.preventDefault();
        e.stopPropagation();

        const offset = {
            x: x - this.clientOffset.x,
            y: y - this.clientOffset.y,
        };

        this.clientOffset = { x, y };

        offset.x = this.state.offset.x + offset.x;
        offset.y = this.state.offset.y + offset.y;
        this.setState({ offset });
    }

    onMoveEnd = (e) => {
        if (!this.mounted) return;

        // e.preventDefault();
        e.stopPropagation();

        this.draggable = false;
        const offset = {
            x: Math.abs(this.state.offset.x),
            y: Math.abs(this.state.offset.y)
        }

        if (Math.abs(offset.x) >= this.offsetRange.x) {
            offset.x = offset.x < 0 ? Math.min(0, -(this.offsetRange.x)) : Math.max(0, this.offsetRange.x);
        }

        if (Math.abs(offset.y) >= this.offsetRange.y) {
            offset.y = offset.y < 0 ? Math.min(0, -(this.offsetRange.y)) : Math.max(0, this.offsetRange.y);
        }
        this.setState({ offset });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.image.src != nextProps.image.src) {
            this.resetOffset();
            this.loadImage(nextProps.image.src);
            this.setState({
                zoom: 0
            });
        }
    }

    componentDidMount() {
        this.mounted = true;
        this.loadImage(this.props.image.src);
        window.addEventListener('resize', this.setOffsetRange.bind(this));
        // document.documentElement.addEventListener("mouseup", this.onMoveEnd.bind(this));
        // document.documentElement.addEventListener("touchend", this.onMoveEnd.bind(this));
    }

    componentWillUnmount() {
        this.mounted = false;
        if (!!this.src) {
            this.src = undefined;
        }
        window.removeEventListener('resize', this.setOffsetRange.bind(this));
        // document.documentElement.removeEventListener("mouseup", this.onMoveEnd.bind(this));
        // document.documentElement.removeEventListener("touchend", this.onMoveEnd.bind(this));
    }

    render() {
        const {
            image
        } = this.props;

        return (
            <div className="image-renderer">
                {/* <input className='image-zoom-control' type="range" min={ZOOM_LEVEL.MIN} max={ZOOM_LEVEL.MAX} step={0.1} value={zoom} onChange={this.onZoomChange} /> */}


                <div className='image-wrapper'>
                    <TransformWrapper>
                        {(props) => (
                            <ZoomableImage image={image} {...props} />
                        )}
                        {/* <TransformComponent>
                            <img src={image.src} alt="test" />
                        </TransformComponent> */}
                    </TransformWrapper>
                    {/* <div
                        style={{ transform: value }}
                        ref={(component) => this.imageOuter = component}
                        className={imageCls}>
                        <img
                            className="image"
                            src={image.src}
                            draggable={false}
                            alt={image.title || ''}
                            onMouseMove={this.onMove}
                            onTouchMove={this.onMove}
                            onMouseUp={this.onMoveEnd}
                            onTouchEnd={this.onMoveEnd}
                            onDragStart={(e) => e.preventDefault()}
                            onMouseDown={this.onMoveStart}
                            onTouchStart={this.onMoveStart}
                            ref={(component) => this.image = component}
                            style={{ transform: `scale3d(${zoomScale}, ${zoomScale}, 1)` }}
                        />
                    </div> */}
                </div>
            </div>
        )
    }
}

export default ImageRenderer;
