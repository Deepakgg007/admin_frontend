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
            <Col xxl="12">
              <Card className="card-gutter-md p-3">
                <div><strong>Name:</strong> {college.name || "—"}</div>
                <div className="mt-2"><strong>Email:</strong> {college.email || "—"}</div>
                <div className="mt-2"><strong>Phone:</strong> {college.phone_number || "—"}</div>
                <div className="mt-2"><strong>Address:</strong> {college.address || "—"}</div>
                <div className="mt-2"><strong>Max Students:</strong> {college.max_students ?? "—"}</div>
                <div className="mt-2"><strong>Current Students:</strong> {college.current_students ?? "—"}</div>
                <div className="mt-2"><strong>Organization:</strong> {college.organization_name || "—"}</div>
                <div className="mt-2"><strong>University:</strong> {college.university_name || "—"}</div>
                <div className="mt-2"><strong>Registration Open:</strong> {college.is_registration_open ? "Yes" : "No"}</div>
                <div className="mt-2"><strong>Status:</strong> {college.is_active ? "Active" : "Inactive"}</div>
                <div className="mt-2"><strong>Logo:</strong>{" "}
                  {college.logo ? (
                    <img
                      src={college.logo}
                      alt={college.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 5,
                      }}
                    />
                  ) : "—"}
                </div>
                <div className="mt-2"><strong>Description:</strong> {college.description || "—"}</div>
                <div className="mt-2"><strong>Created By:</strong> {college.created_by?.username || "—"}</div>
                <div className="mt-2"><strong>Created At:</strong> {college.created_at ? new Date(college.created_at).toLocaleString() : "—"}</div>
                <div className="mt-2"><strong>Updated At:</strong> {college.updated_at ? new Date(college.updated_at).toLocaleString() : "—"}</div>

                <div className="mt-4 d-flex gap-2">
                  <Link to="/Colleges/list-college" className="btn btn-primary">
                    Back
                  </Link>
                  <Link to={`/Colleges/add-company/${id}`} className="btn btn-success">
                    <Icon name="plus" /> Add Company
                  </Link>
                </div>
              </Card>
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
