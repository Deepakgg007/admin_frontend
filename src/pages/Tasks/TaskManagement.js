import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Dropdown, Row, Col, Button, Modal, Badge } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import { search } from 'react-icons-kit/fa/search';
import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { Icon } from '../../components';
import { Eye, Edit, Trash2, FileText, HelpCircle, Video, File } from 'react-feather';
import { API_BASE_URL } from '../../services/apiBase';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [syllabi, setSyllabi] = useState([]);
  const [topics, setTopics] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    syllabus: '',
    topic: '',
    task_type: 'assignment',
    max_score: 100,
    duration_minutes: 60,
    status: 'active',
    is_mandatory: false
  });

  const authToken = localStorage.getItem('authToken') || localStorage.getItem('access_token');

  const fetchTasks = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: perPage,
          search: searchQuery
        };

        // Add filters if selected
        if (filterCourse) params.course = filterCourse;
        if (filterTopic) params.topic = filterTopic;

        const response = await axios.get(`${API_BASE_URL}/api/tasks/`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        console.log('📌 Tasks API Response:', response.data);

        const res = response.data;
        const data = res?.data || res?.results || [];
        const total = res?.pagination?.total || res?.count || data.length;

        console.log('📌 Tasks extracted:', data.length, 'Total:', total);

        setTasks(data);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (error) {
        setTasks([]);
        setTotalCount(0);
        Swal.fire(
          'Error!',
          error.response?.data?.error ||
            error.response?.data?.message ||
            'Failed to fetch tasks.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [authToken, perPage, searchQuery, filterCourse, filterTopic]
  );

  useEffect(() => {
    fetchTasks(currentPage);
    fetchCourses();
    fetchAllTopics();
  }, [currentPage, fetchTasks]);

  useEffect(() => {
    if (formData.course) {
      fetchSyllabiForCourse(formData.course);
    }
  }, [formData.course]);

  useEffect(() => {
    if (formData.syllabus) {
      fetchTopicsForSyllabus(formData.syllabus);
    }
  }, [formData.syllabus]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses/`, {
        headers: getAuthHeaders()
      });
      const courseData = response.data.results || response.data.data || response.data;
      setCourses(Array.isArray(courseData) ? courseData : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchSyllabiForCourse = async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/syllabi/?course=${courseId}`, {
        headers: getAuthHeaders()
      });
      const syllabusData = response.data.results || response.data.data || response.data;
      setSyllabi(Array.isArray(syllabusData) ? syllabusData : []);
    } catch (error) {
      console.error('Error fetching syllabi:', error);
    }
  };

  const fetchTopicsForSyllabus = async (syllabusId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/topics/?syllabus=${syllabusId}`, {
        headers: getAuthHeaders()
      });
      const topicData = response.data.results || response.data.data || response.data;
      setTopics(Array.isArray(topicData) ? topicData : []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchAllTopics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/topics/`, {
        headers: getAuthHeaders()
      });
      const topicData = response.data.results || response.data.data || response.data;
      setAllTopics(Array.isArray(topicData) ? topicData : []);
    } catch (error) {
      console.error('Error fetching all topics:', error);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks(1);
  };
  const handleSelectedRowsChange = ({ selectedRows }) => setSelectedRows(selectedRows);

  const handleShowModal = async (task = null) => {
    if (task) {
      setEditMode(true);
      setCurrentTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        course: task.course || '',
        syllabus: task.syllabus || '',
        topic: task.topic || '',
        task_type: task.task_type || 'assignment',
        max_score: task.max_score || 100,
        duration_minutes: task.duration_minutes || 60,
        status: task.status || 'active',
        is_mandatory: task.is_mandatory || false
      });

      // Load syllabi and topics for the task's course
      if (task.course) {
        await fetchSyllabiForCourse(task.course);
      }
      if (task.syllabus) {
        await fetchTopicsForSyllabus(task.syllabus);
      }
    } else {
      setEditMode(false);
      setCurrentTask(null);
      setFormData({
        title: '',
        description: '',
        course: '',
        syllabus: '',
        topic: '',
        task_type: 'assignment',
        max_score: 100,
        duration_minutes: 60,
        status: 'active',
        is_mandatory: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentTask(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...formData };
      if (!payload.syllabus) payload.syllabus = null;
      if (!payload.topic) payload.topic = null;

      if (editMode && currentTask) {
        await axios.put(
          `${API_BASE_URL}/api/tasks/${currentTask.id}/`,
          payload,
          { headers: getAuthHeaders() }
        );
        Swal.fire('Success', 'Task updated successfully', 'success');
      } else {
        await axios.post(
          `${API_BASE_URL}/api/tasks/`,
          payload,
          { headers: getAuthHeaders() }
        );
        Swal.fire('Success', 'Task created successfully', 'success');
      }
      handleCloseModal();
      fetchTasks(currentPage);
    } catch (error) {
      console.error('Error saving task:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save task', 'error');
    }
  };

  const deleteConfirm = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/tasks/${id}/`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200 || response.status === 204) {
        Swal.fire('Deleted!', 'Task deleted successfully.', 'success');
        fetchTasks(currentPage);
      }
    } catch (error) {
      Swal.fire(
        'Error!',
        error.response?.data?.message || 'Failed to delete.',
        'error'
      );
    }
  };

  const columns = [
    {
      name: 'Task ID',
      selector: (row) => row.task_id ?? row.id ?? '—',
      sortable: true,
      width: '100px'
    },
    {
      name: 'Title',
      selector: (row) => row.title ?? '—',
      sortable: true,
      cell: (row) => (
        <Link to={`/Tasks/task-detail/${row.id}`} className="text-decoration-none">
          <strong>{row.title}</strong>
        </Link>
      ),
      grow: 2
    },
    {
      name: 'Course',
      selector: (row) => row.course_title ?? '—',
      sortable: true,
    },
    {
      name: 'Type',
      selector: (row) => row.task_type ?? '—',
      sortable: true,
      cell: (row) => (
        <span className="badge bg-info">
          {row.task_type || '—'}
        </span>
      ),
      width: '110px'
    },
    {
      name: 'Max Score',
      selector: (row) => row.max_score ?? 0,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Duration',
      selector: (row) => row.duration_minutes ?? 0,
      sortable: true,
      cell: (row) => `${row.duration_minutes} min`,
      width: '100px'
    },
    {
      name: 'Status',
      selector: (row) => row.status ?? '—',
      sortable: true,
      cell: (row) => (
        <span className={`badge bg-${
          row.status === 'active' ? 'success' :
          row.status === 'draft' ? 'warning' : 'secondary'
        }`}>
          {row.status}
        </span>
      ),
      width: '100px'
    },
    {
      name: 'Mandatory',
      selector: (row) => row.is_mandatory ?? false,
      sortable: true,
      cell: (row) => (
        row.is_mandatory ? (
          <Badge bg="danger">Yes</Badge>
        ) : (
          <Badge bg="secondary">No</Badge>
        )
      ),
      center: true,
      width: '110px'
    },
    {
      name: 'Add Content',
      cell: (row) => (
        <div className="d-flex gap-1 flex-wrap">
          <Link to={`/Tasks/question-form/${row.id}`} className="btn btn-sm btn-icon btn-outline-info" title="Add Questions">
            <HelpCircle size={14} />
          </Link>
          <Link to={`/Tasks/task-detail/${row.id}`} className="btn btn-sm btn-icon btn-outline-secondary" title="Add Documents">
            <FileText size={14} />
          </Link>
          <Link to={`/Tasks/task-detail/${row.id}`} className="btn btn-sm btn-icon btn-outline-warning" title="Add Videos">
            <Video size={14} />
          </Link>
          <Link to={`/Courses/manage-task-content/${row.id}?tab=richtext`} className="btn btn-sm btn-icon btn-outline-primary" title="Add Rich Text Page">
            <File size={14} />
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      width: '160px'
    },
    {
      name: 'Actions',
      width: "130px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Link to={`/Tasks/task-detail/${row.id}`} className="btn btn-sm btn-icon btn-outline-primary" title="View Task">
            <Eye size={14} />
          </Link>
          <button onClick={() => handleShowModal(row)} className="btn btn-sm btn-icon btn-outline-success" title="Edit Task">
            <Edit size={14} />
          </button>
          <button onClick={() => deleteConfirm(row.id)} className="btn btn-sm btn-icon btn-outline-danger" title="Delete Task">
            <Trash2 size={14} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        background: 'linear-gradient(to right, #e0eafc, #cfdef3)',
        fontWeight: 'bold',
        fontSize: '14px',
      },
    },
    rows: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        '&:hover': { backgroundColor: '#e6f0ff' },
      },
    },
    headCells: { style: { color: '#333' } },
    cells: { style: { paddingTop: '12px', paddingBottom: '12px' } },
  };

  return (
    <Layout title="Task Management" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Task Management</Block.Title>
            <p className="text-muted">Manage all tasks in the system</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <Button variant="primary" onClick={() => handleShowModal()}>
              <Icon name="plus" className="me-1" /> Add New Task
            </Button>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card className="p-3">
          {/* Filters Row */}
          <Row className="mb-3 g-2">
            <Col md={4}>
              <Form.Label className="small text-muted mb-1">Filter by Course</Form.Label>
              <Form.Select
                value={filterCourse}
                onChange={(e) => {
                  setFilterCourse(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="small text-muted mb-1">Filter by Topic</Form.Label>
              <Form.Select
                value={filterTopic}
                onChange={(e) => {
                  setFilterTopic(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Topics</option>
                {allTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setFilterCourse('');
                  setFilterTopic('');
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                <Icon name="x" className="me-1" /> Clear Filters
              </Button>
            </Col>
          </Row>

          {/* Search Row */}
          <Form onSubmit={handleSearchSubmit} className="mb-3 narrow-search">
            <Row className="align-items-center g-2">
              <Col md={10}>
                <Form.Control
                  type="text"
                  placeholder="Search by title, description, or course"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </Col>
              <Col md={2}>
                <button className="btn btn-outline-primary" type="submit">
                  <Icon icon={search} /> Search
                </button>
              </Col>
            </Row>
          </Form>

          <DataTable
            tableClassName="data-table-head-light table-responsive data-table-checkbox"
            data={tasks}
            columns={columns}
            customStyles={customStyles}
            selectableRows
            onSelectedRowsChange={handleSelectedRowsChange}
            selectedRows={selectedRows}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalCount}
            paginationPerPage={perPage}
            onChangePage={handlePageChange}
          />
        </Card>
      </Block>

      {/* Task Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Task' : 'Create New Task'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
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

            <Form.Group className="mb-3">
              <Form.Label>Syllabus (Optional)</Form.Label>
              <Form.Select
                name="syllabus"
                value={formData.syllabus}
                onChange={handleInputChange}
                disabled={!formData.course}
              >
                <option value="">Select Syllabus</option>
                {syllabi.map((syllabus) => (
                  <option key={syllabus.id} value={syllabus.id}>
                    {syllabus.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Topic (Optional)</Form.Label>
              <Form.Select
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                disabled={!formData.syllabus}
              >
                <option value="">Select Topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Task Type <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="task_type"
                value={formData.task_type}
                onChange={handleInputChange}
                required
              >
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
                <option value="lab">Lab</option>
              </Form.Select>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Max Score <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="max_score"
                    value={formData.max_score}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </div>
            </div>

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
                <option value="draft">Draft</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_mandatory"
                label="Mandatory Task"
                checked={formData.is_mandatory}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? 'Update Task' : 'Create Task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
};

export default TaskManagement;
