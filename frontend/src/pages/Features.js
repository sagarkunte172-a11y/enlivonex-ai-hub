import "./Features.css";

function Features() {
  const features = [
    {
      icon: "🤖",
      title: "AI Chat",
      desc: "Chat with multiple AI models from one platform."
    },
    {
      icon: "🎨",
      title: "Image Generation",
      desc: "Generate high-quality AI images in seconds."
    },
    {
      icon: "💻",
      title: "Coding Assistant",
      desc: "Debug, write and optimize your code with AI."
    },
    {
      icon: "📝",
      title: "Script Generator",
      desc: "Generate scripts for YouTube, Instagram and more."
    },
    {
      icon: "🧠",
      title: "Multiple AI Models",
      desc: "Use OpenAI, Gemini, DeepSeek and local AI models."
    },
    {
      icon: "👥",
      title: "Team Workspace",
      desc: "Collaborate with your team using shared AI tools."
    }
  ];

  return (
    <section className="features-page">

      <h1>🚀 Enlivonex Features</h1>

      <p>
        Everything you need to build, learn and create with AI.
      </p>

      <div className="feature-grid">

        {features.map((item, index) => (

          <div className="feature-card" key={index}>

            <div className="feature-icon">
              {item.icon}
            </div>

            <h2>{item.title}</h2>

            <p>{item.desc}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Features;