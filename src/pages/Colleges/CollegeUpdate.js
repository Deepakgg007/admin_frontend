import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function CollegeUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone_number: "",
    max_students: "",
    organization: "",
    oldOrganization: "",
    is_active: true,
    description: "",
    logo: null,
    oldLogoUrl: "",
  });

  const [organizations, setOrganizations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all organizations
  useEffect(() => {
    if (!authToken) return;
    const fetchOrganizations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/organizations/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data =
          res.data.results || res.data.data || res.data || [];
        setOrganizations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        Swal.fire("Error", "Failed to load organizations", "error");
      }
    };
    fetchOrganizations();
  }, [authToken]);

  // Fetch existing college details
  useEffect(() => {
    if (!authToken) return;
    const fetchCollege = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/colleges/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.data || res.data;

        console.log('📌 Loaded college data:', data);
        console.log('📌 Organization (raw):', data.organization, 'Type:', typeof data.organization);

        // API returns organization as a number (not an object), so use it directly
        const organizationId = data.organization ? String(data.organization) : "";
        console.log('📌 Organization ID (string):', organizationId, 'Type:', typeof organizationId);

        setForm({
          name: data.name || "",
          email: data.email || "",
          password: "", // leave empty for security
          address: data.address || "",
          phone_number: data.phone_number || "",
          max_students: data.max_students || "",
          organization: organizationId, // Convert to string
          oldOrganization: data.organization_name || "", // Use organization_name from API
          is_active: data.is_active ?? true,
          description: data.description || "",
          logo: null,
          oldLogoUrl: data.logo || "",
        });
      } catch (err) {
        console.error("Error fetching college:", err);
        Swal.fire("Error", "Failed to fetch college details", "error");
      }
    };
    fetchCollege();
  }, [id, authToken]);

  // Handle input changes
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      formData.append("email", form.email);
      if (form.password) formData.append("password", form.password);
      formData.append("address", form.address);
      formData.append("phone_number", form.phone_number);
      formData.append("max_students", form.max_students);
      formData.append("organization", form.organization);
      formData.append("is_active", form.is_active);
      formData.append("description", form.description);
      if (form.logo) formData.append("logo", form.logo);

      await axios.patch(`${API_BASE_URL}/api/colleges/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "College updated successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/Colleges/list-college");
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

  return (
    <Layout title="Edit College" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Edit College</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Colleges/list-college">Colleges</Link></li>
                <li className="breadcrumb-item active">Edit</li>
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
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>College Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleInput}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleInput}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Password (optional)</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleInput}
                          placeholder="Leave blank to keep current"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone_number"
                          value={form.phone_number}
                          onChange={handleInput}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Max Students</Form.Label>
                        <Form.Control
                          type="number"
                          name="max_students"
                          value={form.max_students}
                          onChange={handleInput}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleInput}
                        />
                      </Form.Group>
                    </Col>

                    {/* Organization Dropdown */}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Select Organization *</Form.Label>
                        <Form.Select
                          name="organization"
                          value={form.organization || ""}
                          onChange={handleInput}
                          required
                        >
                          <option value="">-- Select Organization --</option>
                          {organizations.map((o) => (
                            <option key={o.id} value={String(o.id)}>
                              {o.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Check
                        type="checkbox"
                        label="Active"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleInput}
                      />
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>College Logo</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={handleLogoChange} />
                      </Form.Group>

                      {/* Show current logo if exists */}
                      {form.oldLogoUrl && !form.logo && (
                        <div className="mt-2">
                          <p>Current Logo:</p>
                          <img
                            src={form.oldLogoUrl}
                            alt="College Logo"
                            style={{
                              width: "100px",
                              height: "100px",
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      )}

                      {/* Show new logo name if selected */}
                      {form.logo && (
                        <div className="mt-2">
                          Selected file: <strong>{form.logo.name}</strong>
                        </div>
                      )}
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="description"
                          rows={3}
                          value={form.description}
                          onChange={handleInput}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col md={12} className="text-center mt-4">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner animation="border" size="sm" /> : "Update College"}
              </Button>
              <Link to="/Colleges/list-college" className="btn btn-outline-primary ms-2">
                Cancel
              </Link>
            </Col>
          </Row>
        </Form>
      </Block>
    </Layout>
  );
}

export default CollegeUpdate;
