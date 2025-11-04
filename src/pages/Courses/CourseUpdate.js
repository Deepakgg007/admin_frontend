import { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function CourseUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    difficulty_level: "beginner",
    duration_hours: "",
    status: "draft",
    is_featured: false,
    thumbnail: null,
    oldThumbnailUrl: "",
    intro_video: null,
    oldIntroVideoUrl: "",
    video_intro_url: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing course details
  useEffect(() => {
    if (!authToken) return;
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/courses/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.data || res.data;

        setForm({
          course_id: data.course_id || "",
          title: data.title || "",
          description: data.description || "",
          difficulty_level: data.difficulty_level || "beginner",
          duration_hours: data.duration_hours || "",
          status: data.status || "draft",
          is_featured: data.is_featured ?? false,
          thumbnail: null,
          oldThumbnailUrl: data.thumbnail || "",
          intro_video: null,
          oldIntroVideoUrl: data.intro_video || "",
          video_intro_url: data.video_intro_url || "",
        });
      } catch (err) {
        console.error("Error fetching course:", err);
        Swal.fire("Error", "Failed to fetch course details", "error");
      }
    };
    fetchCourse();
  }, [id, authToken]);

  // Handle input changes
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle thumbnail change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm((prev) => ({ ...prev, thumbnail: file }));
  };

  // Handle intro video change
  const handleIntroVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm((prev) => ({ ...prev, intro_video: file }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!authToken) {
      Swal.fire("Unauthorized", "Please login first.", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      if (form.course_id) formData.append("course_id", form.course_id);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("difficulty_level", form.difficulty_level);
      formData.append("duration_hours", form.duration_hours || 0);
      formData.append("status", form.status);
      formData.append("is_featured", form.is_featured);
      if (form.thumbnail) formData.append("thumbnail", form.thumbnail);
      if (form.intro_video) formData.append("intro_video", form.intro_video);
      if (form.video_intro_url) formData.append("video_intro_url", form.video_intro_url);

      const response = await axios.put(
        `${API_BASE_URL}/api/courses/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire("Success", "Course updated successfully!", "success");
        navigate(`/Courses/view-course/${id}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      const errorMsg = error.response?.data?.message || "Failed to update course.";
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Update Course" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Update Course</Block.Title>
            <p className="text-muted">Edit course details</p>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to={`/Courses/view-course/${id}`} className="btn btn-outline-secondary">
              <Icon name="arrow-left me-1" /> Back to View
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
                      name="course_id"
                      value={form.course_id}
                      onChange={handleInput}
                      placeholder="e.g., CS101"
                      maxLength={20}
                    />
                    <Form.Text className="text-muted">Unique course identifier</Form.Text>
                  </Form.Group>
                </Col>

                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleInput}
                      placeholder="Enter course title"
                      required
                    />
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
                      name="description"
                      value={form.description}
                      onChange={handleInput}
                      placeholder="Enter detailed course description..."
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={form.status} onChange={handleInput}>
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
                    <Form.Select name="difficulty_level" value={form.difficulty_level} onChange={handleInput}>
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
                      name="duration_hours"
                      value={form.duration_hours}
                      onChange={handleInput}
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
                        name="is_featured"
                        checked={form.is_featured}
                        onChange={handleInput}
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
                    {form.oldThumbnailUrl && (
                      <div className="mb-2">
                        <img
                          src={form.oldThumbnailUrl}
                          alt="Current thumbnail"
                          style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "5px" }}
                        />
                        <p className="text-muted small mt-1">Current thumbnail</p>
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      onChange={handleThumbnailChange}
                      accept="image/*"
                    />
                    <Form.Text className="text-muted">Leave empty to keep current</Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Intro Video (Upload)</Form.Label>
                    {form.oldIntroVideoUrl && (
                      <div className="mb-2">
                        <p className="text-muted small">
                          Current video: <a href={form.oldIntroVideoUrl} target="_blank" rel="noopener noreferrer">View</a>
                        </p>
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      onChange={handleIntroVideoChange}
                      accept="video/*"
                    />
                    <Form.Text className="text-muted">Upload new video file</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Video Intro URL (YouTube/Vimeo)</Form.Label>
                    <Form.Control
                      type="url"
                      name="video_intro_url"
                      value={form.video_intro_url}
                      onChange={handleInput}
                      placeholder="http://www.youtube.com/watch?v=..."
                    />
                    <Form.Text className="text-muted">Or provide a YouTube/Vimeo link</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Submit Buttons */}
              <div className="d-flex gap-2 mt-4">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icon name="check me-1" /> Update Course
                    </>
                  )}
                </Button>
                <Link to={`/Courses/view-course/${id}`} className="btn btn-secondary">
                  Cancel
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
}

export default CourseUpdate;
