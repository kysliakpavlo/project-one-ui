import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import FinancialEnquiry from './FinancialEnquiry';
import { secureApi } from '../../../actions/app';
import { submitFinancingEnquire } from '../../../utils/api';

const mapSTP = () => ({});

const mapDTP = (dispatch) => bindActionCreators({
    submitFinancingEnquire: secureApi(submitFinancingEnquire)
}, dispatch);

export default connect(mapSTP, mapDTP)(FinancialEnquiry);
