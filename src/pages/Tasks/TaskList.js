import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Badge, Form, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Edit2, FileText } from 'react-feather';
import { Block, BlockHead, BlockHeadContent, BlockTitle } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedCourse]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses/courses/`, {
        headers: getAuthHeaders()
      });
      const courseData = response.data.results || response.data.data || response.data;
      setCourses(Array.isArray(courseData) ? courseData : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/tasks/`;

      if (selectedCourse) {
        url += `?course=${selectedCourse}`;
      }

      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      console.log('📌 Tasks:', response.data);

      const taskData = response.data.results || response.data.data || response.data;
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load tasks. Please make sure you are logged in.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      archived: 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <>
      <Block>
        <BlockHead>
          <BlockHeadContent>
            <BlockTitle tag="h4">Task List</BlockTitle>
            <p className="text-muted">Manage tasks and their content</p>
          </BlockHeadContent>
        </BlockHead>

        <Card>
          <Card.Body>
            <Row className="mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Filter by Course</Form.Label>
                  <Form.Select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">All Courses</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={8} className="text-end">
                <div className="mt-4">
                  <span className="text-muted">Total Tasks: {tasks.length}</span>
                </div>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FileText size={48} className="mb-3" />
                <p>No tasks found. Tasks will appear here once created in the Django admin.</p>
              </div>
            ) : (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Topic</th>
                    <th>Created By</th>
                    <th>Creator Type</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => {
                    const typeColors = {
                      'Superuser': 'danger',
                      'College': 'primary',
                      'Student': 'success',
                      'System': 'secondary',
                      'User': 'info'
                    };
                    const creatorTypeColor = typeColors[task.creator_type] || 'secondary';

                    return (
                      <tr key={task.id}>
                        <td>
                          <Badge bg="secondary">{task.order || index + 1}</Badge>
                        </td>
                        <td>
                          <strong>{task.title}</strong>
                          {task.description && (
                            <div className="text-muted small">
                              {task.description.substring(0, 80)}
                              {task.description.length > 80 && '...'}
                            </div>
                          )}
                        </td>
                        <td>{task.course_title || '-'}</td>
                        <td>{task.topic_title || '-'}</td>
                        <td>{task.created_by_name || '-'}</td>
                        <td>
                          {task.creator_type ? (
                            <Badge bg={creatorTypeColor}>{task.creator_type}</Badge>
                          ) : '-'}
                        </td>
                        <td>{getStatusBadge(task.status)}</td>
                        <td>
                          <span className="text-muted small">
                            Max: {task.max_score} | Pass: {task.passing_score}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link
                              to={`/Tasks/task-detail/${task.id}`}
                              className="btn btn-sm btn-icon btn-outline-primary"
                              title="View Task"
                            >
                              <FileText size={14} />
                            </Link>
                            <Link
                              to={`/Tasks/manage-content/${task.id}`}
                              className="btn btn-sm btn-icon btn-outline-success"
                              title="Manage Content"
                            >
                              <Edit2 size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Block>
    </>
  );
};

export default TaskList;
