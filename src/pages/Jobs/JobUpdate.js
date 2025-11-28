import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

function JobUpdate() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: '',
    title: '',
    description: '',
    job_type: 'FULL_TIME',
    experience_level: 'ENTRY',
    location: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'INR',
    required_skills: '',
    qualifications: '',
    responsibilities: '',
    application_deadline: '',
    application_url: '',
    contact_email: '',
    is_active: true,
    is_featured: false,
  });
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await axios.get(`${API_BASE_URL}/api/company/jobs/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const job = jobResponse.data;

        // Format datetime for input
        let deadline = '';
        if (job.application_deadline) {
          const date = new Date(job.application_deadline);
          deadline = date.toISOString().slice(0, 16);
        }

        setFormData({
          company: job.company || '',
          title: job.title || '',
          description: job.description || '',
          job_type: job.job_type || 'FULL_TIME',
          experience_level: job.experience_level || 'ENTRY',
          location: job.location || '',
          salary_min: job.salary_min || '',
          salary_max: job.salary_max || '',
          salary_currency: job.salary_currency || 'INR',
          required_skills: job.required_skills || '',
          qualifications: job.qualifications || '',
          responsibilities: job.responsibilities || '',
          application_deadline: deadline,
          application_url: job.application_url || '',
          contact_email: job.contact_email || '',
          is_active: job.is_active,
          is_featured: job.is_featured,
        });

        // Fetch companies
        const companiesResponse = await axios.get(`${API_BASE_URL}/api/company/companies/`, {
          headers: { Authorization: `Bearer ${authToken}` },
          params: { page_size: 1000 },
        });
        const data = companiesResponse.data.results || companiesResponse.data;
        setCompanies(Array.isArray(data) ? data : []);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch job details.', 'error');
        navigate('/Jobs/list-job');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [slug, authToken, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = { ...formData };

      // Convert empty strings to null for optional fields
      if (!data.salary_min) data.salary_min = null;
      if (!data.salary_max) data.salary_max = null;
      if (!data.application_deadline) data.application_deadline = null;
      if (!data.application_url) data.application_url = null;
      if (!data.contact_email) data.contact_email = null;

      await axios.patch(`${API_BASE_URL}/api/company/jobs/${slug}/`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Job updated successfully.',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => navigate('/Jobs/list-job'), 1600);
    } catch (error) {
      console.error(error.response?.data);
      if (error.response?.status === 400) {
        setErrors(error.response.data);
      } else {
        Swal.fire('Error', error.response?.data?.error || 'Failed to update job.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Layout title="Update Job" content="container">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Update Job" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Update Job Posting</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Jobs/list-job">Jobs</Link></li>
                <li className="breadcrumb-item active">Update</li>
              </ol>
            </nav>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                {/* Basic Information */}
                <Col md={12}>
                  <h5 className="mb-3">Basic Information</h5>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Company <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      isInvalid={!!errors.company}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.company}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Job Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      isInvalid={!!errors.title}
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Job Description <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      isInvalid={!!errors.description}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {/* Job Details */}
                <Col md={12}>
                  <h5 className="mb-3 mt-3">Job Details</h5>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Job Type</Form.Label>
                    <Form.Select name="job_type" value={formData.job_type} onChange={handleChange}>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="FREELANCE">Freelance</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Experience Level</Form.Label>
                    <Form.Select name="experience_level" value={formData.experience_level} onChange={handleChange}>
                      <option value="ENTRY">Entry Level</option>
                      <option value="MID">Mid Level</option>
                      <option value="SENIOR">Senior Level</option>
                      <option value="LEAD">Lead/Manager</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Remote, New York, Hybrid"
                    />
                  </Form.Group>
                </Col>

                {/* Salary Information */}
                <Col md={12}>
                  <h5 className="mb-3 mt-3">Salary Information</h5>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Minimum Salary</Form.Label>
                    <Form.Control
                      type="number"
                      name="salary_min"
                      value={formData.salary_min}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Maximum Salary</Form.Label>
                    <Form.Control
                      type="number"
                      name="salary_max"
                      value={formData.salary_max}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Currency</Form.Label>
                    <Form.Select name="salary_currency" value={formData.salary_currency} onChange={handleChange}>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Requirements */}
                <Col md={12}>
                  <h5 className="mb-3 mt-3">Requirements</h5>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Required Skills</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="required_skills"
                      value={formData.required_skills}
                      onChange={handleChange}
                    />
                    <Form.Text>Comma-separated list of skills</Form.Text>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Qualifications</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Responsibilities</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                {/* Application Details */}
                <Col md={12}>
                  <h5 className="mb-3 mt-3">Application Details</h5>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Application Deadline</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="application_deadline"
                      value={formData.application_deadline}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Application URL</Form.Label>
                    <Form.Control
                      type="url"
                      name="application_url"
                      value={formData.application_url}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Contact Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                {/* Status */}
                <Col md={12}>
                  <h5 className="mb-3 mt-3">Status</h5>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      name="is_active"
                      label="Active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      name="is_featured"
                      label="Featured Job"
                      checked={formData.is_featured}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : <Icon name="check" />}
                      <span className="ms-2">Update Job</span>
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/Jobs/list-job')}>
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
}

export default JobUpdate;
