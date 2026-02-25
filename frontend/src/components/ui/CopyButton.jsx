import React from 'react';

const CopyButton = ({ text }) => (
  <button onClick={() => navigator.clipboard.writeText(text)} className="p-1 hover:bg-slate-800 rounded">
    Copy
  </button>
);

export default CopyButton;
