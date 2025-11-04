import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from "../../services/apiBase";

function UniversityView() {
  const { id } = useParams();
  const [University, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const getUniversity = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/universities/${id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setUniversity(res.data.data);
      } catch {
        Swal.fire("Error", "Failed to load University.", "error");
      } finally {
        setLoading(false);
      }
    };
    getUniversity();
  }, [id, authToken]);

  return (
    <Layout title="View University" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">View University</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/University/list-University">University</Link>
                </li>
                <li className="breadcrumb-item active">View</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/University/list-University" className="btn btn-primary">
              <Icon name="arrow-left" /> Back to University
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        ) : University ? (
          <Row>
            <Col xxl="12">
              <Card className="card-gutter-md p-3">
                <div>
                  <strong>Name:</strong> {University.name || "—"}
                </div>
                <div className="mt-2">
                  <strong>Address:</strong> {University.address || "—"}
                </div>
                <div className="mt-2">
                  <strong>Logo:</strong>{" "}
                  {University.logo ? (
                    <img
                      src={University.logo}
                      alt={University.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 5,
                      }}
                    />
                  ) : (
                    "—"
                  )}
                </div>
                <div className="mt-2">
                  <strong>Organizations:</strong>{" "}
                  {University.total_organizations ?? 0}
                </div>
                <div className="mt-2">
                  <strong>Colleges:</strong> {University.total_colleges ?? 0}
                </div>
                <div className="mt-2">
                  <strong>Created At:</strong>{" "}
                  {University.created_at
                    ? new Date(University.created_at).toLocaleDateString()
                    : "—"}
                </div>

                <div className="mt-4">
                  <Link to="/University/list-University" className="btn btn-primary">
                    Back
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          <p className="text-danger">University not found.</p>
        )}
      </Block>
    </Layout>
  );
}

export default UniversityView;
