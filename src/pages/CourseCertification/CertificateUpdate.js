import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function CertificateUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  const [form, setForm] = useState({
    course: "",
    title: "",
    description: "",
    passing_score: 70,
    duration_minutes: 60,
    max_attempts: 3,
    is_active: true,
    questions: []
  });

  const [courses, setCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch courses and certificate data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesRes = await axios.get(`${API_BASE_URL}/api/courses/`, {
          params: { per_page: 1000, status: 'published' },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCourses(coursesRes.data.data || coursesRes.data.results || []);

        // Fetch certificate
        const certRes = await axios.get(`${API_BASE_URL}/api/admin/cert/certifications/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const certData = certRes.data.data || certRes.data;

        setForm({
          course: String(certData.course || ""),
          title: certData.title || "",
          description: certData.description || "",
          passing_score: certData.passing_score || 70,
          duration_minutes: certData.duration_minutes || 60,
          max_attempts: certData.max_attempts || 3,
          is_active: certData.is_active ?? true,
          questions: certData.questions || []
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load data", "error");
      }
    };
    fetchData();
  }, [id, authToken]);

  // Reuse the same helper functions from CertificateCreate
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: "",
      order: form.questions.length,
      weight: 1,
      is_multiple_correct: false,
      is_active: true,
      options: [
        { id: Date.now() + 1, text: "", is_correct: false },
        { id: Date.now() + 2, text: "", is_correct: false }
      ]
    };
    setForm(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const updateQuestion = (questionIndex, field, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, idx) => 
        idx === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const deleteQuestion = (questionIndex) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== questionIndex)
    }));
  };

  const addOption = (questionIndex) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, idx) => 
        idx === questionIndex 
          ? { ...q, options: [...q.options, { id: Date.now(), text: "", is_correct: false }] }
          : q
      )
    }));
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, qIdx) => 
        qIdx === questionIndex 
          ? {
              ...q,
              options: q.options.map((opt, oIdx) => 
                oIdx === optionIndex ? { ...opt, [field]: value } : opt
              )
            }
          : q
      )
    }));
  };

  const deleteOption = (questionIndex, optionIndex) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, idx) => 
        idx === questionIndex 
          ? { ...q, options: q.options.filter((_, oIdx) => oIdx !== optionIndex) }
          : q
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!form.course) {
      setErrors({ course: "Please select a course" });
      setIsSubmitting(false);
      return;
    }

    if (form.questions.length === 0) {
      Swal.fire("Error", "Please add at least one question", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        course: parseInt(form.course),
        title: form.title,
        description: form.description,
        passing_score: parseInt(form.passing_score),
        duration_minutes: parseInt(form.duration_minutes),
        max_attempts: parseInt(form.max_attempts),
        is_active: form.is_active,
        questions: form.questions.map(q => ({
          id: q.id, // Include ID for existing questions
          text: q.text,
          order: parseInt(q.order),
          weight: parseInt(q.weight),
          is_multiple_correct: q.is_multiple_correct,
          is_active: q.is_active,
          options: q.options.map(opt => ({
            id: opt.id, // Include ID for existing options
            text: opt.text,
            is_correct: opt.is_correct
          }))
        }))
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/cert/certifications/${id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Certificate updated successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/Certificates/list-certificate");
    } catch (error) {
      console.error("Update error:", error.response);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update certificate.";
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Update Certificate" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Update Certificate</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Certificates/list-certificate">Certificates</Link></li>
                <li className="breadcrumb-item active">Update</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to={`/Certificates/view-certificate/${id}`} className="btn btn-primary">
              <Icon name="eye" /> View Certificate
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Form onSubmit={handleSubmit}>
          <Row className="g-gs">
            <Col md={12}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Basic Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Select Course *</Form.Label>
                        <Form.Select
                          name="course"
                          value={form.course}
                          onChange={handleInput}
                          isInvalid={!!errors.course}
                          required
                        >
                          <option value="">-- Select Course --</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.title} {course.course_id ? `(${course.course_id})` : ''}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Certificate Title *</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleInput}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="description"
                          value={form.description}
                          onChange={handleInput}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Passing Score (%) *</Form.Label>
                        <Form.Control
                          type="number"
                          name="passing_score"
                          value={form.passing_score}
                          onChange={handleInput}
                          min="0"
                          max="100"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Duration (minutes) *</Form.Label>
                        <Form.Control
                          type="number"
                          name="duration_minutes"
                          value={form.duration_minutes}
                          onChange={handleInput}
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Max Attempts *</Form.Label>
                        <Form.Control
                          type="number"
                          name="max_attempts"
                          value={form.max_attempts}
                          onChange={handleInput}
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Check
                        type="checkbox"
                        label="Active Certificate"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleInput}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Questions Section */}
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Assessment Questions</h5>
                  <Button variant="primary" size="sm" onClick={addQuestion}>
                    <Icon name="plus" /> Add Question
                  </Button>
                </Card.Header>
                <Card.Body>
                  {form.questions.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      No questions added yet.
                    </Alert>
                  ) : (
                    form.questions.map((question, qIndex) => (
                      <Card key={question.id} className="mb-4 border">
                        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">Question {qIndex + 1}</h6>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteQuestion(qIndex)}
                          >
                            <Icon name="trash" />
                          </Button>
                        </Card.Header>
                        <Card.Body>
                          <Row className="g-3">
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label>Question Text *</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  value={question.text}
                                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </Col>

                            <Col md={3}>
                              <Form.Group>
                                <Form.Label>Order</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={question.order}
                                  onChange={(e) => updateQuestion(qIndex, 'order', e.target.value)}
                                  min="0"
                                  required
                                />
                              </Form.Group>
                            </Col>

                            <Col md={3}>
                              <Form.Group>
                                <Form.Label>Weight</Form.Label>
                                <Form.Control
                                  type="number"
                                  value={question.weight}
                                  onChange={(e) => updateQuestion(qIndex, 'weight', e.target.value)}
                                  min="1"
                                  required
                                />
                              </Form.Group>
                            </Col>

                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Settings</Form.Label>
                                <div>
                                  <Form.Check
                                    type="checkbox"
                                    label="Multiple Correct Answers"
                                    checked={question.is_multiple_correct}
                                    onChange={(e) => updateQuestion(qIndex, 'is_multiple_correct', e.target.checked)}
                                    className="mb-2"
                                  />
                                  <Form.Check
                                    type="checkbox"
                                    label="Active Question"
                                    checked={question.is_active}
                                    onChange={(e) => updateQuestion(qIndex, 'is_active', e.target.checked)}
                                  />
                                </div>
                              </Form.Group>
                            </Col>

                            {/* Options */}
                            <Col md={12}>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Answer Options</h6>
                                <Button variant="outline-primary" size="sm" onClick={() => addOption(qIndex)}>
                                  <Icon name="plus" /> Add Option
                                </Button>
                              </div>

                              {question.options.map((option, oIndex) => (
                                <Row key={option.id} className="g-2 align-items-center mb-2">
                                  <Col md={1}>
                                    <Form.Check
                                      type={question.is_multiple_correct ? "checkbox" : "radio"}
                                      name={`question-${qIndex}`}
                                      checked={option.is_correct}
                                      onChange={(e) => updateOption(qIndex, oIndex, 'is_correct', e.target.checked)}
                                    />
                                  </Col>
                                  <Col md={9}>
                                    <Form.Control
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                      required
                                    />
                                  </Col>
                                  <Col md={2}>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => deleteOption(qIndex, oIndex)}
                                      disabled={question.options.length <= 2}
                                    >
                                      <Icon name="trash" />
                                    </Button>
                                  </Col>
                                </Row>
                              ))}
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={12} className="text-center mt-4">
              <Button variant="primary" type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Updating Certificate...
                  </>
                ) : (
                  "Update Certificate"
                )}
              </Button>
              <Link to={`/Certificates/view-certificate/${id}`} className="btn btn-outline-primary ms-2">
                Cancel
              </Link>
            </Col>
          </Row>
        </Form>
      </Block>
    </Layout>
  );
}

export default CertificateUpdate;