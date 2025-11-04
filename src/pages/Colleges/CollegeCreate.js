// src/pages/Colleges/CollegeCreate.js
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

function CollegeCreate() {
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [logo, setLogo] = useState(null);
  const [description, setDescription] = useState('');
  const [organization, setOrganization] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const authToken = localStorage.getItem('authToken');

  // Fetch organizations for dropdown
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!authToken) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/api/organizations/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // Handle multiple possible response formats
        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.results)) {
          data = response.data.results;
        } else if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }

        if (data.length === 0) {
          Swal.fire('Warning', 'No organizations found', 'warning');
          return;
        }

        setOrganizations(data);
        setOrganization(data[0].id); // preselect first organization
      } catch (err) {
        console.error('Error fetching organizations', err);
        Swal.fire('Error', 'Failed to fetch organizations', 'error');
      }
    };

    fetchOrganizations();
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

    if (!organization) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please select an organization.' });
      setLoading(false);
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', name);
      formDataObj.append('email', email);
      formDataObj.append('password', password);
      formDataObj.append('address', address);
      formDataObj.append('phone_number', phoneNumber);
      formDataObj.append('max_students', maxStudents);
      formDataObj.append('organization', organization);
      formDataObj.append('is_active', isActive);
      if (logo) formDataObj.append('logo', logo);
      formDataObj.append('description', description);

      const response = await axios.post(
        `${API_BASE_URL}/api/colleges/`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'College created successfully.',
        timer: 1500,
        showConfirmButton: false,
      });

      navigate('/Colleges/list-college'); // redirect to college list
    } catch (error) {
      console.error(error.response?.data);
      if (error.response?.status === 422) setErrors(error.response.data.errors || {});
      else if (error.response?.status === 409) {
        Swal.fire({ icon: 'error', title: 'Duplicate Name', text: 'A college with this name already exists.' });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to create College',
          text: error.response?.data?.error || 'Something went wrong.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add College" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Add College</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Colleges/list-college">Colleges</Link></li>
                <li className="breadcrumb-item active">Add</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Colleges/list-college" className="btn btn-primary">
              <Icon name="eye" /> View Colleges
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

                  {/* College Name */}
                  <Form.Group className="form-group">
                    <Form.Label>College Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter college name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">{errors.name && errors.name[0]}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      isInvalid={!!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email && errors.email[0]}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password && errors.password[0]}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Address */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      isInvalid={!!errors.address}
                    />
                    <Form.Control.Feedback type="invalid">{errors.address && errors.address[0]}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Phone */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      isInvalid={!!errors.phone_number}
                    />
                    <Form.Control.Feedback type="invalid">{errors.phone_number && errors.phone_number[0]}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Max Students */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>Max Students</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter max students"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                      isInvalid={!!errors.max_students}
                    />
                    <Form.Control.Feedback type="invalid">{errors.max_students && errors.max_students[0]}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Organization Dropdown */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>Organization</Form.Label>
                    <Form.Select
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      isInvalid={!!errors.organization}
                    >
                      <option value="">Select Organization</option>
                      {organizations.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.organization && errors.organization[0]}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Active */}
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
                    <Form.Label>College Logo</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      isInvalid={!!errors.logo}
                    />
                    <Form.Control.Feedback type="invalid">{errors.logo && errors.logo[0]}</Form.Control.Feedback>
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>

                  {/* Actions */}
                  <div className="mt-4 d-flex justify-content-center">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Save College'}
                    </Button>
                    <Link to="/Colleges/list-college" className="btn btn-outline-primary ms-2">Cancel</Link>
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

export default CollegeCreate;
