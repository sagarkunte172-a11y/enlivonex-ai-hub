import "./Profile.css";
import { Link } from "react-router-dom";
import { getStoredUser } from "../services/authApi";

function Profile() {
  const user = getStoredUser();

  return (
    <div className="profile-page">

      <div className="profile-card">

        <div className="profile-avatar">

          👤

        </div>

        <h2>{user?.username || "Enlivonex User"}</h2>

        <p>Member • Enlivonex AI Hub</p>

        <div className="profile-info">

          <div className="info-box">

            <h4>Email</h4>

            <p>{user?.email || "Not available"}</p>

          </div>

          <div className="info-box">

            <h4>Plan</h4>

            <p>Free Plan</p>

          </div>

          <div className="info-box">

            <h4>Credits</h4>

            <p>100</p>

          </div>

          <div className="info-box">

            <h4>Member Since</h4>

            <p>July 2026</p>

          </div>

        </div>

        <div className="profile-actions">
          <Link className="edit-btn" to="/dashboard">Open Dashboard</Link>
          <Link className="edit-btn" to="/workspace">Open Workspace</Link>
        </div>

      </div>

    </div>
  );
}

export default Profile;