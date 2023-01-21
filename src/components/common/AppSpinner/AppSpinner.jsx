import React from 'react';

import './AppSpinner.scss';

const AppSpinner = ({ variant = '' }) => (
    <div className={`app-spinner ${variant}`}>
        <div />
        <div />
        <div />
        <div />
        <div />
    </div>
);

export default AppSpinner;
