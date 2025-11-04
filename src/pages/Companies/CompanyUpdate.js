import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

function CompanyUpdate() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    employee_count: '',
    hiring_period_start: '',
    hiring_period_end: '',
    is_active: true,
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/companies/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const company = response.data;
        setFormData({
          name: company.name || '',
          description: company.description || '',
          website: company.website || '',
          location: company.location || '',
          industry: company.industry || '',
          employee_count: company.employee_count || '',
          hiring_period_start: company.hiring_period_start || '',
          hiring_period_end: company.hiring_period_end || '',
          is_active: company.is_active,
        });
        setCurrentImage(company.image || '');
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch company details.', 'error');
        navigate('/Companies/list-company');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCompany();
  }, [slug, authToken, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      if (image) data.append('image', image);

      await axios.patch(`${API_BASE_URL}/api/companies/${slug}/`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Company updated successfully.',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => navigate(`/Companies/view-company/${slug}`), 1600);
    } catch (error) {
      console.error(error.response?.data);
      if (error.response?.status === 400) {
        setErrors(error.response.data);
      } else {
        Swal.fire('Error', error.response?.data?.error || 'Failed to update company.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Layout title="Update Company" content="container">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Update Company" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Update Company</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Companies/list-company">Companies</Link></li>
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
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      isInvalid={!!errors.name}
                      required
                    />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Industry</Form.Label>
                    <Form.Control
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Employee Count</Form.Label>
                    <Form.Control
                      type="text"
                      name="employee_count"
                      value={formData.employee_count}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Company Logo</Form.Label>
                    {currentImage && (
                      <div className="mb-2">
                        <img src={currentImage} alt="Current" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                      </div>
                    )}
                    <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hiring Period Start</Form.Label>
                    <Form.Control
                      type="date"
                      name="hiring_period_start"
                      value={formData.hiring_period_start}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hiring Period End</Form.Label>
                    <Form.Control
                      type="date"
                      name="hiring_period_end"
                      value={formData.hiring_period_end}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
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

                <Col md={12}>
                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : <Icon name="check" />}
                      <span className="ms-2">Update Company</span>
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/Companies/view-company/${slug}`)}>
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

export default CompanyUpdate;
