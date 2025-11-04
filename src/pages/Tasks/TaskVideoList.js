import React, { useState, useEffect } from 'react';
import { Button, Table, Spinner, Badge, Modal, Form, Row, Col, ButtonGroup } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Trash2, Edit, Video, Upload, Menu } from 'react-feather';
import { API_BASE_URL } from '../../services/apiBase';

const TaskVideoList = ({ taskId, refreshKey, onRefresh }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [uploadType, setUploadType] = useState('youtube'); // 'youtube' or 'file'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    video_file: null,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

    useEffect(() => {
    fetchVideos();
  }, [taskId, refreshKey]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/task-videos/?task=${taskId}`, { headers: getAuthHeaders() });
      console.log('🎥 Videos:', response.data);

      const vids = response.data.results || response.data;
      setVideos(Array.isArray(vids) ? vids : []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load videos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setUploadType(video.youtube_url ? 'youtube' : 'file');
      setFormData({
        title: video.title || '',
        description: video.description || '',
        youtube_url: video.youtube_url || '',
        video_file: null,
      });
    } else {
      setEditingVideo(null);
      setUploadType('youtube');
      setFormData({
        title: '',
        description: '',
        youtube_url: '',
        video_file: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setFormData({ title: '', description: '', youtube_url: '', video_file: null });
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

    if (uploadType === 'file' && !editingVideo && !formData.video_file) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Video File',
        text: 'Please select a video file to upload'
      });
      return;
    }

    try {
      const data = new FormData();
      data.append('task', taskId);
      data.append('title', formData.title || '');
      data.append('description', formData.description || '');
      data.append('order', videos.length);

      if (uploadType === 'youtube') {
        data.append('youtube_url', formData.youtube_url);
        // Explicitly don't send video_file for youtube
      } else if (formData.video_file) {
        data.append('video_file', formData.video_file);
        // Explicitly don't send youtube_url for file upload
      }

      // Debug: Log what we're sending
      console.log('Submitting video data:', {
        task: taskId,
        title: formData.title,
        uploadType,
        youtube_url: uploadType === 'youtube' ? formData.youtube_url : null,
        video_file: uploadType === 'file' ? formData.video_file?.name : null
      });

      if (editingVideo) {
        await axios.patch(`${API_BASE_URL}/api/task-videos/${editingVideo.id}/`, data, {
          headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Video updated successfully',
          timer: 2000
        });
      } else {
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

      handleCloseModal();
      fetchVideos();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving video:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.non_field_errors?.[0]
        || error.response?.data?.message
        || JSON.stringify(error.response?.data)
        || 'Failed to save video';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg
      });
    }
  };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: 'Delete Video?',
      text: `Are you sure you want to delete "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/task-videos/${id}/`, { headers: getAuthHeaders() });
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Video deleted successfully',
          timer: 2000
        });
        fetchVideos();
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting video:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete video'
        });
      }
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setVideos(items);

    const reorderData = items.map((item, index) => ({
      id: item.id,
      order: index
    }));

    try {
      await axios.post(`${API_BASE_URL}/api/task-videos/reorder/`, {
        items: reorderData
      }, { headers: getAuthHeaders() });
    } catch (error) {
      console.error('Error reordering videos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reorder videos'
      });
      fetchVideos();
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Videos ({videos.length})</h5>
        <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
          <Video size={16} className="me-1" /> Add Video
        </Button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <Video size={48} className="mb-3" />
          <p>No videos yet. Add your first video!</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="videos">
            {(provided) => (
              <Table hover responsive {...provided.droppableProps} ref={provided.innerRef}>
                <thead>
                  <tr>
                    <th width="50"></th>
                    <th width="60">Order</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video, index) => (
                    <Draggable key={video.id} draggableId={String(video.id)} index={index}>
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            backgroundColor: snapshot.isDragging ? '#f8f9fa' : 'white'
                          }}
                        >
                          <td {...provided.dragHandleProps} style={{ cursor: 'grab' }}>
                            <Menu size={18} className="text-muted" />
                          </td>
                          <td>
                            <Badge bg="secondary">{index + 1}</Badge>
                          </td>
                          <td>
                            <strong>{video.title || 'Untitled'}</strong>
                          </td>
                          <td>
                            {video.youtube_url ? (
                              <Badge bg="danger">📺 YouTube</Badge>
                            ) : (
                              <Badge bg="primary">🎥 Uploaded</Badge>
                            )}
                          </td>
                          <td className="text-muted small">
                            {video.description || '-'}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleOpenModal(video)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(video.id, video.title)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </Table>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingVideo ? 'Edit Video' : 'Add Video'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {!editingVideo && (
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Label>Video Source</Form.Label>
                  <ButtonGroup className="d-block">
                    <Button
                      variant={uploadType === 'youtube' ? 'primary' : 'outline-primary'}
                      onClick={() => setUploadType('youtube')}
                    >
                      📺 YouTube URL
                    </Button>
                    <Button
                      variant={uploadType === 'file' ? 'primary' : 'outline-primary'}
                      onClick={() => setUploadType('file')}
                    >
                      🎥 Upload File
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            )}

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
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
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>YouTube URL</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      required={!editingVideo}
                    />
                    <Form.Text className="text-muted">
                      Enter the full YouTube video URL
                    </Form.Text>
                  </Form.Group>

                  {formData.youtube_url && getYouTubeEmbedUrl(formData.youtube_url) && (
                    <div className="mb-3">
                      <Form.Label>Preview</Form.Label>
                      <div className="ratio ratio-16x9">
                        <iframe
                          src={getYouTubeEmbedUrl(formData.youtube_url)}
                          title="YouTube video preview"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                </Col>
              ) : (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Video File {editingVideo && '(Leave empty to keep current file)'}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
                      onChange={(e) => setFormData({ ...formData, video_file: e.target.files[0] })}
                      required={!editingVideo}
                    />
                    <Form.Text className="text-muted">
                      Supported: MP4, MOV, AVI, MKV, WEBM (Max 100MB recommended)
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingVideo ? 'Update' : 'Add'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default TaskVideoList;
