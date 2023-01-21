import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { toggleLogin } from '../../../actions/auth';
import { showMessage } from '../../../actions/toast';
import Subscription from "./Subscription";
import { secureApi } from "../../../actions/app";
import { subscribeToNewsLetter } from "../../../utils/api";

const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
    const categories = _get(state, "app.categories", []);
    const locations = _get(state, "app.locations", []);
    const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
    const showLogin = _get(state, "auth.showLogin", false);


    return {
        showLogin,
        vendor,
        locations,
        categories,
        isLoggedIn
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    showMessage,
    subscribeToNewsLetter: secureApi(subscribeToNewsLetter)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Subscription);
