import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from '../../layout/default';
import { Block, BlockHead, BlockHeadContent, BlockTitle, Icon } from '../../components';
import { API_BASE_URL } from '../../services/apiBase';

const VideoForm = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('edit');

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState('youtube'); // 'youtube' or 'file'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    video_file: null,
  });

  useEffect(() => {
    fetchTask();
    if (videoId) {
      fetchVideo();
    }
  }, [taskId, videoId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load task details'
      });
    }
  };

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/task-videos/${videoId}/`, {
        headers: getAuthHeaders()
      });
      const video = response.data.data || response.data;
      setUploadType(video.youtube_url ? 'youtube' : 'file');
      setFormData({
        title: video.title || '',
        description: video.description || '',
        youtube_url: video.youtube_url || '',
        video_file: null,
      });
    } catch (error) {
      console.error('Error fetching video:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load video details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadType === 'youtube' && !formData.youtube_url) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing YouTube URL',
        text: 'Please enter a YouTube URL'
      });
      return;
    }

    if (uploadType === 'file' && !videoId && !formData.video_file) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Video File',
        text: 'Please select a video file to upload'
      });
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('task', taskId);
      data.append('title', formData.title || '');
      data.append('description', formData.description || '');

      if (uploadType === 'youtube') {
        data.append('youtube_url', formData.youtube_url);
      } else if (formData.video_file) {
        data.append('video_file', formData.video_file);
      }

      if (videoId) {
        // Update existing video
        await axios.patch(`${API_BASE_URL}/api/task-videos/${videoId}/`, data, {
          headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Video updated successfully',
          timer: 2000
        });
      } else {
        // Create new video
        // Get current videos to calculate order
        const videosRes = await axios.get(`${API_BASE_URL}/api/task-videos/?task=${taskId}`, {
          headers: getAuthHeaders()
        });
        const videos = videosRes.data.results || videosRes.data || [];
        data.append('order', videos.length);

        await axios.post(`${API_BASE_URL}/api/task-videos/`, data, {
          headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Video added successfully',
          timer: 2000
        });
      }

      navigate(`/Tasks/task-detail/${taskId}`);
    } catch (error) {
      console.error('Error saving video:', error);
      const errorMsg = error.response?.data?.non_field_errors?.[0]
        || error.response?.data?.message
        || JSON.stringify(error.response?.data)
        || 'Failed to save video';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/Tasks/task-detail/${taskId}`);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <Layout title={videoId ? 'Edit Video' : 'Add Video'} content="container">
      <Block>
        <BlockHead>
          <BlockHeadContent>
            <BlockTitle tag="h2">{videoId ? 'Edit Video' : 'Add Video'}</BlockTitle>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><a href="/">Home</a></li>
                <li className="breadcrumb-item"><a href="/Tasks/task-management">Tasks</a></li>
                <li className="breadcrumb-item"><a href={`/Tasks/task-detail/${taskId}`}>{task?.title || 'Task'}</a></li>
                <li className="breadcrumb-item active">{videoId ? 'Edit Video' : 'Add Video'}</li>
              </ol>
            </nav>
          </BlockHeadContent>
        </BlockHead>

        <Card>
          <Card.Body>
            {task && (
              <Alert variant="info" className="mb-4">
                <strong>Task:</strong> {task.title}
                {task.course_title && <span className="ms-3"><strong>Course:</strong> {task.course_title}</span>}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {!videoId && (
                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Label className="mb-2"><strong>Video Source</strong></Form.Label>
                    <div>
                      <ButtonGroup className="w-100">
                        <Button
                          variant={uploadType === 'youtube' ? 'primary' : 'outline-primary'}
                          onClick={() => setUploadType('youtube')}
                          type="button"
                        >
                          <Icon name="youtube" /> YouTube URL
                        </Button>
                        <Button
                          variant={uploadType === 'file' ? 'primary' : 'outline-primary'}
                          onClick={() => setUploadType('file')}
                          type="button"
                        >
                          <Icon name="upload" /> Upload Video File
                        </Button>
                      </ButtonGroup>
                    </div>
                  </Col>
                </Row>
              )}

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter video title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter description (optional)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                {uploadType === 'youtube' ? (
                  <>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>YouTube URL <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          value={formData.youtube_url}
                          onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                          required={!videoId}
                        />
                        <Form.Text className="text-muted">
                          Enter the full YouTube video URL (e.g., https://youtube.com/watch?v=dQw4w9WgXcQ)
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    {formData.youtube_url && getYouTubeEmbedUrl(formData.youtube_url) && (
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Preview</Form.Label>
                          <div className="ratio ratio-16x9">
                            <iframe
                              src={getYouTubeEmbedUrl(formData.youtube_url)}
                              title="YouTube video preview"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </Form.Group>
                      </Col>
                    )}
                  </>
                ) : (
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Video File {videoId ? '(Leave empty to keep current file)' : <span className="text-danger">*</span>}
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
                        onChange={(e) => setFormData({ ...formData, video_file: e.target.files[0] })}
                        required={!videoId}
                      />
                      <Form.Text className="text-muted">
                        Supported formats: MP4, MOV, AVI, MKV, WEBM (Max 100MB recommended)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                )}
              </Row>

              <div className="d-flex gap-2 justify-content-end mt-4">
                <Button variant="secondary" onClick={handleCancel} disabled={loading}>
                  <Icon name="x" /> Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {videoId ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Icon name={videoId ? 'save' : 'plus'} /> {videoId ? 'Update' : 'Add'}
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
};

export default VideoForm;
