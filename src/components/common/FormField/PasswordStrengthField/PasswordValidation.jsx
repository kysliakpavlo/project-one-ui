import React from 'react';
import SvgComponent from '../../SvgComponent';

const PasswordValidation = ({ data }) => {
    const [label, isMatched] = data;
    const icon = isMatched ? 'done' : 'close';
    const className = isMatched ? 'pattern-matched' : 'pattern-mismatched';

    return (
        <div className={`pattern-msg ${className}`}>
            <SvgComponent path={icon} />
            <p className='mb-0 ml-2'>{label}</p>
        </div>
    );
}

export default PasswordValidation;