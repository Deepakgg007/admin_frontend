// src/pages/Courses/CourseCreate.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

function CourseCreate() {
  const navigate = useNavigate();

  // Form states
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [durationHours, setDurationHours] = useState('');
  const [status, setStatus] = useState('draft');
  const [thumbnail, setThumbnail] = useState(null);
  const [introVideo, setIntroVideo] = useState(null);
  const [videoIntroUrl, setVideoIntroUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const authToken = localStorage.getItem('authToken');

  // Handle thumbnail file change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
  };

  // Handle intro video file change
  const handleIntroVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIntroVideo(file);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!authToken) {
      Swal.fire({ icon: 'error', title: 'Unauthorized', text: 'Please login.' });
      setLoading(false);
      return;
    }

    try {
      const formDataObj = new FormData();
      if (courseId) formDataObj.append('course_id', courseId);
      formDataObj.append('title', title);
      formDataObj.append('description', description);
      formDataObj.append('difficulty_level', difficultyLevel);
      formDataObj.append('duration_hours', durationHours || 0);
      formDataObj.append('status', status);
      if (thumbnail) formDataObj.append('thumbnail', thumbnail);
      if (introVideo) formDataObj.append('intro_video', introVideo);
      if (videoIntroUrl) formDataObj.append('video_intro_url', videoIntroUrl);
      formDataObj.append('is_featured', isFeatured);

      const response = await axios.post(`${API_BASE_URL}/api/courses/`, formDataObj, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        Swal.fire({ icon: 'success', title: 'Success', text: 'Course created successfully!' });
        navigate('/Courses/list-course');
      }
    } catch (error) {
      console.error('Error creating course', error);
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        setErrors(errorData);
        const errorMessages = Object.values(errorData).flat().join(', ');
        Swal.fire({ icon: 'error', title: 'Validation Error', text: errorMessages });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create course.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Course" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Create New Course</Block.Title>
            <p className="text-muted">Fill in the details to add a new course</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Courses/list-course" className="btn btn-outline-secondary">
              <Icon name="arrow-left me-1" /> Back to List
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <h5 className="mb-3">Basic Information</h5>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      isInvalid={!!errors.course_id}
                      placeholder="e.g., CS101"
                      maxLength={20}
                    />
                    <Form.Control.Feedback type="invalid">{errors.course_id}</Form.Control.Feedback>
                    <Form.Text className="text-muted">Unique course identifier (max 20 characters)</Form.Text>
                  </Form.Group>
                </Col>

                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      isInvalid={!!errors.title}
                      placeholder="Enter course title"
                      required
                    />
                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Description <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      isInvalid={!!errors.description}
                      placeholder="Enter detailed course description..."
                      required
                    />
                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Course Settings */}
              <h5 className="mb-3 mt-4">Course Settings</h5>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Difficulty Level</Form.Label>
                    <Form.Select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Duration (hours)</Form.Label>
                    <Form.Control
                      type="number"
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                      min="0"
                      placeholder="e.g., 40"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <div className="pt-4">
                      <Form.Check
                        type="checkbox"
                        label="Featured Course"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Media */}
              <h5 className="mb-3 mt-4">Course Media</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Thumbnail</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleThumbnailChange}
                      accept="image/*"
                    />
                    <Form.Text className="text-muted">Recommended size: 800x600px</Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Intro Video (Upload)</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleIntroVideoChange}
                      accept="video/*"
                    />
                    <Form.Text className="text-muted">Upload video file (MP4, AVI, MKV, etc.)</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Video Intro URL (YouTube/Vimeo)</Form.Label>
                    <Form.Control
                      type="url"
                      value={videoIntroUrl}
                      onChange={(e) => setVideoIntroUrl(e.target.value)}
                      placeholder="http://www.youtube.com/watch?v=..."
                    />
                    <Form.Text className="text-muted">Or provide a YouTube/Vimeo link</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Submit Buttons */}
              <div className="d-flex gap-2 mt-4">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Icon name="check me-1" /> Create Course
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/Courses/list-course')}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
}

export default CourseCreate;
