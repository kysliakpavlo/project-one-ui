import { connect } from "react-redux";
import _get from "lodash/get";
import { showMessage } from '../../../actions/toast';
import { bindActionCreators } from "redux";
import { toggleLogin } from '../../../actions/auth';
import SellWithUs from "./SellWithUs";
import { setLoading, secureApi } from "../../../actions/app";
import { sellForm } from '../../../utils/api';

const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
    const categories = _get(state, "app.categories", []);
    const locations = _get(state, "app.locations", []);
    const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
    const selectedCategory = [];

    return {
        vendor,
        locations,
        categories,
        isLoggedIn,
        selectedCategory,
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    showMessage,
    setLoading,
    sellForm: secureApi(sellForm)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SellWithUs);