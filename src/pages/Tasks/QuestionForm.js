import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Badge, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from '../../layout/default';
import { Block, BlockHead, BlockHeadContent, BlockTitle, Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

const QuestionForm = () => {
  const { taskId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const questionId = searchParams.get('edit');

  const [task, setTask] = useState(null);
  const [questionType, setQuestionType] = useState('mcq');
  const [mcqQuestions, setMcqQuestions] = useState([{
    question_text: '',
    marks: 1,
    mcq_choice_1_text: '',
    mcq_choice_1_is_correct: false,
    mcq_choice_2_text: '',
    mcq_choice_2_is_correct: false,
    mcq_choice_3_text: '',
    mcq_choice_3_is_correct: false,
    mcq_choice_4_text: '',
    mcq_choice_4_is_correct: false,
    mcq_solution_explanation: ''
  }]);

  const [codingQuestion, setCodingQuestion] = useState({
    question_text: '',
    marks: 10,
    question_description: '',
    input_description: '',
    sample_input: '',
    output_format_description: '',
    sample_output: '',
    language: 'python',
    constraints: '',
    hints: '',
    starter_code: ''
  });

  useEffect(() => {
    // Reset form state first
    if (!questionId) {
      setMcqQuestions([{
        question_text: '',
        marks: 1,
        mcq_choice_1_text: '',
        mcq_choice_1_is_correct: false,
        mcq_choice_2_text: '',
        mcq_choice_2_is_correct: false,
        mcq_choice_3_text: '',
        mcq_choice_3_is_correct: false,
        mcq_choice_4_text: '',
        mcq_choice_4_is_correct: false,
        mcq_solution_explanation: ''
      }]);
      setCodingQuestion({
        question_text: '',
        marks: 10,
        question_description: '',
        input_description: '',
        sample_input: '',
        output_format_description: '',
        sample_output: '',
        language: 'python',
        constraints: '',
        hints: '',
        starter_code: ''
      });
      setQuestionType('mcq'); // Reset question type to default
    }

    fetchTask();
    if (questionId) {
      fetchQuestion();
    }
  }, [taskId, questionId]);

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

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/task-questions/${questionId}/`, {
        headers: getAuthHeaders()
      });
      const question = response.data.data || response.data;

      setQuestionType(question.question_type?.toLowerCase() || 'mcq');

      if (question.question_type === 'mcq' && question.mcq_details) {
        setMcqQuestions([{
          question_text: question.question_text,
          marks: question.marks,
          mcq_choice_1_text: question.mcq_details.choice_1_text || '',
          mcq_choice_1_is_correct: question.mcq_details.choice_1_is_correct || false,
          mcq_choice_2_text: question.mcq_details.choice_2_text || '',
          mcq_choice_2_is_correct: question.mcq_details.choice_2_is_correct || false,
          mcq_choice_3_text: question.mcq_details.choice_3_text || '',
          mcq_choice_3_is_correct: question.mcq_details.choice_3_is_correct || false,
          mcq_choice_4_text: question.mcq_details.choice_4_text || '',
          mcq_choice_4_is_correct: question.mcq_details.choice_4_is_correct || false,
          mcq_solution_explanation: question.mcq_details.solution_explanation || ''
        }]);
      } else if (question.question_type === 'coding' && question.coding_details) {
        setCodingQuestion({
          question_text: question.question_text,
          marks: question.marks,
          question_description: question.coding_details.problem_description || '',
          input_description: question.coding_details.input_description || '',
          sample_input: question.coding_details.sample_input || '',
          output_format_description: question.coding_details.output_description || '',
          sample_output: question.coding_details.sample_output || '',
          language: question.coding_details.language || 'python',
          constraints: question.coding_details.constraints || '',
          hints: question.coding_details.hints || '',
          starter_code: question.coding_details.starter_code || ''
        });
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load question'
      });
    }
  };

  const addMcqQuestion = () => {
    setMcqQuestions([...mcqQuestions, {
      question_text: '',
      marks: 1,
      mcq_choice_1_text: '',
      mcq_choice_1_is_correct: false,
      mcq_choice_2_text: '',
      mcq_choice_2_is_correct: false,
      mcq_choice_3_text: '',
      mcq_choice_3_is_correct: false,
      mcq_choice_4_text: '',
      mcq_choice_4_is_correct: false,
      mcq_solution_explanation: ''
    }]);
  };

  const removeMcqQuestion = (index) => {
    if (mcqQuestions.length > 1) {
      const updated = mcqQuestions.filter((_, i) => i !== index);
      setMcqQuestions(updated);
    }
  };

  const updateMcqQuestion = (index, field, value) => {
    const updated = [...mcqQuestions];
    updated[index][field] = value;
    setMcqQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (questionType === 'mcq') {
        // Save multiple MCQ questions
        for (let i = 0; i < mcqQuestions.length; i++) {
          const mcq = mcqQuestions[i];

          // Validation
          if (!mcq.question_text.trim()) {
            Swal.fire({
              icon: 'warning',
              title: 'Missing Information',
              text: `Question ${i + 1}: Question text is required`
            });
            return;
          }

          const hasCorrectAnswer = mcq.mcq_choice_1_is_correct || mcq.mcq_choice_2_is_correct ||
                                   mcq.mcq_choice_3_is_correct || mcq.mcq_choice_4_is_correct;
          if (!hasCorrectAnswer) {
            Swal.fire({
              icon: 'warning',
              title: 'Missing Correct Answer',
              text: `Question ${i + 1}: At least one choice must be marked as correct`
            });
            return;
          }

          const payload = {
            task: taskId,
            question_type: 'mcq',
            question_text: mcq.question_text,
            marks: mcq.marks,
            order: 0,
            mcq_data: {
              choice_1_text: mcq.mcq_choice_1_text,
              choice_1_is_correct: mcq.mcq_choice_1_is_correct,
              choice_2_text: mcq.mcq_choice_2_text,
              choice_2_is_correct: mcq.mcq_choice_2_is_correct,
              choice_3_text: mcq.mcq_choice_3_text,
              choice_3_is_correct: mcq.mcq_choice_3_is_correct,
              choice_4_text: mcq.mcq_choice_4_text,
              choice_4_is_correct: mcq.mcq_choice_4_is_correct,
              solution_explanation: mcq.mcq_solution_explanation
            }
          };

          if (questionId && i === 0) {
            // Update existing question
            await axios.put(`${API_BASE_URL}/api/task-questions/${questionId}/`, payload, {
              headers: getAuthHeaders()
            });
          } else {
            // Create new question
            await axios.post(`${API_BASE_URL}/api/task-questions/`, payload, {
              headers: getAuthHeaders()
            });
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `${mcqQuestions.length} MCQ question(s) ${questionId ? 'updated' : 'added'} successfully`,
          timer: 2000
        });
      } else if (questionType === 'coding') {
        // Validation
        if (!codingQuestion.question_text.trim()) {
          Swal.fire({
            icon: 'warning',
            title: 'Missing Information',
            text: 'Question title is required'
          });
          return;
        }

        if (!codingQuestion.question_description.trim()) {
          Swal.fire({
            icon: 'warning',
            title: 'Missing Information',
            text: 'Problem description is required'
          });
          return;
        }

        const payload = {
          task: taskId,
          question_type: 'coding',
          question_text: codingQuestion.question_text,
          marks: codingQuestion.marks,
          order: 0,
          coding_data: {
            problem_description: codingQuestion.question_description,
            input_description: codingQuestion.input_description,
            sample_input: codingQuestion.sample_input,
            output_description: codingQuestion.output_format_description,
            sample_output: codingQuestion.sample_output,
            language: codingQuestion.language,
            constraints: codingQuestion.constraints,
            hints: codingQuestion.hints,
            starter_code: codingQuestion.starter_code
          }
        };

        if (questionId) {
          await axios.put(`${API_BASE_URL}/api/task-questions/${questionId}/`, payload, {
            headers: getAuthHeaders()
          });
        } else {
          await axios.post(`${API_BASE_URL}/api/task-questions/`, payload, {
            headers: getAuthHeaders()
          });
        }

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Coding question ${questionId ? 'updated' : 'added'} successfully`,
          timer: 2000
        });
      }

      // Navigate back to task detail
      navigate(`/Tasks/task-detail/${taskId}`);
    } catch (error) {
      console.error('Error saving question:', error);
      console.error('Error details:', error.response?.data);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || JSON.stringify(error.response?.data) || 'Failed to save question'
      });
    }
  };

  return (
    <Layout title={`${questionId ? 'Edit' : 'Add'} Question`} content="container">
      <Block>
        <BlockHead>
          <BlockHeadContent>
            <BlockTitle tag="h2">{questionId ? 'Edit' : 'Add'} Question to "{task?.title}"</BlockTitle>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Tasks/task-management">Tasks</Link></li>
                <li className="breadcrumb-item"><Link to={`/Tasks/task-detail/${taskId}`}>{task?.title}</Link></li>
                <li className="breadcrumb-item active">{questionId ? 'Edit' : 'Add'} Question</li>
              </ol>
            </nav>
          </BlockHeadContent>
        </BlockHead>

        <Form onSubmit={handleSubmit}>
          {/* Question Type Selection */}
          <Card className="mb-4">
            <Card.Header>
              <h5>Question Type</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <div className="d-flex gap-3">
                  <Form.Check
                    type="radio"
                    label="Multiple Choice (MCQ)"
                    name="questionType"
                    value="mcq"
                    checked={questionType === 'mcq'}
                    onChange={(e) => setQuestionType(e.target.value)}
                    disabled={!!questionId}
                  />
                  <Form.Check
                    type="radio"
                    label="Coding Question"
                    name="questionType"
                    value="coding"
                    checked={questionType === 'coding'}
                    onChange={(e) => setQuestionType(e.target.value)}
                    disabled={!!questionId}
                  />
                </div>
                {questionId && <small className="text-muted">Question type cannot be changed when editing</small>}
              </Form.Group>
            </Card.Body>
          </Card>

          {/* MCQ Questions */}
          {questionType === 'mcq' && (
            <>
              {mcqQuestions.map((mcq, index) => (
                <Card key={index} className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5>
                      <Badge bg="primary">MCQ</Badge> Question {index + 1}
                    </h5>
                    {mcqQuestions.length > 1 && (
                      <Button variant="outline-danger" size="sm" onClick={() => removeMcqQuestion(index)}>
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
                        value={mcq.question_text}
                        onChange={(e) => updateMcqQuestion(index, 'question_text', e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Marks <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        value={mcq.marks}
                        onChange={(e) => updateMcqQuestion(index, 'marks', parseInt(e.target.value))}
                        min="1"
                        required
                        style={{ width: '150px' }}
                      />
                    </Form.Group>

                    <h6 className="mt-4 mb-3">Answer Choices</h6>
                    {[1, 2, 3, 4].map(choiceNum => (
                      <div key={choiceNum} className="mb-3 p-3 border rounded">
                        <Form.Group>
                          <Form.Label>Choice {choiceNum}</Form.Label>
                          <Form.Control
                            type="text"
                            value={mcq[`mcq_choice_${choiceNum}_text`]}
                            onChange={(e) => updateMcqQuestion(index, `mcq_choice_${choiceNum}_text`, e.target.value)}
                            placeholder={`Enter choice ${choiceNum} text`}
                          />
                        </Form.Group>
                        <Form.Group className="mt-2">
                          <Form.Check
                            type="checkbox"
                            label="This is the correct answer"
                            checked={mcq[`mcq_choice_${choiceNum}_is_correct`]}
                            onChange={(e) => updateMcqQuestion(index, `mcq_choice_${choiceNum}_is_correct`, e.target.checked)}
                          />
                        </Form.Group>
                      </div>
                    ))}

                    <Form.Group className="mt-4">
                      <Form.Label>Solution Explanation <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={mcq.mcq_solution_explanation}
                        onChange={(e) => updateMcqQuestion(index, 'mcq_solution_explanation', e.target.value)}
                        placeholder="Explain why the correct answer is correct"
                        required
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              ))}

              {!questionId && (
                <Button variant="outline-primary" onClick={addMcqQuestion} className="mb-4">
                  <Icon name="plus" /> Add Another MCQ Question
                </Button>
              )}
            </>
          )}

          {/* Coding Question */}
          {questionType === 'coding' && (
            <Card className="mb-4">
              <Card.Header>
                <h5><Badge bg="success">CODING</Badge> Question Details</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Question Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={codingQuestion.question_text}
                    onChange={(e) => setCodingQuestion({...codingQuestion, question_text: e.target.value})}
                    placeholder="e.g., Two Sum Problem"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Marks <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    value={codingQuestion.marks}
                    onChange={(e) => setCodingQuestion({...codingQuestion, marks: parseInt(e.target.value)})}
                    min="1"
                    required
                    style={{ width: '150px' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Problem Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={codingQuestion.question_description}
                    onChange={(e) => setCodingQuestion({...codingQuestion, question_description: e.target.value})}
                    placeholder="Describe the problem in detail"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Input Description <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={codingQuestion.input_description}
                        onChange={(e) => setCodingQuestion({...codingQuestion, input_description: e.target.value})}
                        placeholder="Describe the input format"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sample Input <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={codingQuestion.sample_input}
                        onChange={(e) => setCodingQuestion({...codingQuestion, sample_input: e.target.value})}
                        placeholder="Example: 5 3"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Output Format Description <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={codingQuestion.output_format_description}
                        onChange={(e) => setCodingQuestion({...codingQuestion, output_format_description: e.target.value})}
                        placeholder="Describe the expected output format"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sample Output <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={codingQuestion.sample_output}
                        onChange={(e) => setCodingQuestion({...codingQuestion, sample_output: e.target.value})}
                        placeholder="Example: 8"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Programming Language <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={codingQuestion.language}
                    onChange={(e) => setCodingQuestion({...codingQuestion, language: e.target.value})}
                    required
                  >
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="javascript">JavaScript</option>
                    <option value="csharp">C#</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="php">PHP</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Constraints</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={codingQuestion.constraints}
                    onChange={(e) => setCodingQuestion({...codingQuestion, constraints: e.target.value})}
                    placeholder="Enter problem constraints (e.g., time/space complexity, input limits)"
                  />
                  <Form.Text className="text-muted">
                    Optional: Specify constraints like time limits, input size limits, etc.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Hints</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={codingQuestion.hints}
                    onChange={(e) => setCodingQuestion({...codingQuestion, hints: e.target.value})}
                    placeholder="Enter hints to help students solve the problem"
                  />
                  <Form.Text className="text-muted">
                    Optional: Provide hints or tips to help students approach the problem.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Starter Code</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={codingQuestion.starter_code}
                    onChange={(e) => setCodingQuestion({...codingQuestion, starter_code: e.target.value})}
                    placeholder="# Enter starter code for students to begin with&#10;def solution():&#10;    # Write your code here&#10;    pass"
                    style={{ fontFamily: 'monospace', fontSize: '14px' }}
                  />
                  <Form.Text className="text-muted">
                    Optional: Provide pre-written code that students can start with. This will be pre-filled in the code editor.
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-2 mb-4">
            <Button type="submit" variant="primary">
              <Icon name="save" /> {questionId ? 'Update' : 'Save'} Question{questionType === 'mcq' && !questionId ? `(s)` : ''}
            </Button>
            <Link to={`/Tasks/task-detail/${taskId}`} className="btn btn-secondary">
              <Icon name="x" /> Cancel
            </Link>
          </div>
        </Form>
      </Block>
    </Layout>
  );
};

export default QuestionForm;
