import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

function ConceptUpdate() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: '',
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
  const [fetchLoading, setFetchLoading] = useState(true);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies
        const companiesRes = await axios.get(`${API_BASE_URL}/api/companies/`, {
          params: { is_active: true },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCompanies(companiesRes.data.results || companiesRes.data || []);

        // Fetch concept
        const conceptRes = await axios.get(`${API_BASE_URL}/api/concepts/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const concept = conceptRes.data;
        setFormData({
          company: concept.company || '',
          name: concept.name || '',
          description: concept.description || '',
          difficulty_level: concept.difficulty_level || 'INTERMEDIATE',
          estimated_time_minutes: concept.estimated_time_minutes || 60,
          order: concept.order || 0,
          is_active: concept.is_active,
        });
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch concept details.', 'error');
        navigate('/Concepts/list-concept');
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
      await axios.patch(`${API_BASE_URL}/api/concepts/${slug}/`, formData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Concept updated successfully.',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => navigate(`/Concepts/view-concept/${slug}`), 1600);
    } catch (error) {
      console.error(error.response?.data);
      if (error.response?.status === 400) {
        setErrors(error.response.data);
      } else {
        Swal.fire('Error', error.response?.data?.error || 'Failed to update concept.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Layout title="Update Concept" content="container">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Update Concept" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Update Concept</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Concepts/list-concept">Concepts</Link></li>
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
                      <span className="ms-2">Update Concept</span>
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/Concepts/view-concept/${slug}`)}>
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

export default ConceptUpdate;
