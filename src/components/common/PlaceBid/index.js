import PlaceBidComponent from './PlaceBid';
import DetailedPlaceBidComponent from './DetailedPlaceBid';
import MobilePlaceBidComponent from './MobilePlaceBid';
import PlaceBidBottomComponent from './PlaceBidBottom';
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { toggleLogin } from '../../../actions/auth';
import { showMessage } from '../../../actions/toast';
import { getBidValues } from '../../../utils/api';
import { secureApi } from '../../../actions/app';

const mapStateToProps = (state) => {
    const loggedInUser = _get(state, "auth.loggedInUser", false);
    return {
        loggedInUser
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    showMessage,
    getBidValues: secureApi(getBidValues)
}, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(PlaceBidComponent);
export const MobilePlaceBid = connect(mapStateToProps, mapDispatchToProps)(MobilePlaceBidComponent);
export const DetailedPlaceBid = connect(mapStateToProps, mapDispatchToProps)(DetailedPlaceBidComponent);
export const PlaceBidBottom = connect(mapStateToProps, mapDispatchToProps)(PlaceBidBottomComponent);
