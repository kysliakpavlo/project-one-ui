import React, { useState } from 'react';
import { preventEvent } from '../../../utils/helpers';

import './VideoRenderer.scss';

const VideoRenderer = ({ src }) => {
    const [muted] = useState(false);

    // const togglePlaying = (e) => {
    //     preventEvent(e);
    //     if (playing) {
    //         document.querySelector('video')?.pause();
    //     } else {
    //         document.querySelector('video')?.play();
    //     }
    //     setPlaying(!playing);
    // };

    // const toggleMute = (e) => {
    //     preventEvent(e);
    //     setMuted(!muted);
    // }

    return (
        <div className='video-renderer' onClick={preventEvent}>
            <video
                loop
                src={src}
                controls
                muted={muted}
                disablePictureInPicture
                controlsList="nodownload"
                className="d-block w-100"
            />
            {/* <div className="video-control">
                <span className='play-pause-control' onClick={togglePlaying}>
                    <SvgComponent path={playing ? 'pause' : 'play'} />
                </span>
                <span className='volume-control' onClick={toggleMute}>
                    <SvgComponent path={muted ? 'volume-off' : 'volume-up'} />
                </span>
            </div> */}
        </div>
    )
};

export default VideoRenderer;
