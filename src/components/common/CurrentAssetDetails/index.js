import CurrentAssetDetails from "./CurrentAssetDetails";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";


const mapStateToProps = (state) => {
    return {
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CurrentAssetDetails);
