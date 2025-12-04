import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';

const TaskForm = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(taskId ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    course: '',
    topic: '',
    status: 'active'
  });

  const authToken = localStorage.getItem('authToken') || localStorage.getItem('access_token');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchCourses();
    if (taskId) fetchTask();
  }, [taskId]);

  useEffect(() => {
    if (formData.course) {
      fetchTopics(); // Fetch topics by course
    } else {
      setTopics([]);
      setFormData(prev => ({ ...prev, topic: '' }));
    }
  }, [formData.course]);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        headers: getAuthHeaders()
      });
      const task = response.data.data || response.data;

      setFormData({
        title: task.title || '',
        course: task.course || '',
        topic: task.topic || '',
        status: task.status || 'active'
      });

      if (task.course) {
        await fetchTopics(task.course); // Fetch topics by course
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      Swal.fire('Error', 'Failed to load task details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses/`, {
        headers: getAuthHeaders()
      });
      const data = response.data.results || response.data.data || response.data;
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTopics = async (courseId = null) => {
    try {
      const id = courseId || formData.course;

      if (!id) {
        setTopics([]);
        return;
      }

      // Fetch topics for the selected course only (more efficient)
      let allTopics = [];
      let nextUrl = `${API_BASE_URL}/api/topics/?course=${id}`;

      // Handle pagination - fetch all pages for this course
      while (nextUrl) {
        // Normalize the next URL to ensure it uses HTTPS (fixes CORS issues)
        const normalizedUrl = nextUrl.replace(/^http:/, 'https:');

        const response = await axios.get(normalizedUrl, {
          headers: getAuthHeaders()
        });

        const pageResults = response.data.results || response.data.data || response.data;

        if (Array.isArray(pageResults)) {
          allTopics = [...allTopics, ...pageResults];
        }

        // Check if there's a next page
        let nextUrlFromResponse = response.data.next || null;

        // Normalize next URL to HTTPS if it exists
        if (nextUrlFromResponse) {
          nextUrl = nextUrlFromResponse.replace(/^http:/, 'https:');
        } else {
          nextUrl = null;
        }
      }

      setTopics(allTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData(prev => ({
      ...prev,
      course: courseId,
      topic: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return Swal.fire('Error', 'Title is required', 'error');
    if (!formData.course) return Swal.fire('Error', 'Course is required', 'error');

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        course: parseInt(formData.course),
        topic: formData.topic ? parseInt(formData.topic) : null
      };

      if (taskId) {
        await axios.patch(`${API_BASE_URL}/api/tasks/${taskId}/`, payload, { headers: getAuthHeaders() });
        Swal.fire('Success!', 'Task updated successfully', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/api/tasks/`, payload, { headers: getAuthHeaders() });
        Swal.fire('Success!', 'Task created successfully', 'success');
      }

      navigate('/Tasks/task-management');
    } catch (error) {
      console.error('Error saving task:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Task Form" content="container">
        <Block>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Block>
      </Layout>
    );
  }

  return (
    <Layout title={taskId ? 'Edit Task' : 'Create Task'} content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h3">
              {taskId ? 'Edit Task' : 'Create New Task'}
            </Block.Title>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="course"
                      value={formData.course}
                      onChange={handleCourseChange}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Topic *</Form.Label>
                    <Form.Select
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      disabled={!formData.course}
                    >
                      <option value="">
                        {formData.course ? 'Select Topic' : 'Select course first'}
                      </option>
                      {topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter task title"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex gap-3">
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : taskId ? 'Update Task' : 'Create Task'}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/Tasks/task-management')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
};

export default TaskForm;
