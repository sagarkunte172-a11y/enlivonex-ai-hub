import "./ImageGenerator.css";

function ImageGenerator() {
  return (
    <div className="image-page">

      <h1>🎨 AI Image Generator</h1>

      <p>
        Generate stunning AI images from your imagination.
      </p>

      <div className="image-generator">

        <input
          type="text"
          placeholder="Describe your image..."
        />

        <button>
          Generate Image
        </button>

      </div>

      <div className="image-preview">

        <p>🖼 Your generated image will appear here.</p>

      </div>

    </div>
  );
}

export default ImageGenerator;