import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Form, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from '../../layout/default';
import { Block, BlockHead, BlockHeadContent, BlockTitle, Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

// Add custom CSS for compact spacing in CKEditor
const editorStyles = `
  .ck-editor__editable {
    min-height: 400px;
    max-height: 600px;
    font-family: 'Calibri', 'Arial', sans-serif;
  }
  .ck-editor__editable p {
    margin: 0.25rem 0 !important;
    padding: 0 !important;
    line-height: 1.3 !important;
  }
  .ck-editor__editable h1,
  .ck-editor__editable h2,
  .ck-editor__editable h3,
  .ck-editor__editable h4 {
    margin: 0.5rem 0 !important;
    padding: 0 !important;
    line-height: 1.3 !important;
  }
  .ck-editor__editable ul,
  .ck-editor__editable ol {
    margin: 0.25rem 0 !important;
    padding-left: 2rem !important;
  }
  .ck-editor__editable li {
    margin: 0.1rem 0 !important;
    padding: 0 !important;
  }
  .ck-editor__editable img {
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
    margin: 0.5rem auto !important;
    border: 1px solid #ddd !important;
    border-radius: 4px !important;
  }
  .ck-editor__editable figure {
    margin: 0.5rem 0 !important;
  }
  .ck-editor__editable figure img {
    margin: 0 !important;
  }
  .ck-toolbar {
    border: 1px solid #d1d5db !important;
    border-radius: 4px 4px 0 0 !important;
    background: linear-gradient(to bottom, #f9fafb, #f3f4f6) !important;
  }
  .ck-editor__main {
    border: 1px solid #d1d5db;
    border-radius: 0 0 4px 4px;
  }
`;

// Custom image handler for Base64 encoding
class Base64UploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          default: reader.result
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    }));
  }

  abort() {
    // Abort upload
  }
}

function Base64UploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new Base64UploadAdapter(loader);
  };
}

const RichTextPageEditor = () => {
  const { taskId, pageId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!pageId;

  const [task, setTask] = useState(null);
  const [pageData, setPageData] = useState({
    title: '',
    slug: '',
    order: 0
  });
  const [blocks, setBlocks] = useState([]);
  const [deletedBlocks, setDeletedBlocks] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editorInstances, setEditorInstances] = useState({});

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchTask();
    if (isEdit) {
      fetchPage();
    } else {
      // Reset deleted blocks when creating a new page
      setDeletedBlocks([]);
    }
  }, [taskId, pageId]);

  // Initialize CKEditor for text blocks
  useEffect(() => {
    // Disable CKEditor version check warning
    if (window.CKEDITOR) {
      window.CKEDITOR.config.versionCheck = false;
    }

    // Wait for CKEditor to load
    const initEditors = () => {
      if (!window.CKEDITOR) {
        console.log('CKEditor not loaded yet, waiting...');
        return;
      }

      // Disable version check globally
      window.CKEDITOR.config.versionCheck = false;

      blocks.forEach((block) => {
        if (block.type === 'text') {
          const editorId = `editor-${block.id}`;

          // Check if editor already exists
          if (window.CKEDITOR.instances[editorId]) {
            console.log('Editor already exists:', editorId);
            return;
          }

          // Check if the textarea element exists
          const element = document.getElementById(editorId);
          if (!element) {
            console.log('Element not found:', editorId);
            return;
          }

          console.log('Initializing CKEditor for:', editorId);

          try {
            const editor = window.CKEDITOR.replace(editorId, {
              height: 400,
              versionCheck: false, // Disable version check warning
              toolbar: [
                { name: 'styles', items: ['Format', 'Font', 'FontSize'] },
                { name: 'colors', items: ['TextColor', 'BGColor'] },
                { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
                { name: 'paragraph', items: ['NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote'] },
                { name: 'links', items: ['Link', 'Unlink'] },
                { name: 'insert', items: ['Image', 'Table', 'HorizontalRule'] },
                { name: 'tools', items: ['Maximize'] },
                { name: 'document', items: ['Source'] }
              ],
              removePlugins: 'elementspath',
              resize_enabled: true,
              allowedContent: true,
              extraAllowedContent: '*(*){*}[*]',
              font_names: 'Arial/Arial, Helvetica, sans-serif;' +
                'Times New Roman/Times New Roman, Times, serif;' +
                'Courier New/Courier New, Courier, monospace;' +
                'Verdana;Georgia;Palatino;Garamond;Comic Sans MS;Trebuchet MS;Arial Black;Impact',
              fontSize_sizes: '8/8px;10/10px;12/12px;14/14px;16/16px;18/18px;20/20px;22/22px;24/24px;26/26px;28/28px;36/36px;48/48px;72/72px',
              // Ensure toolbar is visible
              toolbarCanCollapse: false,
              toolbarStartupExpanded: true
            });

            editor.on('change', function() {
              const data = editor.getData();
              updateBlock(block.id, 'content', data);
            });

            // Also listen to key events to capture changes
            editor.on('key', function() {
              const data = editor.getData();
              updateBlock(block.id, 'content', data);
            });

            setEditorInstances(prev => ({ ...prev, [editorId]: editor }));
            console.log('CKEditor initialized successfully:', editorId);
          } catch (error) {
            console.error('CKEditor initialization error:', error);
          }
        }
      });
    };

    // Try multiple times to initialize in case CKEditor is still loading
    const timer1 = setTimeout(initEditors, 300);
    const timer2 = setTimeout(initEditors, 600);
    const timer3 = setTimeout(initEditors, 1000);

    // Cleanup function
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      // Destroy all editor instances for this component
      blocks.forEach((block) => {
        if (block.type === 'text') {
          const editorId = `editor-${block.id}`;
          if (window.CKEDITOR && window.CKEDITOR.instances[editorId]) {
            try {
              window.CKEDITOR.instances[editorId].destroy(true);
              console.log('Destroyed editor:', editorId);
            } catch (e) {
              console.error('Error destroying editor:', e);
            }
          }
        }
      });
    };
  }, [blocks.length]);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        headers: getAuthHeaders()
      });
      setTask(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching task:', error);
      Swal.fire('Error', 'Failed to load task details', 'error');
    }
  };

  const fetchPage = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/task-richtext-pages/${pageId}/`, {
        headers: getAuthHeaders()
      });
      const page = response.data;

      setPageData({
        title: page.title,
        slug: page.slug,
        order: page.order || 0
      });

      // Reset deleted blocks when loading the page
      setDeletedBlocks([]);

      // Combine all blocks and sort by order
      const allBlocks = [];

      (page.text_blocks || []).forEach(block => {
        // All text blocks are treated as text blocks
        allBlocks.push({
          id: `text-${block.id}`,
          existingId: block.id,
          type: 'text',
          order: block.order,
          content: block.content
        });
      });

      (page.code_blocks || []).forEach(block => {
        allBlocks.push({
          id: `code-${block.id}`,
          existingId: block.id,
          type: 'code',
          order: block.order,
          code: block.code,
          language: block.language
        });
      });

      (page.video_blocks || []).forEach(block => {
        allBlocks.push({
          id: `video-${block.id}`,
          existingId: block.id,
          type: 'video',
          order: block.order,
          title: block.title,
          youtube_url: block.youtube_url,
          description: block.description
        });
      });

      (page.highlight_blocks || []).forEach(block => {
        allBlocks.push({
          id: `highlight-${block.id}`,
          existingId: block.id,
          type: 'highlight',
          order: block.order,
          content: block.content
        });
      });

      allBlocks.sort((a, b) => a.order - b.order);
      setBlocks(allBlocks);
    } catch (error) {
      console.error('Error fetching page:', error);
      Swal.fire('Error', 'Failed to load page details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageDataChange = (field, value) => {
    setPageData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && !isEdit) {
      // Auto-generate slug from title
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setPageData(prev => ({ ...prev, slug }));
    }
  };

  const addBlock = (type) => {
    const newBlock = {
      id: `temp-${Date.now()}`,
      type,
      order: blocks.length,
      ...(type === 'text' && { content: '' }),
      ...(type === 'code' && { code: '', language: 'python' }),
      ...(type === 'video' && { title: '', youtube_url: '', description: '' }),
      ...(type === 'highlight' && { content: '', color: '#000000', textColor: '#FFFFFF' })
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id, field, value) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  const removeBlock = (id) => {
    const blockToRemove = blocks.find(block => block.id === id);
    if (blockToRemove && blockToRemove.existingId) {
      // Track this block for deletion
      setDeletedBlocks([...deletedBlocks, blockToRemove]);
    }
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const moveBlock = (index, direction) => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    // Update order values
    newBlocks.forEach((block, idx) => {
      block.order = idx;
    });

    setBlocks(newBlocks);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!pageData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    blocks.forEach((block, index) => {
      if (block.type === 'text' && !block.content?.trim()) {
        newErrors[`block-${index}`] = 'Text content is required';
      }
      if (block.type === 'code' && !block.code?.trim()) {
        newErrors[`block-${index}`] = 'Code content is required';
      }
      if (block.type === 'video' && !block.youtube_url?.trim()) {
        newErrors[`block-${index}`] = 'YouTube URL is required';
      }
      if (block.type === 'highlight' && !block.content?.trim()) {
        newErrors[`block-${index}`] = 'Highlight content is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get latest data from all CKEditor instances before validation
    const updatedBlocks = blocks.map(block => {
      if (block.type === 'text') {
        const editorId = `editor-${block.id}`;
        if (window.CKEDITOR && window.CKEDITOR.instances[editorId]) {
          const editorData = window.CKEDITOR.instances[editorId].getData();
          return { ...block, content: editorData };
        }
      }
      return block;
    });

    // Update the blocks state with latest editor data
    setBlocks(updatedBlocks);

    // Use updatedBlocks for validation instead of state blocks
    const newErrors = {};

    if (!pageData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    updatedBlocks.forEach((block, index) => {
      if (block.type === 'text' && !block.content?.trim()) {
        newErrors[`block-${index}`] = 'Text content is required';
      }
      if (block.type === 'code' && !block.code?.trim()) {
        newErrors[`block-${index}`] = 'Code content is required';
      }
      if (block.type === 'video' && !block.youtube_url?.trim()) {
        newErrors[`block-${index}`] = 'YouTube URL is required';
      }
      if (block.type === 'highlight' && !block.content?.trim()) {
        newErrors[`block-${index}`] = 'Highlight content is required';
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Swal.fire('Validation Error', 'Please fill all required fields', 'error');
      return;
    }

    try {
      setLoading(true);

      // Create or update page
      const pagePayload = {
        task: taskId,
        title: pageData.title,
        slug: pageData.slug,
        order: parseInt(pageData.order) || 0
      };

      let pageResponse;
      if (isEdit) {
        pageResponse = await axios.patch(
          `${API_BASE_URL}/api/task-richtext-pages/${pageId}/`,
          pagePayload,
          { headers: getAuthHeaders() }
        );
      } else {
        pageResponse = await axios.post(
          `${API_BASE_URL}/api/task-richtext-pages/`,
          pagePayload,
          { headers: getAuthHeaders() }
        );
      }

      const savedPageId = pageResponse.data.id;

      // Delete blocks that were removed
      const deletePromises = [];
      deletedBlocks.forEach(block => {
        const endpoint = block.type === 'text'
          ? `/api/task-text-blocks/${block.existingId}/`
          : block.type === 'code'
          ? `/api/task-code-blocks/${block.existingId}/`
          : block.type === 'video'
          ? `/api/task-video-blocks/${block.existingId}/`
          : `/api/task-highlight-blocks/${block.existingId}/`;

        deletePromises.push(
          axios.delete(`${API_BASE_URL}${endpoint}`, { headers: getAuthHeaders() })
            .catch(err => console.warn('Block delete failed:', err))
        );
      });

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }

      // Separate blocks into new and existing (use updatedBlocks to ensure we have latest data)
      const newBlocks = updatedBlocks.filter(block => !block.existingId);
      const existingBlocks = updatedBlocks.filter(block => block.existingId);

      // Update existing blocks with new order and content
      const updatePromises = existingBlocks.map((block, index) => {
        const blockPayload = {
          order: index
        };

        let endpoint;
        if (block.type === 'text') {
          endpoint = `${API_BASE_URL}/api/task-text-blocks/${block.existingId}/`;
          blockPayload.content = block.content;
        } else if (block.type === 'code') {
          endpoint = `${API_BASE_URL}/api/task-code-blocks/${block.existingId}/`;
          blockPayload.code = block.code;
          blockPayload.language = block.language;
        } else if (block.type === 'video') {
          endpoint = `${API_BASE_URL}/api/task-video-blocks/${block.existingId}/`;
          blockPayload.title = block.title;
          blockPayload.youtube_url = block.youtube_url;
          blockPayload.description = block.description;
        } else if (block.type === 'highlight') {
          endpoint = `${API_BASE_URL}/api/task-highlight-blocks/${block.existingId}/`;
          blockPayload.content = block.content;
        }

        return axios.patch(endpoint, blockPayload, { headers: getAuthHeaders() });
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      // Create new blocks
      const createPromises = newBlocks.map((block) => {
        // Calculate the correct order: new blocks follow existing ones in the UI order
        const blockIndex = updatedBlocks.indexOf(block);

        const blockPayload = {
          page: savedPageId,
          order: blockIndex
        };

        let endpoint;
        if (block.type === 'text') {
          endpoint = `${API_BASE_URL}/api/task-text-blocks/`;
          blockPayload.content = block.content;
        } else if (block.type === 'code') {
          endpoint = `${API_BASE_URL}/api/task-code-blocks/`;
          blockPayload.code = block.code;
          blockPayload.language = block.language;
        } else if (block.type === 'video') {
          endpoint = `${API_BASE_URL}/api/task-video-blocks/`;
          blockPayload.title = block.title;
          blockPayload.youtube_url = block.youtube_url;
          blockPayload.description = block.description;
        } else if (block.type === 'highlight') {
          endpoint = `${API_BASE_URL}/api/task-highlight-blocks/`;
          blockPayload.content = block.content;
        }

        return axios.post(endpoint, blockPayload, { headers: getAuthHeaders() });
      });

      if (createPromises.length > 0) {
        await Promise.all(createPromises);
      }

      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Page Updated!' : 'Page Created!',
        text: 'Rich text page saved successfully',
        timer: 2000
      });

      // Reset deleted blocks after successful save
      setDeletedBlocks([]);
      navigate(`/Tasks/task-detail/${taskId}`);
    } catch (error) {
      console.error('Error saving page:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save page', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return (
      <Layout title="Loading..." content="container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEdit ? 'Edit Rich Text Page' : 'Create Rich Text Page'} content="container">
      <style>{editorStyles}</style>
      <Block>
        <BlockHead>
          <BlockHeadContent>
            <BlockTitle tag="h2">{isEdit ? 'Edit' : 'Create'} Rich Text Page</BlockTitle>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Tasks/task-management">Tasks</Link></li>
                <li className="breadcrumb-item"><Link to={`/Tasks/task-detail/${taskId}`}>{task.title}</Link></li>
                <li className="breadcrumb-item active">{isEdit ? 'Edit' : 'Create'} Page</li>
              </ol>
            </nav>
          </BlockHeadContent>
        </BlockHead>

        <Card className="mb-4">
          <Card.Body>
            <Alert variant="info">
              <Icon name="info" className="me-2" />
              Create a rich text page with text, code, and video blocks. You can reorder blocks using the up/down arrows.
            </Alert>

            <Form onSubmit={handleSubmit}>
              {/* Page Details */}
              <Card className="mb-4">
                <Card.Header><strong>Page Details</strong></Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Page Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={pageData.title}
                      onChange={(e) => handlePageDataChange('title', e.target.value)}
                      isInvalid={!!errors.title}
                      placeholder="Enter page title"
                    />
                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Content Blocks */}
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <strong>Content Blocks</strong>
                  <div className="d-flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => addBlock('text')}>
                      <Icon name="file-text" /> Add Text
                    </Button>
                    <Button variant="success" size="sm" onClick={() => addBlock('code')}>
                      <Icon name="code" /> Add Code
                    </Button>
                    <Button variant="info" size="sm" onClick={() => addBlock('video')}>
                      <Icon name="video" /> Add Video
                    </Button>
                    <Button variant="dark" size="sm" onClick={() => addBlock('highlight')}>
                      <Icon name="file-text" /> Add Highlight Content
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {blocks.length === 0 ? (
                    <Alert variant="secondary">
                      No blocks added yet. Click the buttons above to add text, code, or video blocks.
                    </Alert>
                  ) : (
                    blocks.map((block, index) => (
                      <Card key={block.id} className="mb-3 border">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                          <div>
                            <Badge bg={
                              block.type === 'text' ? 'primary' :
                              block.type === 'code' ? 'success' :
                              block.type === 'video' ? 'info' :
                              'warning'
                            }>
                              {block.type.toUpperCase()}
                            </Badge>
                            <span className="ms-2">Block {index + 1}</span>
                          </div>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => moveBlock(index, 'up')}
                              disabled={index === 0}
                            >
                              <Icon name="arrow-up" />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => moveBlock(index, 'down')}
                              disabled={index === blocks.length - 1}
                            >
                              <Icon name="arrow-down" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeBlock(block.id)}
                            >
                              <Icon name="trash" />
                            </Button>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          {block.type === 'text' && (
                            <Form.Group>
                              <Form.Label>Text Content <span className="text-danger">*</span></Form.Label>
                              <textarea
                                id={`editor-${block.id}`}
                                defaultValue={block.content || ''}
                                style={{ width: '100%', minHeight: '200px' }}
                              />
                              {errors[`block-${index}`] && (
                                <div className="text-danger small mt-1">{errors[`block-${index}`]}</div>
                              )}
                            </Form.Group>
                          )}

                          {block.type === 'code' && (
                            <>
                              <Form.Group className="mb-3">
                                <Form.Label>Programming Language <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                  value={block.language}
                                  onChange={(e) => updateBlock(block.id, 'language', e.target.value)}
                                >
                                  <option value="python">Python</option>
                                  <option value="java">Java</option>
                                  <option value="javascript">JavaScript</option>
                                  <option value="cpp">C++</option>
                                  <option value="c">C</option>
                                  <option value="csharp">C#</option>
                                  <option value="go">Go</option>
                                  <option value="rust">Rust</option>
                                </Form.Select>
                              </Form.Group>
                              <Form.Group>
                                <Form.Label>Code <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={10}
                                  value={block.code || ''}
                                  onChange={(e) => updateBlock(block.id, 'code', e.target.value)}
                                  isInvalid={!!errors[`block-${index}`]}
                                  style={{
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    backgroundColor: '#f5f5f5',
                                    whiteSpace: 'pre',
                                    overflowWrap: 'normal',
                                    overflowX: 'auto'
                                  }}
                                  placeholder="Enter your code here..."
                                />
                                <Form.Control.Feedback type="invalid">{errors[`block-${index}`]}</Form.Control.Feedback>
                              </Form.Group>
                            </>
                          )}

                          {block.type === 'video' && (
                            <>
                              <Form.Group className="mb-3">
                                <Form.Label>Video Title</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={block.title || ''}
                                  onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                                  placeholder="Enter video title"
                                />
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label>YouTube URL <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                  type="url"
                                  value={block.youtube_url || ''}
                                  onChange={(e) => updateBlock(block.id, 'youtube_url', e.target.value)}
                                  isInvalid={!!errors[`block-${index}`]}
                                  placeholder="https://www.youtube.com/watch?v=..."
                                />
                                <Form.Control.Feedback type="invalid">{errors[`block-${index}`]}</Form.Control.Feedback>
                              </Form.Group>
                              <Form.Group>
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  value={block.description || ''}
                                  onChange={(e) => updateBlock(block.id, 'description', e.target.value)}
                                  placeholder="Enter video description"
                                />
                              </Form.Group>
                            </>
                          )}

                          {block.type === 'highlight' && (
                            <>
                              <Form.Group>
                                <Form.Label>Highlight Content <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={10}
                                  value={block.content || ''}
                                  onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                                  isInvalid={!!errors[`block-${index}`]}
                                  placeholder="Enter text to highlight..."
                                  style={{
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    backgroundColor: '#000000',
                                    color: '#FFFFFF',
                                    border: '2px solid #000000',
                                    padding: '10px',
                                    whiteSpace: 'pre',
                                    overflowWrap: 'normal',
                                    overflowX: 'auto'
                                  }}
                                />
                                <Form.Control.Feedback type="invalid">{errors[`block-${index}`]}</Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                  This text will be displayed in a black highlight box with white text. Live preview above!
                                </Form.Text>
                              </Form.Group>
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </Card.Body>
              </Card>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/Tasks/task-detail/${taskId}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon name="save" /> {isEdit ? 'Update' : 'Create'} Page
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
};

export default RichTextPageEditor;
