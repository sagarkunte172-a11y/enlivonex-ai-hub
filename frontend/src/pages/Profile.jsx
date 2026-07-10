import "./Profile.css";

function Profile() {
  return (
    <div className="profile-page">

      <div className="profile-card">

        <div className="profile-avatar">

          👤

        </div>

        <h2>Sagar Kunte</h2>

        <p>Founder • Enlivonex AI Hub</p>

        <div className="profile-info">

          <div className="info-box">

            <h4>Email</h4>

            <p>sagar@example.com</p>

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

        <button className="edit-btn">

          Edit Profile

        </button>

      </div>

    </div>
  );
}

export default Profile;