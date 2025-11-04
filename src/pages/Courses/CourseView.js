// src/pages/Courses/CourseView.js
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Row, Col, Spinner, Badge, Tab, Tabs, Accordion } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTopicId, setOpenTopicId] = useState(null);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const getCourse = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/courses/${id}/`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        console.log('Course API Response:', res.data);
        setCourse(res.data.data || res.data);
      } catch (err) {
        console.error('Course fetch error:', err);
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load course.";
        Swal.fire("Error", errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    const getTopics = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/topics/?course=${id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const topicData = res.data.results || res.data.data || res.data;
        setTopics(Array.isArray(topicData) ? topicData : []);
      } catch (err) {
        console.error('Error fetching topics:', err);
      }
    };

    if (authToken && id) {
      getCourse();
      getTopics();
    } else {
      setLoading(false);
      Swal.fire("Error", "Missing authentication or course ID.", "error");
    }
  }, [id, authToken]);

  return (
    <Layout title="View Course" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">View Course</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/Courses/list-course">Courses</Link>
                </li>
                <li className="breadcrumb-item active">View</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Courses/list-course" className="btn btn-outline-secondary me-2">
              <Icon name="arrow-left me-1" /> Back
            </Link>
            <Link to={`/Courses/update-course/${id}`} className="btn btn-primary">
              <Icon name="edit me-1" /> Edit
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        ) : course ? (
          <>
            {/* Course Header Card */}
            <Card className="mb-4">
              {course.thumbnail && (
                <Card.Img
                  variant="top"
                  src={course.thumbnail}
                  style={{ height: "300px", objectFit: "cover" }}
                />
              )}
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    {course.course_id && (
                      <div className="mb-2">
                        <Badge bg="dark" className="me-2">Course ID: {course.course_id}</Badge>
                      </div>
                    )}
                    <h3>{course.title}</h3>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <Badge bg={course.status === 'published' ? 'success' : course.status === 'draft' ? 'warning' : 'secondary'}>
                      {course.status}
                    </Badge>
                    <Badge bg={course.difficulty_level === 'beginner' ? 'info' : course.difficulty_level === 'intermediate' ? 'primary' : 'danger'}>
                      {course.difficulty_level}
                    </Badge>
                    {course.is_featured && <Badge bg="warning">Featured</Badge>}
                  </div>
                </div>

                <Row className="mb-3">
                  <Col md={3}>
                    <div className="p-3 bg-light rounded">
                      <div className="text-muted small">Duration</div>
                      <h5 className="mb-0">{course.duration_hours || 0} hours</h5>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 bg-light rounded">
                      <div className="text-muted small">Syllabus Sections</div>
                      <h5 className="mb-0">{course.syllabi?.length || 0}</h5>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 bg-light rounded">
                      <div className="text-muted small">Total Topics</div>
                      <h5 className="mb-0">{course.total_topics || 0}</h5>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 bg-light rounded">
                      <div className="text-muted small">Total Tasks</div>
                      <h5 className="mb-0">{course.total_tasks || course.tasks?.length || 0}</h5>
                    </div>
                  </Col>
                </Row>

                {/* Intro Video Section */}
                {(course.intro_video || course.video_intro_url) && (
                  <Row className="mb-3">
                    <Col md={12}>
                      <h6 className="mb-2">Introduction Video</h6>
                      {course.intro_video && (
                        <div className="mb-2">
                          <video controls style={{ maxWidth: '100%', maxHeight: '400px' }}>
                            <source src={course.intro_video} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          <div className="mt-1">
                            <a href={course.intro_video} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                              <Icon name="download" /> Download Video
                            </a>
                          </div>
                        </div>
                      )}
                      {course.video_intro_url && (
                        <div className="mb-2">
                          <a href={course.video_intro_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                            <Icon name="play" /> Watch on YouTube/Vimeo
                          </a>
                        </div>
                      )}
                    </Col>
                  </Row>
                )}

                {course.created_by && (
                  <div className="mt-2">
                    <strong>Created by:</strong> {course.created_by.name} ({course.created_by.email})
                  </div>
                )}
                <div className="mt-2">
                      <h5>Course Description</h5>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{course.description}</p>
                    </div>
                 <div className="p-3">
                      <Row>
                        <Col md={6}>
                          <h6>Course Settings</h6>
                          {course.course_id && <div className="mt-2"><strong>Course ID:</strong> {course.course_id}</div>}
                          <div className="mt-2"><strong>Status:</strong> {course.status}</div>
                          <div className="mt-2"><strong>Difficulty:</strong> {course.difficulty_level}</div>
                          <div className="mt-2"><strong>Featured:</strong> {course.is_featured ? 'Yes' : 'No'}</div>
                          <div className="mt-2"><strong>Duration:</strong> {course.duration_hours} hours</div>
                        </Col>
                        <Col md={6}>
                          <h6>Timestamps</h6>
                          <div className="mt-2">
                            <strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}
                          </div>
                          <div className="mt-2">
                            <strong>Updated:</strong> {new Date(course.updated_at).toLocaleDateString()}
                          </div>
                          {course.published_at && (
                            <div className="mt-2">
                              <strong>Published:</strong> {new Date(course.published_at).toLocaleDateString()}
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
              </Card.Body>
            </Card>

            {/* Topics Section with Smooth Dropdown */}
            {topics.length > 0 && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Course Topics ({topics.length})</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Accordion flush>
                    {topics.map((topic, index) => (
                      <Accordion.Item eventKey={topic.id.toString()} key={topic.id}>
                        <Accordion.Header>
                          <div className="d-flex justify-content-between align-items-center w-100 me-3">
                            <div>
                              <strong>{index + 1}. {topic.title}</strong>
                              {topic.topic_id && (
                                <Badge bg="secondary" className="ms-2">ID: {topic.topic_id}</Badge>
                              )}
                            </div>
                            <div className="d-flex gap-2">
                              {topic.status && (
                                <Badge bg={topic.status === 'published' ? 'success' : 'warning'}>
                                  {topic.status}
                                </Badge>
                              )}
                              {topic.tasks_count !== undefined && (
                                <Badge bg="info">{topic.tasks_count} Tasks</Badge>
                              )}
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <Row>
                            <Col md={12}>
                              {topic.description && (
                                <div className="mb-3">
                                  <h6>Description</h6>
                                  <p style={{ whiteSpace: 'pre-wrap' }}>{topic.description}</p>
                                </div>
                              )}

                              <Row className="mb-3">
                                {topic.duration_hours !== undefined && (
                                  <Col md={4}>
                                    <div className="p-2 bg-light rounded">
                                      <small className="text-muted">Duration</small>
                                      <div><strong>{topic.duration_hours} hours</strong></div>
                                    </div>
                                  </Col>
                                )}
                                {topic.order !== undefined && (
                                  <Col md={4}>
                                    <div className="p-2 bg-light rounded">
                                      <small className="text-muted">Order</small>
                                      <div><strong>{topic.order}</strong></div>
                                    </div>
                                  </Col>
                                )}
                                {topic.is_mandatory !== undefined && (
                                  <Col md={4}>
                                    <div className="p-2 bg-light rounded">
                                      <small className="text-muted">Mandatory</small>
                                      <div><strong>{topic.is_mandatory ? 'Yes' : 'No'}</strong></div>
                                    </div>
                                  </Col>
                                )}
                              </Row>

                              {topic.learning_objectives && topic.learning_objectives.length > 0 && (
                                <div className="mb-3">
                                  <h6>Learning Objectives</h6>
                                  <ul>
                                    {topic.learning_objectives.map((obj, idx) => (
                                      <li key={idx}>{obj}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {topic.prerequisites && topic.prerequisites.length > 0 && (
                                <div className="mb-3">
                                  <h6>Prerequisites</h6>
                                  <ul>
                                    {topic.prerequisites.map((prereq, idx) => (
                                      <li key={idx}>{prereq}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="mt-3">
                                <Link
                                  to={`/Topics/view-topic/${topic.id}`}
                                  className="btn btn-sm btn-outline-primary me-2"
                                >
                                  <Icon name="eye" /> View Details
                                </Link>
                                <Link
                                  to={`/Topics/update-topic/${topic.id}`}
                                  className="btn btn-sm btn-outline-secondary"
                                >
                                  <Icon name="edit" /> Edit Topic
                                </Link>
                              </div>
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Card.Body>
              </Card>
            )}
          </>
        ) : (
          <p className="text-danger">Course not found.</p>
        )}
      </Block>
    </Layout>
  );
}

export default CourseView;
