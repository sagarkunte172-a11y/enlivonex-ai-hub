import "./Contact.css";

function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("🚀 Contact feature coming soon!");
  };

  return (
    <section className="contact-page">

      <h1>📩 Contact Us</h1>

      <p>
        We'd love to hear from you. Reach out to us using the
        information below or send us a message.
      </p>

      <div className="contact-container">

        <div className="contact-info">

          <div className="info-card">
            <h3>📧 Email</h3>
            <p>enlivonexofficial@gmail.com</p>
          </div>

          <div className="info-card">
            <h3>🐙 GitHub</h3>
            <p>github.com/Enlivonex</p>
          </div>

          <div className="info-card">
            <h3>💬 Discord</h3>
            <p>Coming Soon</p>
          </div>

          <div className="info-card">
            <h3>💼 LinkedIn</h3>
            <p>Coming Soon</p>
          </div>

        </div>

        <form className="contact-form" onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Your Name"
            required
          />

          <input
            type="email"
            placeholder="Your Email"
            required
          />

          <textarea
            rows="6"
            placeholder="Your Message"
            required
          ></textarea>

          <button type="submit">
            Send Message
          </button>

        </form>

      </div>

    </section>
  );
}

export default Contact;