import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Form, Alert, Spinner, Accordion } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

const TaskRichTextPageList = ({ taskId, refreshKey, onRefresh }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedPageForBlocks, setSelectedPageForBlocks] = useState(null);
  const [blockType, setBlockType] = useState('text');

  // Form states
  const [pageForm, setPageForm] = useState({ title: '', order: 0 });
  const [textBlockForm, setTextBlockForm] = useState({ content: '', order: 0 });
  const [codeBlockForm, setCodeBlockForm] = useState({ language: 'python', code: '', title: '', order: 0 });
  const [videoBlockForm, setVideoBlockForm] = useState({ title: '', youtube_url: '', description: '', order: 0 });

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('access_token')}`
  };

  useEffect(() => {
    fetchPages();
  }, [taskId, refreshKey]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/task-richtext-pages/?task=${taskId}`, {
        headers: authHeaders
      });
      // Handle both paginated (results) and non-paginated responses
      const pagesData = response.data.results || response.data || [];
      setPages(Array.isArray(pagesData) ? pagesData : []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      Swal.fire('Error', 'Failed to fetch rich text pages', 'error');
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = () => {
    setCurrentPage(null);
    setPageForm({ title: '', order: pages.length });
    setShowPageModal(true);
  };

  const handleEditPage = (page) => {
    setCurrentPage(page);
    setPageForm({ title: page.title, order: page.order });
    setShowPageModal(true);
  };

  const handleSavePage = async () => {
    try {
      const data = { ...pageForm, task: taskId };

      if (currentPage) {
        await axios.patch(`${API_BASE_URL}/api/task-richtext-pages/${currentPage.id}/`, data, {
          headers: authHeaders
        });
        Swal.fire('Success', 'Page updated successfully', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/api/task-richtext-pages/`, data, {
          headers: authHeaders
        });
        Swal.fire('Success', 'Page created successfully', 'success');
      }

      setShowPageModal(false);
      fetchPages();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving page:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save page', 'error');
    }
  };

  const handleDeletePage = async (pageId) => {
    const result = await Swal.fire({
      title: 'Delete Page?',
      text: 'This will delete the page and all its blocks!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/task-richtext-pages/${pageId}/`, {
          headers: authHeaders
        });
        Swal.fire('Deleted!', 'Page deleted successfully', 'success');
        fetchPages();
        if (onRefresh) onRefresh();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete page', 'error');
      }
    }
  };

  const handleAddBlock = (page) => {
    setSelectedPageForBlocks(page);
    setBlockType('text');
    setTextBlockForm({ content: '', order: 0 });
    setCodeBlockForm({ language: 'python', code: '', title: '', order: 0 });
    setVideoBlockForm({ title: '', youtube_url: '', description: '', order: 0 });
    setShowBlockModal(true);
  };

  const handleSaveBlock = async () => {
    try {
      let endpoint = '';
      let data = {};

      const totalBlocks = (selectedPageForBlocks.text_blocks?.length || 0) +
                         (selectedPageForBlocks.code_blocks?.length || 0) +
                         (selectedPageForBlocks.video_blocks?.length || 0);

      if (blockType === 'text') {
        endpoint = `${API_BASE_URL}/api/task-text-blocks/`;
        data = { ...textBlockForm, page: selectedPageForBlocks.id, order: totalBlocks };
      } else if (blockType === 'code') {
        endpoint = `${API_BASE_URL}/api/task-code-blocks/`;
        data = { ...codeBlockForm, page: selectedPageForBlocks.id, order: totalBlocks };
      } else if (blockType === 'video') {
        endpoint = `${API_BASE_URL}/api/task-video-blocks/`;
        data = { ...videoBlockForm, page: selectedPageForBlocks.id, order: totalBlocks };
      }

      await axios.post(endpoint, data, { headers: authHeaders });
      Swal.fire('Success', `${blockType} block added successfully`, 'success');
      setShowBlockModal(false);
      fetchPages();
    } catch (error) {
      console.error('Error saving block:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save block', 'error');
    }
  };

  const handleDeleteBlock = async (blockType, blockId) => {
    const result = await Swal.fire({
      title: 'Delete Block?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        let endpoint = '';
        if (blockType === 'text') endpoint = `${API_BASE_URL}/api/task-text-blocks/${blockId}/`;
        else if (blockType === 'code') endpoint = `${API_BASE_URL}/api/task-code-blocks/${blockId}/`;
        else if (blockType === 'video') endpoint = `${API_BASE_URL}/api/task-video-blocks/${blockId}/`;

        await axios.delete(endpoint, { headers: authHeaders });
        Swal.fire('Deleted!', 'Block deleted successfully', 'success');
        fetchPages();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete block', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading rich text pages...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Rich Text Pages <Badge bg="primary">{pages.length}</Badge></h5>
        <Button variant="primary" size="sm" onClick={handleCreatePage}>
          <Icon name="plus" className="me-1" /> Add Page
        </Button>
      </div>

      {pages.length === 0 ? (
        <Alert variant="info">
          No rich text pages created yet. Click "Add Page" to create a Word-editor-like page with text, code, and video blocks.
        </Alert>
      ) : (
        <Accordion>
          {pages.map((page, index) => (
            <Accordion.Item eventKey={String(index)} key={page.id}>
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                  <span>
                    <strong>{page.title}</strong>
                    <small className="text-muted ms-2">({page.slug})</small>
                  </span>
                  <div>
                    <Badge bg="secondary" className="me-2">
                      {(page.text_blocks?.length || 0) + (page.code_blocks?.length || 0) + (page.video_blocks?.length || 0)} blocks
                    </Badge>
                    <Badge bg="info">Order: {page.order}</Badge>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <div className="mb-3">
                  <Button variant="success" size="sm" className="me-2" onClick={() => handleAddBlock(page)}>
                    <Icon name="plus" /> Add Block
                  </Button>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditPage(page)}>
                    <Icon name="edit" /> Edit Page
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeletePage(page.id)}>
                    <Icon name="trash" /> Delete Page
                  </Button>
                </div>

                <Card className="border">
                  <Card.Body>
                    <h6 className="mb-3">Content Blocks:</h6>

                    {page.text_blocks?.length > 0 && (
                      <div className="mb-3">
                        <strong className="text-primary">📝 Text Blocks:</strong>
                        {page.text_blocks.map((block) => (
                          <div key={block.id} className="border p-2 mt-2 bg-light">
                            <div className="d-flex justify-content-between">
                              <small className="text-muted">Order: {block.order}</small>
                              <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDeleteBlock('text', block.id)}>
                                <Icon name="trash" />
                              </Button>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: block.content.substring(0, 200) + (block.content.length > 200 ? '...' : '') }} />
                          </div>
                        ))}
                      </div>
                    )}

                    {page.code_blocks?.length > 0 && (
                      <div className="mb-3">
                        <strong className="text-success">💻 Code Blocks:</strong>
                        {page.code_blocks.map((block) => (
                          <div key={block.id} className="border p-2 mt-2 bg-light">
                            <div className="d-flex justify-content-between">
                              <div>
                                <Badge bg="dark">{block.language}</Badge>
                                {block.title && <span className="ms-2">{block.title}</span>}
                                <small className="text-muted ms-2">Order: {block.order}</small>
                              </div>
                              <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDeleteBlock('code', block.id)}>
                                <Icon name="trash" />
                              </Button>
                            </div>
                            <pre className="bg-dark text-white p-2 mt-2 mb-0" style={{ maxHeight: '150px', overflow: 'auto' }}>
                              <code>{block.code}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {page.video_blocks?.length > 0 && (
                      <div className="mb-3">
                        <strong className="text-danger">🎥 Video Blocks:</strong>
                        {page.video_blocks.map((block) => (
                          <div key={block.id} className="border p-2 mt-2 bg-light">
                            <div className="d-flex justify-content-between">
                              <div>
                                <strong>{block.title || 'Untitled Video'}</strong>
                                <small className="text-muted ms-2">Order: {block.order}</small>
                              </div>
                              <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleDeleteBlock('video', block.id)}>
                                <Icon name="trash" />
                              </Button>
                            </div>
                            <small className="text-muted d-block">{block.youtube_url}</small>
                            {block.description && <p className="mb-0 mt-1">{block.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {(page.text_blocks?.length === 0 && page.code_blocks?.length === 0 && page.video_blocks?.length === 0) && (
                      <Alert variant="secondary" className="mb-0">
                        No blocks added yet. Click "Add Block" to add content.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      <Modal show={showPageModal} onHide={() => setShowPageModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentPage ? 'Edit Page' : 'Create New Page'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Page Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Introduction to Python"
                value={pageForm.title}
                onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Display Order</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={pageForm.order}
                onChange={(e) => setPageForm({ ...pageForm, order: parseInt(e.target.value) })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPageModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSavePage}>
            {currentPage ? 'Update' : 'Create'} Page
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showBlockModal} onHide={() => setShowBlockModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Content Block to "{selectedPageForBlocks?.title}"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Block Type</Form.Label>
            <Form.Select value={blockType} onChange={(e) => setBlockType(e.target.value)}>
              <option value="text">📝 Text Block (HTML)</option>
              <option value="code">💻 Code Block</option>
              <option value="video">🎥 Video Block (YouTube)</option>
            </Form.Select>
          </Form.Group>

          {blockType === 'text' && (
            <Form.Group className="mb-3">
              <Form.Label>Text Content (HTML)</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="<p>Your HTML content here...</p>"
                value={textBlockForm.content}
                onChange={(e) => setTextBlockForm({ ...textBlockForm, content: e.target.value })}
              />
              <Form.Text>You can use HTML tags for formatting</Form.Text>
            </Form.Group>
          )}

          {blockType === 'code' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Code Title (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Hello World Example"
                  value={codeBlockForm.title}
                  onChange={(e) => setCodeBlockForm({ ...codeBlockForm, title: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Programming Language</Form.Label>
                <Form.Select
                  value={codeBlockForm.language}
                  onChange={(e) => setCodeBlockForm({ ...codeBlockForm, language: e.target.value })}
                >
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="bash">Bash</option>
                  <option value="json">JSON</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Code</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  placeholder="def hello_world():\n    print('Hello, World!')"
                  value={codeBlockForm.code}
                  onChange={(e) => setCodeBlockForm({ ...codeBlockForm, code: e.target.value })}
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Group>
            </>
          )}

          {blockType === 'video' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Video Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Python Tutorial"
                  value={videoBlockForm.title}
                  onChange={(e) => setVideoBlockForm({ ...videoBlockForm, title: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>YouTube URL *</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoBlockForm.youtube_url}
                  onChange={(e) => setVideoBlockForm({ ...videoBlockForm, youtube_url: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Video description..."
                  value={videoBlockForm.description}
                  onChange={(e) => setVideoBlockForm({ ...videoBlockForm, description: e.target.value })}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBlockModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveBlock}>Add Block</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskRichTextPageList;
