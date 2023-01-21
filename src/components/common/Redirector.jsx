import { useEffect } from 'react';

const Redirector = ({ location, match, history }) => {

    const { to } = match.params;
    const search = location.search.replace(/^\?/, '');

    useEffect(() => {
        history.replace(`/${to}${search ? '?' + search : ''}`);
    }, [to, search, history]);

    return null;
}

export default Redirector;
