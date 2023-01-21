import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showMessage, removeMessage, removeAllMessages } from '../../../actions/toast';
import PublicConsoleView from "./PublicConsoleView";

const mapStateToProps = (state) => {
    return {
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    showMessage,
    removeMessage,
    removeAllMessages
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PublicConsoleView);
