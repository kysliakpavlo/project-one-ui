import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Enquire from './Enquire';
import { secureApi } from "../../../actions/app";
import { submitAssetEnquire } from '../../../utils/api';

const mapSTP = () => ({});

const mapDTP = (dispatch) => bindActionCreators({
    submitAssetEnquire: secureApi(submitAssetEnquire)
}, dispatch);

export default connect(mapSTP, mapDTP)(Enquire);
