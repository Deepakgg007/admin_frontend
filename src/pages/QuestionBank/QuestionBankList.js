import { useState, useEffect, useCallback } from "react";
import { Card, Form, Row, Col, Badge, Button, Modal, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";
import { ChevronDown, ChevronUp } from "react-feather";

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

function QuestionBankList() {
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [expandedCourses, setExpandedCourses] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    difficulty: "MEDIUM",
    num_questions: 5,
    category: "",
    course: "",
    additional_context: "",
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState("");
  const [importing, setImporting] = useState(false);

  const authToken = localStorage.getItem("authToken");

  const fetchQuestions = useCallback(
    async () => {
      setLoading(true);
      try {
        const params = { search: searchQuery, per_page: 1000 };
        if (filterDifficulty) params.difficulty = filterDifficulty;
        if (filterSource) params.source = filterSource;
        if (filterCategory) params.category = filterCategory;
        if (filterCourse) params.course = filterCourse;

        const response = await axios.get(`${API_BASE_URL}/api/admin/question-bank/questions/`, {
          params,
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const res = response.data;
        const data = res?.results || res?.data || [];

        // Group questions by course
        const grouped = data.reduce((acc, question) => {
          const courseId = question.course || 'no-course';
          const courseTitle = question.course_title || 'Questions Without Course';

          if (!acc[courseId]) {
            acc[courseId] = {
              id: courseId,
              title: courseTitle,
              questions: []
            };
          }
          acc[courseId].questions.push(question);
          return acc;
        }, {});

        setGroupedQuestions(grouped);
      } catch (error) {
        setGroupedQuestions({});
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    },
    [authToken, searchQuery, filterDifficulty, filterSource, filterCategory, filterCourse]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/question-bank/categories/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data?.results || response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [authToken]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/courses/`, {
        params: { per_page: 1000 },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data?.data || response.data?.results || response.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  }, [authToken]);

  const fetchCertifications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/cert/certifications/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data?.results || response.data?.data || response.data || [];
      setCertifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch certifications:", error);
    }
  }, [authToken]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    fetchCategories();
    fetchCourses();
    fetchCertifications();
  }, [fetchCategories, fetchCourses, fetchCertifications]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const toggleCourseExpand = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const toggleQuestionSelect = (question) => {
    setSelectedRows(prev => {
      const exists = prev.find(q => q.id === question.id);
      if (exists) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  const isQuestionSelected = (questionId) => {
    return selectedRows.some(q => q.id === questionId);
  };

  const deleteConfirm = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this question?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/question-bank/questions/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      Swal.fire("Deleted!", "Question deleted successfully.", "success");
      fetchQuestions();
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.message || "Failed to delete.", "error");
    }
  };

  const handleAIGenerate = async () => {
    if (!aiForm.course) {
      Swal.fire("Error!", "Please select a course for question generation.", "error");
      return;
    }

    setAiGenerating(true);
    setGeneratedQuestions([]);

    // Show progress indicator
    Swal.fire({
      title: 'Generating Questions...',
      html: `
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <p>AI is generating ${aiForm.num_questions} ${aiForm.difficulty.toLowerCase()} questions.</p>
          <p class="text-muted small">This may take 30-60 seconds depending on the number of questions.</p>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Get the selected course to use its title as the topic
      const selectedCourse = courses.find(c => c.id === parseInt(aiForm.course));
      const topic = selectedCourse?.title || "General";

      // Create an AbortController for timeout/cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/question-bank/questions/generate_with_ai/`,
        {
          topic: topic,
          difficulty: aiForm.difficulty,
          num_questions: aiForm.num_questions,
          category: aiForm.category || null,
          course: aiForm.course || null,
          additional_context: aiForm.additional_context,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 300000, // 5 minute timeout
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      Swal.close();

      if (response.data.success) {
        setGeneratedQuestions(response.data.questions || []);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.data.message || `Successfully generated ${response.data.questions?.length || 0} questions!`,
          timer: 3000,
          showConfirmButton: true
        });
        fetchQuestions();
      } else {
        Swal.fire("Error!", response.data.error || "Failed to generate questions.", "error");
      }
    } catch (error) {
      Swal.close();

      let errorMsg = "Failed to generate questions.";
      let errorTitle = "Generation Failed";
      let errorIcon = "error";

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMsg = "Request timed out. AI generation is taking longer than expected. The questions may still be generated in the background. Please check the question list after a few minutes.";
      } else if (error.name === 'AbortError' || error.message.includes('abort')) {
        errorMsg = "Request was cancelled due to timeout.";
      } else if (error.response?.status === 429 || error.response?.data?.rate_limit || error.message.includes('429') || error.message.includes('Too Many Requests')) {
        // Rate limit error
        errorTitle = "Rate Limit Exceeded";
        errorIcon = "warning";
        const retryAfter = error.response?.data?.retry_after || 120;
        const minutes = Math.ceil(retryAfter / 60);
        errorMsg = `You have exceeded the AI service rate limit. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before generating more questions.`;
      } else if (error.response?.status === 400 && error.response?.data?.max_allowed) {
        // Handle validation error for too many questions
        errorMsg = `Maximum ${error.response.data.max_allowed} questions allowed per generation. You requested ${error.response.data.requested} questions. Please reduce the number and try again.`;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      // Show different tips based on error type
      const tips = error.response?.status === 429 || error.message.includes('429')
        ? [
            'Wait 2-5 minutes before trying again',
            'Reduce the number of questions per generation',
            'Check your AI service subscription/quota',
            'Contact administrator to upgrade API limits'
          ]
        : [
            'Try generating fewer questions at a time (5-10 instead of 20)',
            'Check your internet connection',
            'Contact administrator if the problem persists'
          ];

      Swal.fire({
        icon: errorIcon,
        title: errorTitle,
        html: `
          <p>${errorMsg}</p>
          <p class="text-muted small mt-2">Tips:</p>
          <ul class="text-start text-muted small">
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        `,
        confirmButtonText: 'OK'
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleImportToCertification = async () => {
    if (!selectedCertification) {
      Swal.fire("Error!", "Please select a certification.", "error");
      return;
    }

    if (selectedRows.length === 0) {
      Swal.fire("Error!", "Please select questions to import.", "error");
      return;
    }

    setImporting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/question-bank/questions/import_to_certification/`,
        {
          question_ids: selectedRows.map((q) => q.id),
          certification_id: parseInt(selectedCertification),
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.success) {
        Swal.fire("Success!", response.data.message, "success");
        setShowImportModal(false);
        setSelectedRows([]);
        setSelectedCertification("");
      }
    } catch (error) {
      Swal.fire("Error!", error.response?.data?.error || "Failed to import questions.", "error");
    } finally {
      setImporting(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = { EASY: "success", MEDIUM: "warning", HARD: "danger" };
    return <Badge bg={colors[difficulty] || "secondary"}>{difficulty}</Badge>;
  };

  const getSourceBadge = (source) => {
    const colors = { MANUAL: "primary", AI_GENERATED: "info", IMPORTED: "secondary" };
    const labels = { MANUAL: "Manual", AI_GENERATED: "AI Generated", IMPORTED: "Imported" };
    return <Badge bg={colors[source] || "secondary"}>{labels[source] || source}</Badge>;
  };

  return (
    <Layout title="Question Bank" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Question Bank</Block.Title>
            <p className="text-muted">Manage questions for certifications and quizzes</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <Button variant="success" className="me-2" onClick={() => setShowAIModal(true)}>
              <Icon name="spark" className="me-1" /> AI Generate
            </Button>
            {selectedRows.length > 0 && (
              <Button variant="info" className="me-2" onClick={() => setShowImportModal(true)}>
                <Icon name="upload" className="me-1" /> Import to Certification ({selectedRows.length})
              </Button>
            )}
            <Link to="/QuestionBank/create-question" className="btn btn-primary">
              <Icon name="plus" className="me-1" /> Add Question
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card className="p-3 mb-3">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="align-items-center g-2">
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                >
                  <option value="">All Sources</option>
                  <option value="MANUAL">Manual</option>
                  <option value="AI_GENERATED">AI Generated</option>
                  <option value="IMPORTED">Imported</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={1}>
                <Button variant="outline-primary" type="submit" className="w-100">
                  <Icon name="search" />
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading questions...</p>
          </div>
        ) : Object.keys(groupedQuestions).length === 0 ? (
          <Card className="p-5 text-center">
            <Icon name="inbox" style={{ fontSize: "48px", opacity: 0.3 }} />
            <h5 className="mt-3">No Questions Found</h5>
            <p className="text-muted">Try adjusting your filters or generate questions using AI.</p>
          </Card>
        ) : (
          <div className="course-cards-container">
            {Object.values(groupedQuestions).map((courseGroup) => {
              const isExpanded = expandedCourses[courseGroup.id];
              const questionCount = courseGroup.questions.length;

              return (
                <Card key={courseGroup.id} className="mb-3 shadow-sm">
                  <Card.Header
                    className="d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer', background: 'linear-gradient(to right, #e0eafc, #cfdef3)' }}
                    onClick={() => toggleCourseExpand(courseGroup.id)}
                  >
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        <span className="ms-2">{courseGroup.title}</span>
                      </h5>
                      <Badge bg="primary" className="ms-3">
                        {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                      </Badge>
                    </div>
                  </Card.Header>

                  {isExpanded && (
                    <Card.Body className="p-0">
                      {courseGroup.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="p-3 border-bottom"
                          style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff' }}
                        >
                          <Row className="align-items-start">
                            <Col md={1} className="text-center">
                              <Form.Check
                                type="checkbox"
                                checked={isQuestionSelected(question.id)}
                                onChange={() => toggleQuestionSelect(question)}
                              />
                            </Col>
                            <Col md={7}>
                              <div className="mb-2">
                                <strong>Q{index + 1}:</strong>{' '}
                                <span dangerouslySetInnerHTML={renderTextWithCode(question.text)}></span>
                              </div>
                              <div className="d-flex gap-2 flex-wrap">
                                {getDifficultyBadge(question.difficulty)}
                                {getSourceBadge(question.source)}
                                {question.category_name && (
                                  <Badge bg="secondary">{question.category_name}</Badge>
                                )}
                                <Badge bg={question.is_active ? "success" : "secondary"}>
                                  {question.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge bg="light" text="dark">
                                  {question.options_count || 0} Options
                                </Badge>
                              </div>
                            </Col>
                            <Col md={4} className="text-end">
                              <div className="d-flex gap-2 justify-content-end">
                                <Link
                                  to={`/QuestionBank/view-question/${question.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                  title="View"
                                >
                                  <Icon name="eye" /> View
                                </Link>
                                <Link
                                  to={`/QuestionBank/edit-question/${question.id}`}
                                  className="btn btn-sm btn-outline-success"
                                  title="Edit"
                                >
                                  <Icon name="edit" /> Edit
                                </Link>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete"
                                  onClick={() => deleteConfirm(question.id)}
                                >
                                  <Icon name="trash" /> Delete
                                </button>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </Card.Body>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Block>

      <Modal show={showAIModal} onHide={() => setShowAIModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="spark" className="me-2" />
            AI Question Generator
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Course *</Form.Label>
              <Form.Select
                value={aiForm.course}
                onChange={(e) => setAiForm({ ...aiForm, course: e.target.value })}
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} {course.course_id ? `(${course.course_id})` : ''}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select the course for which to generate questions. The course title will be used as the topic.
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Difficulty</Form.Label>
                  <Form.Select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Questions</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="10"
                    value={aiForm.num_questions}
                    onChange={(e) => setAiForm({ ...aiForm, num_questions: parseInt(e.target.value) || 5 })}
                  />
                  <Form.Text className="text-warning">
                    <strong>Maximum 10 questions per generation</strong> to prevent timeouts. Generate multiple batches if you need more.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category (Optional)</Form.Label>
                  <Form.Select
                    value={aiForm.category}
                    onChange={(e) => setAiForm({ ...aiForm, category: e.target.value })}
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Additional Context (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add any specific instructions or context for the AI..."
                value={aiForm.additional_context}
                onChange={(e) => setAiForm({ ...aiForm, additional_context: e.target.value })}
              />
            </Form.Group>
          </Form>

          {generatedQuestions.length > 0 && (
            <div className="mt-4">
              <h6>Generated Questions ({generatedQuestions.length})</h6>
              <div className="border rounded p-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                {generatedQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="mb-3 pb-3 border-bottom">
                    <strong>Q{idx + 1}:</strong>{' '}
                    <span dangerouslySetInnerHTML={renderTextWithCode(q.text)}></span>
                    <div className="mt-2 ms-3">
                      {q.options?.map((opt, optIdx) => (
                        <div key={optIdx} className={opt.is_correct ? "text-success fw-bold" : ""}>
                          {String.fromCharCode(65 + optIdx)}.{' '}
                          <span dangerouslySetInnerHTML={renderTextWithCode(opt.text)}></span>
                          {opt.is_correct && " (Correct)"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAIModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={handleAIGenerate} disabled={aiGenerating}>
            {aiGenerating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Generating...
              </>
            ) : (
              <>
                <Icon name="spark" className="me-1" /> Generate Questions
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Import Questions to Certification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You have selected <strong>{selectedRows.length}</strong> questions to import.
          </p>
          <Form.Group>
            <Form.Label>Select Certification</Form.Label>
            <Form.Select
              value={selectedCertification}
              onChange={(e) => setSelectedCertification(e.target.value)}
            >
              <option value="">-- Select Certification --</option>
              {certifications.map((cert) => (
                <option key={cert.id} value={cert.id}>
                  {cert.title} ({cert.course_title || "No Course"})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImportToCertification} disabled={importing}>
            {importing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Importing...
              </>
            ) : (
              "Import Questions"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default QuestionBankList;
