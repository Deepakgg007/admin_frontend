// src/pages/Courses/CourseList.js
import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Dropdown, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { search } from "react-icons-kit/fa/search";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { Eye, Edit, Trash2 } from "react-feather";
import { API_BASE_URL } from "../../services/apiBase";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [creatorFilter, setCreatorFilter] = useState("all");

  const authToken = localStorage.getItem("authToken");

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    if (authToken) {
      fetchCurrentUser();
    }
  }, [authToken]);

  const fetchCourses = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, per_page: perPage, search: searchQuery };

        console.log('Fetching courses with params:', params);

        const response = await axios.get(`${API_BASE_URL}/api/courses/`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });


        const res = response.data;
        // Backend returns: { success, message, data: [...], pagination: { total, ... } }
        let data = res?.data || res?.results || [];

        // Client-side filtering by creator type
        if (creatorFilter !== "all") {
          data = data.filter(course => course.creator_type === creatorFilter);
        }

        const total = data.length;

        setCourses(data);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (error) {
        setCourses([]);
        setTotalCount(0);
        Swal.fire(
          "Error!",
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to fetch courses.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [authToken, perPage, searchQuery, creatorFilter]
  );

  // Fetch courses when page changes
  useEffect(() => {
    fetchCourses(currentPage);
  }, [currentPage, fetchCourses]);

  // When filter changes, reset to page 1 and fetch
  useEffect(() => {
    setCurrentPage(1);
  }, [creatorFilter]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses(1);
  };
  const handleSelectedRowsChange = ({ selectedRows }) =>
    setSelectedRows(selectedRows);

  const deleteConfirm = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this course?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/courses/${id}/`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200 || response.status === 204) {
        Swal.fire("Deleted!", "Course deleted successfully.", "success");
        fetchCourses(currentPage);
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to delete.",
        "error"
      );
    }
  };

  const columns = [
    {
      name: "Thumbnail",
      selector: (row) => row.thumbnail ?? "",
      cell: (row) => (
        <img
          src={row.thumbnail ?? "/placeholder.png"}
          alt={row.title}
          style={{
            width: "60px",
            height: "45px",
            objectFit: "cover",
            borderRadius: "5px",
          }}
        />
      ),
    },
    { name: "Course ID", selector: (row) => row.course_id ?? "—", sortable: true, width: "120px" },
    { name: "Title", selector: (row) => row.title ?? "—", sortable: true, width: "200px" },
    {
      name: "Created By",
      selector: (row) => row.created_by_name || "—",
      sortable: true,
      width: "130px"
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
          <span className={`badge bg-${color}`}>{row.creator_type}</span>
        ) : '—';
      }
    },
    {
      name: "Difficulty",
      selector: (row) => row.difficulty_level ?? "—",
      sortable: true,
      width: "110px",
      cell: (row) => (
        <span className={`badge bg-${
          row.difficulty_level === 'beginner' ? 'info' :
          row.difficulty_level === 'intermediate' ? 'primary' : 'danger'
        }`}>
          {row.difficulty_level}
        </span>
      )
    },
    {
      name: "Status",
      selector: (row) => row.status ?? "—",
      sortable: true,
      cell: (row) => (
        <span className={`badge bg-${
          row.status === 'published' ? 'success' :
          row.status === 'draft' ? 'warning' : 'secondary'
        }`}>
          {row.status}
        </span>
      )
    },

    {
      name: "Created At",
      selector: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
      sortable: true,
    },
    {
      name: "Actions",
      width: "130px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Link to={`/Courses/view-course/${row.id}`} className="btn btn-sm btn-icon btn-outline-primary" title="View Course">
            <Eye size={14} />
          </Link>
          <Link to={`/Courses/update-course/${row.id}`} className="btn btn-sm btn-icon btn-outline-success" title="Edit Course">
            <Edit size={14} />
          </Link>
          <button onClick={() => deleteConfirm(row.id)} className="btn btn-sm btn-icon btn-outline-danger" title="Delete Course">
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
      },
    },
    headCells: { style: { color: "#333" } },
    cells: { style: { paddingTop: "12px", paddingBottom: "12px" } },
  };

  return (
    <Layout title="Courses" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Courses</Block.Title>
            <p className="text-muted">Manage all courses in the system</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Courses/create-course" className="btn btn-primary ms-2">
              <Icon name="plus me-1" /> Add Course
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card className="p-3">
          {/* Filter Tabs */}
          <div className="mb-3 d-flex gap-2">
            <button
              onClick={() => setCreatorFilter("all")}
              className={`btn ${creatorFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
              size="sm"
            >
              All Courses
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

          <Form onSubmit={handleSearchSubmit} className="mb-3 narrow-search">
            <Row className="align-items-center g-2">
              <Col md={10}>
                <Form.Control
                  type="text"
                  placeholder="Search by title, description, or college"
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
            data={courses}
            columns={columns}
            customStyles={customStyles}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalCount}
            paginationPerPage={perPage}
            onChangePage={handlePageChange}
          />
        </Card>
      </Block>
    </Layout>
  );
}

export default CourseList;
