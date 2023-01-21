import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { secureApi } from '../../../../actions/app';
import MarketingSubscription from "./MarketingSubscription";
import { getAccount, subscribeToNewsLetter } from "../../../../utils/api";

const mapSTP = () => ({});

const mapDTP = (dispatch) => bindActionCreators({
    getAccount: secureApi(getAccount),
    subscribeToNewsLetter: secureApi(subscribeToNewsLetter)
}, dispatch);

export default connect(mapSTP, mapDTP)(MarketingSubscription);
