// src/pages/Colleges/CollegeView.js
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Row, Col, Spinner, Badge, Button, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function CollegeView() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch college details
        const collegeRes = await axios.get(
          `${API_BASE_URL}/api/colleges/${id}/`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setCollege(collegeRes.data.data || collegeRes.data);

        // Fetch companies added by this college
        const companiesRes = await axios.get(
          `${API_BASE_URL}/api/companies/?college=${id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setCompanies(companiesRes.data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load college data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, authToken]);

  return (
    <Layout title="View College" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">View College</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/Colleges/list-college">Colleges</Link>
                </li>
                <li className="breadcrumb-item active">View</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Colleges/list-college" className="btn btn-primary">
              <Icon name="arrow-left" /> Back to Colleges
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        ) : college ? (
          <Row>
            {/* Header Section */}
            <Col xxl="12" className="mb-4">
              <Card className="border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <Card.Body className="p-4">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <h2 className="mb-2 fw-bold">{college.name}</h2>
                      <p className="mb-1 text-white-50">{college.organization_name} • {college.university_name}</p>
                      <div className="mt-3">
                        <Badge bg={college.is_active ? "success" : "danger"} className="me-2">
                          {college.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge bg={college.is_registration_open ? "info" : "secondary"}>
                          {college.is_registration_open ? "Registration Open" : "Registration Closed"}
                        </Badge>
                      </div>
                    </Col>
                    <Col md={4} className="text-center">
                      {college.logo_display || college.logo ? (
                        <img
                          src={college.logo_display || college.logo}
                          alt={college.name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: 130,
                            objectFit: "contain",
                            borderRadius: 10,
                            border: "4px solid white",
                            padding: "5px",
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "100%",
                          minHeight: 130,
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          border: "4px solid white",
                        }}>
                          No Logo
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Main Information */}
            <Col lg={8} className="mb-4">
              <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white border-bottom py-3">
                  <Card.Title className="mb-0 fw-bold">Contact Information</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Email</small>
                        <p className="mb-0">{college.email || "—"}</p>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Phone</small>
                        <p className="mb-0">{college.phone_number || "—"}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Address</small>
                        <p className="mb-0">{college.address || "—"}</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom py-3">
                  <Card.Title className="mb-0 fw-bold">Academic Information</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Max Students</small>
                        <h5 className="mb-0">{college.max_students ?? "—"}</h5>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Current Students</small>
                        <h5 className="mb-0">{college.current_students ?? "—"}</h5>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Available Seats</small>
                        <h5 className="mb-0" style={{ color: college.available_seats > 0 ? "#28a745" : "#dc3545" }}>
                          {college.available_seats ?? "—"}
                        </h5>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Sidebar */}
            <Col lg={4} className="mb-4">
              {/* Signature Card */}
              <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white border-bottom py-3">
                  <Card.Title className="mb-0 fw-bold">College Signature</Card.Title>
                </Card.Header>
                <Card.Body className="text-center p-4">
                  {college.signature_display ? (
                    <img
                      src={college.signature_display}
                      alt={`${college.name} Signature`}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        maxHeight: 100,
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <p className="text-muted mb-0">No signature available</p>
                  )}
                </Card.Body>
              </Card>

              {/* Description Card */}
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom py-3">
                  <Card.Title className="mb-0 fw-bold">Description</Card.Title>
                </Card.Header>
                <Card.Body>
                  <p className="mb-0 text-muted">{college.description || "No description provided."}</p>
                </Card.Body>
              </Card>
            </Col>

            {/* Metadata */}
            <Col xxl="12" className="mb-4">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-bottom py-3">
                  <Card.Title className="mb-0 fw-bold">Metadata</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <div>
                        <small className="text-muted d-block mb-1">Created By</small>
                        <p className="mb-0 fw-semibold">{college.created_by?.username || "—"}</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div>
                        <small className="text-muted d-block mb-1">Created At</small>
                        <p className="mb-0 fw-semibold">{college.created_at ? new Date(college.created_at).toLocaleString() : "—"}</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div>
                        <small className="text-muted d-block mb-1">Updated At</small>
                        <p className="mb-0 fw-semibold">{college.updated_at ? new Date(college.updated_at).toLocaleString() : "—"}</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Action Buttons */}
            <Col xxl="12">
              <div className="d-flex gap-2">
                <Link to="/Colleges/list-college" className="btn btn-primary">
                  <Icon name="arrow-left" /> Back to Colleges
                </Link>
                <Link to={`/Colleges/add-company/${id}`} className="btn btn-success">
                  <Icon name="plus" /> Add Company
                </Link>
              </div>
            </Col>

            {/* Companies Section */}
            <Col xxl="12" className="mt-4">
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Companies Added by College</h5>
                  <Link to={`/Colleges/companies/${id}`} className="btn btn-sm btn-primary">
                    <Icon name="eye" /> View All Companies
                  </Link>
                </Card.Header>
                <Card.Body>
                  {companies.length > 0 ? (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Company Name</th>
                          <th>Location</th>
                          <th>Industry</th>
                          <th>Status</th>
                          <th>Approval Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies.map((company) => (
                          <tr key={company.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {company.image && (
                                  <img
                                    src={company.image}
                                    alt={company.name}
                                    style={{ width: 40, height: 40, objectFit: 'cover', marginRight: 10, borderRadius: 4 }}
                                  />
                                )}
                                <strong>{company.name}</strong>
                              </div>
                            </td>
                            <td>{company.location || 'N/A'}</td>
                            <td>{company.industry || 'N/A'}</td>
                            <td>
                              <Badge bg={company.is_active ? 'success' : 'secondary'}>
                                {company.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td>
                              <Badge
                                bg={
                                  company.approval_status === 'APPROVED' ? 'success' :
                                  company.approval_status === 'REJECTED' ? 'danger' :
                                  'warning'
                                }
                              >
                                {company.approval_status}
                              </Badge>
                            </td>
                            <td>
                              <Link to={`/Companies/view-company/${company.slug}`} className="btn btn-sm btn-outline-light">
                                <Icon name="eye" /> View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted">No companies added yet.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <p className="text-danger">College not found.</p>
        )}
      </Block>
    </Layout>
  );
}

export default CollegeView;
