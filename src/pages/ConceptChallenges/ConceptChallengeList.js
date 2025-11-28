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

function ConceptChallengeList() {
  const [searchParams] = useSearchParams();
  const companyIdFromQuery = searchParams.get('company');
  const conceptIdFromQuery = searchParams.get('concept');

  const [conceptChallenges, setConceptChallenges] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterCompany, setFilterCompany] = useState(companyIdFromQuery || "");
  const [filterConcept, setFilterConcept] = useState(conceptIdFromQuery || "");

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

  const fetchConcepts = useCallback(async (companyId = "") => {
    try {
      const params = companyId ? { company: companyId } : {};
      const response = await axios.get(`${API_BASE_URL}/api/concepts/`, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setConcepts(response.data.results || response.data || []);
    } catch (error) {
      console.error("Failed to fetch concepts");
    }
  }, [authToken]);

  const fetchConceptChallenges = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, page_size: 10000 }; // Fetch all to filter client-side
        if (filterCompany) params.company = filterCompany;
        if (filterConcept) params.concept = filterConcept;

        const response = await axios.get(`${API_BASE_URL}/api/concept-challenges/`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        let data = response.data.results || response.data;
        data = Array.isArray(data) ? data : [];

        // Group by concept_name and challenge_id to show unique combinations only
        const uniqueMap = new Map();
        data.forEach(item => {
          const key = `${item.concept_name}_${item.challenge}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });

        const uniqueData = Array.from(uniqueMap.values());

        // Implement client-side pagination
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedData = uniqueData.slice(startIndex, endIndex);

        setConceptChallenges(paginatedData);
        setCurrentPage(page);
        setTotalCount(uniqueData.length);
      } catch (error) {
        setConceptChallenges([]);
        setTotalCount(0);
        Swal.fire("Error!", "Failed to fetch concept challenges.", "error");
      } finally {
        setLoading(false);
      }
    },
    [perPage, filterCompany, filterConcept, authToken]
  );

  useEffect(() => {
    fetchCompanies();
    fetchConcepts();
  }, [fetchCompanies, fetchConcepts]);

  useEffect(() => {
    fetchConceptChallenges(currentPage);
  }, [currentPage, fetchConceptChallenges]);

  useEffect(() => {
    if (filterCompany) {
      fetchConcepts(filterCompany);
      setFilterConcept("");
    }
  }, [filterCompany, fetchConcepts]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleDelete = async (id) => {
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
        await axios.delete(`${API_BASE_URL}/api/concept-challenges/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        Swal.fire("Deleted!", "Concept challenge has been deleted.", "success");
        fetchConceptChallenges(currentPage);
      } catch (error) {
        Swal.fire("Error!", "Failed to delete concept challenge.", "error");
      }
    }
  };

  const columns = [
    {
      name: "Order",
      selector: (row) => row.order,
      sortable: true,
      width: "80px",
      center: true,
    },
    {
      name: "Concept",
      selector: (row) => row.concept_name,
      sortable: true,
      cell: (row) => (
        <div>
          <strong>{row.concept_name}</strong>
        </div>
      ),
    },
    {
      name: "Challenge",
      selector: (row) => row.challenge_details?.title,
      sortable: true,
      cell: (row) => (
        <div>
          {row.challenge_details?.title || 'N/A'}
          <br />
          <small className="text-muted">{row.challenge_details?.category}</small>
        </div>
      ),
    },
    {
      name: "Difficulty",
      selector: (row) => row.challenge_details?.difficulty,
      sortable: true,
      cell: (row) => (
        <Badge bg={
          row.challenge_details?.difficulty === 'EASY' ? 'success' :
          row.challenge_details?.difficulty === 'MEDIUM' ? 'warning' : 'danger'
        }>
          {row.challenge_details?.difficulty || 'N/A'}
        </Badge>
      ),
    },
    {
      name: "Weight",
      selector: (row) => row.weight,
      sortable: true,
      cell: (row) => `${row.weight}x`,
      center: true,
    },
    {
      name: "Time Limit",
      selector: (row) => row.effective_time_limit,
      sortable: true,
      cell: (row) => `${row.effective_time_limit}s`,
      center: true,
    },
    {
      name: "Max Score",
      selector: (row) => row.weighted_max_score,
      sortable: true,
      center: true,
    },
    {
      name: "Hint Video",
      selector: (row) => row.has_hint_video,
      cell: (row) => (
        <Badge bg={row.has_hint_video ? 'success' : 'secondary'}>
          {row.has_hint_video ? 'Yes' : 'No'}
        </Badge>
      ),
      center: true,
    },
    {
      name: "Status",
      selector: (row) => row.is_active,
      sortable: true,
      cell: (row) => (
        <Badge bg={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-icon btn-outline-warning"
            onClick={() => navigate(`/ConceptChallenges/update-concept-challenge/${row.id}`)}
            title="Edit"
          >
            <Icon name="edit" />
          </button>
          <button
            className="btn btn-sm btn-icon btn-outline-danger"
            onClick={() => handleDelete(row.id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: "120px",
    },
  ];

  return (
    <Layout title="Concept Challenges" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Concept Challenges</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item active">Concept Challenges</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/ConceptChallenges/create-concept-challenge" className="btn btn-primary">
              <Icon name="plus" />
              <span>Add Concept Challenge</span>
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card>
          <Card.Body>
            <Row className="g-3 mb-3">
              <Col md={4}>
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
              <Col md={4}>
                <Form.Select
                  value={filterConcept}
                  onChange={(e) => {
                    setFilterConcept(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={!filterCompany && concepts.length === 0}
                >
                  <option value="">All Concepts</option>
                  {concepts.map((concept) => (
                    <option key={concept.id} value={concept.id}>
                      {concept.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => fetchConceptChallenges(currentPage)}
                >
                  <RefreshCw size={16} className="me-1" />
                  Refresh
                </button>
              </Col>
            </Row>

            <DataTable
              columns={columns}
              data={conceptChallenges}
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

export default ConceptChallengeList;
