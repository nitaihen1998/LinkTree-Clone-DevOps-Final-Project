import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import './PublicProfile.css';

function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/profile/${username}`);
        setProfile(response.data);
      } catch (error) {
        setError(error.response?.data?.error || 'Profile not found');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return <div className="public-profile-container"><p>Loading...</p></div>;
  }

  if (error || !profile) {
    return (
      <div className="public-profile-container">
        <div className="error-container">
          <p>{error}</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  const getInitial = (username) => username.charAt(0).toUpperCase();

  return (
    <div className="public-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitial(profile.username)}
        </div>
        <h1>@{profile.username}</h1>
        <p className="profile-bio">{profile.bio}</p>
        <Link to="/login" className="btn-create-profile">Create your own LinkHub</Link>
      </div>

      <div className="profile-links">
        {profile.links && profile.links.length > 0 ? (
          profile.links.map((link) => (
            <a
              key={link._id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
            >
              <span className="link-content-public">
                <span className="link-icon">🔗</span>
                <span className="link-title">{link.title}</span>
              </span>
              <span className="link-arrow">→</span>
            </a>
          ))
        ) : (
          <p className="no-links">No links yet</p>
        )}
      </div>

    </div>
  );
}

export default PublicProfile;