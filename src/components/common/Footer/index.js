import Footer from "./Footer";
import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import { toggleLogin } from '../../../actions/auth';
const mapStateToProps = (state) => {
    const showLogin = _get(state, "auth.showLogin", false);
    return {
        showLogin
    };
};
const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Footer);

