// src/pages/Colleges/CollegeList.js
import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Dropdown, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { search } from "react-icons-kit/fa/search";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { Eye, Edit, Trash2 } from "react-feather";
import { API_BASE_URL } from "../../services/apiBase";

function CollegeList() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);

  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const fetchColleges = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/colleges/`, {
          params: { page, per_page: perPage, search: searchQuery },
          headers: { Authorization: `Bearer ${authToken}` },
        });


        const res = response.data;
        // Backend returns: { success, message, data: [...], pagination: { total, ... } }
        const data = res?.data || res?.results || [];
        const total = res?.pagination?.total || res?.count || data.length;

        console.log('📌 Colleges API Response:', response.data);
        console.log('📌 Colleges extracted:', data.length, 'Total:', total);
        console.log('📌 First College Logo (full URL):', data[0]?.logo); // CollegeListSerializer.logo returns full URL

        setColleges(data);
        setCurrentPage(page);
        setTotalCount(total);
      } catch (error) {
        setColleges([]);
        setTotalCount(0);
        Swal.fire(
          "Error!",
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to fetch colleges.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [authToken, perPage, searchQuery]
  );

  useEffect(() => {
    fetchColleges(currentPage);
  }, [currentPage, fetchColleges]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchColleges(1);
  };
  const handleSelectedRowsChange = ({ selectedRows }) =>
    setSelectedRows(selectedRows);

  const deleteConfirm = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this college?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/colleges/${id}/`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200 || response.status === 204) {
        Swal.fire("Deleted!", "College deleted successfully.", "success");
        fetchColleges(currentPage);
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
      name: "Logo",
      selector: (row) => row.logo ?? "",
      cell: (row) => (
        <div style={{
          width: "50px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: "5px",
        }}>
          {row.logo ? (
            <img
              src={row.logo}
              alt={row.name}
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "5px",
              }}
              onError={(e) => {
                console.error('❌ Failed to load image:', row.logo);
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span style="color: #999; font-size: 10px;">No Logo</span>';
              }}
              onLoad={(e) => {
                console.log('✅ Image loaded successfully:', row.logo);
              }}
            />
          ) : (
            <span style={{color: "#999", fontSize: "10px"}}>No Logo</span>
          )}
        </div>
      ),
    },
    { name: "Name", selector: (row) => row.name ?? "—", sortable: true },
    { name: "Email", selector: (row) => row.email ?? "—", sortable: true },
    { name: "Phone", selector: (row) => row.phone_number ?? "—", sortable: true },
    { name: "Address", selector: (row) => row.address ?? "—", sortable: true },
    { name: "Organization", selector: (row) => row.organization_name ?? "—", sortable: true },
    { name: "University", selector: (row) => row.university_name ?? "—", sortable: true },
    { name: "Max Students", selector: (row) => row.max_students ?? 0, sortable: true },
    { name: "Current Students", selector: (row) => row.current_students ?? 0, sortable: true },
    { name: "Available Seats", selector: (row) => row.available_seats ?? 0, sortable: true },
    {
      name: "Registration Open",
      selector: (row) => (row.is_registration_open ? "Yes" : "No"),
      sortable: true,
    },
    { name: "Description", selector: (row) => row.description ?? "—" },
    { name: "Created By", selector: (row) => row.created_by?.username ?? "—", sortable: true },
    {
      name: "Created At",
      selector: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleString() : "—",
      sortable: true,
    },
    {
      name: "Updated At",
      selector: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleString() : "—",
      sortable: true,
    },
    { name: "Active", selector: (row) => (row.is_active ? "Yes" : "No"), sortable: true },
    {
      name: "Actions",
      width: "130px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Link to={`/Colleges/view-college/${row.id}`} className="btn btn-sm btn-icon btn-outline-primary" title="View College">
            <Eye size={14} />
          </Link>
          <Link to={`/Colleges/update-college/${row.id}`} className="btn btn-sm btn-icon btn-outline-success" title="Edit College">
            <Edit size={14} />
          </Link>
          <button onClick={() => deleteConfirm(row.id)} className="btn btn-sm btn-icon btn-outline-danger" title="Delete College">
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
    <Layout title="Colleges" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Colleges</Block.Title>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Colleges/create-college" className="btn btn-primary ms-2">
              <Icon name="plus me-1" /> Add College
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
                  placeholder="Search by name, email, or university"
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
            data={colleges}
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

export default CollegeList;
