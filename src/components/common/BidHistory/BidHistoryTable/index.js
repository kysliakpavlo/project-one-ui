import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import BidHistoryTable from './BidHistoryTable';
import { bidHistory } from '../../../../utils/api';
import { secureApi } from '../../../../actions/app';

const mapSTP = () => ({});

const mapDTP = (dispatch) => bindActionCreators({
    bidHistory: secureApi(bidHistory)
}, dispatch);

export default connect(mapSTP, mapDTP)(BidHistoryTable);
