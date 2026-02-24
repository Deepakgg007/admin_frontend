import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner, Alert, Modal, Badge } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

/**
 * Helper function to render text with code formatting
 * Handles both inline code and multi-line code blocks
 */
const renderTextWithCode = (text) => {
  if (!text) return '';

  // First, process multi-line code blocks (triple backticks)
  let processedText = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    // Escape HTML entities in code
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Return pre-formatted code block with line breaks preserved
    return `<pre style="background: #1e293b; color: #e2e8f0; padding: 12px 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; margin: 8px 0;"><code>${escapedCode}</code></pre>`;
  });

  // Then process inline code (single backticks)
  const inlineCodeStyle = 'font-family: monospace; color: #e11d48; background: #fef2f2; padding: 2px 6px; border-radius: 4px;';
  processedText = processedText.replace(/`([^`]+)`/g, `<code style="${inlineCodeStyle}">$1</code>`);

  // Convert remaining newlines to <br> for non-code text
  processedText = processedText.replace(/\n/g, '<br />');

  return { __html: processedText };
};

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
    setSelectedQuestionIds([]);

    try {
      console.log('Fetching questions for course:', form.course);
      console.log('Already imported bank questions:', bankQuestions);

      const response = await axios.get(`${API_BASE_URL}/api/admin/question-bank/questions/`, {
        params: { course: form.course, is_active: true },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log('Question bank API response:', response.data);

      // Handle multiple response formats
      // Direct array (pagination disabled): [{...}, {...}]
      // StandardResponseMixin: { data: [...] }
      // Paginated: { results: [...] }
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        data = response.data.results;
      }

      console.log('Extracted questions data:', data.length, 'questions');

      // Filter out questions that have already been imported from the Question Bank
      // Get IDs of questions already linked to this certification via bank_questions
      const importedQuestionIds = bankQuestions.map(bq => {
        // Backend now returns: { id, question: { id, text }, weight, order, is_active }
        if (bq.question && typeof bq.question === 'object' && bq.question.id) {
          return bq.question.id;
        }
        // Fallback for other possible structures
        if (typeof bq.question === 'number') {
          return bq.question;
        }
        return null;
      }).filter(id => id !== null);

      console.log('Already imported question IDs:', importedQuestionIds);
      console.log('bankQuestions structure:', bankQuestions);

      const availableQuestions = data.filter(q => !importedQuestionIds.includes(q.id));

      console.log('Available questions after filtering:', availableQuestions.length);

      setQuestionBankQuestions(availableQuestions);
    } catch (error) {
      console.error('Error loading question bank:', error);
      Swal.fire("Error!", "Failed to load Question Bank.", "error");
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

  const toggleSelectAllQuestions = () => {
    if (selectedQuestionIds.length === questionBankQuestions.length) {
      // If all are selected, deselect all
      setSelectedQuestionIds([]);
    } else {
      // Select all questions
      setSelectedQuestionIds(questionBankQuestions.map(q => q.id));
    }
  };

  const importSelectedQuestions = async () => {
    if (selectedQuestionIds.length === 0) {
      Swal.fire("Error!", "Please select at least one question.", "error");
      return;
    }

    try {
      console.log('Importing questions:', selectedQuestionIds, 'to certification:', id);

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/question-bank/questions/import_to_certification/`,
        {
          question_ids: selectedQuestionIds,
          certification_id: parseInt(id),
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      console.log('Import response:', response.data);

      if (response.data.success) {
        Swal.fire("Success!", response.data.message, "success");
        setShowQuestionBankModal(false);
        setSelectedQuestionIds([]);

        // Refresh certificate data to show newly imported questions
        window.location.reload();
      }
    } catch (error) {
      console.error('Import error:', error);
      console.error('Error response:', error.response?.data);

      // Show detailed error information
      let errorMessage = "Failed to import questions.";
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data, null, 2);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire("Error!", errorMessage, "error");
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

    const totalQuestions = form.questions.length + bankQuestions.length;
    if (totalQuestions === 0) {
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

              {/* Manual Questions Section */}
              {form.questions.length > 0 && (
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Assessment Questions ({form.questions.length})</h5>
                    <Button variant="primary" size="sm" onClick={addQuestion}>
                      <Icon name="plus" /> Add Question
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {form.questions.map((question, qIndex) => (
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
                                  placeholder="Enter the question..."
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
                                      placeholder="Enter option text..."
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
                              <div className="mt-2">
                                <small className="text-muted">
                                  {question.is_multiple_correct
                                    ? "✓ Multiple correct answers allowed"
                                    : "✓ Single correct answer only"}
                                </small>
                                <br />
                                <small className="text-muted">
                                  {question.options.filter(opt => opt.is_correct).length} correct answer(s) selected
                                </small>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </Card.Body>
                </Card>
              )}

              {/* Question Bank Questions Section */}
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Questions from Question Bank ({bankQuestions.length})
                  </h5>
                  <Button variant="primary" size="sm" onClick={openQuestionBankModal}>
                    <Icon name="archive" /> Import from Question Bank
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <Icon name="info-fill" className="me-2" />
                    Questions imported from the <Link to="/QuestionBank/list-questions">Question Bank</Link> are managed separately.
                    Click "Import from Question Bank" to add more questions.
                  </Alert>
                  {bankQuestions.length === 0 ? (
                    <Alert variant="warning" className="text-center">
                      No questions imported from Question Bank yet.
                    </Alert>
                  ) : (
                    bankQuestions.map((bankQuestion, qIndex) => (
                      <Card key={bankQuestion.id} className="mb-4 border border-primary">
                        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-0">Question {form.questions.length + qIndex + 1}</h6>
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

              {/* Add Question Button for Manual Questions */}
              {form.questions.length === 0 && (
                <Card className="mb-4">
                  <Card.Body className="text-center">
                    <Button variant="outline-primary" onClick={addQuestion}>
                      <Icon name="plus" className="me-2" /> Add Manual Question
                    </Button>
                  </Card.Body>
                </Card>
              )}
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
            <Alert variant="info">
              <strong>No new questions available to import.</strong>
              <p className="mb-0 mt-2">
                {bankQuestions.length > 0
                  ? `All ${bankQuestions.length} question(s) from the Question Bank have already been imported for this certificate.`
                  : 'Please create questions for this course in the Question Bank first.'
                }
              </p>
              <Link to="/QuestionBank/list-questions" target="_blank" className="btn btn-sm btn-outline-primary mt-2">
                Go to Question Bank
              </Link>
            </Alert>
          ) : (
            <>
              <Alert variant="info" className="mb-3">
                <Icon name="info-fill" className="me-2" />
                Showing <strong>{questionBankQuestions.length}</strong> available question(s) for import.
                {bankQuestions.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      ({bankQuestions.length} question(s) already imported and hidden from this list)
                    </small>
                  </div>
                )}
              </Alert>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted mb-0">
                  Select questions to import ({selectedQuestionIds.length} selected)
                </p>
                <Form.Check
                  type="checkbox"
                  label="Select All"
                  checked={questionBankQuestions.length > 0 && selectedQuestionIds.length === questionBankQuestions.length}
                  onChange={toggleSelectAllQuestions}
                  className="fw-bold"
                />
              </div>
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
                        <h6>Q{index + 1}: <span dangerouslySetInnerHTML={renderTextWithCode(question.text)} /></h6>
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