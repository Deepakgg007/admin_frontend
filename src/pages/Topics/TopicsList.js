import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Dropdown, Row, Col, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { search } from "react-icons-kit/fa/search";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon, AdminOnly } from "../../components";
import { XCircle, Trash2, RefreshCw } from "react-feather";
import { isAdmin } from "../../utilities/auth";
import { API_BASE_URL } from "../../services/apiBase";

function TopicsList() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);

  const authToken = localStorage.getItem("authToken");

  // Fetch courses for filter dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/courses/`, {
          params: { per_page: 1000 },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.data || res.data.results || [];
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    if (authToken) {
      fetchCourses();
    }
  }, [authToken]);

  // Fetch topics from API
  const fetchTopics = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: perPage,
          search: searchQuery
        };

        // Add course filter if selected
        if (courseFilter) {
          params.course = courseFilter;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/topics/`,
          {
            params,
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );


        const res = response.data;
        let data = res?.data || res?.results || [];

        // Client-side filtering by creator type
        if (creatorFilter !== "all") {
          data = data.filter(topic => topic.creator_type === creatorFilter);
        }

        const total = data.length;


        setTopics(data);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (error) {
        setTopics([]);
        setTotalCount(0);

        const backendMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch topics.";
        Swal.fire("Error!", backendMessage, "error");
      } finally {
        setLoading(false);
      }
    },
    [perPage, searchQuery, courseFilter, creatorFilter, authToken]
  );

  // Fetch topics when page changes
  useEffect(() => {
    fetchTopics(currentPage);
  }, [currentPage, fetchTopics]);

  // When creator filter changes, reset to page 1 and fetch
  useEffect(() => {
    setCurrentPage(1);
  }, [creatorFilter]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleCourseFilterChange = (e) => {
    setCourseFilter(e.target.value);
    setCurrentPage(1);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTopics(1);
  };
  const handleSelectedRowsChange = ({ selectedRows }) =>
    setSelectedRows(selectedRows);

  const deleteConfirm = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this topic?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/topics/${id}/`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200 || response.status === 204) {
        Swal.fire("Deleted!", "Topic deleted successfully.", "success");
        fetchTopics(currentPage);
      } else {
        Swal.fire("Error!", response.data?.message || "Failed to delete.", "error");
      }
    } catch (error) {
      const backendMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to delete.";
      Swal.fire("Error!", backendMessage, "error");
    }
  };

  // Columns for DataTable
  const columns = [
    {
      name: "Title",
      selector: (row) => row.title ?? "—",
      sortable: true,
      wrap: true
    },
    {
      name: "Course",
      selector: (row) => row.course_title || "—",
      sortable: true,
      width: "150px"
    },
    {
      name: "Creator Type",
      selector: (row) => row.creator_type || "—",
      sortable: true,
      width: "150px",
      cell: (row) => {
        const typeColors = {
          'Superuser': 'danger',
          'College': 'primary',
          'Student': 'success',
          'System': 'secondary',
          'User': 'info'
        };
        const color = typeColors[row.creator_type] || 'secondary';
        return row.creator_type ? (
          <Badge bg={color}>{row.creator_type}</Badge>
        ) : '—';
      }
    },
    {
      name: "Status",
      cell: (row) => (
        <>
          {row.is_published ? (
            <Badge bg="success">Published</Badge>
          ) : (
            <Badge bg="secondary">Draft</Badge>
          )}
          {row.is_preview && (
            <Badge bg="info" className="ms-1">Preview</Badge>
          )}
        </>
      ),
      width: "150px"
    },
    {
      name: "Actions",
      width: "150px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Link
            to={`/Topics/view-topic/${row.id}`}
            className="btn btn-sm btn-icon btn-outline-primary"
            title="View Topic"
          >
            <Icon name="eye" />
          </Link>
          {isAdmin() && (
            <>
              <Link
                to={`/Topics/update-topic/${row.id}`}
                className="btn btn-sm btn-icon btn-outline-success"
                title="Edit Topic"
              >
                <Icon name="edit" />
              </Link>
              <button
                onClick={() => deleteConfirm(row.id)}
                className="btn btn-sm btn-icon btn-outline-danger"
                title="Delete Topic"
              >
                <Icon name="trash" />
              </button>
            </>
          )}
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        background: "linear-gradient(to right, #e0eafc, #cfdef3)",
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
        "&:hover": { backgroundColor: "#e6f0ff" },
        overflow: "visible",
      },
    },
    headCells: { style: { color: "#333" } },
    cells: {
      style: {
        paddingTop: "12px",
        paddingBottom: "12px",
        overflow: "visible",
      }
    },
    table: {
      style: {
        overflow: "visible",
      },
    },
  };

  return (
    <Layout title="Topics" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Topics</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Topics
                </li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <AdminOnly>
              <div className="d-flex align-items-center">
                <Dropdown>
                  <Dropdown.Toggle variant="primary">
                    <Icon name="settings me-2" /> Bulk Actions
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ marginTop: "50px", marginRight: "50px" }}>
                    <Dropdown.Item
                      onClick={() => Swal.fire("Implement Multi Delete")}
                      className="d-flex align-items-center gap-2 text-danger"
                    >
                      <Trash2 size={18} /> Multi Soft Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => Swal.fire("Implement Multi Force Delete")}
                      className="d-flex align-items-center gap-2 text-danger"
                    >
                      <XCircle size={18} /> Multi Force Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => Swal.fire("Implement Restore")}
                      className="d-flex align-items-center gap-2 text-success"
                    >
                      <RefreshCw size={18} /> Restore
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Link to="/Topics/create-topic" className="btn btn-primary ms-2">
                  <Icon name="plus me-1" /> Add Topic
                </Link>
              </div>
            </AdminOnly>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card className="p-3">
          {/* Creator Type Filter Tabs */}
          <div className="mb-3 d-flex gap-2">
            <button
              onClick={() => setCreatorFilter("all")}
              className={`btn ${creatorFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
              size="sm"
            >
              All Topics
            </button>
            <button
              onClick={() => setCreatorFilter("Superuser")}
              className={`btn ${creatorFilter === "Superuser" ? "btn-danger" : "btn-outline-danger"}`}
              size="sm"
            >
              Admin Created
            </button>
            <button
              onClick={() => setCreatorFilter("College")}
              className={`btn ${creatorFilter === "College" ? "btn-primary" : "btn-outline-primary"}`}
              size="sm"
            >
              College Created
            </button>
          </div>

          <Form onSubmit={handleSearchSubmit} className="mb-3">
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Filter by Course</Form.Label>
                  <Form.Select
                    value={courseFilter}
                    onChange={handleCourseFilterChange}
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
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Search by Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by title"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <button className="btn btn-outline-primary w-100" type="submit">
                  <Icon icon={search} /> Search
                </button>
              </Col>
            </Row>
          </Form>

          <DataTable
            tableClassName="data-table-head-light table-responsive data-table-checkbox"
            data={topics}
            columns={columns}
            customStyles={customStyles}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalCount}
            paginationPerPage={perPage}
            onChangePage={handlePageChange}
            fixedHeader
            fixedHeaderScrollHeight="500px"
          />
        </Card>
      </Block>
    </Layout>
  );
}

export default TopicsList;
