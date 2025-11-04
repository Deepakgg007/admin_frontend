import { useState, useEffect } from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function TopicView() {
  const { id } = useParams();
  const authToken = localStorage.getItem("authToken");
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/topics/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.data || res.data;
        setTopic(data);
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to load topic details.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id, authToken]);

  if (loading) {
    return (
      <Layout title="Topic Details" content="container">
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!topic) {
    return (
      <Layout title="Topic Details" content="container">
        <div className="alert alert-warning">Topic not found</div>
      </Layout>
    );
  }

  return (
    <Layout title="Topic Details" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Topic Details</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Topics/list-topic">Topics</Link></li>
                <li className="breadcrumb-item active">View</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <div className="d-flex gap-2">
              <Link to={`/Topics/update-topic/${id}`} className="btn btn-primary">
                <Icon name="edit" /> Edit
              </Link>
              <Link to="/Topics/list-topic" className="btn btn-outline-primary">
                <Icon name="list" /> View All
              </Link>
            </div>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Row className="g-gs">
          <Col md={12}>
            <Card>
              <Card.Header className="bg-light">
                <h4 className="mb-0">{topic.title}</h4>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={12}>
                    <p className="text-muted mb-1">Course</p>
                    <p className="fw-bold">{topic.course_title || `ID: ${topic.course}`}</p>
                  </Col>

                  <Col md={12}>
                    <p className="text-muted mb-1">Description</p>
                    <p>{topic.description || "No description provided."}</p>
                  </Col>

                  <Col md={12}>
                    <p className="text-muted mb-1">Status</p>
                    <div>
                      {topic.is_published ? (
                        <Badge bg="success" className="me-2">Published</Badge>
                      ) : (
                        <Badge bg="secondary" className="me-2">Draft</Badge>
                      )}
                      {topic.is_preview && <Badge bg="info">Preview Available</Badge>}
                    </div>
                  </Col>

                  <Col md={6}>
                    <p className="text-muted mb-1">Created At</p>
                    <p>{new Date(topic.created_at).toLocaleString()}</p>
                  </Col>

                  <Col md={6}>
                    <p className="text-muted mb-1">Last Updated</p>
                    <p>{new Date(topic.updated_at).toLocaleString()}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Block>
    </Layout>
  );
}

export default TopicView;
