import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from '../../services/apiBase';

function OrganizationUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    university: "",
    oldUniversity: "", // store current university name
    universityChanged: false, // track if changed
    isActive: true,
    logo: null,
    oldLogoUrl: "",
  });
  const [universities, setUniversities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authToken = localStorage.getItem("authToken");

  // Fetch all universities for dropdown
  useEffect(() => {
    if (!authToken) return;
    const fetchUniversities = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/universities/`, {
          params: { page: 1, per_page: 1000 },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.results || res.data.data || [];
        console.log('📌 Loaded universities:', data);
        console.log('📌 First university ID:', data[0]?.id, 'Type:', typeof data[0]?.id);
        setUniversities(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to fetch universities", "error");
      }
    };
    fetchUniversities();
  }, [authToken]);

  // Fetch organization data
  useEffect(() => {
    if (!authToken) return;
    const fetchOrganization = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/organizations/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.data || res.data;

        console.log('📌 Loaded organization data:', data);
        console.log('📌 University (raw):', data.university, 'Type:', typeof data.university);

        // API returns university as a number (not an object), so use it directly
        const universityId = data.university ? String(data.university) : "";
        console.log('📌 University ID (string):', universityId, 'Type:', typeof universityId);

        setForm({
          name: data.name || "",
          address: data.address || "",
          university: universityId, // Convert to string
          oldUniversity: data.university_name || "", // Use university_name from API
          universityChanged: false,
          isActive: data.is_active ?? true,
          logo: null,
          oldLogoUrl: data.logo || "",
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load organization data", "error");
      }
    };
    fetchOrganization();
  }, [id, authToken]);

  // Handle input changes
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle logo change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm((prev) => ({ ...prev, logo: file }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("address", form.address);
      formData.append("university", form.university);
      formData.append("is_active", form.isActive);
      if (form.logo) formData.append("logo", form.logo);

      await axios.patch(`${API_BASE_URL}/api/organizations/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Organization updated successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/Organizations/list-organization");
    } catch (err) {
      console.error("Update error:", err.response);
      Swal.fire(
        "Update Failed",
        err.response?.data?.error || err.response?.data?.message || "Something went wrong.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug: Log when rendering
  console.log('📌 Rendering - form.university:', form.university, 'Type:', typeof form.university);
  console.log('📌 Rendering - universities count:', universities.length);

  return (
    <Layout title="Edit Organization" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Edit Organization</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Organizations/list-organization">Organizations</Link></li>
                <li className="breadcrumb-item active">Edit</li>
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
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group controlId="name">
                        <Form.Label>Organization Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleInput}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleInput}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group controlId="university">
                        <Form.Label>Select University *</Form.Label>
                        <Form.Select
                          name="university"
                          value={form.university || ""}
                          onChange={(e) => {
                            handleInput(e);
                            setForm(prev => ({ ...prev, universityChanged: true }));
                          }}
                          required
                        >
                          <option value="">-- Select University --</option>
                          {universities.map((u) => (
                            <option key={u.id} value={String(u.id)}>{u.name}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mt-2">
                      <Form.Check
                        type="checkbox"
                        label="Active"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleInput}
                      />
                    </Col>

                    <Col md={12} className="mt-3">
                      <Form.Group controlId="logo">
                        <Form.Label>Upload New Logo</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={handleLogoChange} />
                      </Form.Group>

                      {/* Existing logo */}
                      {form.oldLogoUrl && !form.logo && (
                        <div className="mt-2">
                          <p>Current Logo:</p>
                          <img
                            src={form.oldLogoUrl}
                            alt="Current Logo"
                            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }}
                          />
                        </div>
                      )}

                      {/* Selected new logo */}
                      {form.logo && (
                        <div className="mt-2">
                          Selected file: <strong>{form.logo.name}</strong>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col md={12} className="text-center mt-4">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner animation="border" size="sm" /> : "Update Organization"}
              </Button>
              <Link to="/Organizations/list-organization" className="btn btn-outline-primary ms-2">
                Cancel
              </Link>
            </Col>
          </Row>
        </Form>
      </Block>
    </Layout>
  );
}

export default OrganizationUpdate;
