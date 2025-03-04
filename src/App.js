import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>GPT Wrapper Chatbox</h1>
      </header>
      <main>
        <ChatBox />
      </main>
    </div>
  );
}

export default App; 