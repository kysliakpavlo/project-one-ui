
import AuctionAssetDetails from './AuctionAssetDetails';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi } from '../../../actions/app';
import { auctionTerms } from '../../../utils/api';

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) => bindActionCreators({
    auctionTerms: secureApi(auctionTerms)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AuctionAssetDetails);
