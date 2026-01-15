import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Badge, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from '../../layout/default';
import { Block, BlockHead, BlockHeadContent, BlockTitle, Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

const MCQSetForm = () => {
  const { taskId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setId = searchParams.get('edit');

  const [task, setTask] = useState(null);
  const [setTitle, setSetTitle] = useState('');
  const [setDescription, setSetDescription] = useState('');
  const [mcqQuestions, setMcqQuestions] = useState([{
    question_text: '',
    marks: 1,
    choice_1_text: '',
    choice_1_is_correct: false,
    choice_2_text: '',
    choice_2_is_correct: false,
    choice_3_text: '',
    choice_3_is_correct: false,
    choice_4_text: '',
    choice_4_is_correct: false,
    solution_explanation: ''
  }]);

  useEffect(() => {
    fetchTask();
    if (setId) {
      fetchMCQSet();
    }
  }, [taskId, setId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTask = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        headers: getAuthHeaders()
      });
      setTask(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  };

  const fetchMCQSet = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/task-mcq-sets/${setId}/`, {
        headers: getAuthHeaders()
      });
      const set = response.data.data || response.data;

      setSetTitle(set.title || '');
      setSetDescription(set.description || '');

      if (set.mcq_questions && set.mcq_questions.length > 0) {
        const formattedQuestions = set.mcq_questions.map(q => ({
          question_text: q.question_text || '',
          marks: q.marks || 1,
          choice_1_text: q.choice_1_text || '',
          choice_1_is_correct: q.choice_1_is_correct || false,
          choice_2_text: q.choice_2_text || '',
          choice_2_is_correct: q.choice_2_is_correct || false,
          choice_3_text: q.choice_3_text || '',
          choice_3_is_correct: q.choice_3_is_correct || false,
          choice_4_text: q.choice_4_text || '',
          choice_4_is_correct: q.choice_4_is_correct || false,
          solution_explanation: q.solution_explanation || ''
        }));
        setMcqQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error('Error fetching MCQ set:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load MCQ set'
      });
    }
  };

  const handleAddMCQ = () => {
    setMcqQuestions([...mcqQuestions, {
      question_text: '',
      marks: 1,
      choice_1_text: '',
      choice_1_is_correct: false,
      choice_2_text: '',
      choice_2_is_correct: false,
      choice_3_text: '',
      choice_3_is_correct: false,
      choice_4_text: '',
      choice_4_is_correct: false,
      solution_explanation: ''
    }]);
  };

  const handleRemoveMCQ = (index) => {
    if (mcqQuestions.length > 1) {
      const updated = mcqQuestions.filter((_, i) => i !== index);
      setMcqQuestions(updated);
    }
  };

  const handleMCQChange = (index, field, value) => {
    const updated = [...mcqQuestions];
    updated[index][field] = value;
    setMcqQuestions(updated);
  };

  const validateForm = () => {
    if (!setTitle.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a title for the MCQ set'
      });
      return false;
    }

    for (let i = 0; i < mcqQuestions.length; i++) {
      const q = mcqQuestions[i];

      if (!q.question_text.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: `Please enter question text for Question ${i + 1}`
        });
        return false;
      }

      // Check if at least one correct answer is selected
      const hasCorrectAnswer = q.choice_1_is_correct || q.choice_2_is_correct ||
                               q.choice_3_is_correct || q.choice_4_is_correct;

      if (!hasCorrectAnswer) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: `Please select at least one correct answer for Question ${i + 1}`
        });
        return false;
      }

      // Check if all choices have text
      if (!q.choice_1_text.trim() || !q.choice_2_text.trim() ||
          !q.choice_3_text.trim() || !q.choice_4_text.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: `Please fill in all 4 choices for Question ${i + 1}`
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        task: parseInt(taskId),
        title: setTitle,
        description: setDescription,
        questions: mcqQuestions
      };

      if (setId) {
        // Update existing set
        await axios.put(`${API_BASE_URL}/api/task-mcq-sets/${setId}/`, payload, {
          headers: getAuthHeaders()
        });

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'MCQ Set updated successfully',
          timer: 2000
        });
      } else {
        // Create new set
        await axios.post(`${API_BASE_URL}/api/task-mcq-sets/`, payload, {
          headers: getAuthHeaders()
        });

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'MCQ Set created successfully',
          timer: 2000
        });
      }

      navigate(`/Tasks/task-detail/${taskId}`);
    } catch (error) {
      console.error('Error saving MCQ set:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save MCQ set'
      });
    }
  };

  return (
    <Layout title="MCQ Set Form" content="container">
      <Block>
        <BlockHead>
          <BlockHeadContent>
            <BlockTitle tag="h2">{setId ? 'Edit' : 'Create'} MCQ Set</BlockTitle>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Tasks/task-management">Tasks</Link></li>
                <li className="breadcrumb-item"><Link to={`/Tasks/task-detail/${taskId}`}>Task Detail</Link></li>
                <li className="breadcrumb-item active">{setId ? 'Edit' : 'Create'} MCQ Set</li>
              </ol>
            </nav>
          </BlockHeadContent>
        </BlockHead>

        <Form onSubmit={handleSubmit}>
          {/* Set Details Card */}
          <Card className="mb-4">
            <Card.Header>
              <Icon name="info" className="me-2" />
              MCQ Set Details
            </Card.Header>
            <Card.Body>
              {task && (
                <div className="mb-3">
                  <p><strong>Task:</strong> {task.title}</p>
                  <p><strong>Course:</strong> {task.course_title || 'N/A'}</p>
                  <p><strong>Topic:</strong> {task.topic_title || 'N/A'}</p>
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label>MCQ Set Title <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Python Basics Quiz, Data Structures Assessment"
                  value={setTitle}
                  onChange={(e) => setSetTitle(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Optional description for this MCQ set"
                  value={setDescription}
                  onChange={(e) => setSetDescription(e.target.value)}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* MCQ Questions */}
          <Card className="mb-4">
            <Card.Header>
              <Icon name="help-circle" className="me-2" />
              MCQ Questions ({mcqQuestions.length})
            </Card.Header>
            <Card.Body>
              {mcqQuestions.map((mcq, index) => (
                <Card key={index} className="mb-3 border-primary">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <strong>Question {index + 1}</strong>
                    {mcqQuestions.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveMCQ(index)}
                        type="button"
                      >
                        <Icon name="trash" /> Remove
                      </Button>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Question Text <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter the question"
                        value={mcq.question_text}
                        onChange={(e) => handleMCQChange(index, 'question_text', e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Marks</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={mcq.marks}
                        onChange={(e) => handleMCQChange(index, 'marks', parseInt(e.target.value) || 1)}
                        style={{ width: '100px' }}
                      />
                    </Form.Group>

                    {/* Choices */}
                    {[1, 2, 3, 4].map(choiceNum => (
                      <Card key={choiceNum} className="mb-2 bg-light">
                        <Card.Body>
                          <Row className="align-items-center">
                            <Col md={10}>
                              <Form.Group>
                                <Form.Label>Choice {choiceNum} <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={`Enter choice ${choiceNum}`}
                                  value={mcq[`choice_${choiceNum}_text`]}
                                  onChange={(e) => handleMCQChange(index, `choice_${choiceNum}_text`, e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={2}>
                              <Form.Check
                                type="checkbox"
                                label="Correct"
                                checked={mcq[`choice_${choiceNum}_is_correct`]}
                                onChange={(e) => handleMCQChange(index, `choice_${choiceNum}_is_correct`, e.target.checked)}
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}

                    <Form.Group className="mb-3">
                      <Form.Label>Solution Explanation</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Explain why this is the correct answer (optional)"
                        value={mcq.solution_explanation}
                        onChange={(e) => handleMCQChange(index, 'solution_explanation', e.target.value)}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              ))}

              {/* Add Question Button at the bottom */}
              <div className="text-center mt-3">
                <Button variant="outline-primary" onClick={handleAddMCQ} type="button">
                  <Icon name="plus" /> Add Another Question
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Actions */}
          <div className="d-flex gap-2 mb-4">
            <Button type="submit" variant="primary">
              <Icon name="save" /> {setId ? 'Update' : 'Create'} MCQ Set
            </Button>
            <Link to={`/Tasks/task-detail/${taskId}`} className="btn btn-secondary">
              <Icon name="arrow-left" /> Cancel
            </Link>
          </div>
        </Form>
      </Block>
    </Layout>
  );
};

export default MCQSetForm;
