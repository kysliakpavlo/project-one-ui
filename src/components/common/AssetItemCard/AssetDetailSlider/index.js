import AssetDetailSlider from './AssetDetailSlider';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi } from '../../../../actions/app';
import { getPartialAssetDetails } from '../../../../utils/api';

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    getPartialAssetDetails: secureApi(getPartialAssetDetails)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AssetDetailSlider);
