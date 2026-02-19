import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Row, Col, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';

import Layout from '../../layout/default';
import Block from '../../components/Block/Block';
import { Icon } from '../../components';
import { Trash2, RefreshCw } from 'react-feather';
import { API_BASE_URL } from '../../services/apiBase';

function ChallengeList() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('-created_at'); // Default: recent first
  const [categories, setCategories] = useState([]);

  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (filterCategory) params.category = filterCategory;
      if (sortBy) params.ordering = sortBy;

      const response = await axios.get(`${API_BASE_URL}/api/challenges/`, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Handle both array and paginated response
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setChallenges(data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to fetch challenges.', 'error');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterDifficulty, filterCategory, sortBy, authToken]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    // Fetch categories
    axios
      .get(`${API_BASE_URL}/api/challenges/categories/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error(err));
  }, [authToken]);

  const handleDelete = async (slug) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/challenges/${slug}/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        Swal.fire('Deleted!', 'Challenge has been deleted.', 'success');
        fetchChallenges();
      } catch (error) {
        const message = error.response?.data?.error || 'Failed to delete challenge.';
        Swal.fire('Error!', message, 'error');
      }
    }
  };

  const columns = [
    {
      name: 'Title',
      selector: (row) => row.title,
      sortable: true,
      cell: (row) => (
        <Link to={`/CodingChallenges/view-challenge/${row.slug}`}>
          <strong>{row.title}</strong>
        </Link>
      ),
      width: '300px',
    },
    {
      name: 'Difficulty',
      selector: (row) => row.difficulty,
      sortable: true,
      cell: (row) => (
        <Badge
          bg={
            row.difficulty === 'EASY' ? 'success' : row.difficulty === 'MEDIUM' ? 'warning' : 'danger'
          }
        >
          {row.difficulty_display}
        </Badge>
      ),
    },
    {
      name: 'Category',
      selector: (row) => row.category_display,
      sortable: true,
    },
    {
      name: 'Created',
      selector: (row) => row.created_at,
      sortable: true,
      cell: (row) => {
        const date = new Date(row.created_at);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      },
      width: '120px',
    },
    {
      name: 'Max Score',
      selector: (row) => row.max_score,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => navigate(`/CodingChallenges/update-challenge/${row.slug}`)}
          >
            <Icon name="edit" />
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.slug)}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
      width: '120px',
    },
  ];

  return (
    <Layout title="Coding Challenges" content="container">
      <Block.Head>
        <Block.HeadBetween>
          <Block.HeadContent>
            <Block.Title tag="h2">Coding Challenges</Block.Title>
            <nav>
              <ol className="breadcrumb breadcrumb-arrow mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item active">Coding Challenges</li>
              </ol>
            </nav>
          </Block.HeadContent>
          <Block.HeadContent>
            <Link to="/CodingChallenges/create-challenge" className="btn btn-primary">
              <Icon name="plus" /> Create Challenge
            </Link>
          </Block.HeadContent>
        </Block.HeadBetween>
      </Block.Head>

      <Block>
        <Card>
          <Card.Body>
            {/* Filters */}
            <Row className="g-3 mb-3">
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Search by title, description, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Form.Select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="-created_at">Recent First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="-title">Title (Z-A)</option>
                  <option value="difficulty">Difficulty (Easy to Hard)</option>
                  <option value="-difficulty">Difficulty (Hard to Easy)</option>
                  <option value="category">Category (A-Z)</option>
                  <option value="-max_score">Max Score (High to Low)</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <button className="btn btn-outline-light w-100" onClick={fetchChallenges}>
                  <RefreshCw size={16} className="me-2" /> Refresh
                </button>
              </Col>
            </Row>

            <DataTable
              columns={columns}
              data={challenges}
              progressPending={loading}
              pagination
              highlightOnHover
              responsive
              noDataComponent={
                <div className="text-center py-5 text-muted">
                  <Icon name="inbox" style={{ fontSize: 48 }} />
                  <p className="mt-3">No challenges found</p>
                </div>
              }
            />
          </Card.Body>
        </Card>
      </Block>
    </Layout>
  );
}

export default ChallengeList;
