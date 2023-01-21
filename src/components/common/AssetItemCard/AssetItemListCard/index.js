import AssetItemListCard from './AssetItemListCard';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi } from '../../../../actions/app';
import { getBidValues } from '../../../../utils/api';

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    getBidValues: secureApi(getBidValues)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AssetItemListCard);
