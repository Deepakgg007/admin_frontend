import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner, Alert, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function CertificateCreate() {
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
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Question Bank Import Modal state
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
  const [questionBankList, setQuestionBankList] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loadingQuestionBank, setLoadingQuestionBank] = useState(false);

  // AI Generation Modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSettings, setAISettings] = useState({
    num_questions: 5,
    difficulty: 'MEDIUM',
    provider: 'OPENROUTER',
    api_key: '',
    model: 'openai/gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 4000,
    additional_context: ''
  });

  // Fetch courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await axios.get(`${API_BASE_URL}/api/courses/`, {
          params: { per_page: 1000 },
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = res.data.data || [];

        setCourses(data);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch courses", "error");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [authToken]);

  // Handle basic input changes
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Add new question
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
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  // Update question
  const updateQuestion = (questionIndex, field, value) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, idx) => 
        idx === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  // Delete question
  const deleteQuestion = (questionIndex) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== questionIndex)
    }));
  };

  // Add option to question
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

  // Update option
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

  // Delete option
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

  // Fetch Question Bank
  const fetchQuestionBank = async (courseId) => {
    try {
      setLoadingQuestionBank(true);
      const params = { per_page: 100, is_active: true };

      // Filter by course if specified
      if (courseId) {
        params.course = courseId;
      }

      const res = await axios.get(`${API_BASE_URL}/api/admin/question-bank/questions/`, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = res.data.data || res.data.results || [];

      // Filter out questions that have already been imported
      const importedQuestionBankIds = form.questions
        .filter(q => q.question_bank_id) // Only check questions with question_bank_id
        .map(q => q.question_bank_id);

      const availableQuestions = data.filter(q => !importedQuestionBankIds.includes(q.id));

      setQuestionBankList(availableQuestions);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch question bank", "error");
    } finally {
      setLoadingQuestionBank(false);
    }
  };

  // Open Question Bank Modal
  const openQuestionBankModal = () => {
    // Check if course is selected
    if (!form.course) {
      Swal.fire({
        icon: "warning",
        title: "Please select a course first",
        text: "You need to select a course before importing questions from the Question Bank.",
      });
      return;
    }

    setShowQuestionBankModal(true);
    setSelectedQuestions([]);
    fetchQuestionBank(form.course);
  };

  // Toggle question selection
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Toggle all questions selection
  const toggleSelectAllQuestions = () => {
    if (selectedQuestions.length === questionBankList.length) {
      // If all are selected, deselect all
      setSelectedQuestions([]);
    } else {
      // Select all questions
      setSelectedQuestions(questionBankList.map(q => q.id));
    }
  };

  // Import selected questions from Question Bank
  const importQuestionsFromBank = async () => {
    if (selectedQuestions.length === 0) {
      Swal.fire("Warning", "Please select at least one question", "warning");
      return;
    }

    try {
      // Show loading indicator
      Swal.fire({
        title: 'Importing Questions...',
        text: 'Please wait while we fetch the complete question details.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Fetch full details for each selected question (to get options)
      const questionDetailsPromises = selectedQuestions.map(questionId =>
        axios.get(`${API_BASE_URL}/api/admin/question-bank/questions/${questionId}/`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      );

      const questionResponses = await Promise.all(questionDetailsPromises);
      const selectedQuestionData = questionResponses.map(res => res.data);

      const maxOrder = form.questions.length > 0
        ? Math.max(...form.questions.map(q => q.order))
        : -1;

      const newQuestions = selectedQuestionData.map((q, idx) => {
        // Now we have the full question data with options
        const questionOptions = q.options || [];

        const mappedOptions = questionOptions.map((opt, optIdx) => ({
          id: Date.now() + idx * 100 + optIdx,
          text: opt.text,
          is_correct: opt.is_correct || false
        }));

        return {
          id: Date.now() + idx,
          question_bank_id: q.id, // Store original question bank ID to prevent duplicates
          text: q.text,
          order: maxOrder + idx + 1,
          weight: q.weight || 1,
          is_multiple_correct: q.is_multiple_correct || false,
          is_active: true,
          options: mappedOptions
        };
      });

      // Validate that all questions have at least 2 options
      const questionsWithoutEnoughOptions = newQuestions.filter(q => !q.options || q.options.length < 2);
      if (questionsWithoutEnoughOptions.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Import Failed",
          html: `${questionsWithoutEnoughOptions.length} question(s) don't have enough answer options.<br><br>` +
                `Questions in the Question Bank must have at least 2 options to be imported.<br><br>` +
                `Please add options to these questions in the Question Bank first.`,
        });
        return;
      }

      setForm(prev => ({
        ...prev,
        questions: [...prev.questions, ...newQuestions]
      }));

      setShowQuestionBankModal(false);
      Swal.fire({
        icon: "success",
        title: "Questions imported successfully!",
        text: `${selectedQuestions.length} question(s) added`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Import Failed",
        text: "Failed to import questions. Please try again.",
      });
    }
  };

  // Open AI Generation Modal
  const openAIModal = () => {
    if (!form.course) {
      Swal.fire({
        icon: "warning",
        title: "Please select a course first",
        text: "You need to select a course before generating questions with AI.",
      });
      return;
    }
    setShowAIModal(true);
  };

  // Handle AI settings change
  const handleAISettingsChange = (e) => {
    const { name, value } = e.target;
    setAISettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate questions with AI
  const generateQuestionsWithAI = async () => {
    try {
      setGeneratingAI(true);

      // Validate inputs
      if (!aiSettings.api_key) {
        Swal.fire("Error", "Please enter API Key", "error");
        return;
      }

      if (aiSettings.num_questions < 1 || aiSettings.num_questions > 20) {
        Swal.fire("Error", "Number of questions must be between 1 and 20", "error");
        return;
      }

      // Get course name
      const selectedCourse = courses.find(c => c.id === parseInt(form.course));
      const courseName = selectedCourse?.title || "selected course";

      // Build the AI prompt
      const prompt = `Generate ${aiSettings.num_questions} multiple-choice questions for a certification exam.

Course: ${courseName}
Difficulty: ${aiSettings.difficulty}
${aiSettings.additional_context ? `Additional Context: ${aiSettings.additional_context}` : ''}

Requirements:
1. Each question must have 4 options
2. Mark which option(s) are correct
3. Provide a brief explanation for the correct answer
4. Questions should be relevant to the course topic
5. Difficulty level should match "${aiSettings.difficulty}"

Return ONLY a valid JSON array in this exact format:
[
  {
    "text": "Question text here?",
    "is_multiple_correct": false,
    "explanation": "Brief explanation of the correct answer",
    "options": [
      {"text": "Option 1", "is_correct": true},
      {"text": "Option 2", "is_correct": false},
      {"text": "Option 3", "is_correct": false},
      {"text": "Option 4", "is_correct": false}
    ]
  }
]`;

      // Call AI API based on provider
      let aiResponse;

      if (aiSettings.provider === 'OPENROUTER') {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: aiSettings.model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert educational content creator. Generate high-quality multiple choice questions in valid JSON format only. Do not include any text outside the JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: parseFloat(aiSettings.temperature),
            max_tokens: parseInt(aiSettings.max_tokens)
          },
          {
            headers: {
              'Authorization': `Bearer ${aiSettings.api_key}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Educational Platform Question Generator'
            }
          }
        );
        aiResponse = response.data.choices[0].message.content;
      } else if (aiSettings.provider === 'GEMINI') {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${aiSettings.model}:generateContent?key=${aiSettings.api_key}`,
          {
            contents: [{
              parts: [{
                text: `You are an expert educational content creator. Generate high-quality multiple choice questions in valid JSON format only. Do not include any text outside the JSON.\n\n${prompt}`
              }]
            }],
            generationConfig: {
              temperature: parseFloat(aiSettings.temperature),
              maxOutputTokens: parseInt(aiSettings.max_tokens)
            }
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
        aiResponse = response.data.candidates[0].content.parts[0].text;
      } else if (aiSettings.provider === 'ZAI') {
        const response = await axios.post(
          'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          {
            model: aiSettings.model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert educational content creator. Generate high-quality multiple choice questions in valid JSON format only. Do not include any text outside the JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: parseFloat(aiSettings.temperature),
            max_tokens: parseInt(aiSettings.max_tokens)
          },
          {
            headers: {
              'Authorization': `Bearer ${aiSettings.api_key}`,
              'Content-Type': 'application/json'
            }
          }
        );
        aiResponse = response.data.choices[0].message.content;
      }

      // Parse the AI response
      let generatedQuestions;
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          generatedQuestions = JSON.parse(jsonMatch[0]);
        } else {
          generatedQuestions = JSON.parse(aiResponse);
        }
      } catch (parseError) {
        Swal.fire("Error", "Failed to parse AI response. Please try again.", "error");
        return;
      }

      // Validate and format questions
      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        Swal.fire("Error", "No valid questions generated. Please try again.", "error");
        return;
      }

      const maxOrder = form.questions.length > 0
        ? Math.max(...form.questions.map(q => q.order))
        : -1;

      const formattedQuestions = generatedQuestions.map((q, idx) => ({
        id: Date.now() + idx,
        text: q.text,
        order: maxOrder + idx + 1,
        weight: 1,
        is_multiple_correct: q.is_multiple_correct || false,
        is_active: true,
        options: q.options.map((opt, optIdx) => ({
          id: Date.now() + idx * 100 + optIdx,
          text: opt.text,
          is_correct: opt.is_correct || false
        }))
      }));

      // Add questions to form
      setForm(prev => ({
        ...prev,
        questions: [...prev.questions, ...formattedQuestions]
      }));

      setShowAIModal(false);
      Swal.fire({
        icon: "success",
        title: "Questions generated successfully!",
        text: `${formattedQuestions.length} question(s) added from AI`,
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || "Failed to generate questions";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setGeneratingAI(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate form
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

    // Validate that each question has at least 2 options
    for (let i = 0; i < form.questions.length; i++) {
      const question = form.questions[i];
      if (question.options.length < 2) {
        Swal.fire("Error", `Question ${i + 1} must have at least 2 options`, "error");
        setIsSubmitting(false);
        return;
      }
      
      // Validate that at least one option is correct
      const hasCorrectOption = question.options.some(opt => opt.is_correct);
      if (!hasCorrectOption) {
        Swal.fire("Error", `Question ${i + 1} must have at least one correct answer`, "error");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Prepare data for API - SIMPLIFIED PAYLOAD
      const payload = {
        course: parseInt(form.course),
        title: form.title,
        description: form.description,
        passing_score: parseInt(form.passing_score),
        duration_minutes: parseInt(form.duration_minutes),
        max_attempts: parseInt(form.max_attempts),
        is_active: form.is_active,
        questions: form.questions.map((q, index) => ({
          text: q.text,
          order: parseInt(q.order || index),
          weight: parseInt(q.weight || 1),
          is_multiple_correct: q.is_multiple_correct || false,
          is_active: q.is_active !== false, // Default to true if not specified
          options: q.options.map(opt => ({
            text: opt.text,
            is_correct: opt.is_correct || false
          }))
        }))
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/cert/certifications/`,
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
        title: "Certificate created successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/Certificates/list-certificate");
    } catch (error) {
      let errorMessage = "Failed to create certificate.";
      
      if (error.response?.data) {
        // Handle backend validation errors
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'object') {
          // Handle field-level errors
          const fieldErrors = Object.entries(error.response.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              } else if (typeof messages === 'object') {
                return Object.entries(messages)
                  .map(([subField, subMessages]) => `${field}.${subField}: ${Array.isArray(subMessages) ? subMessages.join(', ') : subMessages}`)
                  .join('\n');
              }
              return `${field}: ${messages}`;
            })
            .join('\n');
          errorMessage = fieldErrors || "Validation error occurred.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Specific handling for the backend method error
      if (errorMessage.includes("validate_options")) {
        errorMessage = "Backend validation error: The certification system needs to be fixed on the server side. Please contact the development team.";
      }
      
      Swal.fire({
        icon: "error",
        title: "Error!",
        html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">
               <strong>Error Details:</strong><br/>
               <pre style="white-space: pre-wrap; font-size: 12px;">${errorMessage}</pre>
               </div>`,
        width: 600
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Create Certificate" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Create Course Completion Certificate</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Certificates/list-certificate">Certificates</Link></li>
                <li className="breadcrumb-item active">Create</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Certificates/list-certificate" className="btn btn-primary">
              <Icon name="list" /> View All
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
                        {loadingCourses ? (
                          <div className="text-center py-3">
                            <Spinner size="sm" animation="border" className="me-2" />
                            Loading courses...
                          </div>
                        ) : (
                          <>
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
                            <Form.Control.Feedback type="invalid">
                              {errors.course}
                            </Form.Control.Feedback>
                            {courses.length === 0 && (
                              <Form.Text className="text-warning">
                                No courses available. Please create courses first.
                              </Form.Text>
                            )}
                            {courses.length > 0 && (
                              <Form.Text className="text-muted">
                                Found {courses.length} course(s)
                              </Form.Text>
                            )}
                          </>
                        )}
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
                          placeholder="e.g., Final Assessment for Web Development"
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
                          placeholder="Describe the certificate assessment..."
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
                  <div className="d-flex gap-2">
                    <Button variant="outline-success" size="sm" onClick={openAIModal}>
                      <Icon name="spark" /> Generate with AI
                    </Button>
                    <Button variant="outline-primary" size="sm" onClick={openQuestionBankModal}>
                      <Icon name="archive" /> Import from Question Bank
                    </Button>
                    <Button variant="primary" size="sm" onClick={addQuestion}>
                      <Icon name="plus" /> Add Question
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {form.questions.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      No questions added yet. Click "Add Question" to get started.
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
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={12} className="text-center mt-4">
              <Button variant="primary" type="submit" disabled={isSubmitting || loadingCourses} size="lg">
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating Certificate...
                  </>
                ) : (
                  "Create Certificate"
                )}
              </Button>
              <Link to="/Certificates/list-certificate" className="btn btn-outline-primary ms-2">
                Cancel
              </Link>
            </Col>
          </Row>
        </Form>
      </Block>

      {/* AI Generation Modal */}
      <Modal show={showAIModal} onHide={() => setShowAIModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Generate Questions with AI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={12}>
                <Alert variant="info">
                  <Icon name="info-fill" className="me-2" />
                  Generate MCQ questions for: <strong>{courses.find(c => c.id === parseInt(form.course))?.title || 'selected course'}</strong>
                </Alert>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Number of Questions *</Form.Label>
                  <Form.Control
                    type="number"
                    name="num_questions"
                    value={aiSettings.num_questions}
                    onChange={handleAISettingsChange}
                    min="1"
                    max="20"
                    required
                  />
                  <Form.Text className="text-muted">
                    Between 1 and 20 questions
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Difficulty Level *</Form.Label>
                  <Form.Select
                    name="difficulty"
                    value={aiSettings.difficulty}
                    onChange={handleAISettingsChange}
                    required
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>AI Provider *</Form.Label>
                  <Form.Select
                    name="provider"
                    value={aiSettings.provider}
                    onChange={handleAISettingsChange}
                    required
                  >
                    <option value="OPENROUTER">OpenRouter</option>
                    <option value="GEMINI">Google Gemini</option>
                    <option value="ZAI">Z.AI / BigModel</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Model Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={aiSettings.model}
                    onChange={handleAISettingsChange}
                    placeholder="e.g., openai/gpt-4o-mini"
                    required
                  />
                  <Form.Text className="text-muted">
                    {aiSettings.provider === 'OPENROUTER' && 'e.g., openai/gpt-4o-mini'}
                    {aiSettings.provider === 'GEMINI' && 'e.g., gemini-1.5-flash'}
                    {aiSettings.provider === 'ZAI' && 'e.g., glm-4-flash'}
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>API Key *</Form.Label>
                  <Form.Control
                    type="password"
                    name="api_key"
                    value={aiSettings.api_key}
                    onChange={handleAISettingsChange}
                    placeholder="Enter your API key"
                    required
                  />
                  <Form.Text className="text-muted">
                    Your API key will not be stored
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Temperature</Form.Label>
                  <Form.Control
                    type="number"
                    name="temperature"
                    value={aiSettings.temperature}
                    onChange={handleAISettingsChange}
                    step="0.1"
                    min="0"
                    max="2"
                  />
                  <Form.Text className="text-muted">
                    0 = deterministic, 2 = creative (0-2)
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Max Tokens</Form.Label>
                  <Form.Control
                    type="number"
                    name="max_tokens"
                    value={aiSettings.max_tokens}
                    onChange={handleAISettingsChange}
                    min="100"
                    max="16000"
                  />
                  <Form.Text className="text-muted">
                    Maximum response length
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Additional Context / Rules (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="additional_context"
                    value={aiSettings.additional_context}
                    onChange={handleAISettingsChange}
                    placeholder="Add any specific instructions or context for the AI model..."
                  />
                  <Form.Text className="text-muted">
                    e.g., "Focus on practical applications" or "Include code examples"
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAIModal(false)} disabled={generatingAI}>
            Cancel
          </Button>
          <Button variant="primary" onClick={generateQuestionsWithAI} disabled={generatingAI}>
            {generatingAI ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Generating Questions...
              </>
            ) : (
              <>
                <Icon name="spark" className="me-1" />
                Generate Questions
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Question Bank Import Modal */}
      <Modal show={showQuestionBankModal} onHide={() => setShowQuestionBankModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Import Questions from Question Bank</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {loadingQuestionBank ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading questions...</p>
            </div>
          ) : questionBankList.length === 0 ? (
            <Alert variant="info">
              <strong>No new questions available to import.</strong>
              <p className="mb-0 mt-2">
                {form.questions.filter(q => q.question_bank_id).length > 0
                  ? 'All available questions from the Question Bank have already been imported for this certificate.'
                  : `Please create questions for ${courses.find(c => c.id === parseInt(form.course))?.title || 'this course'} in the Question Bank first.`
                }
              </p>
            </Alert>
          ) : (
            <>
              <Alert variant="info" className="mb-3">
                <Icon name="info-fill" className="me-2" />
                Showing questions for: <strong>{courses.find(c => c.id === parseInt(form.course))?.title || 'selected course'}</strong>
                {form.questions.filter(q => q.question_bank_id).length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      ({form.questions.filter(q => q.question_bank_id).length} question(s) already imported and hidden from this list)
                    </small>
                  </div>
                )}
              </Alert>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted mb-0">
                  Select questions to import ({selectedQuestions.length} selected)
                </p>
                <Form.Check
                  type="checkbox"
                  label="Select All"
                  checked={questionBankList.length > 0 && selectedQuestions.length === questionBankList.length}
                  onChange={toggleSelectAllQuestions}
                  className="fw-bold"
                />
              </div>
              {questionBankList.map((question) => (
                <Card
                  key={question.id}
                  className={`mb-3 ${selectedQuestions.includes(question.id) ? 'border-primary' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleQuestionSelection(question.id)}
                >
                  <Card.Body>
                    <div className="d-flex align-items-start">
                      <Form.Check
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => {}}
                        className="me-3 mt-1"
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-2">{question.text}</h6>
                        <div className="d-flex gap-3 text-muted small">
                          <span>
                            <strong>Difficulty:</strong> {question.difficulty}
                          </span>
                          <span>
                            <strong>Weight:</strong> {question.weight}
                          </span>
                          <span>
                            <strong>Options:</strong> {question.options_count}
                          </span>
                          {question.category_name && (
                            <span>
                              <strong>Category:</strong> {question.category_name}
                            </span>
                          )}
                        </div>
                        {question.tags && question.tags.length > 0 && (
                          <div className="mt-2">
                            {question.tags.map((tag, idx) => (
                              <span key={idx} className="badge bg-secondary me-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
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
            onClick={importQuestionsFromBank}
            disabled={selectedQuestions.length === 0}
          >
            Import {selectedQuestions.length > 0 && `(${selectedQuestions.length})`} Question{selectedQuestions.length !== 1 ? 's' : ''}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default CertificateCreate;