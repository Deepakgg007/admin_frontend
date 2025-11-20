import { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Table, Button, Modal, Form } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon, AdminOnly } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";
import { isAdmin } from "../../utilities/auth";

function SyllabusDetail() {
  const { id } = useParams();
  const authToken = localStorage.getItem("authToken");
  const [syllabus, setSyllabus] = useState(null);
  const [syllabusTopics, setSyllabusTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSyllabusDetail();
  }, [id]);

  const fetchSyllabusDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/syllabi/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = res.data.data || res.data;
      console.log('📌 Syllabus data:', data);
      setSyllabus(data);

      // Get ordered topics from the response
      const orderedTopics = data.ordered_topics || [];
      console.log('📌 Ordered topics:', orderedTopics);
      setSyllabusTopics(orderedTopics);

      // Fetch all topics for the course to show in add modal
      if (data.course) {
        fetchAvailableTopics(data.course);
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Failed to load syllabus details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTopics = async (courseId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/topics/`, {
        params: { course: courseId, per_page: 1000 },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = res.data.data || res.data.results || [];
      console.log('📌 Available topics:', data);
      setAvailableTopics(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOrderChange = (index, newOrder) => {
    const updated = [...syllabusTopics];
    updated[index].order = parseInt(newOrder) || 0;
    setSyllabusTopics(updated);
  };

  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);

      const topicsOrder = syllabusTopics.map((st) => ({
        syllabus_topic_id: st.id,
        order: st.order
      }));

      const response = await axios.post(
        `${API_BASE_URL}/api/syllabi/${id}/reorder_topics/`,
        { topics_order: topicsOrder },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Order saved!",
        text: "Topic order has been updated successfully",
        timer: 2000
      });

      // Refresh from server to ensure consistency
      setTimeout(() => fetchSyllabusDetail(), 500);
    } catch (error) {
      console.error("Error saving order:", error);
      Swal.fire("Error!", "Failed to save order", "error");
      // Refresh on error to get correct order from server
      fetchSyllabusDetail();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTopic = async () => {
    if (!selectedTopicId) {
      Swal.fire("Error!", "Please select a topic.", "error");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/syllabi/${id}/add_topic/`,
        { topic_id: parseInt(selectedTopicId) },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setShowAddModal(false);
      setSelectedTopicId("");
      fetchSyllabusDetail();
      Swal.fire({
        icon: "success",
        title: "Topic added to syllabus!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to add topic.";
      Swal.fire("Error!", errorMsg, "error");
    }
  };

  const handleRemoveTopic = async (syllabusTopicId) => {
    const result = await Swal.fire({
      title: "Remove Topic?",
      text: "This will remove the topic from this syllabus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/syllabi/${id}/remove_topic/`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { syllabus_topic_id: syllabusTopicId }
      });

      fetchSyllabusDetail();
      Swal.fire("Removed!", "Topic removed from syllabus.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Failed to remove topic.", "error");
    }
  };

  if (loading) {
    return (
      <Layout title="Syllabus Details" content="container">
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!syllabus) {
    return (
      <Layout title="Syllabus Details" content="container">
        <div className="alert alert-warning">Syllabus not found</div>
      </Layout>
    );
  }

  // Filter out topics that are already in the syllabus
  const topicsAlreadyInSyllabus = syllabusTopics.map(st => st.topic_id);
  const filteredAvailableTopics = availableTopics.filter(
    t => !topicsAlreadyInSyllabus.includes(t.id)
  );

  return (
    <Layout title="Syllabus Details" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Syllabus Details - Manage Topics</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Syllabus/list-syllabus">Syllabus</Link></li>
                <li className="breadcrumb-item active">Manage Topics</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <div className="d-flex gap-2">
              <AdminOnly>
                <Link to={`/Syllabus/update-syllabus/${id}`} className="btn btn-primary">
                  <Icon name="edit" /> Edit Syllabus
                </Link>
              </AdminOnly>
              <Link to="/Syllabus/list-syllabus" className="btn btn-outline-primary">
                <Icon name="list" /> View All
              </Link>
            </div>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Row className="g-gs">
          {/* Syllabus Info */}
          <Col md={12}>
            <Card>
              <Card.Header className="bg-light">
                <h4 className="mb-0">{syllabus.title}</h4>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <p className="text-muted mb-1">Course</p>
                    <p className="fw-bold">{syllabus.course_title || `ID: ${syllabus.course}`}</p>
                  </Col>

                  <Col md={3}>
                    <p className="text-muted mb-1">Order</p>
                    <p className="fw-bold">{syllabus.order}</p>
                  </Col>

                  <Col md={3}>
                    <p className="text-muted mb-1">Status</p>
                    <div>
                      {syllabus.is_published ? (
                        <Badge bg="success">Published</Badge>
                      ) : (
                        <Badge bg="secondary">Draft</Badge>
                      )}
                    </div>
                  </Col>

                  <Col md={12}>
                    <p className="text-muted mb-1">Description</p>
                    <p>{syllabus.description || "No description provided."}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Topics Section */}
          <Col md={12}>
            <Card>
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Topics in Syllabus ({syllabusTopics.length})</h5>
                <AdminOnly>
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleSaveOrder}
                      disabled={isSaving}
                    >
                      <Icon name="save" /> {isSaving ? 'Saving...' : 'Save Order'}
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                      <Icon name="plus" /> Add Topic
                    </Button>
                  </div>
                </AdminOnly>
              </Card.Header>
              <Card.Body>
                {syllabusTopics.length === 0 ? (
                  <div className="alert alert-info">
                    No topics added yet. Click "Add Topic" to add topics to this syllabus.
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th style={{width: "60px"}}>Order</th>
                        <th>Title</th>
                        <AdminOnly>
                          <th style={{width: "180px"}}>Actions</th>
                        </AdminOnly>
                      </tr>
                    </thead>
                    <tbody>
                      {syllabusTopics.map((st, index) => (
                        <tr key={st.id}>
                          <AdminOnly>
                            <td>
                              <Form.Control
                                type="number"
                                value={st.order}
                                onChange={(e) => handleOrderChange(index, e.target.value)}
                                style={{ width: '80px' }}
                                min="0"
                              />
                            </td>
                          </AdminOnly>
                          <td>
                            <Link to={`/Topics/view-topic/${st.topic_id}`}>
                              {st.topic_title}
                            </Link>
                          </td>
                          <AdminOnly>
                            <td>
                              <div className="d-flex">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleRemoveTopic(st.id)}
                                  title="Remove from Syllabus"
                                >
                                  <Icon name="trash" />
                                </Button>
                              </div>
                            </td>
                          </AdminOnly>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>

      {/* Add Topic Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Topic to Syllabus</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Topic</Form.Label>
            <Form.Select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
            >
              <option value="">-- Select Topic --</option>
              {filteredAvailableTopics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </Form.Select>
            {filteredAvailableTopics.length === 0 && (
              <Form.Text className="text-muted">
                No available topics. All topics for this course have been added to the syllabus.
              </Form.Text>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddTopic}
            disabled={!selectedTopicId}
          >
            Add Topic
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default SyllabusDetail;
