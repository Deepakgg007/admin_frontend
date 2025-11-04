// JobList.js
import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Row, Col, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { Trash2, RefreshCw, Briefcase } from "react-feather";
import { API_BASE_URL } from "../../services/apiBase";

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterJobType, setFilterJobType] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [filterActive, setFilterActive] = useState("true");

  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // Fetch Jobs from API
  const fetchJobs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, page_size: perPage };
        if (searchQuery) params.search = searchQuery;
        if (filterJobType) params.job_type = filterJobType;
        if (filterExperience) params.experience_level = filterExperience;
        if (filterActive) params.is_active = filterActive;

        const response = await axios.get(`${API_BASE_URL}/api/jobs/`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = response.data.results || response.data;
        const total = response.data.count || data.length;

        setJobs(Array.isArray(data) ? data : []);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (error) {
        setJobs([]);
        setTotalCount(0);
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch jobs.";
        Swal.fire("Error!", message, "error");
      } finally {
        setLoading(false);
      }
    },
    [perPage, searchQuery, filterJobType, filterExperience, filterActive, authToken]
  );

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage, fetchJobs]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleDelete = async (slug) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/jobs/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        Swal.fire("Deleted!", "Job has been deleted.", "success");
        fetchJobs(currentPage);
      } catch (error) {
        const message =
          error.response?.data?.error || "Failed to delete job.";
        Swal.fire("Error!", message, "error");
      }
    }
  };

  const getJobTypeBadge = (jobType) => {
    const badges = {
      FULL_TIME: "primary",
      PART_TIME: "info",
      CONTRACT: "warning",
      INTERNSHIP: "success",
      FREELANCE: "secondary",
    };
    return badges[jobType] || "secondary";
  };

  const getExperienceBadge = (experience) => {
    const badges = {
      ENTRY: "success",
      MID: "warning",
      SENIOR: "danger",
      LEAD: "dark",
    };
    return badges[experience] || "secondary";
  };

  const columns = [
    {
      name: "Job Title",
      selector: (row) => row.title,
      sortable: true,
      width: "250px",
      cell: (row) => (
        <Link to={`/Jobs/view-job/${row.slug}`}>
          <strong>{row.title}</strong>
        </Link>
      ),
    },
    {
      name: "Company",
      selector: (row) => row.company_name,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          {row.company_logo && (
            <img
              src={row.company_logo}
              alt={row.company_name}
              style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
            />
          )}
          <span>{row.company_name}</span>
        </div>
      ),
    },
    {
      name: "Job Type",
      selector: (row) => row.job_type,
      sortable: true,
      cell: (row) => (
        <Badge bg={getJobTypeBadge(row.job_type)}>
          {row.job_type?.replace("_", " ")}
        </Badge>
      ),
    },
    {
      name: "Experience",
      selector: (row) => row.experience_level,
      sortable: true,
      cell: (row) => (
        <Badge bg={getExperienceBadge(row.experience_level)}>
          {row.experience_level}
        </Badge>
      ),
    },
    {
      name: "Location",
      selector: (row) => row.location || "Remote",
      sortable: true,
    },
    {
      name: "Salary",
      selector: (row) => row.salary_min,
      sortable: true,
      cell: (row) => {
        if (row.salary_min && row.salary_max) {
          return `$${row.salary_min.toLocaleString()} - $${row.salary_max.toLocaleString()}`;
        }
        return "Not Specified";
      },
    },
    {
      name: "Posted By",
      selector: (row) => row.college_name || "Admin",
      sortable: true,
      cell: (row) => (
        <span className={row.college_name ? "text-info" : "text-success"}>
          {row.college_name || "Admin"}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.is_active,
      sortable: true,
      cell: (row) => (
        <Badge bg={row.is_active ? "success" : "danger"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-icon btn-outline-primary"
            onClick={() => navigate(`/Jobs/view-job/${row.slug}`)}
            title="View"
          >
            <Icon name="eye" />
          </button>
          <button
            className="btn btn-sm btn-icon btn-outline-warning"
            onClick={() => navigate(`/Jobs/update-job/${row.slug}`)}
            title="Edit"
          >
            <Icon name="edit" />
          </button>
          <button
            className="btn btn-sm btn-icon btn-outline-danger"
            onClick={() => handleDelete(row.slug)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  return (
    <Layout title="Jobs" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Job Postings</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Jobs
                </li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Jobs/create-job" className="btn btn-primary">
              <Icon name="plus" />
              <span>Add Job</span>
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card>
          <Card.Body>
            <Row className="g-3 mb-3">
              <Col md={3}>
                <Form onSubmit={handleSearchSubmit}>
                  <Form.Control
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </Form>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterJobType}
                  onChange={(e) => {
                    setFilterJobType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Job Types</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterExperience}
                  onChange={(e) => {
                    setFilterExperience(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Experience</option>
                  <option value="ENTRY">Entry Level</option>
                  <option value="MID">Mid Level</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterActive}
                  onChange={(e) => {
                    setFilterActive(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => fetchJobs(currentPage)}
                >
                  <RefreshCw size={16} className="me-1" />
                  Refresh
                </button>
              </Col>
            </Row>

            <DataTable
              columns={columns}
              data={jobs}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={totalCount}
              paginationPerPage={perPage}
              onChangePage={handlePageChange}
              highlightOnHover
              striped
              responsive
            />
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
}

export default JobList;
