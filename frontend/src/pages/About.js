import "./About.css";

function About() {
  return (
    <div className="about-page">

      <h1>🚀 About Enlivonex AI Hub</h1>

      <p className="about-intro">
        Enlivonex AI Hub is an AI platform built by students, for students,
        creators, developers and innovators.
      </p>

      <div className="about-container">

        <div className="about-card">
          <h2>🎯 Our Mission</h2>

          <p>
            Our mission is to make Artificial Intelligence accessible to
            everyone by providing powerful AI tools in one platform.
          </p>
        </div>

        <div className="about-card">
          <h2>🌍 Our Vision</h2>

          <p>
            We aim to build one of the most useful AI platforms where users
            can chat with AI, generate images, write code, create scripts
            and much more.
          </p>
        </div>

        <div className="about-card">
          <h2>👨‍💻 Founder</h2>

          <p>
            Enlivonex AI Hub is being developed by <strong>Sagar Kunte </strong>
            with the vision of creating an affordable AI ecosystem for
            students and developers.
          </p>
        </div>

        <div className="about-card">
          <h2>📌 Current Version</h2>

          <p>
            Version <strong>0.1 Alpha</strong>
            <br /><br />
            This project is currently under active development and many
            exciting AI features will be added in upcoming releases.
          </p>
        </div>

      </div>

    </div>
  );
}

export default About;