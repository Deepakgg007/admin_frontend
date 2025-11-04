import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

const TaskQuestionList = ({ taskId, refreshKey, onRefresh }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [taskId, refreshKey]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/task-questions/?task=${taskId}`, {
        headers: getAuthHeaders()
      });
      const questionData = response.data.results || response.data.data || response.data;
      setQuestions(Array.isArray(questionData) ? questionData : []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load questions'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    const result = await Swal.fire({
      title: 'Delete Question?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/task-questions/${questionId}/`, {
          headers: getAuthHeaders()
        });
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Question has been deleted.',
          timer: 2000
        });
        fetchQuestions();
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting question:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete question'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading questions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5>Questions ({questions.length})</h5>
        <Link to={`/Tasks/question-form/${taskId}`} className="btn btn-primary">
          <Icon name="plus" /> Add Question
        </Link>
      </div>

      {questions.length > 0 ? (
        <div>
          {questions.map((question, index) => (
            <Card key={question.id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <strong className="me-2">Q{index + 1}:</strong>
                      <Badge bg={question.question_type === 'mcq' ? 'primary' : 'success'}>
                        {question.question_type === 'mcq' ? 'MCQ' : 'CODING'}
                      </Badge>
                      <Badge bg="secondary" className="ms-2">
                        {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                      </Badge>
                    </div>
                    <p className="mb-2">{question.question_text}</p>

                    {/* MCQ Choices */}
                    {question.question_type === 'mcq' && question.mcq_details && (
                      <div className="mt-3 ps-3">
                        <small className="text-muted d-block mb-2">Answer Choices:</small>
                        <div className="d-flex flex-column gap-1">
                          {[1, 2, 3, 4].map(num => {
                            const choiceText = question.mcq_details[`choice_${num}_text`];
                            const isCorrect = question.mcq_details[`choice_${num}_is_correct`];
                            if (!choiceText) return null;
                            return (
                              <div key={num} className={`p-2 rounded ${isCorrect ? 'bg-success bg-opacity-10 border border-success' : 'bg-light'}`}>
                                <small>
                                  {isCorrect && <Icon name="check-circle" className="text-success me-1" />}
                                  {choiceText}
                                </small>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Coding Details */}
                    {question.question_type === 'coding' && question.coding_details && (
                      <div className="mt-3 ps-3">
                        <small className="text-muted d-block">
                          Language: <Badge bg="info">{question.coding_details.language}</Badge>
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <Link
                      to={`/Tasks/question-form/${taskId}?edit=${question.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <Icon name="edit" />
                    </Link>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Icon name="trash" />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No questions added yet.</p>
          <Link to={`/Tasks/question-form/${taskId}`} className="btn btn-primary">
            <Icon name="plus" /> Add Your First Question
          </Link>
        </div>
      )}
    </div>
  );
};

export default TaskQuestionList;
