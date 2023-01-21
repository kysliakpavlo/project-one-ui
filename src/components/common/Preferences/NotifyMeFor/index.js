import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import NotifyMeFor from './NotifyMeFor';
import { secureApi } from '../../../../actions/app';
import { saveNotifyMe, getAllNotifyMe, deleteNotifyme } from '../../../../utils/api';

const mapSTP = () => ({});

const mapDTP = (dispatch) => bindActionCreators({
    saveNotifyMe: secureApi(saveNotifyMe),
    getAllNotifyMe: secureApi(getAllNotifyMe),
    deleteNotifyme: secureApi(deleteNotifyme),
}, dispatch);

export default connect(mapSTP, mapDTP)(NotifyMeFor);
