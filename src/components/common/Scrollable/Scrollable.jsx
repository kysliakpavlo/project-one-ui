import React, { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';

import SvgComponent from '../SvgComponent';
import useWindowSize from '../../../hooks/useWindowSize';
import { getClientXY } from '../../../utils/helpers';
import './Scrollable.scss';

let pos = { top: 0, left: 0, x: 0, y: 0 };
let ele;
let moved = false;
let onComplete = null;

function addDragListener(element, e, onCompleteDragDrop) {
    ele = element;
    const { x, y } = getClientXY(e);
    pos = {
        // The current scroll 
        x,
        y,
        left: ele.scrollLeft,
        top: ele.scrollTop,
        // Get the current mouse position
    };

    ele.style.cursor = 'grabbing';
    ele.style.userSelect = 'none';

    ele.addEventListener('mouseup', onMouseUp);
    ele.addEventListener('mousemove', onMouseMove);

    ele.addEventListener('touchend', onMouseUp);
    ele.addEventListener('touchmove', onMouseMove);

    onComplete = onCompleteDragDrop;
}

function onMouseMove(e) {
    // How far the mouse has been moved
    const { x, y } = getClientXY(e);
    const dx = x - pos.x;
    const dy = y - pos.y;
    moved = true;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
}

function onMouseUp(e) {
    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');
    ele.removeEventListener('mouseup', onMouseUp);
    ele.removeEventListener('mousemove', onMouseMove);

    ele.removeEventListener('touchend', onMouseUp);
    ele.removeEventListener('touchmove', onMouseMove);

    onComplete && onComplete(false);
};

function removeListener(ele, e) {
    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');
    ele.removeEventListener('mouseup', onMouseUp);
    ele.removeEventListener('mousemove', onMouseMove);

    ele.removeEventListener('touchend', onMouseUp);
    ele.removeEventListener('touchmove', onMouseMove);

    onComplete && onComplete(false);
}

const Scrollable = (props) => {
    const scrollableRef = useRef(null);

    const [showPrev, setShowPrev] = useState(true);
    const [showNext, setShowNext] = useState(true);
    const [width] = useWindowSize();

    const onChange = (resetAgain) => {
        const scrollWidth = scrollableRef.current?.scrollWidth;
        const scrollLeft = scrollableRef.current?.scrollLeft
        const parentWidth = scrollableRef.current?.parentElement?.offsetWidth;
        setShowPrev(scrollLeft !== 0);
        setShowNext(scrollWidth - scrollLeft - 5 >= parentWidth);
        resetAgain && setTimeout(() => onChange(false));
    };

    useEffect(() => {
        onChange(true);
    }, [width]);

    useEffect(() => {
        if (props.view === 'featuredAssets') {
            scrollableRef.current.scroll({ left: scrollableRef.current.scrollLeft + 350, behavior: 'smooth' });
            setShowPrev(true);
        }
        if (props.view === 'openingSoon') {
            scrollableRef.current.scroll({ left: 550, behavior: 'smooth' });
            setShowPrev(true);
        }
        if (props.view === 'endingSoon') {
            scrollableRef.current.scroll({ left: 450, behavior: 'smooth' });
            setShowPrev(true);
        }
        if (props.view === 'all') {
            scrollableRef.current.scroll({ left: 70, behavior: 'smooth' });
            setShowPrev(true)
        }
        if (props.view === 'featured') {
            scrollableRef.current.scroll({ left: 0, behavior: 'smooth' });
            setShowPrev(false)
        }
        if (props.view === 'featuredAuctions') {
            scrollableRef.current.scroll({ left: window.screen.width > 767 ? 200 : 280, behavior: 'smooth' });
        }
    }, [props]);

    const onPrev = () => {
        scrollableRef.current.scroll({ left: scrollableRef.current.scrollLeft - 100, behavior: 'smooth' });
        onChange(true);
    }

    const onNext = () => {
        scrollableRef.current.scroll({ left: scrollableRef.current.scrollLeft + 100, behavior: 'smooth' });
        onChange(true);
    };

    const contentClick = (e) => {
        if (!moved) {
            setTimeout(() => {
                e.target.scrollIntoViewIfNeeded ? e.target.scrollIntoViewIfNeeded(true) : e.target.scrollIntoView({ behavior: 'smooth' });
                onChange(false);
            }, 200);
            onChange(false);
        };

    };


    const mouseDownHandler = function (e) {
        moved = false;
        addDragListener(scrollableRef.current, e, onChange);
    };

    const mouseLeaveHandler = function (e) {
        moved = false;
        removeListener(scrollableRef.current, e);
    };

    return (
        <div className='scrollable'>
            <Button className={`prev ${showPrev && 'show'}`} onClick={onPrev} aria-label="prev">
                <SvgComponent path='arrow_left' />
            </Button>
            <div className='scrollable-parent'>
                <div className='scrollable-view' ref={scrollableRef} onTouchStart={mouseDownHandler} onMouseDown={mouseDownHandler} onTouchCancel={mouseLeaveHandler} onMouseLeave={mouseLeaveHandler}>
                    <div className='scrollable-content' onClick={contentClick}>
                        {props.children}
                    </div>
                </div>
            </div>
            <Button className={`next ${showNext && 'show'}`} onClick={onNext} aria-label="next">
                <SvgComponent path='arrow_right' />
            </Button>
        </div>
    );
};

export default Scrollable;
