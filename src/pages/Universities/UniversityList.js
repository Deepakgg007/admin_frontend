// UniversityList.js
import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Dropdown, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { search } from "react-icons-kit/fa/search";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon, AdminOnly } from "../../components";
import { XCircle, Trash2, RefreshCw, Eye, Edit } from "react-feather";
import { isAdmin } from "../../utilities/auth";
import { API_BASE_URL } from "../../services/apiBase";

function UniversityList() {
  const [University, setUniversity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);

  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // Fetch University from API
  const fetchUniversity = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/universities/`,
          {
            params: { page, per_page: perPage, search: searchQuery },
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        console.log('📌 Universities API Response:', response.data);

        const res = response.data;
        // Backend returns: { success, message, data: [...], pagination: { total, ... } }
        const universities = res?.data || res?.results || [];
        const total = res?.pagination?.total || res?.count || universities.length;

        console.log('📌 Universities extracted:', universities.length, 'Total:', total);

        setUniversity(universities);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (error) {
        setUniversity([]);
        setTotalCount(0);

        const backendMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch University.";
        Swal.fire("Error!", backendMessage, "error");
      } finally {
        setLoading(false);
      }
    },
    [perPage, searchQuery, authToken]
  );

  useEffect(() => {
    fetchUniversity(currentPage);
  }, [currentPage, fetchUniversity]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUniversity(1);
  };
  const handleSelectedRowsChange = ({ selectedRows }) =>
    setSelectedRows(selectedRows);

  const deleteConfirm = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this university?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/universities/${id}/`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200 || response.status === 204) {
        Swal.fire("Deleted!", "University deleted successfully.", "success");
        fetchUniversity(currentPage);
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
      name: "Logo",
      selector: (row) => row.logo ?? "",
      cell: (row) => (
        <img
          src={row.logo ?? "/placeholder.png"}
          alt={row.name}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "5px",
          }}
        />
      ),
    },
    { name: "Name", selector: (row) => row.name ?? "—", sortable: true },
    { name: "Location", selector: (row) => row.address ?? "—", sortable: true },
    {
      name: "Created At",
      selector: (row) => new Date(row.created_at).toLocaleString(),
    },
    {
      name: "Updated At",
      selector: (row) => new Date(row.updated_at).toLocaleString(),
    },
    {
      name: "Actions",
      width: "130px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Link to={`/University/view-University/${row.id}`} className="btn btn-sm btn-icon btn-outline-primary" title="View University">
            <Eye size={14} />
          </Link>
          {isAdmin() && (
            <>
              <Link to={`/University/update-University/${row.id}`} className="btn btn-sm btn-icon btn-outline-success" title="Edit University">
                <Edit size={14} />
              </Link>
              <button onClick={() => deleteConfirm(row.id)} className="btn btn-sm btn-icon btn-outline-danger" title="Delete University">
                <Trash2 size={14} />
              </button>
            </>
          )}
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
    <Layout title="University" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">University</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  University
                </li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <AdminOnly>
              <div className="d-flex align-items-center">
                <Dropdown>
                  <Dropdown.Toggle variant="primary ">
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

                <Link to="/University/create-University" className="btn btn-primary ms-2">
                  <Icon name="plus me-1" /> Add University
                </Link>
              </div>
            </AdminOnly>
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
                  placeholder="Search by name"
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
            data={University}
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

export default UniversityList;
