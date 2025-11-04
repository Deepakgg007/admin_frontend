import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function UniversityUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    address: "",
    logo: null, // for new file
    oldLogoUrl: "", // store existing logo URL
    total_organizations: 0,
    total_colleges: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    axios
      .get(`${API_BASE_URL}/api/universities/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        const data = res.data.data;
        setForm({
          name: data.name || "",
          address: data.address || "",
          logo: null, // new upload
          oldLogoUrl: data.logo || "", // store previous logo
          total_organizations: data.total_organizations || 0,
          total_colleges: data.total_colleges || 0,
        });


      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Failed to load University data",
          text: err.response?.data?.message || "Could not fetch University details",
        });
      });
  }, [id]);


  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm((prev) => ({ ...prev, logo: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const authToken = localStorage.getItem("authToken");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("address", form.address);
      formData.append("total_organizations", form.total_organizations);
      formData.append("total_colleges", form.total_colleges);
      if (form.logo) formData.append("logo", form.logo);

      const response = await axios.put(
        `${API_BASE_URL}/api/universities/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "University updated successfully!",
          text: response.data.message,
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        setTimeout(() => navigate("/University/list-University"), 2000);
      }
    } catch (err) {
      console.error("Update error:", err.response);
      Swal.fire({
        icon: "error",
        title: "Failed to update University",
        text:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update University",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Edit University" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Edit University</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/University/list-University">University</Link>
                </li>
                <li className="breadcrumb-item active">Edit</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/University/list-University" className="btn btn-primary">
              <Icon name="eye" /> View University
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
                        <Form.Label>University Name *</Form.Label>
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
                      <Form.Group controlId="logo">
                        <Form.Label>Upload New Logo</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                        />
                      </Form.Group>

                      {/* Show previous logo */}
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

                      {/* Show selected new logo */}
                      {form.logo && (
                        <div className="mt-2">
                          Selected file: <strong>{form.logo.name}</strong>
                        </div>
                      )}
                    </Col>


                    <Col md={6}>
                      <Form.Group controlId="total_organizations">
                        <Form.Label>Total Organizations</Form.Label>
                        <Form.Control
                          type="number"
                          name="total_organizations"
                          value={form.total_organizations}
                          onChange={handleInput}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="total_colleges">
                        <Form.Label>Total Colleges</Form.Label>
                        <Form.Control
                          type="number"
                          name="total_colleges"
                          value={form.total_colleges}
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
                {isSubmitting ? <Spinner animation="border" size="sm" /> : "Update University"}
              </Button>
              <Link to="/University/list-University" className="btn btn-outline-primary ms-2">
                Cancel
              </Link>
            </Col>
          </Row>
        </Form>
      </Block>
    </Layout>
  );
}

export default UniversityUpdate;
