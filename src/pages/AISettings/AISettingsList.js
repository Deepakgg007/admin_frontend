import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Row, Col, Badge, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import Layout from "../../layout/default";
import Block from "../../components/Block/Block";
import { Icon } from "../../components";
import apiBase from "../../services/apiBase";

function AISettingsList() {
  const [providers, setProviders] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [defaultModels, setDefaultModels] = useState({});
  const [defaultEndpoints, setDefaultEndpoints] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({
    provider: "OPENROUTER",
    api_key: "",
    api_endpoint: "",
    default_model: "",
    is_active: true,
    is_default: false,
    max_tokens: 4000,
    temperature: 0.7,
  });
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    fetchProviders();
    fetchAvailableProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await apiBase.get("/admin/question-bank/ai-settings/");
      setProviders(response.data.results || response.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch AI providers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProviders = async () => {
    try {
      const response = await apiBase.get("/admin/question-bank/ai-settings/available_providers/");
      setAvailableProviders(response.data.providers || []);
      setDefaultModels(response.data.default_models || {});
      setDefaultEndpoints(response.data.default_endpoints || {});
    } catch (err) {
      console.error("Failed to fetch available providers:", err);
    }
  };

  const handleOpenModal = (provider = null) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        provider: provider.provider,
        api_key: "",
        api_endpoint: provider.api_endpoint || "",
        default_model: provider.default_model || "",
        is_active: provider.is_active,
        is_default: provider.is_default,
        max_tokens: provider.max_tokens || 4000,
        temperature: provider.temperature || 0.7,
      });
    } else {
      setEditingProvider(null);
      setFormData({
        provider: "OPENROUTER",
        api_key: "",
        api_endpoint: "",
        default_model: "",
        is_active: true,
        is_default: false,
        max_tokens: 4000,
        temperature: 0.7,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProvider(null);
    setFormData({
      provider: "OPENROUTER",
      api_key: "",
      api_endpoint: "",
      default_model: "",
      is_active: true,
      is_default: false,
      max_tokens: 4000,
      temperature: 0.7,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProviderChange = (e) => {
    const provider = e.target.value;
    setFormData((prev) => ({
      ...prev,
      provider,
      default_model: defaultModels[provider]?.[0] || "",
      api_endpoint: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!submitData.api_key && editingProvider) {
        delete submitData.api_key;
      }
      if (!submitData.api_endpoint) {
        delete submitData.api_endpoint;
      }

      if (editingProvider) {
        await apiBase.put(`/admin/question-bank/ai-settings/${editingProvider.id}/`, submitData);
        setSuccess("AI provider updated successfully");
      } else {
        await apiBase.post("/admin/question-bank/ai-settings/", submitData);
        setSuccess("AI provider added successfully");
      }
      handleCloseModal();
      fetchProviders();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save AI provider");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this AI provider?")) {
      return;
    }
    try {
      await apiBase.delete(`/admin/question-bank/ai-settings/${id}/`);
      setSuccess("AI provider deleted successfully");
      fetchProviders();
    } catch (err) {
      setError("Failed to delete AI provider");
      console.error(err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await apiBase.post(`/admin/question-bank/ai-settings/${id}/set_default/`);
      setSuccess("Default AI provider updated");
      fetchProviders();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to set default provider");
      console.error(err);
    }
  };

  const handleTestConnection = async (id) => {
    setTestingConnection(true);
    try {
      const response = await apiBase.post(`/admin/question-bank/ai-settings/${id}/test_connection/`);
      if (response.data.success) {
        setSuccess(response.data.message);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Connection test failed");
      console.error(err);
    } finally {
      setTestingConnection(false);
    }
  };

  const columns = [
    {
      name: "Provider",
      selector: (row) => row.provider_display,
      sortable: true,
      cell: (row) => (
        <div>
          <strong>{row.provider_display}</strong>
          {row.is_default && (
            <Badge bg="primary" className="ms-2">
              Default
            </Badge>
          )}
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.is_active,
      sortable: true,
      cell: (row) => (
        <Badge bg={row.is_active ? "success" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      name: "API Key",
      selector: (row) => row.has_api_key,
      cell: (row) => (
        <span>
          {row.has_api_key ? (
            <span className="text-success">
              <Icon name="check-circle" /> Configured ({row.masked_api_key})
            </span>
          ) : (
            <span className="text-danger">
              <Icon name="cross-circle" /> Not Set
            </span>
          )}
        </span>
      ),
    },
    {
      name: "Model",
      selector: (row) => row.default_model,
      cell: (row) => row.default_model || "-",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleOpenModal(row)}
            title="Edit"
          >
            <Icon name="edit" />
          </Button>
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => handleTestConnection(row.id)}
            disabled={!row.has_api_key || testingConnection}
            title="Test Connection"
          >
            <Icon name="reload" />
          </Button>
          {!row.is_default && row.is_active && row.has_api_key && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => handleSetDefault(row.id)}
              title="Set as Default"
            >
              <Icon name="check" />
            </Button>
          )}
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDelete(row.id)}
            title="Delete"
          >
            <Icon name="trash" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="AI Settings">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">AI Settings</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  AI Settings
                </li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <ul className="d-flex gap-2">
              <li>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                  <Icon name="plus" /> Add Provider
                </Button>
              </li>
            </ul>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Card>
          <Card.Body>
            <p className="text-muted mb-4">
              Configure AI providers for question generation. You can add multiple providers
              and set one as the default. The default provider will be used for AI question
              generation in the Question Bank.
            </p>
            <DataTable
              columns={columns}
              data={providers}
              progressPending={loading}
              pagination
              paginationPerPage={10}
              noDataComponent="No AI providers configured. Click 'Add Provider' to get started."
            />
          </Card.Body>
        </Card>
      </Block>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProvider ? "Edit AI Provider" : "Add AI Provider"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Provider *</Form.Label>
                  <Form.Select
                    name="provider"
                    value={formData.provider}
                    onChange={handleProviderChange}
                    disabled={!!editingProvider}
                  >
                    {availableProviders.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    API Key {editingProvider ? "(leave blank to keep current)" : "*"}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="api_key"
                    value={formData.api_key}
                    onChange={handleInputChange}
                    placeholder="Enter API key"
                    required={!editingProvider}
                  />
                  {editingProvider && editingProvider.masked_api_key && (
                    <Form.Text className="text-muted">
                      Current: {editingProvider.masked_api_key}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Default Model</Form.Label>
                  <Form.Select
                    name="default_model"
                    value={formData.default_model}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a model</option>
                    {(defaultModels[formData.provider] || []).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Custom API Endpoint (Optional)</Form.Label>
                  <Form.Control
                    type="url"
                    name="api_endpoint"
                    value={formData.api_endpoint}
                    onChange={handleInputChange}
                    placeholder={defaultEndpoints[formData.provider] || "Default endpoint"}
                  />
                  <Form.Text className="text-muted">
                    Leave blank to use default: {defaultEndpoints[formData.provider]}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Tokens</Form.Label>
                  <Form.Control
                    type="number"
                    name="max_tokens"
                    value={formData.max_tokens}
                    onChange={handleInputChange}
                    min={100}
                    max={32000}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Temperature</Form.Label>
                  <Form.Control
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <Form.Text className="text-muted">
                    0 = deterministic, 2 = creative
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 pt-4">
                  <Form.Check
                    type="checkbox"
                    name="is_active"
                    label="Active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <Form.Check
                    type="checkbox"
                    name="is_default"
                    label="Set as Default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingProvider ? "Update Provider" : "Add Provider"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}

export default AISettingsList;
