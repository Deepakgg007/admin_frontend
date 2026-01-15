import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);

  const authToken = localStorage.getItem('authToken') || localStorage.getItem('access_token');

  const fetchTasks = useCallback(
    async () => {
      setLoading(true);
      try {
        const params = {
          per_page: 10000, // Fetch all tasks without pagination
          search: searchQuery
        };

        // Add filters if selected
        if (filterCourse) params.course = filterCourse;
        if (filterTopic) params.topic = filterTopic;

        console.log('📌 Fetching tasks with params:', params);

        const response = await axios.get(`${API_BASE_URL}/api/tasks/`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        console.log('📌 Tasks API Response:', response.data);

        const res = response.data;
        let data = res?.data || res?.results || [];

        console.log('📌 Raw data from API:', data.length, 'tasks');

        // Client-side filtering by creator type
        if (creatorFilter !== 'all') {
          data = data.filter(task => task.creator_type === creatorFilter);
          console.log('📌 After creator filter:', data.length, 'tasks');
        }

        // Client-side filtering by topic (in case API doesn't filter properly)
        if (filterTopic) {
          data = data.filter(task => {
            const taskTopicId = task.topic;
            const selectedTopicId = parseInt(filterTopic);
            return taskTopicId === selectedTopicId;
          });
          console.log('📌 After topic filter:', data.length, 'tasks for topic', filterTopic);
        }

        console.log('📌 Final tasks extracted:', data.length);

        setTasks(data);
      } catch (error) {
        setTasks([]);
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
    [authToken, searchQuery, filterCourse, filterTopic, creatorFilter]
  );

  useEffect(() => {
    fetchTasks();
    fetchCourses();
    fetchAllTopics();
  }, [fetchTasks]);

  // Filter topics based on selected course
  useEffect(() => {
    if (filterCourse) {
      const courseId = parseInt(filterCourse);
      const topicsForCourse = allTopics.filter(topic => {
        const topicCourseId = topic.course;
        return topicCourseId === courseId;
      });
      setFilteredTopics(topicsForCourse);
      console.log(`Filtered ${topicsForCourse.length} topics for course ${filterCourse}:`, topicsForCourse);

      // Only reset topic filter if selected topic is NOT in the new course
      if (filterTopic) {
        const isTopicInCourse = topicsForCourse.some(t => t.id === parseInt(filterTopic));
        if (!isTopicInCourse) {
          console.log(`Topic ${filterTopic} not found in course ${filterCourse}, resetting topic filter`);
          setFilterTopic('');
        } else {
          console.log(`Topic ${filterTopic} is valid for course ${filterCourse}, keeping selection`);
        }
      }
    } else {
      setFilteredTopics([]);
      setFilterTopic('');
    }
  }, [filterCourse, allTopics, filterTopic]);

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
    // This function is no longer needed as form handling moved to TaskForm component
  };

  const fetchTopicsForSyllabus = async (syllabusId) => {
    // This function is no longer needed as form handling moved to TaskForm component
  };

  const fetchAllTopics = async () => {
    try {
      // Fetch all pages of topics
      let allTopics = [];
      let nextUrl = `${API_BASE_URL}/api/topics/`;

      while (nextUrl) {
        const normalizedUrl = nextUrl.replace(/^http:/, 'https:');

        const response = await axios.get(normalizedUrl, {
          headers: getAuthHeaders()
        });

        const pageResults = response.data.results || response.data.data || response.data;

        if (Array.isArray(pageResults)) {
          allTopics = [...allTopics, ...pageResults];
        }

        // Check for next page
        let nextUrlFromResponse = response.data.next || null;
        if (nextUrlFromResponse) {
          nextUrl = nextUrlFromResponse.replace(/^http:/, 'https:');
        } else {
          nextUrl = null;
        }
      }

      setAllTopics(allTopics);
    } catch (error) {
      console.error('Error fetching all topics:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };
  const handleSelectedRowsChange = ({ selectedRows }) => setSelectedRows(selectedRows);

  const handleShowModal = async (task = null) => {
    if (task) {
      navigate(`/Tasks/task-form/${task.id}`);
    } else {
      navigate('/Tasks/task-form');
    }
  };

  const handleCloseModal = () => {
    // Modal no longer used
  };

  const handleInputChange = (e) => {
    // Form handling moved to TaskForm component
  };

  const handleSubmit = async (e) => {
    // Form submission moved to TaskForm component
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
        fetchTasks();
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
      name: 'Topic',
      selector: (row) => row.topic_title ?? '—',
      sortable: true,
      width: '200px'
    },
    {
      name: 'Status',
      selector: (row) => row.status ?? '—',
      sortable: true,
      cell: (row) => (
        <span className={`badge bg-${
          row.status === 'active' ? 'success' :
          row.status === 'inactive' ? 'warning' : 'secondary'
        }`}>
          {row.status}
        </span>
      ),
      width: '100px'
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
          {/* Creator Type Filter Tabs */}
          <div className="mb-3 d-flex gap-2">
            <button
              onClick={() => setCreatorFilter('all')}
              className={`btn ${creatorFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              size="sm"
            >
              All Tasks
            </button>
            <button
              onClick={() => setCreatorFilter('Superuser')}
              className={`btn ${creatorFilter === 'Superuser' ? 'btn-danger' : 'btn-outline-danger'}`}
              size="sm"
            >
              Admin Created
            </button>
            <button
              onClick={() => setCreatorFilter('College')}
              className={`btn ${creatorFilter === 'College' ? 'btn-primary' : 'btn-outline-primary'}`}
              size="sm"
            >
              College Created
            </button>
          </div>

          {/* Filters Row */}
          <Row className="mb-3 g-2">
            <Col md={4}>
              <Form.Label className="small text-muted mb-1">Filter by Course</Form.Label>
              <Form.Select
                value={filterCourse}
                onChange={(e) => {
                  setFilterCourse(e.target.value);
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
                }}
                disabled={!filterCourse}
              >
                <option value="">
                  {filterCourse ? 'All Topics' : 'Select course first'}
                </option>
                {filteredTopics.map((topic) => (
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
            progressPending={loading}
            fixedHeader
            fixedHeaderScrollHeight="500px"
          />
        </Card>
      </Block>

    </Layout>
  );
};

export default TaskManagement;
