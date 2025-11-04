import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Card,
  Form,
  Row,
  Col,
  Button,
  Spinner
} from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

function UniversityCreate() {
  const navigate = useNavigate();

  // State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState(null); // File object
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle file change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogo(file); // store File object directly
  };

  // Handle form submit
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrors({});

  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    Swal.fire({
      icon: 'error',
      title: 'Unauthorized',
      text: 'Please login.',
    });
    setLoading(false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    if (logo) formData.append('logo', logo);

    // Debug: see what is being sent
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await axios.post(`${API_BASE_URL}/api/universities/`, formData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'University created successfully.',
      timer: 1500,
      showConfirmButton: false,
    });

    setTimeout(() => navigate('/University/list-University'), 1600);

  } catch (error) {
    console.error(error.response?.data);
    if (error.response?.status === 422) {
      setErrors(error.response.data.errors || {});
    } else if (error.response?.status === 409) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Name',
        text: 'A university with this name already exists.',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to create university',
        text: error.response?.data?.error || 'Something went wrong.',
      });
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <Layout title="Add University" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Add Universities</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/University/list-University">Universities</Link></li>
                <li className="breadcrumb-item active">Add</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/University/list-University" className="btn btn-primary">
              <Icon name="eye" /> View Universities
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

                  {/* University Name */}
                  <Form.Group className="form-group">
                    <Form.Label>University Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter hub name"
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
                    <Form.Label>University Address</Form.Label>
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

                  {/* Logo Upload */}
                  <Form.Group className="form-group mt-3">
                    <Form.Label>University Logo</Form.Label>
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
                      {loading ? <Spinner animation="border" size="sm" /> : 'Save university'}
                    </Button>
                    <Link to="/University/list-University" className="btn btn-outline-primary ms-2">
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

export default UniversityCreate;
