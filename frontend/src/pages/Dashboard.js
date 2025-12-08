import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import './Dashboard.css';

function Dashboard() {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch current user info
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(userResponse.data.username);
        setBio(userResponse.data.bio || '');

        // Fetch user links
        const linksResponse = await axios.get(`${API_BASE_URL}/links`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLinks(Array.isArray(linksResponse.data) ? linksResponse.data : []);
      } catch (error) {
        console.error(error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleAddLink = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/links`,
        { title, url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLinks([...links, response.data]);
      setTitle('');
      setUrl('');
    } catch (error) {
      console.error(error);
      alert('Failed to add link');
    }
  };

  const handleUpdateBio = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/auth/bio`,
        { bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingBio(false);
    } catch (error) {
      console.error(error);
      alert('Failed to update bio');
    }
  };

  const handleEditLink = (link) => {
    setEditingLink(link._id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  const handleSaveEditLink = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/links/${editingLink}`,
        { title: editTitle, url: editUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLinks(links.map((l) => (l._id === editingLink ? response.data : l)));
      setEditingLink(null);
    } catch (error) {
      console.error(error);
      alert('Failed to update link');
    }
  };

  const handleToggleVisibility = async (linkId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_BASE_URL}/links/${linkId}/toggle-visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLinks(links.map((l) => (l._id === linkId ? response.data : l)));
    } catch (error) {
      console.error(error);
      alert('Failed to toggle link visibility');
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/links/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLinks(links.filter((link) => link._id !== id));
      } catch (error) {
        console.error(error);
        alert('Failed to delete link');
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    const newLinks = [...links];
    const draggedLink = newLinks[draggedItem];
    newLinks.splice(draggedItem, 1);
    newLinks.splice(dropIndex, 0, draggedLink);

    setLinks(newLinks);
    setDraggedItem(null);

    // Update order on backend
    try {
      const token = localStorage.getItem('token');
      const linkIds = newLinks.map((l) => l._id);
      await axios.post(
        `${API_BASE_URL}/links/reorder`,
        { linkIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error(error);
      alert('Failed to reorder links');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🔗 LinkHub</h1>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => navigate(`/u/${username}`)}>
              View Profile
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Your Profile Section */}
          <section className="profile-section">
            <h2>Your Profile</h2>
            <p className="profile-url">
              Your page: <span>linkhub.com/u/{username}</span>
            </p>

            <div className="bio-section">
              <h3>Bio</h3>
              {editingBio ? (
                <div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows="4"
                  />
                  <div className="bio-actions">
                    <button className="btn-primary" onClick={handleUpdateBio}>
                      Save Bio
                    </button>
                    <button className="btn-secondary" onClick={() => setEditingBio(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <textarea
                    value={bio}
                    readOnly
                    placeholder="Add a bio to your profile"
                    rows="4"
                  />
                  <button className="btn-secondary" onClick={() => setEditingBio(true)}>
                    Edit Bio
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Add New Link Section */}
          <section className="add-link-section">
            <h2>Add New Link</h2>
            <p>Create a new link for your profile</p>
            <form onSubmit={handleAddLink} className="link-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="My Website"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="url">URL</label>
                <input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                + Add Link
              </button>
            </form>
          </section>

          {/* Your Links Section */}
          <section className="links-section">
            <h2>Your Links</h2>
            {links.length === 0 ? (
              <p className="no-links">No links yet. Create your first link above!</p>
            ) : (
              <div className="links-list">
                {links.map((link, index) => (
                  <div
                    key={link._id}
                    className={`link-item ${!link.visible ? 'hidden' : ''} ${
                      draggedItem === index ? 'dragging' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {editingLink === link._id ? (
                      <div className="link-edit-form">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title"
                        />
                        <input
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          placeholder="URL"
                        />
                        <div className="edit-actions">
                          <button
                            className="btn-primary"
                            onClick={handleSaveEditLink}
                          >
                            Save
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => setEditingLink(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="link-handle">⋮⋮</div>
                        <div className="link-content">
                          <h4>{link.title}</h4>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.url}
                          </a>
                          {!link.visible && <span className="hidden-badge">Hidden</span>}
                        </div>
                        <div className="link-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditLink(link)}
                            title="Edit link"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className={`btn-hide ${!link.visible ? 'hidden-btn' : ''}`}
                            onClick={() => handleToggleVisibility(link._id)}
                            title={link.visible ? 'Hide link' : 'Show link'}
                          >
                            {link.visible ? '👁️ Hide' : '🚫 Hidden'}
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteLink(link._id)}
                            title="Delete link"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;