// src/components/RichTextEditor.jsx
import { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaListUl, 
  FaListOl, 
  FaLink, 
  FaAlignLeft, 
  FaAlignCenter, 
  FaAlignRight,
  FaCode,
  FaUndo,
  FaRedo
} from 'react-icons/fa';

const RichTextEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
  const { isDark } = useTheme();
  const editorRef = useRef(null);
  const isCodeView = useRef(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toggleCodeView = () => {
    if (!editorRef.current) return;
    
    if (isCodeView.current) {
      const htmlContent = editorRef.current.textContent;
      editorRef.current.innerHTML = htmlContent;
      editorRef.current.contentEditable = true;
      isCodeView.current = false;
    } else {
      const htmlContent = editorRef.current.innerHTML;
      editorRef.current.textContent = htmlContent;
      editorRef.current.contentEditable = true;
      isCodeView.current = true;
    }
    handleContentChange();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const toolbarButtons = [
    { icon: FaUndo, command: 'undo', title: 'Undo' },
    { icon: FaRedo, command: 'redo', title: 'Redo' },
    { type: 'separator' },
    { icon: FaBold, command: 'bold', title: 'Bold' },
    { icon: FaItalic, command: 'italic', title: 'Italic' },
    { icon: FaUnderline, command: 'underline', title: 'Underline' },
    { type: 'separator' },
    { icon: FaListUl, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: FaListOl, command: 'insertOrderedList', title: 'Numbered List' },
    { type: 'separator' },
    { icon: FaAlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: FaAlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: FaAlignRight, command: 'justifyRight', title: 'Align Right' },
    { type: 'separator' },
    { icon: FaLink, action: insertLink, title: 'Insert Link' },
    { icon: FaCode, action: toggleCodeView, title: 'Code View' },
  ];

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#4a5568' }}>
      <div
        className="flex items-center gap-1 p-2 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: '#4a5568' }}
      >
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return <div key={index} className="w-px h-6 mx-1" style={{ backgroundColor: '#4a5568' }} />;
          }

          const Icon = button.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => button.action ? button.action() : execCommand(button.command)}
              className="p-2 rounded hover:bg-gray-700 transition-colors"
              style={{ color: 'var(--text-primary)' }}
              title={button.title}
            >
              <Icon className="text-sm" />
            </button>
          );
        })}

        <select
          onChange={(e) => {
            if (e.target.value) {
              execCommand('formatBlock', e.target.value);
              e.target.value = '';
            }
          }}
          className="ml-2 px-2 py-1 rounded border text-sm"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: '#4a5568',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">Format</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onBlur={handleContentChange}
        className="p-4 min-h-[300px] focus:outline-none"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-secondary);
          font-style: italic;
        }
        [contenteditable] h1 { font-size: 2em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] h3 { font-size: 1.2em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] p { margin: 0.5em 0; }
        [contenteditable] ul, [contenteditable] ol { margin: 0.5em 0; padding-left: 2em; }
        [contenteditable] a { color: #3b82f6; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;