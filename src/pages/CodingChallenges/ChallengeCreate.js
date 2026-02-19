import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Button, Spinner, Row, Col, Tab, Tabs, Modal, Alert, Badge } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

// Utility function to strip HTML tags while preserving formatting
const stripHtmlTags = (html) => {
  if (!html) return '';

  let text = html;

  // Convert HTML entities to their symbols
  text = text
    .replace(/&le;/g, '≤')
    .replace(/&ge;/g, '≥')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&times;/g, '×')
    .replace(/&plusmn;/g, '±')
    .replace(/&ne;/g, '≠')
    .replace(/&deg;/g, '°')
    .replace(/&sup2;/g, '²')
    .replace(/&sup3;/g, '³')
    // Preserve <li> items as bullet points
    .replace(/<li[^>]*>/gi, '\n• ')
    // Preserve <ol> numbered list items
    .replace(/<\/ol>/gi, '\n')
    // Handle list item closing
    .replace(/<\/li>/gi, '\n')
    // Convert <br> and <br/> to newlines
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove excessive newlines but preserve list structure
    .replace(/\n{3,}/g, '\n\n')
    // Clean up bullet points
    .replace(/[•\s]+\n[•\s]+/g, '• ')
    .trim();

  return text;
};

function ChallengeCreate() {
  const { slug } = useParams(); // Get slug for edit mode
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categories, setCategories] = useState([]);

  // AI Generation States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProviderStatus, setAiProviderStatus] = useState(null);
  const [aiFormData, setAiFormData] = useState({
    topic: '',
    category: '',
    difficulty: 'MEDIUM',
    num_challenges: 1,
    additional_context: '',
    check_duplicates: true,
    force_save: false,
  });
  const [aiResults, setAiResults] = useState(null);

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

    // Fetch AI provider status
    axios
      .get(`${API_BASE_URL}/api/challenges/ai-provider-status/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setAiProviderStatus(res.data))
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
            description: stripHtmlTags(challenge.description) || '',
            input_format: stripHtmlTags(challenge.input_format) || '',
            output_format: stripHtmlTags(challenge.output_format) || '',
            constraints: stripHtmlTags(challenge.constraints) || '',
            explanation: stripHtmlTags(challenge.explanation) || '',
            sample_input: stripHtmlTags(challenge.sample_input) || '',
            sample_output: stripHtmlTags(challenge.sample_output) || '',
            time_complexity: stripHtmlTags(challenge.time_complexity) || '',
            space_complexity: stripHtmlTags(challenge.space_complexity) || '',
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

  // AI Generation Functions
  const handleOpenAIModal = () => {
    setAiFormData({
      topic: '',
      category: '',
      difficulty: formData.difficulty || 'MEDIUM',
      num_challenges: 1,
      additional_context: '',
      check_duplicates: true,
      force_save: false,
    });
    setAiResults(null);
    setShowAIModal(true);
  };

  const handleCloseAIModal = () => {
    setShowAIModal(false);
    setAiResults(null);
  };

  const handleAIFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAiFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAIGenerate = async () => {
    if (!aiFormData.category) {
      Swal.fire('Error', 'Please select a category for the coding challenges.', 'error');
      return;
    }

    // Use category label as topic if not provided
    const selectedCategory = categories.find(cat => cat.value === aiFormData.category);
    const topicToSend = aiFormData.topic || selectedCategory?.label || aiFormData.category;

    setAiGenerating(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/challenges/generate-with-ai/`,
        { ...aiFormData, topic: topicToSend },
        {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 180000 // 3 minute timeout
        }
      );

      setAiResults(response.data);

      // If challenges were created, show success and navigate
      if (response.data.created > 0) {
        Swal.fire({
          icon: 'success',
          title: 'AI Generation Complete!',
          html: `Successfully generated ${response.data.created} challenge(s)!`,
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => navigate('/CodingChallenges/list-challenge'), 2100);
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      console.error('Error response:', error.response?.data);

      let errorMsg = error.response?.data?.error || 'Failed to generate challenges with AI.';
      let errorDetails = '';

      // Check if challenges were actually generated before the error
      if (error.response?.data?.challenges && Array.isArray(error.response.data.challenges)) {
        const challenges = error.response.data.challenges;
        errorDetails = `\n\n${challenges.length} challenge(s) generated:\n` +
          challenges.map((c, i) => `${i + 1}. ${c.title || 'Untitled'}`).join('\n');
      }

      Swal.fire({
        icon: 'error',
        title: 'Generation Issue',
        text: errorMsg + errorDetails,
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCheckDuplicates = async () => {
    if (!formData.title.trim()) {
      Swal.fire('Error', 'Please enter a title first.', 'warning');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/challenges/check-duplicates/`,
        {
          title: formData.title,
          description: formData.description || '',
          test_cases: testCases.map(tc => ({
            input_data: tc.input_data,
            expected_output: tc.expected_output,
          })),
          exclude_id: isEditMode ? null : undefined, // We'd need the challenge ID for edit mode
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      

      if (response.data.is_duplicate) {
        const duplicates = response.data.duplicates;
        const duplicateList = duplicates
          .map(d => `- <strong>${d.challenge.title}</strong> (${d.challenge.difficulty}, ${d.challenge.category})<br/>Reason: ${d.reason}`)
          .join('<br/><br/>');

        Swal.fire({
          icon: 'warning',
          title: 'Potential Duplicates Found!',
          html: `<div style="text-align: left; font-size: 14px;">${duplicateList}</div>`,
          confirmButtonText: 'I Understand',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'No Duplicates Found',
          text: 'This challenge appears to be unique.',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to check for duplicates.', 'error');
    }
  };

  const loadChallengeToForm = (challengeSlug) => {
    axios
      .get(`${API_BASE_URL}/api/challenges/${challengeSlug}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        const challenge = res.data;

        setFormData({
          title: challenge.title || '',
          description: stripHtmlTags(challenge.description) || '',
          input_format: stripHtmlTags(challenge.input_format) || '',
          output_format: stripHtmlTags(challenge.output_format) || '',
          constraints: stripHtmlTags(challenge.constraints) || '',
          explanation: stripHtmlTags(challenge.explanation) || '',
          sample_input: stripHtmlTags(challenge.sample_input) || '',
          sample_output: stripHtmlTags(challenge.sample_output) || '',
          time_complexity: stripHtmlTags(challenge.time_complexity) || '',
          space_complexity: stripHtmlTags(challenge.space_complexity) || '',
          difficulty: challenge.difficulty || 'MEDIUM',
          max_score: challenge.max_score || 100,
          category: challenge.category || 'implementation',
          tags: challenge.tags || '',
          time_limit_seconds: challenge.time_limit_seconds || 10,
          memory_limit_mb: challenge.memory_limit_mb || 256,
        });

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

        handleCloseAIModal();
        Swal.fire({
          icon: 'success',
          title: 'Challenge Loaded',
          text: 'The AI-generated challenge has been loaded into the form.',
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to load the challenge.', 'error');
      });
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
            <ul className="d-flex gap-2">
              <li>
                <Button variant="primary" onClick={handleOpenAIModal}>
                  <Icon name="sparkling" /> Generate with AI
                </Button>
              </li>
              <li>
                <Link to="/CodingChallenges/list-challenge" className="btn btn-outline-light">
                  <Icon name="arrow-left" /> Back
                </Link>
              </li>
            </ul>
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

                    <Col md={12}>
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
                  variant="outline-info"
                  onClick={handleCheckDuplicates}
                  disabled={loading}
                >
                  <Icon name="refresh" /> Check Duplicates
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

      {/* AI Generation Modal */}
      <Modal show={showAIModal} onHide={handleCloseAIModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon name="sparkling" className="text-primary me-2" />
            Generate Coding Challenge with AI
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!aiProviderStatus?.has_provider && (
            <Alert variant="warning">
              <Icon name="alert-circle" /> No AI provider configured. Please configure an AI
              provider in <Link to="/AISettings/list">AI Settings</Link> first.
            </Alert>
          )}

          {aiResults && aiResults.duplicates_found > 0 && (
            <Alert variant="warning">
              <strong>Duplicates Found:</strong> {aiResults.duplicates_found} challenge(s) were
              skipped because similar challenges already exist.
            </Alert>
          )}

          {aiResults && aiResults.created > 0 && (
            <Alert variant="success">
              <strong>Success!</strong> {aiResults.created} challenge(s) were created.
            </Alert>
          )}

          {aiResults && aiResults.skipped > 0 && (
            <Alert variant="info">
              <strong>Skipped:</strong> {aiResults.skipped} challenge(s) had validation errors.
            </Alert>
          )}

          {aiResults && aiResults.duplicate_challenges && aiResults.duplicate_challenges.length > 0 && (
            <div className="mb-3">
              <h6>Duplicate Challenges Found:</h6>
              {aiResults.duplicate_challenges.map((dup, idx) => (
                <Card key={idx} className="mb-2">
                  <Card.Body>
                    <strong>{dup.title}</strong>
                    <br />
                    <small className="text-muted">
                      Similar challenges: {dup.duplicates.map((d, i) => (
                        <span key={i}>
                          <Badge bg="secondary" className="me-1">
                            {d.challenge.title}
                          </Badge>
                          {d.similarity && `(${d.similarity}% match)`}
                        </span>
                      ))}
                    </small>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          <Form>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="category"
                    value={aiFormData.category}
                    onChange={handleAIFormChange}
                    disabled={aiGenerating}
                    required
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Select a category to generate a relevant coding challenge
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Difficulty</Form.Label>
                  <Form.Select
                    name="difficulty"
                    value={aiFormData.difficulty}
                    onChange={handleAIFormChange}
                    disabled={aiGenerating}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Topic (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="topic"
                    value={aiFormData.topic}
                    onChange={handleAIFormChange}
                    placeholder="e.g., Two Sum problem, Binary Tree Traversal, etc."
                    disabled={aiGenerating}
                  />
                  <Form.Text className="text-muted">
                    Leave empty to auto-generate based on category
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Additional Context (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="additional_context"
                    value={aiFormData.additional_context}
                    onChange={handleAIFormChange}
                    placeholder="e.g., Focus on hash map solution"
                    disabled={aiGenerating}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  name="check_duplicates"
                  label="Check for duplicates"
                  checked={aiFormData.check_duplicates}
                  onChange={handleAIFormChange}
                  disabled={aiGenerating}
                />
                <Form.Check
                  type="checkbox"
                  name="force_save"
                  label="Force save (even if duplicates found)"
                  checked={aiFormData.force_save}
                  onChange={handleAIFormChange}
                  disabled={aiGenerating}
                  className="mt-2"
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAIModal} disabled={aiGenerating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAIGenerate}
            disabled={aiGenerating || !aiProviderStatus?.has_provider}
          >
            {aiGenerating ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Generating...
              </>
            ) : (
              <>
                <Icon name="sparkling" /> Generate Challenge
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default ChallengeCreate;
