import React from "react";
import ProgressBar from 'react-bootstrap/ProgressBar'
import './ReserveMet.scss'

const ReserveMet = ({ percent = 0 }) => {
    let variant = 'danger';
    if (percent <= 30) {
        variant = 'danger'
    } else if (percent > 30 && percent <= 70) {
        variant = 'warning'
    } else {
        variant = 'success'
    }
    return (
        <div className='reserve-met'>
            <ProgressBar variant={variant} now={percent} />
        </div>
    )
};

export default ReserveMet;
