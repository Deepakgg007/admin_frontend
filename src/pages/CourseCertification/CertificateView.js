import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Row, Col, Spinner, Badge, Table, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";
import CertificateTemplate from "./CertificateTemplate";
import { downloadCertificateAsPDF, printCertificate } from "./CertificateDownloadHelper";

function CertificateView() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef(null);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const getCertificate = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/admin/cert/certifications/${id}/`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        setCertificate(res.data.data || res.data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load certificate.", "error");
      } finally {
        setLoading(false);
      }
    };
    getCertificate();
  }, [id, authToken]);

  /**
   * Download certificate as PDF using frontend generation
   * Generates certificate directly from React component with Z1 logo, college logo, and signatures
   */
  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      await downloadCertificateAsPDF(
        certificateRef,
        `${certificate.title || 'Certificate'}`
      );
      Swal.fire(
        "Success",
        "Certificate downloaded successfully.",
        "success"
      );
    } catch (error) {
      console.error("Error downloading certificate:", error);
      Swal.fire(
        "Error",
        error.message || "Failed to download certificate.",
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Print certificate using frontend template
   */
  const handlePrintCertificate = async () => {
    try {
      await printCertificate(certificateRef);
    } catch (error) {
      console.error("Error printing certificate:", error);
      Swal.fire(
        "Error",
        error.message || "Failed to print certificate.",
        "error"
      );
    }
  };

  return (
    <Layout title="View Certificate" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Certificate Details</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/Certificates/list-certificate">Certificates</Link>
                </li>
                <li className="breadcrumb-item active">View</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <div className="d-flex gap-2 flex-wrap">
              <Link to="/Certificates/list-certificate" className="btn btn-outline-secondary">
                <Icon name="arrow-left me-1" /> Back
              </Link>
              <Link to={`/Certificates/update-certificate/${id}`} className="btn btn-primary">
                <Icon name="edit me-1" /> Edit
              </Link>
              <Button
                variant="success"
                onClick={handleDownloadCertificate}
                disabled={downloading || !certificate}
              >
                <Icon name="download me-1" />
                {downloading ? "Downloading..." : "Download PDF"}
              </Button>
              <Button
                variant="info"
                onClick={handlePrintCertificate}
                disabled={!certificate}
              >
                <Icon name="printer me-1" /> Print
              </Button>
            </div>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        ) : certificate ? (
          <>
            {/* Certificate Preview */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Certificate Preview</h5>
              </Card.Header>
              <Card.Body className="p-0" style={{ backgroundColor: "#f5f5f5" }}>
                <CertificateTemplate
                  ref={certificateRef}
                  studentName={certificate.student_name || "Student Name"}
                  courseName={certificate.course_title || certificate.title}
                  completionDate={new Date(certificate.created_at || Date.now()).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                  score={certificate.score || 100}
                  passingScore={certificate.passing_score || 80}
                  collegeName={certificate.college_name || "Z1 Education"}
                  collegeLogo={certificate.college_logo}
                  collegeSignature={certificate.college_signature}
                  certificateNumber={certificate.certificate_number || `CERT-${id}`}
                  principalName={certificate.principal_name || "Director"}
                />
              </Card.Body>
            </Card>

            {/* Certificate Header Card */}
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h3>{certificate.title}</h3>
                    <p className="text-muted mb-0">{certificate.description}</p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <Badge bg={certificate.is_active ? "success" : "secondary"}>
                      {certificate.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <Row className="mb-3">
                  <Col md={4}>
                    <strong>Course:</strong> {certificate.course_title || `ID: ${certificate.course}`}
                  </Col>
                  <Col md={4}>
                    <strong>Passing Score:</strong> {certificate.passing_score}%
                  </Col>
                  <Col md={4}>
                    <strong>Duration:</strong> {certificate.duration_minutes} minutes
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <strong>Max Attempts:</strong> {certificate.max_attempts}
                  </Col>
                  <Col md={4}>
                    <strong>Total Questions:</strong> {certificate.questions_count || certificate.questions?.length || 0}
                  </Col>
                  <Col md={4}>
                    <strong>Created:</strong> {new Date(certificate.created_at).toLocaleDateString()}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Questions Section */}
            {certificate.questions && certificate.questions.length > 0 && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Assessment Questions ({certificate.questions.length})</h5>
                </Card.Header>
                <Card.Body>
                  {certificate.questions.map((question, qIndex) => (
                    <Card key={question.id} className="mb-3 border">
                      <Card.Header className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">Question {qIndex + 1}</h6>
                          <div className="d-flex gap-2">
                            <Badge bg="info">Order: {question.order}</Badge>
                            <Badge bg="primary">Weight: {question.weight}</Badge>
                            {question.is_multiple_correct && (
                              <Badge bg="warning">Multiple Correct</Badge>
                            )}
                            <Badge bg={question.is_active ? "success" : "secondary"}>
                              {question.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <p className="fw-bold mb-3">{question.text}</p>

                        <h6 className="mb-2">Options:</h6>
                        <Table responsive striped>
                          <thead>
                            <tr>
                              <th width="5%">Correct</th>
                              <th>Option Text</th>
                            </tr>
                          </thead>
                          <tbody>
                            {question.options.map((option, oIndex) => (
                              <tr key={option.id}>
                                <td>
                                  {option.is_correct ? (
                                    <Badge bg="success">✓</Badge>
                                  ) : (
                                    <Badge bg="secondary">✗</Badge>
                                  )}
                                </td>
                                <td>{option.text}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  ))}
                </Card.Body>
              </Card>
            )}
          </>
        ) : (
          <p className="text-danger">Certificate not found.</p>
        )}
      </Block>
    </Layout>
  );
}

export default CertificateView;
