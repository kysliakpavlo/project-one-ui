
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { showMessage, removeMessage, removeAllMessages } from '../../../actions/toast';
import AdminConsoleView from "./AdminConsoleView";

const mapStateToProps = (state) => {

    return {
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    showMessage,
    removeMessage,
    removeAllMessages
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AdminConsoleView);
