import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, Button, Form, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
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
  const [searchParams] = useSearchParams();
  const isEdit = !!pageId;

  const [task, setTask] = useState(null);
  const [pageData, setPageData] = useState({
    title: '',
    slug: '',
    order: 0
  });
  const [blocks, setBlocks] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    }
  }, [taskId, pageId]);

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

      // Combine all blocks and sort by order
      const allBlocks = [];

      (page.text_blocks || []).forEach(block => {
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
      ...(type === 'video' && { title: '', youtube_url: '', description: '' })
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id, field, value) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  const removeBlock = (id) => {
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

    if (!pageData.slug.trim()) {
      newErrors.slug = 'Slug is required';
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
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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

      // Delete existing blocks if editing
      if (isEdit) {
        const deletePromises = [];

        // Get existing block IDs from the fetched page
        blocks.forEach(block => {
          if (block.existingId) {
            const endpoint = block.type === 'text'
              ? `/api/task-text-blocks/${block.existingId}/`
              : block.type === 'code'
              ? `/api/task-code-blocks/${block.existingId}/`
              : `/api/task-video-blocks/${block.existingId}/`;

            deletePromises.push(
              axios.delete(`${API_BASE_URL}${endpoint}`, { headers: getAuthHeaders() })
                .catch(err => console.warn('Block delete failed:', err))
            );
          }
        });

        await Promise.all(deletePromises);
      }

      // Create all blocks
      const blockPromises = blocks.map((block, index) => {
        const blockPayload = {
          page: savedPageId,
          order: index
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
        }

        return axios.post(endpoint, blockPayload, { headers: getAuthHeaders() });
      });

      await Promise.all(blockPromises);

      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Page Updated!' : 'Page Created!',
        text: 'Rich text page saved successfully',
        timer: 2000
      });

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

                  <Form.Group className="mb-3">
                    <Form.Label>Slug (URL-friendly) <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={pageData.slug}
                      onChange={(e) => handlePageDataChange('slug', e.target.value)}
                      isInvalid={!!errors.slug}
                      placeholder="page-slug"
                    />
                    <Form.Control.Feedback type="invalid">{errors.slug}</Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Auto-generated from title, but you can customize it
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      value={pageData.order}
                      onChange={(e) => handlePageDataChange('order', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <Form.Text className="text-muted">
                      Lower numbers appear first
                    </Form.Text>
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
                            <Badge bg={block.type === 'text' ? 'primary' : block.type === 'code' ? 'success' : 'info'}>
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
                              <CKEditor
                                editor={ClassicEditor}
                                data={block.content || ''}
                                onChange={(event, editor) => {
                                  const data = editor.getData();
                                  updateBlock(block.id, 'content', data);
                                }}
                                config={{
                                  extraPlugins: [Base64UploadAdapterPlugin],
                                  toolbar: {
                                    items: [
                                      'heading', 'paragraph', '|',
                                      'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', '|',
                                      'fontColor', 'fontBackgroundColor', 'fontFamily', 'fontSize', '|',
                                      'bulletedList', 'numberedList', 'outdent', 'indent', '|',
                                      'alignment', '|',
                                      'link', 'uploadImage', 'blockQuote', 'codeBlock', 'insertTable', 'horizontalLine', '|',
                                      'removeFormat', '|',
                                      'undo', 'redo'
                                    ],
                                    shouldNotGroupWhenFull: true
                                  },
                                  paragraph: {
                                    modes: [
                                      {
                                        title: 'Paragraph',
                                        model: 'paragraph',
                                        class: 'ck-heading_paragraph'
                                      }
                                    ]
                                  },
                                  image: {
                                    toolbar: [
                                      'imageStyle:block',
                                      'imageStyle:side',
                                      'imageStyle:alignBlockLeft',
                                      'imageStyle:alignBlockRight',
                                      'imageStyle:alignInline',
                                      '|',
                                      'imageResize',
                                      '|',
                                      'imageTextAlternative',
                                      'imageTitle',
                                      'imageLinkOpen',
                                      'imageLinkEdit'
                                    ],
                                    styles: {
                                      options: [
                                        { name: 'block', title: 'Block image (full width)', isDefault: true },
                                        { name: 'side', title: 'Side image (wrapped with text)' },
                                        { name: 'inline', title: 'Inline image' },
                                        { name: 'alignBlockLeft', title: 'Align left' },
                                        { name: 'alignBlockRight', title: 'Align right' }
                                      ]
                                    },
                                    resizeOptions: [
                                      {
                                        name: 'resizeImage:original',
                                        label: 'Original size',
                                        value: null
                                      },
                                      {
                                        name: 'resizeImage:50',
                                        label: '50%',
                                        value: '50'
                                      },
                                      {
                                        name: 'resizeImage:75',
                                        label: '75%',
                                        value: '75'
                                      }
                                    ]
                                  },
                                  simpleUpload: {
                                    uploadUrl: `${API_BASE_URL}/api/upload-image/`
                                  },
                                  upload: {
                                    types: ['jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff']
                                  },
                                  table: {
                                    contentToolbar: [
                                      'tableColumn',
                                      'tableRow',
                                      'mergeTableCells',
                                      'tableProperties',
                                      'tableCellProperties',
                                      'toggleTableCaption'
                                    ]
                                  },
                                  fontSize: {
                                    options: [
                                      9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 32, 36
                                    ]
                                  },
                                  fontFamily: {
                                    options: [
                                      'default',
                                      'Arial, sans-serif',
                                      'Calibri, sans-serif',
                                      'Courier New, monospace',
                                      'Georgia, serif',
                                      'Lucida Sans Unicode, sans-serif',
                                      'Trebuchet MS, sans-serif',
                                      'Verdana, sans-serif',
                                      'Times New Roman, serif'
                                    ]
                                  },
                                  fontColor: {
                                    columns: 5,
                                    colors: [
                                      { color: 'hsl(0, 0%, 0%)', label: 'Black' },
                                      { color: 'hsl(0, 0%, 30%)', label: 'Dark Grey' },
                                      { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
                                      { color: 'hsl(0, 75%, 60%)', label: 'Red' },
                                      { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
                                      { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
                                      { color: 'hsl(120, 75%, 60%)', label: 'Green' },
                                      { color: 'hsl(180, 75%, 60%)', label: 'Cyan' },
                                      { color: 'hsl(240, 75%, 60%)', label: 'Blue' },
                                      { color: 'hsl(270, 75%, 60%)', label: 'Purple' },
                                      { color: 'hsl(300, 75%, 60%)', label: 'Magenta' },
                                      { color: 'hsl(0, 0%, 100%)', label: 'White' }
                                    ]
                                  },
                                  fontBackgroundColor: {
                                    columns: 5,
                                    colors: [
                                      { color: 'hsl(0, 0%, 100%)', label: 'White (default)' },
                                      { color: 'hsl(60, 75%, 60%)', label: 'Yellow highlight' },
                                      { color: 'hsl(120, 75%, 60%)', label: 'Green highlight' },
                                      { color: 'hsl(240, 75%, 60%)', label: 'Blue highlight' },
                                      { color: 'hsl(0, 75%, 60%)', label: 'Red highlight' },
                                      { color: 'hsl(30, 75%, 60%)', label: 'Orange highlight' },
                                      { color: 'hsl(300, 75%, 60%)', label: 'Pink highlight' },
                                      { color: 'hsl(270, 75%, 60%)', label: 'Purple highlight' }
                                    ]
                                  },
                                  heading: {
                                    options: [
                                      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                                      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                                      { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
                                    ]
                                  }
                                }}
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
                                    backgroundColor: '#f5f5f5'
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
