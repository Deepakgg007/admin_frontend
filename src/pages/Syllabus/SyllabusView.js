import { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Table } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function SyllabusView() {
  const { id } = useParams();
  const authToken = localStorage.getItem("authToken");
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/syllabi/${id}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data.data || res.data;
        setSyllabus(data);
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to load syllabus details.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [id, authToken]);

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

  return (
    <Layout title="Syllabus Details" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Syllabus Details</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/Syllabus/list-syllabus">Syllabus</Link></li>
                <li className="breadcrumb-item active">View</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <div className="d-flex gap-2">
              <Link to={`/Syllabus/update-syllabus/${id}`} className="btn btn-primary">
                <Icon name="edit" /> Edit
              </Link>
              <Link to="/Syllabus/list-syllabus" className="btn btn-outline-primary">
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
                <h4 className="mb-0">{syllabus.title}</h4>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <p className="text-muted mb-1">Course</p>
                    <p className="fw-bold">{syllabus.course_title || syllabus.course?.title || `ID: ${syllabus.course}`}</p>
                  </Col>

                  <Col md={6}>
                    <p className="text-muted mb-1">Order</p>
                    <p className="fw-bold">{syllabus.order}</p>
                  </Col>

                  <Col md={12}>
                    <p className="text-muted mb-1">Description</p>
                    <p>{syllabus.description || "No description provided."}</p>
                  </Col>

                  <Col md={12}>
                    <p className="text-muted mb-1">Status</p>
                    <div>
                      {syllabus.is_published ? (
                        <Badge bg="success" className="me-2">Published</Badge>
                      ) : (
                        <Badge bg="secondary" className="me-2">Draft</Badge>
                      )}
                    </div>
                  </Col>

                  <Col md={6}>
                    <p className="text-muted mb-1">Created At</p>
                    <p>{new Date(syllabus.created_at).toLocaleString()}</p>
                  </Col>

                  <Col md={6}>
                    <p className="text-muted mb-1">Last Updated</p>
                    <p>{new Date(syllabus.updated_at).toLocaleString()}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {syllabus.topics && syllabus.topics.length > 0 && (
            <Col md={12}>
              <Card>
                <Card.Header className="bg-light">
                  <h5 className="mb-0">Topics ({syllabus.topics_count || syllabus.topics.length})</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syllabus.topics.map((topic) => (
                        <tr key={topic.id}>
                          <td>{topic.order}</td>
                          <td>{topic.title}</td>
                          <td>
                            <Badge bg="info">{topic.content_type || "N/A"}</Badge>
                          </td>
                          <td>{topic.duration_minutes ? `${topic.duration_minutes} min` : "—"}</td>
                          <td>
                            {topic.is_published ? (
                              <Badge bg="success">Published</Badge>
                            ) : (
                              <Badge bg="secondary">Draft</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Block>
    </Layout>
  );
}

export default SyllabusView;
