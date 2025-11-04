import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { API_BASE_URL } from '../../services/apiBase';
import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { Icon } from '../../components';

function OrganizationCreate() {
  const navigate = useNavigate();

  // State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState(null);
  const [university, setUniversity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [universities, setUniversities] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const authToken = localStorage.getItem('authToken');

  // Fetch universities for dropdown
  useEffect(() => {
    const fetchUniversities = async () => {
      if (!authToken) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/universities/`, {
          params: { page: 1, per_page: 1000 },
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = response.data.results || response.data.data || [];
        if (data.length === 0) {
          Swal.fire('Warning', 'No universities found', 'warning');
          return;
        }

        setUniversities(data);
        setUniversity(data[0].id); // preselect first university
      } catch (err) {
        console.error('Error fetching universities', err);
        Swal.fire('Error', 'Failed to fetch universities', 'error');
      }
    };

    fetchUniversities();
  }, [authToken]);

  // Handle logo file change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!authToken) {
      Swal.fire({ icon: 'error', title: 'Unauthorized', text: 'Please login.' });
      setLoading(false);
      return;
    }

    if (!university) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please select a university.' });
      setLoading(false);
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', name);
      formDataObj.append('address', address);
      formDataObj.append('university', university);
      formDataObj.append('is_active', isActive);
      if (logo) formDataObj.append('logo', logo);

      const response = await axios.post(
        `${API_BASE_URL}/api/organizations/`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Organization created successfully.',
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirect to organization list
      navigate('/Organizations/list-organization');

    } catch (error) {
      console.error(error.response?.data);
      if (error.response?.status === 422) setErrors(error.response.data.errors || {});
      else if (error.response?.status === 409) {
        Swal.fire({ icon: 'error', title: 'Duplicate Name', text: 'A Organization with this name already exists.' });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to create Organization',
          text: error.response?.data?.error || 'Something went wrong.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Organization" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Add Organizations</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Organization/list-organization">Organizations</Link></li>
                <li className="breadcrumb-item active">Add</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Organizations/list-organization" className="btn btn-primary">
              <Icon name="eye" /> View Organizations
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Form onSubmit={handleSubmit}>
          <Row className="g-gs">
            <Col xxl="12">
              <Card className="card-gutter-md">
                <Card.Body>

                  {/* Organization Name */}
                  <Form.Group className="form-group">
                    <Form.Label>Organization Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Organization name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name && errors.name[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Address */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>Organization Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      isInvalid={!!errors.address}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.address && errors.address[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* University Dropdown */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>University</Form.Label>
                    <Form.Select
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      isInvalid={!!errors.university}
                    >
                      <option value="">Select University</option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.university && errors.university[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Active Status */}
                  <Form.Group className="form-group mt-3">
                    <Form.Check
                      type="checkbox"
                      label="Active"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                  </Form.Group>

                  {/* Logo Upload */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>Organization Logo</Form.Label>
                    <Form.Control
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      isInvalid={!!errors.logo}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.logo && errors.logo[0]}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Actions */}
                  <div className="mt-4 d-flex justify-content-center">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Save Organization'}
                    </Button>
                    <Link to="/Organizations/list-organization" className="btn btn-outline-primary ms-2">
                      Cancel
                    </Link>
                  </div>

                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Block>
    </Layout>
  );
}

export default OrganizationCreate;
