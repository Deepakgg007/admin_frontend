import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Badge, Button } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function QuestionBankView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/question-bank/questions/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setQuestion(response.data);
    } catch (error) {
      Swal.fire("Error!", "Failed to fetch question details.", "error");
      navigate("/QuestionBank/list-questions");
    } finally {
      setLoading(false);
    }
  }, [authToken, id, navigate]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const getDifficultyBadge = (difficulty) => {
    const colors = { EASY: "success", MEDIUM: "warning", HARD: "danger" };
    return <Badge bg={colors[difficulty] || "secondary"}>{difficulty}</Badge>;
  };

  const getSourceBadge = (source) => {
    const colors = { MANUAL: "primary", AI_GENERATED: "info", IMPORTED: "secondary" };
    const labels = { MANUAL: "Manual", AI_GENERATED: "AI Generated", IMPORTED: "Imported" };
    return <Badge bg={colors[source] || "secondary"}>{labels[source] || source}</Badge>;
  };

  if (loading) {
    return (
      <Layout title="Question Details" content="container">
        <div className="text-center py-5">Loading...</div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout title="Question Details" content="container">
        <div className="text-center py-5">Question not found.</div>
      </Layout>
    );
  }

  return (
    <Layout title="Question Details" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Question Details</Block.Title>
            <p className="text-muted">View question information</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to={`/QuestionBank/edit-question/${id}`} className="btn btn-primary me-2">
              <Icon name="edit" className="me-1" /> Edit
            </Link>
            <Button variant="outline-secondary" onClick={() => navigate("/QuestionBank/list-questions")}>
              <Icon name="arrow-left" className="me-1" /> Back to List
            </Button>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card className="p-4">
          <Row className="mb-4">
            <Col md={12}>
              <h5>Question</h5>
              <p className="fs-5">{question.text}</p>
            </Col>
          </Row>

          {question.explanation && (
            <Row className="mb-4">
              <Col md={12}>
                <h6>Explanation</h6>
                <p className="text-muted">{question.explanation}</p>
              </Col>
            </Row>
          )}

          <Row className="mb-4">
            <Col md={3}>
              <h6>Difficulty</h6>
              {getDifficultyBadge(question.difficulty)}
            </Col>
            <Col md={3}>
              <h6>Source</h6>
              {getSourceBadge(question.source)}
            </Col>
            <Col md={3}>
              <h6>Category</h6>
              <span>{question.category_name || "No Category"}</span>
            </Col>
            <Col md={3}>
              <h6>Course</h6>
              <span>{question.course_title || "No Course"}</span>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={3}>
              <h6>Weight (Points)</h6>
              <span>{question.weight}</span>
            </Col>
            <Col md={3}>
              <h6>Multiple Correct</h6>
              <Badge bg={question.is_multiple_correct ? "info" : "secondary"}>
                {question.is_multiple_correct ? "Yes" : "No"}
              </Badge>
            </Col>
            <Col md={3}>
              <h6>Status</h6>
              <Badge bg={question.is_active ? "success" : "secondary"}>
                {question.is_active ? "Active" : "Inactive"}
              </Badge>
            </Col>
            <Col md={3}>
              <h6>Created</h6>
              <span>{new Date(question.created_at).toLocaleDateString()}</span>
            </Col>
          </Row>

          {question.tags && question.tags.length > 0 && (
            <Row className="mb-4">
              <Col md={12}>
                <h6>Tags</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {question.tags.map((tag, idx) => (
                    <Badge key={idx} bg="light" text="dark">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>
          )}

          <hr />

          <h5 className="mb-3">Answer Options ({question.options?.length || 0})</h5>
          <div className="border rounded p-3">
            {question.options?.map((option, idx) => (
              <div
                key={option.id || idx}
                className={`d-flex align-items-center p-2 mb-2 rounded ${
                  option.is_correct ? "bg-success bg-opacity-10 border border-success" : "bg-light"
                }`}
              >
                <span className="fw-bold me-3">{String.fromCharCode(65 + idx)}.</span>
                <span className="flex-grow-1">{option.text}</span>
                {option.is_correct && (
                  <Badge bg="success">
                    <Icon name="check" className="me-1" /> Correct
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {question.source === "AI_GENERATED" && question.ai_model && (
            <>
              <hr />
              <h6>AI Generation Info</h6>
              <Row>
                <Col md={6}>
                  <p className="text-muted mb-1">Model: {question.ai_model}</p>
                </Col>
              </Row>
              {question.ai_prompt && (
                <div className="mt-2">
                  <p className="text-muted mb-1">Prompt used:</p>
                  <pre className="bg-light p-2 rounded" style={{ fontSize: "12px", maxHeight: "200px", overflow: "auto" }}>
                    {question.ai_prompt}
                  </pre>
                </div>
              )}
            </>
          )}
        </Card>
      </Block>
    </Layout>
  );
}

export default QuestionBankView;
