from flask import Flask, request, render_template
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import load_img, img_to_array
import numpy as np
import os

# Flask app
app = Flask(__name__)

# Load trained model
MODEL_PATH = "flower_model.h5"
model = load_model(MODEL_PATH)

# Class labels (same order as training)
# Adjust these to match your dataset folders
class_labels = ['daisy', 'dandelion', 'rose', 'sunflower', 'tulip']

# Upload folder
UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/", methods=["GET", "POST"])
def index():
    prediction = None
    filename = None

    if request.method == "POST":
        if "file" not in request.files:
            return render_template("index.html", prediction="No file part")

        file = request.files["file"]
        if file.filename == "":
            return render_template("index.html", prediction="No file selected")

        if file:
            # Save uploaded file
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filepath)
            filename = file.filename

            # Preprocess image
            img = load_img(filepath, target_size=(128, 128))
            img_array = img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            # Predict
            preds = model.predict(img_array)
            pred_class = np.argmax(preds, axis=1)[0]
            prediction = class_labels[pred_class]

    return render_template("index.html", prediction=prediction, filename=filename)

if __name__ == "__main__":
    app.run(debug=True)
