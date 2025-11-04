import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Button, Spinner, Row, Col, Tab, Tabs } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

function ChallengeCreate() {
  const { slug } = useParams(); // Get slug for edit mode
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    input_format: '',
    output_format: '',
    constraints: '',
    explanation: '',
    sample_input: '',
    sample_output: '',
    time_complexity: '',
    space_complexity: '',
    difficulty: 'MEDIUM',
    max_score: 100,
    category: 'implementation',
    tags: '',
    time_limit_seconds: 10,
    memory_limit_mb: 256,
  });

  // Test Cases State
  const [testCases, setTestCases] = useState([]);

  // Starter Codes State (for all 5 languages) - store both ID and code
  const [starterCodes, setStarterCodes] = useState({
    python: { id: null, code: '' },
    java: { id: null, code: '' },
    c_cpp: { id: null, code: '' },
    c: { id: null, code: '' },
    javascript: { id: null, code: '' },
  });

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    // Fetch categories
    axios
      .get(`${API_BASE_URL}/api/challenges/categories/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error(err));
  }, [authToken]);

  // Load existing challenge data if in edit mode
  useEffect(() => {
    if (slug) {
      setIsEditMode(true);
      setLoading(true);

      axios
        .get(`${API_BASE_URL}/api/challenges/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((res) => {
          const challenge = res.data;

          // Set form data
          setFormData({
            title: challenge.title || '',
            description: challenge.description || '',
            input_format: challenge.input_format || '',
            output_format: challenge.output_format || '',
            constraints: challenge.constraints || '',
            explanation: challenge.explanation || '',
            sample_input: challenge.sample_input || '',
            sample_output: challenge.sample_output || '',
            time_complexity: challenge.time_complexity || '',
            space_complexity: challenge.space_complexity || '',
            difficulty: challenge.difficulty || 'MEDIUM',
            max_score: challenge.max_score || 100,
            category: challenge.category || 'implementation',
            tags: challenge.tags || '',
            time_limit_seconds: challenge.time_limit_seconds || 10,
            memory_limit_mb: challenge.memory_limit_mb || 256,
          });

          // Set test cases
          if (challenge.test_cases && challenge.test_cases.length > 0) {
            setTestCases(
              challenge.test_cases.map((tc) => ({
                id: tc.id,
                input_data: tc.input_data,
                expected_output: tc.expected_output,
                is_sample: tc.is_sample,
                hidden: tc.hidden,
                score_weight: tc.score_weight || 1,
              }))
            );
          }

          // Set starter codes
          if (challenge.starter_codes && challenge.starter_codes.length > 0) {
            const codes = {
              python: { id: null, code: '' },
              java: { id: null, code: '' },
              c_cpp: { id: null, code: '' },
              c: { id: null, code: '' },
              javascript: { id: null, code: '' },
            };
            challenge.starter_codes.forEach((sc) => {
              codes[sc.language] = { id: sc.id, code: sc.code || '' };
            });
            setStarterCodes(codes);
          }
        })
        .catch((err) => {
          console.error(err);
          Swal.fire('Error', 'Failed to load challenge data.', 'error');
          navigate('/CodingChallenges/list-challenge');
        })
        .finally(() => setLoading(false));
    }
  }, [slug, authToken, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Test Case Functions
  const addTestCase = () => {
    setTestCases([...testCases, { input_data: '', expected_output: '', is_sample: false, hidden: false, score_weight: 1 }]);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  // Starter Code Functions
  const updateStarterCode = (language, code) => {
    setStarterCodes((prev) => ({ ...prev, [language]: { ...prev[language], code } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let challengeId;

      if (isEditMode) {
        // Update existing challenge
        await axios.put(`${API_BASE_URL}/api/challenges/${slug}/`, formData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        // Get challenge ID from response
        const response = await axios.get(`${API_BASE_URL}/api/challenges/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        challengeId = response.data.id;

        // Delete existing test cases and starter codes
        for (const testCase of testCases) {
          if (testCase.id) {
            await axios.delete(`${API_BASE_URL}/api/test-cases/${testCase.id}/`, {
              headers: { Authorization: `Bearer ${authToken}` },
            }).catch(() => {});
          }
        }
      } else {
        // Create new challenge
        const challengeResponse = await axios.post(`${API_BASE_URL}/api/challenges/`, formData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        challengeId = challengeResponse.data.id;
      }

      // Create/Update test cases
      for (const testCase of testCases) {
        const { id, ...tcData } = testCase;
        await axios.post(
          `${API_BASE_URL}/api/test-cases/`,
          { ...tcData, challenge: challengeId },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }

      // Create/Update starter codes for languages that have code
      for (const [language, starterData] of Object.entries(starterCodes)) {
        const { id, code } = starterData;

        if (id && isEditMode) {
          // Delete existing starter code
          await axios.delete(`${API_BASE_URL}/api/starter-codes/${id}/`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }).catch(() => {});
        }

        // Create new starter code if code is provided
        if (code && code.trim()) {
          await axios.post(
            `${API_BASE_URL}/api/starter-codes/`,
            { challenge: challengeId, language, code },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Challenge ${isEditMode ? 'updated' : 'created'} successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => navigate('/CodingChallenges/list-challenge'), 1600);
    } catch (error) {
      console.error(error.response?.data);
      Swal.fire('Error', error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} challenge.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isEditMode ? "Edit Challenge" : "Create Challenge"} content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">{isEditMode ? 'Edit' : 'Create'} Coding Challenge</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/CodingChallenges/list-challenge">Challenges</Link></li>
                <li className="breadcrumb-item active">{isEditMode ? 'Edit' : 'Create'}</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/CodingChallenges/list-challenge" className="btn btn-outline-light">
              <Icon name="arrow-left" /> Back
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Form onSubmit={handleSubmit}>
          <Card>
            <Card.Body>
              <Tabs defaultActiveKey="basic" className="mb-3">
                {/* Basic Info Tab */}
                <Tab eventKey="basic" title="Basic Info">
                  <Row className="g-3">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Difficulty <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Tags (comma-separated)</Form.Label>
                        <Form.Control
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleChange}
                          placeholder="array, loop, sorting"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={8}
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          placeholder="Enter challenge description..."
                        />
                        <Form.Text className="text-muted">
                          You can use HTML tags for formatting
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab>

                {/* Details Tab */}
                <Tab eventKey="details" title="Details">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Input Format</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="input_format"
                          value={formData.input_format}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Output Format</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="output_format"
                          value={formData.output_format}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Constraints</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="constraints"
                          value={formData.constraints}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Explanation</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="explanation"
                          value={formData.explanation}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Time Complexity</Form.Label>
                        <Form.Control
                          type="text"
                          name="time_complexity"
                          value={formData.time_complexity}
                          onChange={handleChange}
                          placeholder="O(n)"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Space Complexity</Form.Label>
                        <Form.Control
                          type="text"
                          name="space_complexity"
                          value={formData.space_complexity}
                          onChange={handleChange}
                          placeholder="O(1)"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab>

                {/* Sample I/O Tab */}
                <Tab eventKey="samples" title="Sample I/O">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Sample Input</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="sample_input"
                          value={formData.sample_input}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Sample Output</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="sample_output"
                          value={formData.sample_output}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab>

                {/* Settings Tab */}
                <Tab eventKey="settings" title="Settings">
                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Max Score</Form.Label>
                        <Form.Control
                          type="number"
                          name="max_score"
                          value={formData.max_score}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Time Limit (seconds)</Form.Label>
                        <Form.Control
                          type="number"
                          name="time_limit_seconds"
                          value={formData.time_limit_seconds}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Memory Limit (MB)</Form.Label>
                        <Form.Control
                          type="number"
                          name="memory_limit_mb"
                          value={formData.memory_limit_mb}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab>

                {/* Test Cases Tab */}
                <Tab eventKey="testcases" title="Test Cases">
                  <div className="mb-3">
                    <Button variant="primary" size="sm" onClick={addTestCase}>
                      <Icon name="plus" /> Add Test Case
                    </Button>
                  </div>

                  {testCases.map((testCase, index) => (
                    <Card key={index} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between mb-3">
                          <h6>Test Case #{index + 1}</h6>
                          <Button variant="danger" size="sm" onClick={() => removeTestCase(index)}>
                            <Icon name="trash" />
                          </Button>
                        </div>
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Input Data</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={testCase.input_data}
                                onChange={(e) => updateTestCase(index, 'input_data', e.target.value)}
                                placeholder="Enter input data..."
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Expected Output</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={testCase.expected_output}
                                onChange={(e) => updateTestCase(index, 'expected_output', e.target.value)}
                                placeholder="Enter expected output..."
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Check
                              type="checkbox"
                              label="Is Sample"
                              checked={testCase.is_sample}
                              onChange={(e) => updateTestCase(index, 'is_sample', e.target.checked)}
                            />
                          </Col>
                          <Col md={4}>
                            <Form.Check
                              type="checkbox"
                              label="Hidden"
                              checked={testCase.hidden}
                              onChange={(e) => updateTestCase(index, 'hidden', e.target.checked)}
                            />
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Score Weight</Form.Label>
                              <Form.Control
                                type="number"
                                value={testCase.score_weight}
                                onChange={(e) => updateTestCase(index, 'score_weight', parseInt(e.target.value))}
                                min="1"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}

                  {testCases.length === 0 && (
                    <p className="text-muted">No test cases added yet. Click "Add Test Case" to create one.</p>
                  )}
                </Tab>

                {/* Starter Code Tab */}
                <Tab eventKey="startercode" title="Starter Code">
                  <Row className="g-3">
                    <Col md={12}>
                      <h6>Python</h6>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={starterCodes.python.code}
                        onChange={(e) => updateStarterCode('python', e.target.value)}
                        placeholder="def solution():\n    # Your code here\n    pass"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </Col>

                    <Col md={12}>
                      <h6>Java</h6>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={starterCodes.java.code}
                        onChange={(e) => updateStarterCode('java', e.target.value)}
                        placeholder="class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </Col>

                    <Col md={12}>
                      <h6>C++</h6>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={starterCodes.c_cpp.code}
                        onChange={(e) => updateStarterCode('c_cpp', e.target.value)}
                        placeholder="#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </Col>

                    <Col md={12}>
                      <h6>C</h6>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={starterCodes.c.code}
                        onChange={(e) => updateStarterCode('c', e.target.value)}
                        placeholder="#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </Col>

                    <Col md={12}>
                      <h6>JavaScript</h6>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={starterCodes.javascript.code}
                        onChange={(e) => updateStarterCode('javascript', e.target.value)}
                        placeholder="function solution() {\n    // Your code here\n}"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </Col>
                  </Row>
                </Tab>
              </Tabs>

              <div className="mt-3 d-flex gap-2">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Icon name="check" /> {isEditMode ? 'Update Challenge' : 'Create Challenge'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline-light"
                  onClick={() => navigate('/CodingChallenges/list-challenge')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Form>
      </Block>
    </Layout>
  );
}

export default ChallengeCreate;
