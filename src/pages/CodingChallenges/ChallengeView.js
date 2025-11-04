import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Row, Col, Badge, Button, Spinner, Tab, Tabs } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

function ChallengeView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const authToken = localStorage.getItem('authToken');

  // Check if user is admin
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const isSuperuser = localStorage.getItem('is_superuser') === 'true';
    const isStaff = localStorage.getItem('is_staff') === 'true';
    setIsAdmin(userRole === 'admin' || isSuperuser || isStaff);
  }, []);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/challenges/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setChallenge(response.data);
      } catch (error) {
        Swal.fire('Error', 'Failed to fetch challenge details.', 'error');
        navigate('/CodingChallenges/list-challenge');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [slug, authToken, navigate]);

  if (loading) {
    return (
      <Layout title="Challenge Details" content="container">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Layout>
    );
  }

  if (!challenge) return null;

  const difficultyColors = {
    EASY: 'success',
    MEDIUM: 'warning',
    HARD: 'danger',
  };

  return (
    <Layout title="Challenge Details" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">{challenge.title}</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/CodingChallenges/list-challenge">Challenges</Link></li>
                <li className="breadcrumb-item active">{challenge.title}</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <div className="d-flex gap-2">
              <Button variant="warning" onClick={() => navigate(`/CodingChallenges/update-challenge/${slug}`)}>
                <Icon name="edit" /> Edit
              </Button>
              <Link to="/CodingChallenges/list-challenge" className="btn btn-outline-light">
                <Icon name="arrow-left" /> Back
              </Link>
            </div>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Row className="g-3">
          <Col lg={8}>
            <Card>
              <Card.Body>
                <div className="mb-3">
                  <Badge bg={difficultyColors[challenge.difficulty]} className="me-2">
                    {challenge.difficulty_display}
                  </Badge>
                  <Badge bg="secondary">{challenge.category_display}</Badge>
                  {challenge.tags_list && challenge.tags_list.map((tag, index) => (
                    <Badge key={index} bg="info" className="ms-2">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Tabs defaultActiveKey="description" className="mb-3">
                  <Tab eventKey="description" title="Description">
                    <div dangerouslySetInnerHTML={{ __html: challenge.description }} />

                    {challenge.input_format && (
                      <div className="mt-3">
                        <h6>Input Format:</h6>
                        <pre className="bg-light p-3 rounded">{challenge.input_format}</pre>
                      </div>
                    )}

                    {challenge.output_format && (
                      <div className="mt-3">
                        <h6>Output Format:</h6>
                        <pre className="bg-light p-3 rounded">{challenge.output_format}</pre>
                      </div>
                    )}

                    {challenge.constraints && (
                      <div className="mt-3">
                        <h6>Constraints:</h6>
                        <pre className="bg-light p-3 rounded">{challenge.constraints}</pre>
                      </div>
                    )}
                  </Tab>

                  <Tab eventKey="sample" title="Sample I/O">
                    {challenge.sample_input && (
                      <div className="mb-3">
                        <h6>Sample Input:</h6>
                        <pre className="bg-light p-3 rounded">{challenge.sample_input}</pre>
                      </div>
                    )}

                    {challenge.sample_output && (
                      <div className="mb-3">
                        <h6>Sample Output:</h6>
                        <pre className="bg-light p-3 rounded">{challenge.sample_output}</pre>
                      </div>
                    )}

                    {challenge.explanation && (
                      <div className="mb-3">
                        <h6>Explanation:</h6>
                        <p>{challenge.explanation}</p>
                      </div>
                    )}
                  </Tab>

                  <Tab eventKey="testcases" title="Test Cases">
                    {challenge.test_cases && challenge.test_cases.length > 0 ? (
                      <div>
                        <p className="text-muted">
                          Total Test Cases: {challenge.total_test_cases}
                          {!isAdmin && <span className="ms-2 text-warning">(Hidden test cases data is masked)</span>}
                        </p>
                        {challenge.test_cases.map((testcase, index) => (
                          <Card key={index} className="mb-2">
                            <Card.Body>
                              <div className="d-flex justify-content-between mb-2">
                                <div>
                                  {testcase.is_sample && <Badge bg="info">Sample</Badge>}
                                  {testcase.hidden && <Badge bg="warning" className="ms-2">Hidden</Badge>}
                                </div>
                              </div>
                              <Row>
                                <Col md={6}>
                                  <small className="text-muted">Input:</small>
                                  <pre className="bg-light p-2 rounded">{testcase.input_data}</pre>
                                </Col>
                                <Col md={6}>
                                  <small className="text-muted">Expected Output:</small>
                                  <pre className="bg-light p-2 rounded">{testcase.expected_output}</pre>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No test cases added yet.</p>
                    )}
                  </Tab>

                  <Tab eventKey="starter" title="Starter Code">
                    {challenge.starter_codes && challenge.starter_codes.length > 0 ? (
                      challenge.starter_codes.map((starter, index) => (
                        <div key={index} className="mb-3">
                          <h6>{starter.language_display}</h6>
                          <pre className="bg-dark text-light p-3 rounded">{starter.code}</pre>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No starter code added yet.</p>
                    )}
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Challenge Info</h5>
                <div className="mb-2">
                  <strong>Max Score:</strong>
                  <p>{challenge.max_score}</p>
                </div>
                <div className="mb-2">
                  <strong>Success Rate:</strong>
                  <p>{challenge.success_rate.toFixed(1)}%</p>
                </div>
                <div className="mb-2">
                  <strong>Total Submissions:</strong>
                  <p>{challenge.total_submissions}</p>
                </div>
                <div className="mb-2">
                  <strong>Accepted:</strong>
                  <p className="text-success">{challenge.accepted_submissions}</p>
                </div>
                <div className="mb-2">
                  <strong>Time Limit:</strong>
                  <p>{challenge.time_limit_seconds} seconds</p>
                </div>
                <div className="mb-2">
                  <strong>Memory Limit:</strong>
                  <p>{challenge.memory_limit_mb} MB</p>
                </div>
                {challenge.time_complexity && (
                  <div className="mb-2">
                    <strong>Time Complexity:</strong>
                    <p><code>{challenge.time_complexity}</code></p>
                  </div>
                )}
                {challenge.space_complexity && (
                  <div className="mb-2">
                    <strong>Space Complexity:</strong>
                    <p><code>{challenge.space_complexity}</code></p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>
    </Layout>
  );
}

export default ChallengeView;
