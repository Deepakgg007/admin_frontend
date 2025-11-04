import React, { useState, useEffect } from 'react';
import { Button, Table, Spinner, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Trash2, Edit, Upload, Download, Menu } from 'react-feather';
import { API_BASE_URL } from '../../services/apiBase';

const TaskDocumentList = ({ taskId, refreshKey, onRefresh }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document: null,
  });

  useEffect(() => {
    fetchDocuments();
  }, [taskId, refreshKey]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/task-documents/?task=${taskId}`, {
        headers: getAuthHeaders()
      });
      console.log('📄 Documents:', response.data);

      // Handle both paginated and non-paginated responses
      const docs = response.data.results || response.data;
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load documents'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (document = null) => {
    if (document) {
      setEditingDocument(document);
      setFormData({
        title: document.title || '',
        description: document.description || '',
        document: null,
      });
    } else {
      setEditingDocument(null);
      setFormData({
        title: '',
        description: '',
        document: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDocument(null);
    setFormData({ title: '', description: '', document: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingDocument && !formData.document) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing File',
        text: 'Please select a document to upload'
      });
      return;
    }

    try {
      const data = new FormData();
      data.append('task', taskId);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('order', documents.length); // Add at end

      if (formData.document) {
        data.append('document', formData.document);
      }

      if (editingDocument) {
        // Update
        await axios.patch(`${API_BASE_URL}/api/task-documents/${editingDocument.id}/`, data, {
          headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Document updated successfully',
          timer: 2000
        });
      } else {
        // Create
        await axios.post(`${API_BASE_URL}/api/task-documents/`, data, {
          headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Document uploaded successfully',
          timer: 2000
        });
      }

      handleCloseModal();
      fetchDocuments();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving document:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save document'
      });
    }
  };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: 'Delete Document?',
      text: `Are you sure you want to delete "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/task-documents/${id}/`, { headers: getAuthHeaders() });
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Document deleted successfully',
          timer: 2000
        });
        fetchDocuments();
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting document:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete document'
        });
      }
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(documents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    setDocuments(items);

    // Prepare reorder data
    const reorderData = items.map((item, index) => ({
      id: item.id,
      order: index
    }));

    try {
      await axios.post(`${API_BASE_URL}/api/task-documents/reorder/`, {
        items: reorderData
      }, { headers: getAuthHeaders() });
    } catch (error) {
      console.error('Error reordering documents:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reorder documents'
      });
      // Revert on error
      fetchDocuments();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Documents ({documents.length})</h5>
        <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
          <Upload size={16} className="me-1" /> Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <Upload size={48} className="mb-3" />
          <p>No documents yet. Upload your first document!</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="documents">
            {(provided) => (
              <Table hover responsive {...provided.droppableProps} ref={provided.innerRef}>
                <thead>
                  <tr>
                    <th width="50"></th>
                    <th width="60">Order</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <Draggable key={doc.id} draggableId={String(doc.id)} index={index}>
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            backgroundColor: snapshot.isDragging ? '#f8f9fa' : 'white'
                          }}
                        >
                          <td {...provided.dragHandleProps} style={{ cursor: 'grab' }}>
                            <Menu size={18} className="text-muted" />
                          </td>
                          <td>
                            <Badge bg="secondary">{index + 1}</Badge>
                          </td>
                          <td>
                            <strong>{doc.title || 'Untitled'}</strong>
                            {doc.document && (
                              <a
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download size={14} />
                              </a>
                            )}
                          </td>
                          <td className="text-muted small">
                            {doc.description || '-'}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleOpenModal(doc)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(doc.id, doc.title)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </Table>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingDocument ? 'Edit Document' : 'Upload Document'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter document title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Document File {editingDocument && '(Leave empty to keep current file)'}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })}
                    required={!editingDocument}
                  />
                  <Form.Text className="text-muted">
                    Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingDocument ? 'Update' : 'Upload'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default TaskDocumentList;
