import React, { useState, useEffect } from 'react';
import { Card, Nav, Tab, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from '../../layout/default';
import { Block, BlockHead, BlockHeadContent, BlockTitle, Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

// Import content components
import TaskDocumentList from './TaskDocumentList';
import TaskVideoList from './TaskVideoList';
import TaskQuestionList from './TaskQuestionList';
import TaskRichTextPageList from './TaskRichTextPageList';

const TaskContentManager = () => {
  const { taskId } = useParams();
  const [searchParams] = useSearchParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'documents');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        headers: getAuthHeaders()
      });
      console.log('📌 Task Details:', response.data);
      const taskData = response.data.data || response.data;
      setTask(taskData);
    } catch (error) {
      console.error('Error fetching task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load task details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchTaskDetails();
  };

  if (loading) {
    return (
      <Layout title="Manage Task Content" content="container">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading task details...</p>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout title="Manage Task Content" content="container">
        <Alert variant="danger">
          Task not found or you don't have permission to access it.
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Task Content" content="container">
      <Block>
        <BlockHead>
          <BlockHeadContent>
            <BlockTitle tag="h2">Manage Task Content</BlockTitle>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/Courses/list-course">Courses</Link>
                </li>
                {task.course && (
                  <li className="breadcrumb-item">
                    <Link to={`/Courses/view-course/${task.course}`}>Course Details</Link>
                  </li>
                )}
                <li className="breadcrumb-item active">Manage Task Content</li>
              </ol>
            </nav>
          </BlockHeadContent>
          <BlockHeadContent>
            {task.course && (
              <Link to={`/Courses/view-course/${task.course}`} className="btn btn-outline-secondary">
                <Icon name="arrow-left" className="me-1" /> Back to Course
              </Link>
            )}
          </BlockHeadContent>
        </BlockHead>

        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h4>{task.title}</h4>
                {task.description && <p className="text-muted mb-2">{task.description}</p>}
                <div className="d-flex gap-3">
                  <small className="text-muted">Course: {task.course_title || 'N/A'}</small>
                  {task.topic_title && <small className="text-muted">Topic: {task.topic_title}</small>}
                  <small className="text-muted">Max Score: {task.max_score}</small>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Row>
                <Col lg={12}>
                  <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                      <Nav.Link eventKey="documents">
                        📄 Documents
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="videos">
                        🎥 Videos
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="questions">
                        ❓ Questions
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="richtext">
                        📝 Rich Text Pages
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    <Tab.Pane eventKey="documents">
                      <TaskDocumentList
                        taskId={taskId}
                        refreshKey={refreshKey}
                        onRefresh={handleRefresh}
                      />
                    </Tab.Pane>

                    <Tab.Pane eventKey="videos">
                      <TaskVideoList
                        taskId={taskId}
                        refreshKey={refreshKey}
                        onRefresh={handleRefresh}
                      />
                    </Tab.Pane>

                    <Tab.Pane eventKey="questions">
                      <TaskQuestionList
                        taskId={taskId}
                        refreshKey={refreshKey}
                        onRefresh={handleRefresh}
                      />
                    </Tab.Pane>

                    <Tab.Pane eventKey="richtext">
                      <TaskRichTextPageList
                        taskId={taskId}
                        refreshKey={refreshKey}
                        onRefresh={handleRefresh}
                      />
                    </Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
};

export default TaskContentManager;
