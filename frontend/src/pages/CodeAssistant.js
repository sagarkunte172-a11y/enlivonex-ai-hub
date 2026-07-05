import "./CodeAssistant.css";

function CodeAssistant() {

  return (

    <div className="code-page">

      <h1>💻 Code Assistant</h1>

      <p>
        Generate, Debug and Optimize your code with AI.
      </p>

      <div className="code-box">

        <textarea
          placeholder="Paste your code here..."
        ></textarea>

        <button>
          Generate Solution
        </button>

      </div>

    </div>

  );

}

export default CodeAssistant;