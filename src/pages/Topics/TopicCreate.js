import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function TopicCreate() {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  const [form, setForm] = useState({
    course: "",
    title: "",
    description: "",
    is_preview: false,
    is_published: true,
  });

  const [courses, setCourses] = useState([]);
  const [existingTopics, setExistingTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch courses for dropdown
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
        Swal.fire("Error", "Failed to fetch courses", "error");
      }
    };
    fetchCourses();
  }, [authToken]);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Fetch existing topics when course changes to check for duplicates
  useEffect(() => {
    const fetchExistingTopics = async () => {
      if (!form.course) {
        setExistingTopics([]);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/topics/`, {
          params: { course: form.course, per_page: 1000 },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.data || res.data.results || [];
        setExistingTopics(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExistingTopics();
  }, [form.course, authToken]);

  const checkDuplicate = () => {
    if (!form.course || !form.title.trim()) {
      return false;
    }
    const duplicate = existingTopics.find(
      (t) => t.course === parseInt(form.course) && t.title.toLowerCase() === form.title.toLowerCase().trim()
    );
    return !!duplicate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Check for duplicate topic in the same course
    if (checkDuplicate()) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Topic!",
        text: "A topic with this title already exists in the selected course. Please use a different title.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        course: parseInt(form.course),
        title: form.title,
        description: form.description,
        is_preview: form.is_preview,
        is_published: form.is_published,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/topics/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Topic created successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/Topics/list-topic");
      }
    } catch (error) {
      console.error("Create error:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create topic.";
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Create Topic" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Create Topic</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/Topics/list-topic">Topics</Link>
                </li>
                <li className="breadcrumb-item active">Create</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Topics/list-topic" className="btn btn-primary">
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
                        <Form.Select
                          name="course"
                          value={form.course}
                          onChange={handleInput}
                          required
                        >
                          <option value="">-- Select Course --</option>
                          {courses.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                              {c.title}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Topic Title *</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleInput}
                          placeholder="e.g., Introduction to Components"
                          required
                          isInvalid={checkDuplicate()}
                        />
                        {checkDuplicate() && (
                          <Form.Control.Feedback type="invalid" style={{display: 'block'}}>
                            This topic title already exists in the selected course.
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="description"
                          value={form.description}
                          onChange={handleInput}
                          placeholder="Describe what this topic covers..."
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Settings</Form.Label>
                        <div>
                          <Form.Check
                            type="checkbox"
                            label="Published"
                            name="is_published"
                            checked={form.is_published}
                            onChange={handleInput}
                          />
                          <Form.Check
                            type="checkbox"
                            label="Preview (Available before enrollment)"
                            name="is_preview"
                            checked={form.is_preview}
                            onChange={handleInput}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col md={12} className="text-center mt-4">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating...
                  </>
                ) : (
                  "Create Topic"
                )}
              </Button>
              <Link
                to="/Topics/list-topic"
                className="btn btn-outline-primary ms-2"
              >
                Cancel
              </Link>
            </Col>
          </Row>
        </Form>
      </Block>
    </Layout>
  );
}

export default TopicCreate;
