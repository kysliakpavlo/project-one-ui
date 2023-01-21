import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { secureApi } from "../../../actions/app";
import { showMessage } from "../../../actions/toast";
import { getAuctionDocuments, getAssetInvoice } from "../../../utils/api";
import DownloadAuctionDocuments from "./DownloadAuctionDocuments";

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      showMessage,
      getAuctionDocuments: secureApi(getAuctionDocuments),
      getAssetInvoice: secureApi(getAssetInvoice),
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DownloadAuctionDocuments);
