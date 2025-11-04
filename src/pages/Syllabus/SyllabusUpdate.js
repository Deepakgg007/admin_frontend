import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function SyllabusUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  const [form, setForm] = useState({
    course: "",
    title: "",
    description: "",
    order: 0,
    is_published: true,
  });

  const [courses, setCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/courses/`, {
          params: { per_page: 1000 },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.data || res.data.results || [];
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [authToken]);

  // Fetch syllabus data
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/syllabi/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.data || res.data;

        setForm({
          course: String(data.course || ""),
          title: data.title || "",
          description: data.description || "",
          order: data.order || 0,
          is_published: data.is_published ?? true,
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load syllabus data", "error");
      }
    };
    fetchSyllabus();
  }, [id, authToken]);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        course: parseInt(form.course),
        title: form.title,
        description: form.description,
        order: parseInt(form.order),
        is_published: form.is_published,
      };

      await axios.put(`${API_BASE_URL}/api/syllabi/${id}/`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Syllabus updated successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/Syllabus/list-syllabus");
    } catch (error) {
      console.error("Update error:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update syllabus.";
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Edit Syllabus" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Edit Syllabus</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Syllabus/list-syllabus">Syllabus</Link></li>
                <li className="breadcrumb-item active">Edit</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Syllabus/list-syllabus" className="btn btn-primary">
              <Icon name="list" /> View All
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
                      <Form.Group>
                        <Form.Label>Select Course *</Form.Label>
                        <Form.Select name="course" value={form.course} onChange={handleInput} required>
                          <option value="">-- Select Course --</option>
                          {courses.map((c) => (
                            <option key={c.id} value={String(c.id)}>{c.title}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Syllabus Title *</Form.Label>
                        <Form.Control type="text" name="title" value={form.title} onChange={handleInput} required />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={4} name="description" value={form.description} onChange={handleInput} />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Order *</Form.Label>
                        <Form.Control type="number" name="order" value={form.order} onChange={handleInput} min="0" required />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Settings</Form.Label>
                        <div>
                          <Form.Check type="checkbox" label="Published" name="is_published" checked={form.is_published} onChange={handleInput} />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col md={12} className="text-center mt-4">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Spinner animation="border" size="sm" className="me-2" />Updating...</> : "Update Syllabus"}
              </Button>
              <Link to="/Syllabus/list-syllabus" className="btn btn-outline-primary ms-2">Cancel</Link>
            </Col>
          </Row>
        </Form>
      </Block>
    </Layout>
  );
}

export default SyllabusUpdate;
