import React, { useRef, useState, useEffect } from 'react';
import { Button, ButtonGroup, Container, Row, Col } from 'react-bootstrap';
import './EnhancedTextEditor.css';

/**
 * EnhancedTextEditor Component
 * A WYSIWYG text editor with formatting toolbar
 * Features:
 * - Text color picker
 * - Text highlight/background color
 * - Bold, Italic, Underline
 * - Lists (bullet and numbered)
 * - HTML output for backend storage
 */

const EnhancedTextEditor = ({ value, onChange, placeholder = "Enter your text here..." }) => {
  const editorRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedHighlight, setSelectedHighlight] = useState('#FFFF00');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  // Update parent component when content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Execute formatting command
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Text color formatting
  const handleTextColor = (color) => {
    executeCommand('foreColor', color);
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  // Highlight/background color formatting
  const handleHighlightColor = (color) => {
    // Use backColor for highlighting text
    executeCommand('backColor', color);
    setSelectedHighlight(color);
    setShowHighlightPicker(false);
  };

  // Format with font size
  const handleFontSize = (size) => {
    executeCommand('fontSize', size);
  };

  // Format with paragraph style
  const handleParagraphStyle = (tag) => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  // Predefined colors
  const colorPalette = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF6600', '#FF00FF', '#00FFFF', '#808080',
    '#C0C0C0', '#800000', '#008000', '#000080', '#FFA500'
  ];

  const highlightPalette = [
    '#FFFF00', '#00FF00', '#FF6600', '#FF00FF', '#00FFFF',
    '#FFFFFF', '#C0C0C0', '#FFC0CB', '#FFE4B5', '#E6E6FA'
  ];

  return (
    <div className="enhanced-text-editor">
      {/* Formatting Toolbar */}
      <div className="editor-toolbar">
        <Container fluid>
          {/* Row 1: Text Formatting */}
          <Row className="toolbar-row mb-2">
            <Col xs="auto">
              <ButtonGroup size="sm" className="me-2">
                <Button
                  variant="outline-secondary"
                  title="Bold"
                  onClick={() => executeCommand('bold')}
                >
                  <strong>B</strong>
                </Button>
                <Button
                  variant="outline-secondary"
                  title="Italic"
                  onClick={() => executeCommand('italic')}
                >
                  <em>I</em>
                </Button>
                <Button
                  variant="outline-secondary"
                  title="Underline"
                  onClick={() => executeCommand('underline')}
                >
                  <u>U</u>
                </Button>
                <Button
                  variant="outline-secondary"
                  title="Strikethrough"
                  onClick={() => executeCommand('strikethrough')}
                >
                  <s>S</s>
                </Button>
              </ButtonGroup>
            </Col>

            {/* List Buttons */}
            <Col xs="auto">
              <ButtonGroup size="sm" className="me-2">
                <Button
                  variant="outline-secondary"
                  title="Bullet List"
                  onClick={() => executeCommand('insertUnorderedList')}
                >
                  ○ ●
                </Button>
                <Button
                  variant="outline-secondary"
                  title="Numbered List"
                  onClick={() => executeCommand('insertOrderedList')}
                >
                  1 2 3
                </Button>
              </ButtonGroup>
            </Col>

            {/* Text Color Picker */}
            <Col xs="auto">
              <div className="color-picker-wrapper">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  title="Text Color"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="text-color-btn"
                >
                  <span style={{ color: selectedColor }}>A</span>
                  <span className="color-indicator" style={{ backgroundColor: selectedColor }}></span>
                </Button>
                {showColorPicker && (
                  <div className="color-palette">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        className="color-option"
                        style={{ backgroundColor: color }}
                        onClick={() => handleTextColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Col>

            {/* Highlight Color Picker */}
            <Col xs="auto">
              <div className="highlight-picker-wrapper">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  title="Text Highlight"
                  onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                  className="highlight-btn"
                >
                  🖍️
                  <span className="highlight-indicator" style={{ backgroundColor: selectedHighlight }}></span>
                </Button>
                {showHighlightPicker && (
                  <div className="highlight-palette">
                    {highlightPalette.map((color) => (
                      <button
                        key={color}
                        className="highlight-option"
                        style={{ backgroundColor: color }}
                        onClick={() => handleHighlightColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Col>

            {/* Font Size Dropdown */}
            <Col xs="auto">
              <select
                size="sm"
                className="form-select form-select-sm font-size-select"
                onChange={(e) => handleFontSize(e.target.value)}
                title="Font Size"
              >
                <option value="">Font Size</option>
                <option value="1">Small (8pt)</option>
                <option value="3">Normal (14pt)</option>
                <option value="4">Large (18pt)</option>
                <option value="5">Extra Large (24pt)</option>
                <option value="6">Heading (32pt)</option>
              </select>
            </Col>

            {/* Alignment Buttons */}
            <Col xs="auto">
              <ButtonGroup size="sm" className="me-2">
                <Button
                  variant="outline-secondary"
                  title="Align Left"
                  onClick={() => executeCommand('justifyLeft')}
                >
                  ⬅
                </Button>
                <Button
                  variant="outline-secondary"
                  title="Align Center"
                  onClick={() => executeCommand('justifyCenter')}
                >
                  ↔
                </Button>
                <Button
                  variant="outline-secondary"
                  title="Align Right"
                  onClick={() => executeCommand('justifyRight')}
                >
                  ➡
                </Button>
              </ButtonGroup>
            </Col>

            {/* Clear Formatting */}
            <Col xs="auto">
              <Button
                variant="outline-danger"
                size="sm"
                title="Clear Formatting"
                onClick={() => executeCommand('removeFormat')}
              >
                ✕ Clear
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        className="editor-content"
        onInput={handleContentChange}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* HTML Output for debugging/reference */}
      <div className="editor-footer">
        <small className="text-muted">The HTML content is automatically saved and will be stored in the database.</small>
      </div>
    </div>
  );
};

export default EnhancedTextEditor;
