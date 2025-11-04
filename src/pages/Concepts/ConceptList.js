import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Row, Col, Badge } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { Trash2, RefreshCw } from "react-feather";
import { API_BASE_URL } from "../../services/apiBase";

function ConceptList() {
  const [searchParams] = useSearchParams();
  const companyIdFromQuery = searchParams.get('company');

  const [concepts, setConcepts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterCompany, setFilterCompany] = useState(companyIdFromQuery || "");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/companies/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCompanies(response.data.results || response.data || []);
    } catch (error) {
      console.error("Failed to fetch companies");
    }
  }, [authToken]);

  const fetchConcepts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, page_size: perPage };
        if (searchQuery) params.search = searchQuery;
        if (filterCompany) params.company = filterCompany;
        if (filterDifficulty) params.difficulty = filterDifficulty;

        const response = await axios.get(`${API_BASE_URL}/api/concepts/`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = response.data.results || response.data;
        const total = response.data.count || data.length;

        setConcepts(Array.isArray(data) ? data : []);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (error) {
        setConcepts([]);
        setTotalCount(0);
        Swal.fire("Error!", "Failed to fetch concepts.", "error");
      } finally {
        setLoading(false);
      }
    },
    [perPage, searchQuery, filterCompany, filterDifficulty, authToken]
  );

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchConcepts(currentPage);
  }, [currentPage, fetchConcepts]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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
        await axios.delete(`${API_BASE_URL}/api/concepts/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        Swal.fire("Deleted!", "Concept has been deleted.", "success");
        fetchConcepts(currentPage);
      } catch (error) {
        Swal.fire("Error!", "Failed to delete concept.", "error");
      }
    }
  };

  const difficultyColors = {
    BEGINNER: "success",
    INTERMEDIATE: "warning",
    ADVANCED: "danger",
    EXPERT: "dark",
  };

  const columns = [
    {
      name: "Concept Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <Link to={`/Concepts/view-concept/${row.slug}`}>
          <strong>{row.name}</strong>
        </Link>
      ),
    },
    {
      name: "Company",
      selector: (row) => row.company_name,
      sortable: true,
    },
    {
      name: "Difficulty",
      selector: (row) => row.difficulty_level,
      sortable: true,
      cell: (row) => (
        <Badge bg={difficultyColors[row.difficulty_level] || "secondary"}>
          {row.difficulty_level}
        </Badge>
      ),
    },
    {
      name: "Est. Time",
      selector: (row) => row.estimated_time_minutes,
      sortable: true,
      cell: (row) => `${row.estimated_time_minutes} min`,
    },
    {
      name: "Challenges",
      selector: (row) => row.challenge_count || 0,
      sortable: true,
      center: true,
      cell: (row) => (
        <Link
          to={`/ConceptChallenges/list-concept-challenge?concept=${row.id}`}
          className="text-primary fw-bold"
          style={{ textDecoration: 'none' }}
        >
          {row.challenge_count || 0}
          <Icon name="arrow-right" className="ms-1" style={{ fontSize: '0.8rem' }} />
        </Link>
      ),
    },
    {
      name: "Order",
      selector: (row) => row.order,
      sortable: true,
      center: true,
      width: "80px",
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
            onClick={() => navigate(`/Concepts/view-concept/${row.slug}`)}
            title="View"
          >
            <Icon name="eye" />
          </button>
          <button
            className="btn btn-sm btn-icon btn-outline-warning"
            onClick={() => navigate(`/Concepts/update-concept/${row.slug}`)}
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
    <Layout title="Concepts" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Concepts</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item active">Concepts</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Concepts/create-concept" className="btn btn-primary">
              <Icon name="plus" />
              <span>Add Concept</span>
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card>
          <Card.Body>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Search concepts..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filterCompany}
                  onChange={(e) => {
                    setFilterCompany(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filterDifficulty}
                  onChange={(e) => {
                    setFilterDifficulty(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Difficulty</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => fetchConcepts(currentPage)}
                >
                  <RefreshCw size={16} className="me-1" />
                  Refresh
                </button>
              </Col>
            </Row>

            <DataTable
              columns={columns}
              data={concepts}
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

export default ConceptList;
