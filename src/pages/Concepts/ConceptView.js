import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Row, Col, Badge, Button, Spinner, Table } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { API_BASE_URL } from '../../services/apiBase';
import { Icon } from '../../components';

function ConceptView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [concept, setConcept] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchConcept = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/concepts/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setConcept(response.data);

        // Fetch challenges for this concept
        const challengesRes = await axios.get(`${API_BASE_URL}/api/concepts/${slug}/challenges/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setChallenges(challengesRes.data || []);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch concept details.', 'error');
        navigate('/Concepts/list-concept');
      } finally {
        setLoading(false);
      }
    };

    fetchConcept();
  }, [slug, authToken, navigate]);

  if (loading) {
    return (
      <Layout title="Concept Details" content="container">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Layout>
    );
  }

  if (!concept) return null;

  const difficultyColors = {
    BEGINNER: 'success',
    INTERMEDIATE: 'warning',
    ADVANCED: 'danger',
    EXPERT: 'dark',
  };

  return (
    <Layout title="Concept Details" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">{concept.name}</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Concepts/list-concept">Concepts</Link></li>
                <li className="breadcrumb-item active">{concept.name}</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Button variant="warning" onClick={() => navigate(`/Concepts/update-concept/${slug}`)}>
              <Icon name="edit" /> Edit
            </Button>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Row className="g-3">
          <Col lg={4}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Overview</h5>
                <div className="mb-3">
                  <strong>Company:</strong>
                  <p>{concept.company_name}</p>
                </div>
                <div className="mb-3">
                  <strong>Difficulty:</strong>
                  <div>
                    <Badge bg={difficultyColors[concept.difficulty_level] || 'secondary'}>
                      {concept.difficulty_level}
                    </Badge>
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Estimated Time:</strong>
                  <p>{concept.estimated_time_minutes} minutes</p>
                </div>
                <div className="mb-3">
                  <strong>Display Order:</strong>
                  <p>{concept.order}</p>
                </div>
                <div className="mb-3">
                  <strong>Status:</strong>
                  <div>
                    <Badge bg={concept.is_active ? 'success' : 'danger'}>
                      {concept.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Description</h5>
                <p>{concept.description || 'No description available.'}</p>

                <hr />

                <h5 className="mb-3">Statistics</h5>
                <Row>
                  <Col md={4}>
                    <div className="card-inner">
                      <div className="card-title-group align-start mb-2">
                        <div className="card-title">
                          <h6 className="title">Total Challenges</h6>
                        </div>
                      </div>
                      <div className="card-amount">
                        <Link
                          to={`/ConceptChallenges/list-concept-challenge?concept=${concept.id}`}
                          className="text-primary fw-bold"
                          style={{ fontSize: '1.5rem', textDecoration: 'none' }}
                        >
                          {concept.challenge_count || 0}
                          <Icon name="arrow-right" className="ms-2" />
                        </Link>
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="card-inner">
                      <div className="card-title-group align-start mb-2">
                        <div className="card-title">
                          <h6 className="title">Max Score</h6>
                        </div>
                      </div>
                      <div className="card-amount">
                        <span className="amount h2">{concept.max_score || 0}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mt-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Challenges</h5>
                  <Link
                    to={`/ConceptChallenges/create-concept-challenge?concept=${concept.id}`}
                    className="btn btn-sm btn-primary"
                  >
                    <Icon name="plus" /> Add Challenge
                  </Link>
                </div>
                {challenges.length > 0 ? (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Challenge</th>
                        <th>Difficulty</th>
                        <th>Weight</th>
                        <th>Time Limit</th>
                        <th>Max Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challenges.map((item, index) => (
                        <tr key={item.id}>
                          <td>{item.order}</td>
                          <td>
                            <strong>{item.challenge_details?.title || 'N/A'}</strong>
                          </td>
                          <td>
                            <Badge bg={
                              item.challenge_details?.difficulty === 'EASY' ? 'success' :
                              item.challenge_details?.difficulty === 'MEDIUM' ? 'warning' : 'danger'
                            }>
                              {item.challenge_details?.difficulty || 'N/A'}
                            </Badge>
                          </td>
                          <td>{item.weight}x</td>
                          <td>{item.effective_time_limit}s</td>
                          <td>{item.weighted_max_score}</td>
                          <td>
                            <Badge bg={item.is_active ? 'success' : 'secondary'}>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">No challenges added yet.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>
    </Layout>
  );
}

export default ConceptView;
