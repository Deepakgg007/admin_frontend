import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Row, Col, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { search } from "react-icons-kit/fa/search";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

// ---------------------------------------------------------------
// Action Buttons Component (View | Edit | Delete)
// ---------------------------------------------------------------
const ActionButtons = ({ row, deleteConfirm }) => (
  <div className="d-flex gap-2 justify-content-center">
    {/* View */}
    <Link
      to={`/Certificates/view-certificate/${row.id}`}
      className="btn btn-sm btn-icon btn-light"
      title="View"
    >
      <Icon name="eye" />
    </Link>

    {/* Edit */}
    <Link
      to={`/Certificates/update-certificate/${row.id}`}
      className="btn btn-sm btn-icon btn-light"
      title="Edit"
    >
      <Icon name="edit" />
    </Link>

    {/* Delete */}
    <button
      type="button"
      className="btn btn-sm btn-icon btn-light text-danger"
      title="Delete"
      onClick={() => deleteConfirm(row.id)}
    >
      <Icon name="trash" />
    </button>
  </div>
);

function CertificateList() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);

  const authToken = localStorage.getItem("authToken");

  const fetchCertificates = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/cert/certifications/`, {
          params: { page, per_page: perPage, search: searchQuery },
          headers: { Authorization: `Bearer ${authToken}` },
        });

        console.log('Certificates API Response:', response.data);

        const res = response.data;
        const data = res?.data || res?.results || [];
        const total = res?.pagination?.total || res?.count || data.length;

        setCertificates(data);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (error) {
        setCertificates([]);
        setTotalCount(0);
        Swal.fire(
          "Error!",
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to fetch certificates.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [authToken, perPage, searchQuery]
  );

  useEffect(() => {
    fetchCertificates(currentPage);
  }, [currentPage, fetchCertificates]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCertificates(1);
  };
  const handleSelectedRowsChange = ({ selectedRows }) =>
    setSelectedRows(selectedRows);

  const deleteConfirm = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this certificate?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/cert/certifications/${id}/`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200 || response.status === 204) {
        Swal.fire("Deleted!", "Certificate deleted successfully.", "success");
        fetchCertificates(currentPage);
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to delete.",
        "error"
      );
    }
  };

  // ---------------------------------------------------------------
  // Table Columns (Dropdown replaced with icon buttons)
  // ---------------------------------------------------------------
  const columns = [
    {
      name: "Course",
      selector: (row) => row.course_title || row.course?.title || "—",
      sortable: true,
      wrap: true,
    },
    {
      name: "Title",
      selector: (row) => row.title || "—",
      sortable: true,
      wrap: true,
    },
    {
      name: "Passing Score",
      selector: (row) => row.passing_score || 0,
      sortable: true,
      cell: (row) => `${row.passing_score}%`,
    },
    {
      name: "Duration",
      selector: (row) => row.duration_minutes || 0,
      sortable: true,
      cell: (row) => `${row.duration_minutes} min`,
    },
    {
      name: "Max Attempts",
      selector: (row) => row.max_attempts || 0,
      sortable: true,
    },
    {
      name: "Questions",
      selector: (row) => row.total_questions || 0,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <Badge bg={row.is_active ? "success" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => <ActionButtons row={row} deleteConfirm={deleteConfirm} />,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "140px",
      center: true,
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
    <Layout title="Certificates" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Course Completion Certificates</Block.Title>
            <p className="text-muted">Manage certificate assessments for courses</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Certificates/create-certificate" className="btn btn-primary ms-2">
              <Icon name="plus" className="me-1" /> Add Certificate
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card className="p-3">
          <Form onSubmit={handleSearchSubmit} className="mb-3 narrow-search">
            <Row className="align-items-center g-2">
              <Col md={10}>
                <Form.Control
                  type="text"
                  placeholder="Search by title, course, or description"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
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
            data={certificates}
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
    </Layout>
  );
}

export default CertificateList;