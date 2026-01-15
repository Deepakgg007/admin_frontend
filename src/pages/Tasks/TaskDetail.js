import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Button, Badge, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from '../../layout/default';
import { Block, BlockHead, BlockHeadContent, BlockTitle, Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

const TaskDetail = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [unifiedContent, setUnifiedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState(''); // 'document' or 'video' or 'question' or 'page'

  useEffect(() => {
    fetchTaskWithContent();
  }, [taskId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTaskWithContent = async () => {
    try {
      setLoading(true);

      // Fetch task details
      const taskRes = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        headers: getAuthHeaders()
      });
      const taskData = taskRes.data.data || taskRes.data;
      setTask(taskData);

      // Fetch all content types in parallel
      const [docsRes, videosRes, mcqSetsRes, questionsRes, pagesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/task-documents/?task=${taskId}`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/task-videos/?task=${taskId}`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/task-mcq-sets/?task=${taskId}`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/task-questions/?task=${taskId}`, { headers: getAuthHeaders() }),
        axios.get(`${API_BASE_URL}/api/task-richtext-pages/?task=${taskId}`, { headers: getAuthHeaders() })
      ]);

      const documents = docsRes.data.results || docsRes.data || [];
      const videos = videosRes.data.results || videosRes.data || [];
      const mcqSets = mcqSetsRes.data.results || mcqSetsRes.data || [];
      const questions = questionsRes.data.results || questionsRes.data || [];
      const pages = pagesRes.data.results || pagesRes.data || [];

      // Build unified content list
      const unified = [];

      // Add documents
      documents.forEach(doc => {
        unified.push({
          type: 'document',
          id: doc.id,
          title: doc.title || doc.document_url?.split('/').pop() || 'Untitled Document',
          order: doc.order || 0,
          object: doc,
          isGroup: false
        });
      });

      // Add videos
      videos.forEach(video => {
        unified.push({
          type: 'video',
          id: video.id,
          title: video.title || 'Untitled Video',
          order: video.order || 0,
          object: video,
          isGroup: false
        });
      });

      // Add MCQ Sets (each set is displayed separately, like pages)
      mcqSets.forEach(set => {
        unified.push({
          type: 'mcq_set',
          id: set.id,
          title: set.title || 'Untitled MCQ Set',
          order: set.order || 0,
          object: set,
          isGroup: true,
          questions: set.mcq_questions || []
        });
      });

      // Add remaining individual questions (coding questions without sets)
      const codingQuestions = questions.filter(q => q.question_type === 'coding');

      if (codingQuestions.length > 0) {
        const firstCodingOrder = codingQuestions[0].order || 0;
        unified.push({
          type: 'questions_group',
          id: 'coding_questions',
          title: `Coding Questions (${codingQuestions.length} items)`,
          order: firstCodingOrder,
          questions: codingQuestions,
          isGroup: true,
          questionType: 'coding'
        });
      }

      // Add pages
      pages.forEach(page => {
        unified.push({
          type: 'page',
          id: page.id,
          title: page.title,
          order: page.order || 0,
          object: page,
          isGroup: false
        });
      });

      // Sort by order
      unified.sort((a, b) => a.order - b.order);

      setUnifiedContent(unified);
    } catch (error) {
      console.error('Error fetching task content:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load task content'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (index, newOrder) => {
    const updated = [...unifiedContent];
    updated[index].order = parseInt(newOrder) || 0;
    setUnifiedContent(updated);
  };

  const handleSaveOrder = async () => {
    try {
      // Save order for each content type
      const promises = [];

      unifiedContent.forEach(item => {
        if (item.type === 'document') {
          promises.push(
            axios.patch(`${API_BASE_URL}/api/task-documents/${item.id}/`,
              { order: item.order },
              { headers: getAuthHeaders() }
            )
          );
        } else if (item.type === 'video') {
          promises.push(
            axios.patch(`${API_BASE_URL}/api/task-videos/${item.id}/`,
              { order: item.order },
              { headers: getAuthHeaders() }
            )
          );
        } else if (item.type === 'mcq_set') {
          promises.push(
            axios.patch(`${API_BASE_URL}/api/task-mcq-sets/${item.id}/`,
              { order: item.order },
              { headers: getAuthHeaders() }
            )
          );
        } else if (item.type === 'questions_group') {
          // Update all questions in the group with the same order
          item.questions.forEach(q => {
            promises.push(
              axios.patch(`${API_BASE_URL}/api/task-questions/${q.id}/`,
                { order: item.order },
                { headers: getAuthHeaders() }
              )
            );
          });
        } else if (item.type === 'page') {
          promises.push(
            axios.patch(`${API_BASE_URL}/api/task-richtext-pages/${item.id}/`,
              { order: item.order },
              { headers: getAuthHeaders() }
            )
          );
        }
      });

      await Promise.all(promises);

      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Content order updated successfully',
        timer: 2000
      });

      fetchTaskWithContent();
    } catch (error) {
      console.error('Error saving order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save order'
      });
    }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Delete this content?',
      text: `Are you sure you want to delete "${item.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        let endpoint = '';
        if (item.type === 'document') endpoint = `/api/task-documents/${item.id}/`;
        else if (item.type === 'video') endpoint = `/api/task-videos/${item.id}/`;
        else if (item.type === 'mcq_set') endpoint = `/api/task-mcq-sets/${item.id}/`;
        else if (item.type === 'page') endpoint = `/api/task-richtext-pages/${item.id}/`;

        if (endpoint) {
          await axios.delete(`${API_BASE_URL}${endpoint}`, {
            headers: getAuthHeaders()
          });

          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Content has been deleted.',
            timer: 2000
          });

          fetchTaskWithContent();
        }
      } catch (error) {
        console.error('Error deleting content:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete content'
        });
      }
    }
  };

  if (loading) {
    return (
      <Layout title="Task Detail" content="container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout title="Task Detail" content="container">
        <div className="alert alert-danger">Task not found</div>
      </Layout>
    );
  }

  return (
    <Layout title="Task Detail" content="container">
      <Block>
        <BlockHead>
          <BlockHeadContent>
            <BlockTitle tag="h2">Task: {task.title}</BlockTitle>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Tasks/task-management">Tasks</Link></li>
                <li className="breadcrumb-item active">{task.title}</li>
              </ol>
            </nav>
          </BlockHeadContent>
        </BlockHead>

        {/* Task Details Card */}
        <Card className="mb-4">
          <Card.Body>
            <h5>Task Details</h5>
            <p><strong>Course:</strong> {task.course_title || 'N/A'}</p>
            <p><strong>Topic:</strong> {task.topic_title || 'N/A'}</p>
            <div className="d-flex gap-2">
              <Link to={`/Tasks/task-management`} className="btn btn-primary btn-sm">
                <Icon name="arrow-left" /> Back to Tasks
              </Link>
              <Badge bg={task.status === 'active' ? 'success' : 'secondary'}>{task.status}</Badge>
            </div>
          </Card.Body>
        </Card>

        {/* Unified Content Management */}
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <Icon name="layers" className="me-2" />
              Task Content (Unified Order)
            </div>
            <Button variant="primary" size="sm" onClick={handleSaveOrder}>
              <Icon name="save" /> Save Order
            </Button>
          </Card.Header>
          <Card.Body>
            <p className="text-muted mb-3">
              <Icon name="info" /> Set the order in which content will be displayed. Lower numbers appear first.
            </p>

            {unifiedContent.length > 0 ? (
              <div>
                {unifiedContent.map((item, index) => (
                  <div key={`${item.type}-${item.id}`} className="mb-3 p-3 border rounded">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <Form.Control
                          type="number"
                          value={item.order}
                          onChange={(e) => handleOrderChange(index, e.target.value)}
                          style={{ width: '80px' }}
                          min="0"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          {item.type === 'mcq_set' && <Badge bg="primary" className="me-2">MCQ Set</Badge>}
                          {item.type === 'questions_group' && <Badge bg="info" className="me-2">Questions Group</Badge>}
                          {item.type === 'document' && <Badge bg="warning" className="me-2">Document</Badge>}
                          {item.type === 'video' && <Badge bg="success" className="me-2">Video</Badge>}
                          {item.type === 'page' && <Badge bg="secondary" className="me-2">Page</Badge>}
                          <strong>{item.title}</strong>
                        </div>

                        {/* MCQ Set */}
                        {item.type === 'mcq_set' && (
                          <div className="mt-2 ps-3">
                            <p className="text-muted mb-2">
                              <Icon name="info" /> MCQ Assessment - {item.questions.length} question(s), Total Marks: {item.object.total_marks || 0}
                            </p>
                            {item.object.description && <p className="text-muted small">{item.object.description}</p>}
                            {item.questions.map((q, qIdx) => (
                              <div key={q.id} className="mb-2 p-2 bg-light rounded">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <strong>Q{qIdx + 1}:</strong>
                                    <Badge bg="primary" className="ms-2">MCQ - {q.marks} marks</Badge>
                                    <p className="mb-0 mt-1">{q.question_text?.substring(0, 100)}...</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="mt-2 d-flex gap-2">
                              <Link to={`/Tasks/mcq-set-form/${taskId}?edit=${item.id}`} className="btn btn-sm btn-outline-primary">
                                <Icon name="edit" /> Edit Set
                              </Link>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item)}>
                                <Icon name="trash" /> Delete Set
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Questions Group */}
                        {item.type === 'questions_group' && (
                          <div className="mt-2 ps-3">
                            <p className="text-muted mb-2">
                              <Icon name="info" /> {item.questionType === 'mcq' ? 'Multiple Choice Questions' : 'Coding Questions'}
                            </p>
                            {item.questions.map((q, qIdx) => (
                              <div key={q.id} className="mb-2 p-2 bg-light rounded">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <strong>Q{qIdx + 1}:</strong>
                                    <Badge bg={item.questionType === 'mcq' ? 'primary' : 'success'} className="ms-2">
                                      {q.question_type.toUpperCase()}
                                    </Badge>
                                    <p className="mb-0 mt-1">{q.question_text?.substring(0, 100)}...</p>
                                  </div>
                                  <div className="d-flex gap-1">
                                    <Link to={`/Tasks/question-form/${taskId}?edit=${q.id}`} className="btn btn-sm btn-outline-primary">
                                      Edit
                                    </Link>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={async () => {
                                        const result = await Swal.fire({
                                          title: 'Delete Question?',
                                          text: 'Are you sure you want to delete this question?',
                                          icon: 'warning',
                                          showCancelButton: true,
                                          confirmButtonColor: '#d33',
                                          confirmButtonText: 'Yes, delete it!'
                                        });
                                        if (result.isConfirmed) {
                                          try {
                                            await axios.delete(`${API_BASE_URL}/api/task-questions/${q.id}/`, {
                                              headers: getAuthHeaders()
                                            });
                                            Swal.fire('Deleted!', 'Question has been deleted.', 'success');
                                            fetchTaskWithContent();
                                          } catch (error) {
                                            Swal.fire('Error', 'Failed to delete question', 'error');
                                          }
                                        }
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <Link to={`/Tasks/question-form/${taskId}`} className="btn btn-sm btn-primary mt-2">
                              <Icon name="plus" /> Add More Questions
                            </Link>
                          </div>
                        )}

                        {/* Document */}
                        {item.type === 'document' && (
                          <div>
                            <small className="text-muted">{item.object.description}</small>
                            <div className="mt-2 d-flex gap-2">
                              <Link to={`/Tasks/document-form/${taskId}?edit=${item.id}`} className="btn btn-sm btn-outline-primary">
                                <Icon name="edit" /> Edit
                              </Link>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item)}>
                                <Icon name="trash" /> Delete
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Video */}
                        {item.type === 'video' && (
                          <div>
                            <small className="text-muted">{item.object.description}</small>
                            {item.object.youtube_url && <div className="text-muted mt-1"><small>YouTube: {item.object.youtube_url}</small></div>}
                            <div className="mt-2 d-flex gap-2">
                              <Link to={`/Tasks/video-form/${taskId}?edit=${item.id}`} className="btn btn-sm btn-outline-primary">
                                <Icon name="edit" /> Edit
                              </Link>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item)}>
                                <Icon name="trash" /> Delete
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Page */}
                        {item.type === 'page' && (
                          <div>
                            <small className="text-muted">Slug: {item.object.slug}</small>
                            <div className="mt-2 d-flex gap-2">
                              <Link to={`/Tasks/richtext-page-editor/${taskId}/${item.id}`} className="btn btn-sm btn-outline-primary">
                                <Icon name="edit" /> Edit
                              </Link>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item)}>
                                <Icon name="trash" /> Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No content items yet. Add content below.</p>
            )}
          </Card.Body>
        </Card>

        {/* Add Content Buttons */}
        <Card>
          <Card.Header>
            <Icon name="plus-circle" className="me-2" />
            Add Content
          </Card.Header>
          <Card.Body>
            <div className="d-flex gap-2 flex-wrap">
              <Link to={`/Tasks/mcq-set-form/${taskId}`} className="btn btn-primary">
                <Icon name="help-circle" /> Add MCQ Set
              </Link>
              <Link to={`/Tasks/document-form/${taskId}`} className="btn btn-warning">
                <Icon name="file-text" /> Add Document
              </Link>
              <Link to={`/Tasks/video-form/${taskId}`} className="btn btn-success">
                <Icon name="video" /> Add Video
              </Link>
              <Link to={`/Tasks/richtext-page-editor/${taskId}`} className="btn btn-secondary">
                <Icon name="file" /> Add Page
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
};

export default TaskDetail;
