import AssetCardImages from './AssetCardImages';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi } from '../../../actions/app';
import { getAssetImages } from '../../../utils/api';

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    getAssetImages: secureApi(getAssetImages)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AssetCardImages);
