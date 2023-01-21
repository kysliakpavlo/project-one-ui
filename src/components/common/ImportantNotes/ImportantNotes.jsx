import React, { useEffect, useRef } from 'react';
import './ImportantNotes.scss';

const ImportantNotes = (props) => {
    const impNoteRef = useRef(null);
    useEffect(() => {
        scrollToMyRef();
    }, [props.impNotesList])

    const scrollToMyRef = () => {
        const scroll =
            impNoteRef.current.scrollHeight -
            impNoteRef.current.clientHeight;
        impNoteRef.current.scrollTo(0, scroll);
    };

    return (
        <div className="imp-notes" ref={impNoteRef}>
            <div className="title">Important Notes</div>
            <div className="notes-wrapper">
                {props.impNotesList && props.impNotesList.map((notes, index) => (
                    <div className="notes" key={index}>
                        <span className="label">Admin</span>:  <span className="msg">{notes.message}</span>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default ImportantNotes;