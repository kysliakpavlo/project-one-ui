import React from 'react';
import Countdown from 'react-countdown';
import BlockRenderer from './BlockRenderer';

const CountdownTimer = ({ heading, bonusTime, time = null, onComplete, renderer = BlockRenderer }) => (
    <div className="countdown-timer countdownTimer">
        <Countdown
            renderer={renderer}
			heading={heading}
            bonusTime={bonusTime}
            onComplete={onComplete}
            date={Date.parse(time)}
        />
    </div>
);

export default CountdownTimer;
