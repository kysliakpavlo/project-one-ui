import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";
import { setLoading } from '../../../actions/app';
import { toggleLogin } from '../../../actions/auth';
import BuyerCardView from "./BuyerCardView";

const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
    const isLoggedIn = !!_get(state, "auth.loggedInUser", false);


    return {
        vendor,
        isLoggedIn
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    setLoading
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(BuyerCardView);
