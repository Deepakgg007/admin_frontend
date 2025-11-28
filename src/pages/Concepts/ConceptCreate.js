import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Row, Col, Button, Spinner, Dropdown } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

function ConceptCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companies: [], // Changed to array for multiple companies
    name: '',
    description: '',
    difficulty_level: 'INTERMEDIATE',
    estimated_time_minutes: 60,
    order: 0,
    is_active: true,
  });
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/companies/`, {
          params: { is_active: true },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCompanies(response.data.results || response.data || []);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch companies.', 'error');
      }
    };

    fetchCompanies();
  }, [authToken]);

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

    if (!authToken) {
      Swal.fire('Unauthorized', 'Please login.', 'error');
      setLoading(false);
      return;
    }

    if (formData.companies.length === 0) {
      Swal.fire('Validation Error', 'Please select at least one company.', 'error');
      setLoading(false);
      return;
    }

    try {
      // Create concept for each selected company
      const promises = formData.companies.map((companyId) => {
        const conceptData = {
          company: companyId,
          name: formData.name,
          description: formData.description,
          difficulty_level: formData.difficulty_level,
          estimated_time_minutes: formData.estimated_time_minutes,
          order: formData.order,
          is_active: formData.is_active,
        };
        return axios.post(`${API_BASE_URL}/api/concepts/`, conceptData, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      });

      await Promise.all(promises);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Concept created successfully for ${formData.companies.length} ${formData.companies.length === 1 ? 'company' : 'companies'}.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate('/Concepts/list-concept'), 2100);
    } catch (error) {
      console.error(error.response?.data);
      if (error.response?.status === 400) {
        setErrors(error.response.data);
      } else {
        Swal.fire('Error', error.response?.data?.error || 'Failed to create concept.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Concept" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Create Concept</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Concepts/list-concept">Concepts</Link></li>
                <li className="breadcrumb-item active">Create</li>
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
                    <Form.Label>Companies <span className="text-danger">*</span></Form.Label>
                    <Dropdown autoClose="outside">
                      <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start d-flex justify-content-between align-items-center">
                        {formData.companies.length > 0
                          ? `${formData.companies.length} ${formData.companies.length === 1 ? 'company' : 'companies'} selected`
                          : 'Select companies'}
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {companies.length > 0 ? (
                          companies.map((company) => (
                            <Dropdown.Item
                              key={company.id}
                              as="div"
                              onClick={(e) => e.stopPropagation()}
                              className="p-0"
                            >
                              <Form.Check
                                type="checkbox"
                                id={`company-${company.id}`}
                                label={company.name}
                                checked={formData.companies.includes(company.id)}
                                onChange={(e) => {
                                  const companyId = company.id;
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      companies: [...formData.companies, companyId]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      companies: formData.companies.filter(id => id !== companyId)
                                    });
                                  }
                                }}
                                className="px-3 py-2"
                              />
                            </Dropdown.Item>
                          ))
                        ) : (
                          <Dropdown.Item disabled>No companies available</Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                    {formData.companies.length > 0 && (
                      <div className="mt-2">
                        <small className="text-success">
                          <Icon name="check-circle" /> {formData.companies.length} {formData.companies.length === 1 ? 'company' : 'companies'} selected
                        </small>
                      </div>
                    )}
                    {errors.companies && (
                      <div className="text-danger mt-1">
                        <small>{errors.companies}</small>
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Concept Name <span className="text-danger">*</span></Form.Label>
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

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Difficulty Level</Form.Label>
                    <Form.Select
                      name="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={handleChange}
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Estimated Time (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      name="estimated_time_minutes"
                      value={formData.estimated_time_minutes}
                      onChange={handleChange}
                      min="1"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      min="0"
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
                      <span className="ms-2">Create Concept</span>
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/Concepts/list-concept')}>
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

export default ConceptCreate;
