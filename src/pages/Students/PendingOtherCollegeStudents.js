import { useState, useEffect, useCallback } from "react";
import { Card, Form, Row, Col, Modal, Button, Spinner, Badge, Alert, Tabs, Tab } from "react-bootstrap";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { Icon } from "../../components";
import Layout from "../../layout/default";
import apiBase, { API_BASE_URL } from "../../services/apiBase";

// Helper function to get full profile picture URL
const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return null;
  // If it's already a full URL (starts with http), return as is
  if (profilePicture.startsWith('http')) return profilePicture;
  // Otherwise, prepend the API base URL
  return `${API_BASE_URL}${profilePicture}`;
};

function PendingOtherCollegeStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchStudents = useCallback(async (status = "pending") => {
    setLoading(true);
    try {
      const response = await apiBase.get(`/admin/dashboard/other-college-students/pending/`, {
        params: { status, per_page: 100 },
      });
      const data = response.data?.data || [];
      setStudents(data);
      setFilteredStudents(data);

      // Update stats based on the response pagination count
      if (response.data?.pagination?.count !== undefined) {
        setStats(prev => ({ ...prev, [status]: response.data.pagination.count }));
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      Swal.fire("Error!", error.response?.data?.message || "Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all statuses to get accurate counts
  const fetchAllStats = useCallback(async () => {
    try {
      const statuses = ["pending", "approved", "rejected"];
      const counts = {};

      for (const status of statuses) {
        try {
          const response = await apiBase.get(`/admin/dashboard/other-college-students/pending/`, {
            params: { status, per_page: 1 },
          });
          counts[status] = response.data?.pagination?.count || 0;
        } catch (e) {
          counts[status] = 0;
        }
      }
      setStats(counts);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  useEffect(() => {
    fetchStudents(activeTab);
  }, [activeTab, fetchStudents]);

  useEffect(() => {
    setFilteredStudents(
      students.filter(
        (student) =>
          student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.college_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, students]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  const handleApprove = async (id) => {
    try {
      Swal.fire({ title: "Approving...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await apiBase.post(`/admin/dashboard/other-college-students/${id}/action/`, { action: "approve" });
      Swal.fire("Approved!", "Student approved successfully.", "success");
      fetchStudents(activeTab);
      fetchAllStats();
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || "Failed to approve student", "error");
    }
  };

  const handleDecline = async (id) => {
    const { value: reason } = await Swal.fire({
      title: "Decline Student",
      input: "text",
      inputLabel: "Reason for declining",
      inputPlaceholder: "Enter reason...",
      showCancelButton: true,
    });

    if (!reason) return;

    try {
      Swal.fire({ title: "Processing...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await apiBase.post(`/admin/dashboard/other-college-students/${id}/action/`, {
        action: "decline",
        decline_reason: reason,
      });
      Swal.fire("Declined!", "Student declined successfully.", "success");
      fetchStudents(activeTab);
      fetchAllStats();
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || "Failed to decline student", "error");
    }
  };

  const handleMoveToPending = async (id) => {
    try {
      Swal.fire({ title: "Processing...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await apiBase.post(`/admin/dashboard/other-college-students/${id}/action/`, { action: "pending" });
      Swal.fire("Success!", "Student moved to pending status.", "success");
      fetchStudents(activeTab);
      fetchAllStats();
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || "Failed to update student", "error");
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      approved: "success",
      rejected: "danger",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const columns = [
    {
      name: "Profile",
      cell: (row) => {
        const profilePic = getProfilePictureUrl(row.profile_picture);
        return (
          <img
            src={profilePic || "https://via.placeholder.com/50"}
            alt={row.first_name}
            style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
          />
        );
      },
      width: "80px"
    },
    { name: "Name", selector: (row) => row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A', sortable: true, wrap: true },
    { name: "Email", selector: (row) => row.email || 'N/A', sortable: true },
    { name: "USN", selector: (row) => row.usn || 'N/A', sortable: true },
    { name: "Phone", selector: (row) => row.phone_number || 'N/A' },
    { name: "College (Other)", selector: (row) => row.college_name || 'N/A', sortable: true, wrap: true },
    {
      name: "Status",
      cell: (row) => getStatusBadge(row.approval_status),
      width: "100px"
    },
    {
      name: "Actions",
      width: "200px",
      cell: (row) => (
        <div className="d-flex gap-1 flex-wrap">
          <Button size="sm" variant="outline-primary" onClick={() => handleViewDetails(row)} title="View Details" className="btn-icon">
            <Icon name="eye" />
          </Button>
          {row.approval_status !== 'approved' && (
            <Button size="sm" variant="outline-success" onClick={() => handleApprove(row.id)} title="Approve" className="btn-icon">
              <Icon name="check" />
            </Button>
          )}
          {row.approval_status !== 'rejected' && (
            <Button size="sm" variant="outline-warning" onClick={() => handleDecline(row.id)} title="Decline" className="btn-icon">
              <Icon name="cross" />
            </Button>
          )}
          {row.approval_status !== 'pending' && (
            <Button size="sm" variant="outline-secondary" onClick={() => handleMoveToPending(row.id)} title="Move to Pending" className="btn-icon">
              <Icon name="refresh" />
            </Button>
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
        background: "linear-gradient(to right, #667eea, #764ba2)",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        backgroundColor: "#fff",
        borderBottom: "1px solid #dee2e6",
        "&:hover": {
          backgroundColor: "#f1f3f5",
          cursor: "pointer"
        },
      },
    },
    headCells: {
      style: {
        color: "#fff",
        paddingLeft: "16px",
        paddingRight: "16px",
      }
    },
    cells: {
      style: {
        paddingTop: "12px",
        paddingBottom: "12px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }
    },
  };

  return (
    <Layout title="Other College Student Approvals">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-2">Other College Student Approvals</h2>
            <p className="text-muted">Review and approve students who registered with 'Other' college</p>
          </div>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <div className="p-3 bg-warning bg-opacity-10 border border-warning rounded text-center">
                <Icon name="users" className="text-warning mb-2" style={{ fontSize: "24px" }} />
                <h5 className="mb-1 text-warning">{stats.pending}</h5>
                <small className="text-muted">Pending</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-success bg-opacity-10 border border-success rounded text-center">
                <Icon name="check-circle" className="text-success mb-2" style={{ fontSize: "24px" }} />
                <h5 className="mb-1 text-success">{stats.approved}</h5>
                <small className="text-muted">Approved</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-danger bg-opacity-10 border border-danger rounded text-center">
                <Icon name="cross-circle" className="text-danger mb-2" style={{ fontSize: "24px" }} />
                <h5 className="mb-1 text-danger">{stats.rejected}</h5>
                <small className="text-muted">Rejected</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={handleTabChange} className="mb-3">
            <Tab eventKey="pending" title={`Pending (${stats.pending})`} />
            <Tab eventKey="approved" title={`Approved (${stats.approved})`} />
            <Tab eventKey="rejected" title={`Rejected (${stats.rejected})`} />
          </Tabs>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search by name, email, USN, or college name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-primary" className="w-100" onClick={() => { fetchStudents(activeTab); fetchAllStats(); }}>
                <Icon name="refresh" /> Refresh
              </Button>
            </Col>
          </Row>

          <Alert variant="info" className="mb-3">
            <Icon name="info" className="me-2" />
            These students registered with "Other" as their college option. Review and approve them to grant access.
          </Alert>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-5">
              <p className="mt-3 text-muted" style={{ fontSize: "48px", opacity: 0.3 }}>📋</p>
              <p className="text-muted">
                {searchQuery ? "No students found matching your search." : `No ${activeTab} students with 'Other' college at this time.`}
              </p>
            </div>
          ) : (
            <DataTable
              data={filteredStudents}
              columns={columns}
              customStyles={customStyles}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 50, 100]}
              highlightOnHover
              pointerOnHover
              responsive
            />
          )}

          {!loading && filteredStudents.length > 0 && (
            <div className="mt-3 text-muted">
              <small>Showing {filteredStudents.length} {activeTab} students</small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Student Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <div className="row g-4">
              <div className="col-12 text-center">
                <img
                  src={getProfilePictureUrl(selectedStudent.profile_picture) || "https://via.placeholder.com/120"}
                  alt={selectedStudent.first_name}
                  style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" }}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/120"; }}
                />
              </div>
              <div className="col-md-6">
                <h6>Personal Information</h6>
                <p><strong>Name:</strong> {selectedStudent.full_name || `${selectedStudent.first_name} ${selectedStudent.last_name}`}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Phone:</strong> {selectedStudent.phone_number || 'N/A'}</p>
                <p><strong>USN:</strong> {selectedStudent.usn || 'N/A'}</p>
              </div>
              <div className="col-md-6">
                <h6>College Information</h6>
                <p><strong>College:</strong> {selectedStudent.college_name || 'N/A'}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedStudent.approval_status)}</p>
                <p><strong>Registered:</strong> {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : 'N/A'}</p>
                {selectedStudent.rejection_reason && (
                  <p><strong>Rejection Reason:</strong> {selectedStudent.rejection_reason}</p>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedStudent && (
            <>
              {selectedStudent.approval_status !== 'approved' && (
                <Button variant="success" onClick={() => { setShowModal(false); handleApprove(selectedStudent.id); }}>
                  Approve
                </Button>
              )}
              {selectedStudent.approval_status !== 'rejected' && (
                <Button variant="warning" onClick={() => { setShowModal(false); handleDecline(selectedStudent.id); }}>
                  Decline
                </Button>
              )}
              {selectedStudent.approval_status !== 'pending' && (
                <Button variant="secondary" onClick={() => { setShowModal(false); handleMoveToPending(selectedStudent.id); }}>
                  Move to Pending
                </Button>
              )}
            </>
          )}
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default PendingOtherCollegeStudents;
