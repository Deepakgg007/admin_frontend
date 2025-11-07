// CompanyList.js
import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Row, Col, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { Trash2, RefreshCw } from "react-feather";
import { API_BASE_URL } from "../../services/apiBase";

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filterHiring, setFilterHiring] = useState("");
  const [filterActive, setFilterActive] = useState("true");

  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // Fetch Companies from API
  const fetchCompanies = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, page_size: perPage };
        if (searchQuery) params.search = searchQuery;
        if (filterHiring) params.is_hiring = filterHiring;
        if (filterActive) params.is_active = filterActive;

        const response = await axios.get(`${API_BASE_URL}/api/companies/`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = response.data.results || response.data;
        const total = response.data.count || data.length;

        console.log('📌 Companies API Response:', response.data);
        console.log('📌 Companies extracted:', Array.isArray(data) ? data.length : 0, 'Total:', total);
        console.log('📌 First Company Image (full URL):', data[0]?.image_display);

        setCompanies(Array.isArray(data) ? data : []);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (error) {
        setCompanies([]);
        setTotalCount(0);
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch companies.";
        Swal.fire("Error!", message, "error");
      } finally {
        setLoading(false);
      }
    },
    [perPage, searchQuery, filterHiring, filterActive, authToken]
  );

  useEffect(() => {
    fetchCompanies(currentPage);
  }, [currentPage, fetchCompanies]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies(1);
  };

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
        await axios.delete(`${API_BASE_URL}/api/companies/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        Swal.fire("Deleted!", "Company has been deleted.", "success");
        fetchCompanies(currentPage);
      } catch (error) {
        const message =
          error.response?.data?.error || "Failed to delete company.";
        Swal.fire("Error!", message, "error");
      }
    }
  };

  const columns = [
    {
      name: "Logo",
      selector: (row) => row.image_display ?? "",
      sortable: false,
      width: "80px",
      cell: (row) => (
        <div className="user-avatar sq">
          {row.image_display ? (
            <img src={row.image_display} alt={row.name} />
          ) : (
            <span className="text-uppercase">{row.name.charAt(0)}</span>
          )}
        </div>
      ),
    },
    {
      name: "Company Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <Link to={`/Companies/view-company/${row.slug}`}>
          <strong>{row.name}</strong>
        </Link>
      ),
    },
    {
      name: "Location",
      selector: (row) => row.location || "N/A",
      sortable: true,
    },
    {
      name: "Industry",
      selector: (row) => row.industry || "N/A",
      sortable: true,
    },
    {
      name: "Created By",
      selector: (row) => row.college_name || "Admin",
      sortable: true,
      cell: (row) => (
        <span className={row.college_name ? "text-info" : "text-success"}>
          {row.college_name || "Admin"}
        </span>
      ),
    },
    {
      name: "Hiring Status",
      selector: (row) => row.is_hiring,
      sortable: true,
      cell: (row) => (
        <Badge bg={row.is_hiring ? "success" : "secondary"}>
          {row.is_hiring ? "Hiring" : "Not Hiring"}
        </Badge>
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
      name: "Concepts",
      selector: (row) => row.total_concepts || 0,
      sortable: true,
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-icon btn-outline-primary"
            onClick={() => navigate(`/Companies/view-company/${row.slug}`)}
            title="View"
          >
            <Icon name="eye" />
          </button>
          <button
            className="btn btn-sm btn-icon btn-outline-warning"
            onClick={() => navigate(`/Companies/update-company/${row.slug}`)}
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
    <Layout title="Companies" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Companies</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Companies
                </li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Companies/create-company" className="btn btn-primary">
              <Icon name="plus" />
              <span>Add Company</span>
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card>
          <Card.Body>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form onSubmit={handleSearchSubmit}>
                  <Form.Control
                    type="text"
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </Form>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filterHiring}
                  onChange={(e) => {
                    setFilterHiring(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Hiring Status</option>
                  <option value="true">Hiring</option>
                  <option value="false">Not Hiring</option>
                </Form.Select>
              </Col>
              <Col md={3}>
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
                  onClick={() => fetchCompanies(currentPage)}
                >
                  <RefreshCw size={16} className="me-1" />
                  Refresh
                </button>
              </Col>
            </Row>

            <DataTable
              columns={columns}
              data={companies}
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

export default CompanyList;
