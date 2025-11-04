import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";

import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import { API_BASE_URL } from '../../services/apiBase';

function OrganizationView() {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const getOrganization = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/organizations/${id}/`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setOrganization(res.data.data || res.data);
      } catch {
        Swal.fire("Error", "Failed to load organization.", "error");
      } finally {
        setLoading(false);
      }
    };
    getOrganization();
  }, [id, authToken]);

  return (
    <Layout title="View Organization" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">View Organization</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/Organization/list-organization">Organizations</Link>
                </li>
                <li className="breadcrumb-item active">View</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/Organization/list-organization" className="btn btn-primary">
              <Icon name="arrow-left" /> Back to Organizations
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        ) : organization ? (
          <Row>
            <Col xxl="12">
              <Card className="card-gutter-md p-3">
                <div>
                  <strong>Name:</strong> {organization.name || "—"}
                </div>
                <div className="mt-2">
                  <strong>Address:</strong> {organization.address || "—"}
                </div>
                <div className="mt-2">
                  <strong>University:</strong> {organization.university?.name || "—"}
                </div>
                <div className="mt-2">
                  <strong>Status:</strong> {organization.is_active ? "Active" : "Inactive"}
                </div>
                <div className="mt-2">
                  <strong>Logo:</strong>{" "}
                  {organization.logo ? (
                    <img
                      src={organization.logo}
                      alt={organization.name}
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
                  <strong>Created At:</strong>{" "}
                  {organization.created_at
                    ? new Date(organization.created_at).toLocaleDateString()
                    : "—"}
                </div>

                <div className="mt-4">
                  <Link to="/Organizations/list-organization" className="btn btn-primary">
                    Back
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          <p className="text-danger">Organization not found.</p>
        )}
      </Block>
    </Layout>
  );
}

export default OrganizationView;
