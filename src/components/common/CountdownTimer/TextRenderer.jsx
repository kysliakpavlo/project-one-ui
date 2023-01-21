import React from 'react';

const TextRenderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
        return <strong>Closed!</strong>
    } else {
        let labels = [];
        let times = [];
        let highlightTimer = false;
        if (days === 0 && hours === 0 && minutes < 5) {
            highlightTimer = true;
        }
        if (days !== 0) {
            labels = ['days', 'hrs', 'min'];
            times = [days, hours, minutes];
        } else {
            times = [hours, minutes, seconds];
            labels = ['hrs', 'min', 'sec'];
        }
        return (
            <div className={`${highlightTimer ? "text-danger bolder" : "bolder"}`}>
                <div>
                {/* {`${times[0]} ${labels[0]}, ${times[1]} ${labels[1]}, ${times[2]} ${labels[2]}`} */}
                {`${labels[0]}, ${labels[1]},${labels[2]}`}
                </div>
                <div>
                {`${times[0]}, ${times[1]}, ${times[2]}`}
                </div>
            </div>
        );
    }
};

export default TextRenderer;