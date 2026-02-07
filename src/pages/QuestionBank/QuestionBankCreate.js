import React, { useState, useEffect, useCallback } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function QuestionBankCreate() {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    text: "",
    explanation: "",
    is_multiple_correct: false,
    difficulty: "MEDIUM",
    category: "",
    course: "",
    tags: "",
    weight: 1,
    is_active: true,
  });

  const [options, setOptions] = useState([
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ]);

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
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data?.results || response.data?.data || response.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  }, [authToken]);

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, [fetchCategories, fetchCourses]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      newOptions[index] = { ...newOptions[index], [field]: value };
      return newOptions;
    });
  };

  const handleCorrectChange = (index) => {
    if (formData.is_multiple_correct) {
      setOptions((prev) => {
        const newOptions = [...prev];
        newOptions[index] = { ...newOptions[index], is_correct: !newOptions[index].is_correct };
        return newOptions;
      });
    } else {
      setOptions((prev) =>
        prev.map((opt, i) => ({
          ...opt,
          is_correct: i === index,
        }))
      );
    }
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions((prev) => [...prev, { text: "", is_correct: false }]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filledOptions = options.filter((opt) => opt.text.trim());
    if (filledOptions.length < 2) {
      Swal.fire("Error!", "Please provide at least 2 options.", "error");
      return;
    }

    const hasCorrect = filledOptions.some((opt) => opt.is_correct);
    if (!hasCorrect) {
      Swal.fire("Error!", "Please mark at least one option as correct.", "error");
      return;
    }

    if (!formData.text.trim()) {
      Swal.fire("Error!", "Please enter the question text.", "error");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        text: formData.text,
        explanation: formData.explanation,
        is_multiple_correct: formData.is_multiple_correct,
        difficulty: formData.difficulty,
        category: formData.category || null,
        course: formData.course || null,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        weight: parseInt(formData.weight) || 1,
        is_active: formData.is_active,
        options: filledOptions.map((opt, idx) => ({
          text: opt.text,
          is_correct: opt.is_correct,
          order: idx,
        })),
      };

      await axios.post(`${API_BASE_URL}/api/admin/question-bank/questions/`, payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      Swal.fire("Success!", "Question created successfully.", "success");
      navigate("/QuestionBank/list-questions");
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to create question.";
      Swal.fire("Error!", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Question" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Create Question</Block.Title>
            <p className="text-muted">Add a new question to the question bank</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <Button variant="outline-secondary" onClick={() => navigate("/QuestionBank/list-questions")}>
              <Icon name="arrow-left" className="me-1" /> Back to List
            </Button>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Question Text *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Enter the question text..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Explanation (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="explanation"
                value={formData.explanation}
                onChange={handleInputChange}
                placeholder="Explain the correct answer..."
              />
            </Form.Group>

            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Difficulty</Form.Label>
                  <Form.Select name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Course</Form.Label>
                  <Form.Select name="course" value={formData.course} onChange={handleInputChange}>
                    <option value="">No Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (Points)</Form.Label>
                  <Form.Control
                    type="number"
                    name="weight"
                    min="1"
                    max="10"
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tags (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., python, loops, basics"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 mt-4">
                  <Form.Check
                    type="checkbox"
                    name="is_multiple_correct"
                    label="Multiple Correct Answers"
                    checked={formData.is_multiple_correct}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 mt-4">
                  <Form.Check
                    type="checkbox"
                    name="is_active"
                    label="Active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Answer Options</h5>
                {options.length < 6 && (
                  <Button variant="outline-primary" size="sm" onClick={addOption}>
                    <Icon name="plus" /> Add Option
                  </Button>
                )}
              </div>

              {options.map((option, index) => (
                <Row key={index} className="mb-2 align-items-center">
                  <Col md={1} className="text-center">
                    <strong>{String.fromCharCode(65 + index)}.</strong>
                  </Col>
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Check
                      type={formData.is_multiple_correct ? "checkbox" : "radio"}
                      name="correctOption"
                      label="Correct"
                      checked={option.is_correct}
                      onChange={() => handleCorrectChange(index)}
                    />
                  </Col>
                  <Col md={1}>
                    {options.length > 2 && (
                      <Button variant="outline-danger" size="sm" onClick={() => removeOption(index)}>
                        <Icon name="trash" />
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
            </div>

            <hr />

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate("/QuestionBank/list-questions")}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Question"}
              </Button>
            </div>
          </Form>
        </Card>
      </Block>
    </Layout>
  );
}

export default QuestionBankCreate;
