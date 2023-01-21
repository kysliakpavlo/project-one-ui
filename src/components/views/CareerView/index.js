import { connect } from "react-redux";
import _get from "lodash/get";
import { bindActionCreators } from "redux";
import CareerView from './CareerView';

const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
    return {
        vendor
    };
};
const mapDispatchToProps = (dispatch) => bindActionCreators({
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CareerView);
