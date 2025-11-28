import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from '../../layout/default';
import { Block, BlockHead, BlockHeadContent, BlockTitle, Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

const DocumentForm = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('edit');

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document: null,
  });

  useEffect(() => {
    fetchTask();
    if (documentId) {
      fetchDocument();
    }
  }, [taskId, documentId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchTask = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        headers: getAuthHeaders()
      });
      setTask(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load task details'
      });
    }
  };

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/task-documents/${documentId}/`, {
        headers: getAuthHeaders()
      });
      const doc = response.data.data || response.data;
      setFormData({
        title: doc.title || '',
        description: doc.description || '',
        document: null, // Don't pre-populate file
      });
    } catch (error) {
      console.error('Error fetching document:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load document details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentId && !formData.document) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing File',
        text: 'Please select a document to upload'
      });
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('task', taskId);
      data.append('title', formData.title);
      data.append('description', formData.description);

      if (formData.document) {
        data.append('document', formData.document);
      }

      if (documentId) {
        // Update existing document
        await axios.patch(`${API_BASE_URL}/api/task-documents/${documentId}/`, data, {
          headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Document updated successfully',
          timer: 2000
        });
      } else {
        // Create new document
        // Get current documents to calculate order
        const docsRes = await axios.get(`${API_BASE_URL}/api/task-documents/?task=${taskId}`, {
          headers: getAuthHeaders()
        });
        const documents = docsRes.data.results || docsRes.data || [];
        data.append('order', documents.length);

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

      navigate(`/Tasks/task-detail/${taskId}`);
    } catch (error) {
      console.error('Error saving document:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save document'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/Tasks/task-detail/${taskId}`);
  };

  return (
    <Layout title={documentId ? 'Edit Document' : 'Add Document'} content="container">
      <Block>
        <BlockHead>
          <BlockHeadContent>
            <BlockTitle tag="h2">{documentId ? 'Edit Document' : 'Add Document'}</BlockTitle>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><a href="/">Home</a></li>
                <li className="breadcrumb-item"><a href="/Tasks/task-management">Tasks</a></li>
                <li className="breadcrumb-item"><a href={`/Tasks/task-detail/${taskId}`}>{task?.title || 'Task'}</a></li>
                <li className="breadcrumb-item active">{documentId ? 'Edit Document' : 'Add Document'}</li>
              </ol>
            </nav>
          </BlockHeadContent>
        </BlockHead>

        <Card>
          <Card.Body>
            {task && (
              <Alert variant="info" className="mb-4">
                <strong>Task:</strong> {task.title}
                {task.course_title && <span className="ms-3"><strong>Course:</strong> {task.course_title}</span>}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
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
                      Document File {documentId ? '(Leave empty to keep current file)' : <span className="text-danger">*</span>}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                      onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })}
                      required={!documentId}
                    />
                    <Form.Text className="text-muted">
                      Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex gap-2 justify-content-end mt-4">
                <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                  <Icon name="x" /> Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {documentId ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Icon name={documentId ? 'save' : 'upload'} /> {documentId ? 'Update' : 'Upload'}
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

export default DocumentForm;
