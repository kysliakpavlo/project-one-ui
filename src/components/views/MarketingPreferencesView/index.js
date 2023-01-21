import _get from 'lodash/get';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MarketingPreferencesView from './MarketingPreferencesView';
import { showMessage } from '../../../actions/toast';

const mapStateToProps = (state) => {
    const categories = _get(state, "app.categories", []);
    const locations = _get(state, "app.locations", []);
    return {
        locations,
        categories
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    showMessage
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MarketingPreferencesView);
