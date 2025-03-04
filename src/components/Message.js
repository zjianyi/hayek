import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Latex } from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './Message.css';

const Message = ({ message }) => {
  const { role, content, images, isStreaming } = message;

  // Custom renderer for code blocks with syntax highlighting
  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Process text to handle LaTeX
    text(props) {
      const { children } = props;
      // This regex matches both inline and block LaTeX
      const parts = String(children).split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
      
      return parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Block LaTeX
          return <Latex key={index}>{part}</Latex>;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline LaTeX
          return <Latex key={index}>{part}</Latex>;
        } else {
          return part;
        }
      });
    }
  };

  return (
    <div className={`message ${role}`}>
      <div className="message-avatar">
        {role === 'user' ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        {images && images.length > 0 && (
          <div className="message-images">
            {images.map((image, index) => (
              <img 
                key={index} 
                src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                alt={`User uploaded ${index}`} 
                className="uploaded-image" 
              />
            ))}
          </div>
        )}
        <div className={`message-text ${isStreaming ? 'streaming' : ''}`}>
          <ReactMarkdown components={renderers}>{content}</ReactMarkdown>
        </div>
        {isStreaming && <div className="streaming-indicator">▌</div>}
      </div>
    </div>
  );
};

export default Message; 