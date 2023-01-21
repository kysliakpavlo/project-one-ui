import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Paynow from './Paynow';
import { secureApi } from '../../../actions/app';
import { payUsingCard } from '../../../utils/api';

const mapSTP = () => ({});

const mapDTP = (dispatch) => bindActionCreators({
    payUsingCard: secureApi(payUsingCard)
}, dispatch);

export default connect(mapSTP, mapDTP)(Paynow);
