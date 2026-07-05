import "./ScriptGenerator.css";

function ScriptGenerator() {

  return (

    <div className="script-page">

      <h1>📝 AI Script Generator</h1>

      <p>
        Create YouTube scripts, blogs, captions and more.
      </p>

      <textarea
        placeholder="Describe what script you need..."
      ></textarea>

      <button>

        Generate Script

      </button>

    </div>

  );

}

export default ScriptGenerator;