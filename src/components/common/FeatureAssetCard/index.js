import _get from "lodash/get";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { toggleLogin } from '../../../actions/auth';
import { showMessage } from '../../../actions/toast';
import { setHomeAuction, setDetailsAuction } from '../../../actions/advanceSearch';
import { getAssetImages } from '../../../utils/api';
import { secureApi } from '../../../actions/app';

import FeatureAssetCard from './FeatureAssetCard';

const mapStateToProps = (state) => {
    const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
    const loggedInUser = _get(state, "auth.loggedInUser", null);
    return {
        isLoggedIn,
        loggedInUser,
    };
};
const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    showMessage,
    setHomeAuction,
    setDetailsAuction,
    getAssetImages: secureApi(getAssetImages)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FeatureAssetCard);
