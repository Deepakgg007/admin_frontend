import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Row, Col, Badge, Button, Spinner } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

function JobView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/jobs/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setJob(response.data);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch job details.', 'error');
        navigate('/Jobs/list-job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug, authToken, navigate]);

  if (loading) {
    return (
      <Layout title="Job Details" content="container">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Layout>
    );
  }

  if (!job) return null;

  const getJobTypeBadge = (jobType) => {
    const badges = {
      FULL_TIME: 'primary',
      PART_TIME: 'info',
      CONTRACT: 'warning',
      INTERNSHIP: 'success',
      FREELANCE: 'secondary',
    };
    return badges[jobType] || 'secondary';
  };

  const getExperienceBadge = (experience) => {
    const badges = {
      ENTRY: 'success',
      MID: 'warning',
      SENIOR: 'danger',
      LEAD: 'dark',
    };
    return badges[experience] || 'secondary';
  };

  return (
    <Layout title="Job Details" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">{job.title}</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Jobs/list-job">Jobs</Link></li>
                <li className="breadcrumb-item active">{job.title}</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Button variant="warning" onClick={() => navigate(`/Jobs/update-job/${slug}`)}>
              <Icon name="edit" /> Edit
            </Button>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Row className="g-3">
          {/* Left Column - Company & Basic Info */}
          <Col lg={4}>
            <Card>
              <Card.Body>
                {job.company_logo && (
                  <div className="text-center mb-3">
                    <img src={job.company_logo} alt={job.company_name} className="img-fluid rounded" style={{ maxHeight: '100px' }} />
                  </div>
                )}
                <h5 className="text-center mb-3">{job.company_name}</h5>

                <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
                  <Badge bg={getJobTypeBadge(job.job_type)}>
                    {job.job_type?.replace('_', ' ')}
                  </Badge>
                  <Badge bg={getExperienceBadge(job.experience_level)}>
                    {job.experience_level}
                  </Badge>
                  <Badge bg={job.is_active ? 'success' : 'danger'}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {job.is_featured && (
                    <Badge bg="warning">
                      <Icon name="star" /> Featured
                    </Badge>
                  )}
                </div>

                <hr />

                <div className="mb-2">
                  <strong><Icon name="map-pin" /> Location:</strong>
                  <p className="mb-0">{job.location || 'Remote'}</p>
                </div>

                {(job.salary_min || job.salary_max) && (
                  <div className="mb-2">
                    <strong><Icon name="dollar-sign" /> Salary:</strong>
                    <p className="mb-0">
                      {job.salary_currency} {job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()}
                    </p>
                  </div>
                )}

                {job.application_deadline && (
                  <div className="mb-2">
                    <strong><Icon name="clock" /> Deadline:</strong>
                    <p className="mb-0">
                      {new Date(job.application_deadline).toLocaleDateString()}
                      {job.is_deadline_passed && (
                        <Badge bg="danger" className="ms-2">Expired</Badge>
                      )}
                    </p>
                  </div>
                )}

                {job.college_name && (
                  <div className="mb-2">
                    <strong><Icon name="home" /> Posted By:</strong>
                    <p className="mb-0">
                      <Badge bg="info">{job.college_name}</Badge>
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Detailed Info */}
          <Col lg={8}>
            <Card className="mb-3">
              <Card.Body>
                <h5 className="mb-3">Job Description</h5>
                <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
              </Card.Body>
            </Card>

            {job.required_skills && (
              <Card className="mb-3">
                <Card.Body>
                  <h5 className="mb-3">Required Skills</h5>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{job.required_skills}</p>
                </Card.Body>
              </Card>
            )}

            {job.qualifications && (
              <Card className="mb-3">
                <Card.Body>
                  <h5 className="mb-3">Qualifications</h5>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{job.qualifications}</p>
                </Card.Body>
              </Card>
            )}

            {job.responsibilities && (
              <Card className="mb-3">
                <Card.Body>
                  <h5 className="mb-3">Responsibilities</h5>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{job.responsibilities}</p>
                </Card.Body>
              </Card>
            )}

            <Card>
              <Card.Body>
                <h5 className="mb-3">Application Details</h5>
                <Row>
                  {job.application_url && (
                    <Col md={6}>
                      <strong>Application URL:</strong>
                      <p>
                        <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                          Apply Now <Icon name="external-link" />
                        </a>
                      </p>
                    </Col>
                  )}
                  {job.contact_email && (
                    <Col md={6}>
                      <strong>Contact Email:</strong>
                      <p>
                        <a href={`mailto:${job.contact_email}`}>{job.contact_email}</a>
                      </p>
                    </Col>
                  )}
                  <Col md={6}>
                    <strong>Created At:</strong>
                    <p>{new Date(job.created_at).toLocaleDateString()}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Last Updated:</strong>
                    <p>{new Date(job.updated_at).toLocaleDateString()}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>
    </Layout>
  );
}

export default JobView;
