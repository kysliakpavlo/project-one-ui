import React, { useEffect, useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Container from 'react-bootstrap/Container';
import Visible from '../../common/Visible';
import { NotifyMeFor, SavedSearches } from '../../common/Preferences';

const PreferencesView = ({ history, showMessage, isLoggedIn }) => {
    const [activeTab, setActiveTab] = useState('notify-me');
    useEffect(() => {
        if (!isLoggedIn) {
            history.push('/');
        }
    }, [history, isLoggedIn]);

    return (
        <Container className='preferences-view my-3'>
            <h3>Saved searches & Alerts</h3>
            <Tabs id="preferences-tabs" activeKey={activeTab} onSelect={setActiveTab}>
                <Tab eventKey="notify-me" title="Notify Me">
                    <Visible when={activeTab === 'notify-me'}>
                        <NotifyMeFor showMessage={showMessage} />
                    </Visible>
                </Tab>
                <Tab eventKey="saved-searches" title="Saved Searches">
                    <Visible when={activeTab === 'saved-searches'}>
                        <SavedSearches showMessage={showMessage} />
                    </Visible>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default PreferencesView;
