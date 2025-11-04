import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Row, Col, Badge, Button, Spinner } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

function CompanyView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/companies/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCompany(response.data);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch company details.', 'error');
        navigate('/Companies/list-company');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug, authToken, navigate]);

  if (loading) {
    return (
      <Layout title="Company Details" content="container">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Layout>
    );
  }

  if (!company) return null;

  return (
    <Layout title="Company Details" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">{company.name}</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Companies/list-company">Companies</Link></li>
                <li className="breadcrumb-item active">{company.name}</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Button variant="warning" onClick={() => navigate(`/Companies/update-company/${slug}`)}>
              <Icon name="edit" /> Edit
            </Button>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Row className="g-3">
          <Col lg={4}>
            <Card>
              <Card.Body className="text-center">
                {company.image ? (
                  <img src={company.image} alt={company.name} className="img-fluid rounded mb-3" style={{ maxHeight: '200px' }} />
                ) : (
                  <div className="user-avatar sq lg bg-primary text-white mb-3">
                    <span className="fs-2">{company.name.charAt(0)}</span>
                  </div>
                )}
                <h4>{company.name}</h4>
                <p className="text-muted">{company.industry || 'N/A'}</p>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  <Badge bg={company.is_active ? 'success' : 'danger'}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge bg={company.is_hiring ? 'success' : 'secondary'}>
                    {company.is_hiring ? 'Hiring' : 'Not Hiring'}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Company Information</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <strong>Location:</strong>
                    <p>{company.location || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Employee Count:</strong>
                    <p>{company.employee_count || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Website:</strong>
                    <p>
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          {company.website}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </Col>
                  <Col md={6}>
                    <strong>Created By:</strong>
                    <p>
                      {company.college_name ? (
                        <>
                          <Badge bg="info" className="me-2">College</Badge>
                          {company.college_name}
                          {company.college_organization && (
                            <small className="text-muted d-block">({company.college_organization})</small>
                          )}
                        </>
                      ) : (
                        <>
                          <Badge bg="success" className="me-2">Admin</Badge>
                          Global Company
                        </>
                      )}
                    </p>
                  </Col>
                  <Col md={6}>
                    <strong>Total Concepts:</strong>
                    <p>
                      <Link
                        to={`/Concepts/list-concept?company=${company.id}`}
                        className="text-primary fw-bold"
                        style={{ fontSize: '1.2rem', textDecoration: 'none' }}
                      >
                        {company.total_concepts || 0}
                        <Icon name="arrow-right" className="ms-2" />
                      </Link>
                    </p>
                  </Col>
                  <Col md={6}>
                    <strong>Total Challenges:</strong>
                    <p>
                      <Link
                        to={`/ConceptChallenges/list-concept-challenge?company=${company.id}`}
                        className="text-primary fw-bold"
                        style={{ fontSize: '1.2rem', textDecoration: 'none' }}
                      >
                        {company.total_challenges || 0}
                        <Icon name="arrow-right" className="ms-2" />
                      </Link>
                    </p>
                  </Col>
                  <Col md={12}>
                    <strong>Description:</strong>
                    <p>{company.description || 'No description available.'}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {(company.hiring_period_start || company.hiring_period_end) && (
              <Card className="mt-3">
                <Card.Body>
                  <h5 className="mb-3">Hiring Period</h5>
                  <Row>
                    <Col md={6}>
                      <strong>Start Date:</strong>
                      <p>{company.hiring_period_start || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <strong>End Date:</strong>
                      <p>{company.hiring_period_end || 'N/A'}</p>
                    </Col>
                    {company.is_hiring_open && (
                      <Col md={12}>
                        <Badge bg="success">
                          Hiring Open - {company.days_until_hiring_ends} days remaining
                        </Badge>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Block>
    </Layout>
  );
}

export default CompanyView;
