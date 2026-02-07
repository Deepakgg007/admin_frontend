import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner, Alert, Modal, Badge } from "react-bootstrap";
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

  const [bankQuestions, setBankQuestions] = useState([]);

  const [courses, setCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Question Bank Import Modal
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
  const [questionBankQuestions, setQuestionBankQuestions] = useState([]);
  const [loadingQuestionBank, setLoadingQuestionBank] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

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

        setBankQuestions(certData.bank_questions || []);
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

  // Question Bank functions
  const openQuestionBankModal = async () => {
    if (!form.course) {
      Swal.fire("Error!", "Please select a course first.", "error");
      return;
    }

    setShowQuestionBankModal(true);
    setLoadingQuestionBank(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/question-bank/questions/`, {
        params: { course: form.course, per_page: 1000 },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = response.data?.results || response.data?.data || [];
      setQuestionBankQuestions(data);
    } catch (error) {
      Swal.fire("Error!", "Failed to load Question Bank.", "error");
      console.error(error);
    } finally {
      setLoadingQuestionBank(false);
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const importSelectedQuestions = async () => {
    if (selectedQuestionIds.length === 0) {
      Swal.fire("Error!", "Please select at least one question.", "error");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/question-bank/questions/import_to_certification/`,
        {
          question_ids: selectedQuestionIds,
          certification_id: parseInt(id),
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.success) {
        Swal.fire("Success!", response.data.message, "success");
        setShowQuestionBankModal(false);
        setSelectedQuestionIds([]);

        // Refresh certificate data to show newly imported questions
        window.location.reload();
      }
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.error || "Failed to import questions.", "error");
    }
  };

  const removeBankQuestion = async (bankQuestionId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will remove the question from this certificate (the question will remain in Question Bank).",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, remove it!",
      });

      if (result.isConfirmed) {
        await axios.delete(
          `${API_BASE_URL}/api/admin/question-bank/certification-questions/${bankQuestionId}/`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        Swal.fire("Removed!", "Question removed from certificate.", "success");

        // Update state to remove the question
        setBankQuestions(prev => prev.filter(q => q.id !== bankQuestionId));
      }
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.error || "Failed to remove question.", "error");
    }
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

    if (form.questions.length === 0 && bankQuestions.length === 0) {
      Swal.fire("Error", "Please add at least one question (manual or from Question Bank)", "error");
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
                  <h5 className="mb-0">Assessment Questions (From Question Bank)</h5>
                  <Button variant="primary" size="sm" onClick={openQuestionBankModal}>
                    <Icon name="archive" /> Import from Question Bank
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <Icon name="info-fill" className="me-2" />
                    Questions are now managed in the <Link to="/QuestionBank/list-questions">Question Bank</Link>.
                    Click "Import from Question Bank" to add AI-generated or manually created questions to this certificate.
                  </Alert>
                  {bankQuestions.length === 0 ? (
                    <Alert variant="warning" className="text-center">
                      No questions imported yet. Click "Import from Question Bank" above to add questions.
                    </Alert>
                  ) : (
                    bankQuestions.map((bankQuestion, qIndex) => (
                      <Card key={bankQuestion.id} className="mb-4 border border-primary">
                        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-0">Question {qIndex + 1}</h6>
                            <small className="text-muted">From Question Bank</small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeBankQuestion(bankQuestion.id)}
                          >
                            <Icon name="trash" /> Remove
                          </Button>
                        </Card.Header>
                        <Card.Body>
                          <Row className="g-3">
                            <Col md={12}>
                              <div>
                                <strong>Question:</strong>
                                <p className="mt-2">{bankQuestion.question_text || bankQuestion.question_details?.text}</p>
                              </div>
                            </Col>

                            <Col md={4}>
                              <div>
                                <strong>Order:</strong> {bankQuestion.order}
                              </div>
                            </Col>

                            <Col md={4}>
                              <div>
                                <strong>Weight:</strong> {bankQuestion.weight}
                              </div>
                            </Col>

                            <Col md={4}>
                              <div>
                                <strong>Type:</strong> {bankQuestion.question_details?.is_multiple_correct ? "Multiple Choice" : "Single Choice"}
                              </div>
                            </Col>

                            {/* Display Options */}
                            <Col md={12}>
                              <h6>Answer Options</h6>
                              {bankQuestion.question_details?.options?.map((option, oIndex) => (
                                <div key={option.id} className="mb-2 p-2 border rounded">
                                  <Form.Check
                                    type={bankQuestion.question_details?.is_multiple_correct ? "checkbox" : "radio"}
                                    label={option.text}
                                    checked={option.is_correct}
                                    disabled
                                    readOnly
                                  />
                                </div>
                              ))}
                            </Col>

                            <Col md={12}>
                              <Alert variant="info" className="mb-0">
                                <small>
                                  <Icon name="info" /> This question is managed in the Question Bank.
                                  To edit it, go to <Link to="/QuestionBank/list-questions" target="_blank">Question Bank</Link>.
                                </small>
                              </Alert>
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

      {/* Question Bank Import Modal */}
      <Modal show={showQuestionBankModal} onHide={() => setShowQuestionBankModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Import Questions from Question Bank</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {loadingQuestionBank ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading questions...</p>
            </div>
          ) : questionBankQuestions.length === 0 ? (
            <Alert variant="warning">
              No questions found for the selected course in Question Bank.
              <br />
              <Link to="/QuestionBank/list-questions" target="_blank">
                Go to Question Bank to create questions
              </Link>
            </Alert>
          ) : (
            <>
              <Alert variant="info">
                <small>
                  Select questions to import. These questions are from the Question Bank for the selected course.
                </small>
              </Alert>
              {questionBankQuestions.map((question, index) => (
                <Card key={question.id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="checkbox"
                        checked={selectedQuestionIds.includes(question.id)}
                        onChange={() => toggleQuestionSelection(question.id)}
                        className="me-3 mt-1"
                      />
                      <div className="flex-grow-1">
                        <h6>Q{index + 1}: {question.text}</h6>
                        <div className="d-flex gap-2 mt-2">
                          <Badge bg={
                            question.difficulty === 'EASY' ? 'success' :
                            question.difficulty === 'MEDIUM' ? 'warning' :
                            'danger'
                          }>
                            {question.difficulty}
                          </Badge>
                          <Badge bg={
                            question.source === 'AI_GENERATED' ? 'info' :
                            question.source === 'MANUAL' ? 'primary' :
                            'secondary'
                          }>
                            {question.source === 'AI_GENERATED' ? 'AI Generated' :
                             question.source === 'MANUAL' ? 'Manual' :
                             'Imported'}
                          </Badge>
                          {question.category_name && (
                            <Badge bg="secondary">{question.category_name}</Badge>
                          )}
                          <Badge bg="light" text="dark">
                            {question.options_count} Options
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuestionBankModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={importSelectedQuestions}
            disabled={selectedQuestionIds.length === 0}
          >
            Import {selectedQuestionIds.length > 0 ? `(${selectedQuestionIds.length})` : ''} Selected Questions
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default CertificateUpdate;