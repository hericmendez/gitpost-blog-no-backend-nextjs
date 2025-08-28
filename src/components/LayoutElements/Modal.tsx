// Modal.tsx
import React, { useEffect, useRef, useState } from 'react';
import Modal, { Styles } from 'react-modal';

type ReactModalProps = {
  children?: React.ReactNode;
};

const customStyles: Styles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',

    transform: 'translate(-50%, -50%)',
  },
};

export default function ReactModal({ children }: ReactModalProps) {
  const [modalIsOpen, setIsOpen] = useState(false);
  const subtitleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Preferencial em Next.js:
      const appEl = document.getElementById('__next') ?? document.body;
      Modal.setAppElement(appEl);
    }
  }, []);

  function afterOpenModal() {
    if (subtitleRef.current) {
      subtitleRef.current.style.color = '#f00';
    }
  }

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={() => setIsOpen(false)}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2 ref={subtitleRef}>Hello</h2>
        <button onClick={() => setIsOpen(false)}>close</button>
        <div>I am a modal</div>
        {children}
      </Modal>
    </div>
  );
}
4