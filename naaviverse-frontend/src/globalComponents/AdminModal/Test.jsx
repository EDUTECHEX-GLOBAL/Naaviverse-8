import React from "react";
import { useContext } from "react";
import { CSSTransition } from "react-transition-group";
import { GlobalContex } from "../../globalContext";

import "./adminModal.scss";

const Test = () => {
  const { modalOpen, setModalOpen } = useContext(GlobalContex);
  return (
    <CSSTransition
      in={modalOpen}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}
    >
      <div className="modal" onClick={(e) => setModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h4 className="modal-title">Title</h4>
          </div>
          <div className="modal-body">Body...</div>
          <div className="modal-footer">
            <button onClick={(e) => setModalOpen(false)} className="button">
              Close
            </button>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

export default Test;
