import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Layout from '../../layout/fullpage';
import { saveUserData } from '../../utilities/auth';
import { API_BASE_URL } from '../../services/apiBase';

const AuthLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for remembered credentials on component mount
  React.useEffect(() => {
    const rememberedEmailOrPhone = localStorage.getItem('rememberedEmailOrPhone');
    if (rememberedEmailOrPhone) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmailOrPhone,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
      email: formData.email,
      password: formData.password
    });

    console.log('Login response:', response.data); // Debug log

    // Extract data from StandardResponseMixin format: { success, message, data: {...} }
    const responseData = response.data?.data || response.data;

    // Extract tokens and user from response
    const accessToken = responseData?.access;
    const refreshToken = responseData?.refresh;
    const userData = responseData?.user;

    // Store tokens with correct keys that match courseApi.js
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('authToken', accessToken); // Keep for backward compatibility
    } else {
      throw new Error('No access token received from server');
    }

    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('refreshToken', refreshToken); // Keep for backward compatibility
    }

    // Store user data with correct key that matches auth.js utilities
    if (userData) {
      saveUserData(userData); // Uses 'user' key
      localStorage.setItem('userData', JSON.stringify(userData)); // Keep for backward compatibility
      console.log('User data saved:', userData); // Debug log
    } else {
      throw new Error('No user data received from server');
    }

    // Remember me
    if (formData.rememberMe) {
      localStorage.setItem('rememberedEmailOrPhone', formData.email);
    } else {
      localStorage.removeItem('rememberedEmailOrPhone');
    }

    console.log('Login successful, redirecting to dashboard...'); // Debug log

    // Redirect to dashboard
    navigate('/dashboard', { replace: true });

  } catch (err) {
    console.error('Login error:', err); // Debug log
    if (err.response) {
      const errorMessage =
        err.response.data?.error ||
        err.response.data?.message ||
        err.response.data?.detail ||
        'Login failed. Please try again.';
      setError(errorMessage);
    } else if (err.message) {
      setError(err.message);
    } else {
      setError('Network error. Please check your connection.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <Layout title="Login" centered>
      <div className="container p-2 p-sm-4">
        <Card className="overflow-hidden card-gutter-lg rounded-4 card-auth card-auth-mh">
          <Row className="g-0 flex-lg-row-reverse">
              <Card.Body className="h-100 d-flex flex-column justify-content-center">
                <div className="nk-block-head text-center">
                  <div className="nk-block-head-content">
                    <h3 className="nk-block-title mb-1">welcome admin Login</h3>
                    <p className="small">Please sign-in to your account and start the adventure.</p>
                  </div>
                </div>

                {error && (
                  <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row className="gy-3">
                    <Col className="col-12">
                      <Form.Group className="form-group">
                        <Form.Label htmlFor="email">Email</Form.Label>
                        <div className="form-control-wrap">
                          <Form.Control
                            type="text"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col className="col-12">
                      <Form.Group className="form-group">
                        <Form.Label htmlFor="password">Password</Form.Label>
                        <div className="form-control-wrap">
                          <Form.Control
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col className="col-12">
                      <div className="d-flex flex-wrap justify-content-between">
                        <Form.Check
                          className="form-check-sm"
                          type="checkbox"
                          id="rememberMe"
                          name="rememberMe"
                          label="Remember Me"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                        />
                      </div>
                    </Col>
                    <Col className="col-12">
                      <div className="d-grid">
                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                              <span className="ms-2">Logging in...</span>
                            </>
                          ) : (
                            'Login to account'
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
          </Row>
        </Card>
      </div>
    </Layout>
  );
};

export default AuthLoginPage;