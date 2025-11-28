import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

function ConceptChallengeCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conceptIdFromQuery = searchParams.get('concept');

  const [formData, setFormData] = useState({
    concept: conceptIdFromQuery || '',
    challenge: '',
    order: 0,
    is_active: true,
    weight: 1.0,
    custom_time_limit: '',
    hint_video_title: '',
    hint_video_description: '',
    hint_youtube_url: '',
  });
  const [hintVideoFile, setHintVideoFile] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [allConcepts, setAllConcepts] = useState([]); // Store all concepts for lookup
  const [challenges, setChallenges] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch concepts
        const conceptsRes = await axios.get(`${API_BASE_URL}/api/concepts/`, {
          params: { is_active: true },
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const fetchedConcepts = conceptsRes.data.results || conceptsRes.data || [];

        // Store all concepts for later use
        setAllConcepts(fetchedConcepts);

        // Remove duplicates by concept name - keep only unique concept names for display
        const uniqueConceptsMap = new Map();
        fetchedConcepts.forEach(concept => {
          if (!uniqueConceptsMap.has(concept.name)) {
            uniqueConceptsMap.set(concept.name, concept);
          }
        });
        const uniqueConcepts = Array.from(uniqueConceptsMap.values());

        setConcepts(uniqueConcepts);

        // Fetch challenges
        const challengesRes = await axios.get(`${API_BASE_URL}/api/challenges/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setChallenges(challengesRes.data.results || challengesRes.data || []);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch data.', 'error');
      }
    };

    fetchData();
  }, [authToken]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setHintVideoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!authToken) {
      Swal.fire('Unauthorized', 'Please login.', 'error');
      setLoading(false);
      return;
    }

    try {
      // Find the selected concept to get its name
      const selectedConcept = concepts.find(c => c.id === parseInt(formData.concept));
      if (!selectedConcept) {
        Swal.fire('Error', 'Please select a valid concept.', 'error');
        setLoading(false);
        return;
      }

      // Find all concepts with the same name across all companies
      const matchingConcepts = allConcepts.filter(c => c.name === selectedConcept.name);

      // Create concept-challenge for each matching concept
      const promises = matchingConcepts.map((concept) => {
        const data = new FormData();
        data.append('concept', concept.id);
        data.append('challenge', formData.challenge);
        data.append('order', formData.order);
        data.append('is_active', formData.is_active);
        data.append('weight', formData.weight);
        if (formData.custom_time_limit) data.append('custom_time_limit', formData.custom_time_limit);
        if (formData.hint_video_title) data.append('hint_video_title', formData.hint_video_title);
        if (formData.hint_video_description) data.append('hint_video_description', formData.hint_video_description);
        if (formData.hint_youtube_url) data.append('hint_youtube_url', formData.hint_youtube_url);
        if (hintVideoFile) data.append('hint_video_file', hintVideoFile);

        return axios.post(`${API_BASE_URL}/api/concept-challenges/`, data, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      });

      await Promise.all(promises);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Concept challenge created for ${matchingConcepts.length} ${matchingConcepts.length === 1 ? 'company' : 'companies'}.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate('/ConceptChallenges/list-concept-challenge'), 2100);
    } catch (error) {
      console.error(error.response?.data);
      if (error.response?.status === 400) {
        setErrors(error.response.data);
      } else {
        Swal.fire('Error', error.response?.data?.error || 'Failed to create concept challenge.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Concept Challenge" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Create Concept Challenge</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/ConceptChallenges/list-concept-challenge">Concept Challenges</Link></li>
                <li className="breadcrumb-item active">Create</li>
              </ol>
            </nav>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Concept <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="concept"
                      value={formData.concept}
                      onChange={handleChange}
                      isInvalid={!!errors.concept}
                      required
                    >
                      <option value="">Select Concept</option>
                      {concepts.map((concept) => (
                        <option key={concept.id} value={concept.id}>
                          {concept.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.concept}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Challenge <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="challenge"
                      value={formData.challenge}
                      onChange={handleChange}
                      isInvalid={!!errors.challenge}
                      required
                    >
                      <option value="">Select Challenge</option>
                      {challenges.map((challenge) => (
                        <option key={challenge.id} value={challenge.id}>
                          {challenge.title} ({challenge.difficulty})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.challenge}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Score Weight</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0.1"
                    />
                    <Form.Text className="text-muted">Multiplier for challenge score</Form.Text>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Custom Time Limit (seconds)</Form.Label>
                    <Form.Control
                      type="number"
                      name="custom_time_limit"
                      value={formData.custom_time_limit}
                      onChange={handleChange}
                      min="1"
                    />
                    <Form.Text className="text-muted">Leave empty to use challenge default</Form.Text>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <hr />
                  <h5>Hint Video (Optional)</h5>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hint Video Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="hint_video_title"
                      value={formData.hint_video_title}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hint YouTube URL</Form.Label>
                    <Form.Control
                      type="url"
                      name="hint_youtube_url"
                      value={formData.hint_youtube_url}
                      onChange={handleChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Hint Video Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="hint_video_description"
                      value={formData.hint_video_description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Upload Hint Video File</Form.Label>
                    <Form.Control
                      type="file"
                      accept="video/mp4,video/mov,video/avi,video/mkv"
                      onChange={handleFileChange}
                    />
                    <Form.Text className="text-muted">
                      Choose either YouTube URL or upload video file (not both)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      name="is_active"
                      label="Active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : <Icon name="check" />}
                      <span className="ms-2">Create Concept Challenge</span>
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/ConceptChallenges/list-concept-challenge')}>
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
}

export default ConceptChallengeCreate;
