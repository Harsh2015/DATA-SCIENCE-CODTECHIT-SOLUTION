from flask import Flask, render_template, request, redirect, flash, url_for, session, jsonify,flash
import pickle
import numpy as np
import pandas as pd
from fuzzywuzzy import process
from antibiotic import antibiotic_data
from encoding import *
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


########### Loading the pre-trained DT model
with open("C:\\Users\\HARSH\\Desktop\\codtech-tasks\\t3-end-to-end-data-science-project\\SymptomSolver\\d_model.pkl", 'rb') as model_file:
    model = pickle.load(model_file)



@app.route('/')
def dashboard():
    return render_template('dashboard.html')


# Function to encode symptoms with fuzzy matching
def encode_symptom(symptom, column):
    symptom_dict = symptom_to_encoded.get(column, {})
    match = process.extractOne(symptom, symptom_dict.keys())
    if match and match[1] > 80:  # match threshold (e.g., 80% similarity)
        return symptom_dict[match[0]]  # Return the encoded value for the best match
    else:
        print(f"Unknown symptom: {symptom} in column {column}")
        return 0  # Default encoding for unknown symptoms

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == "POST":
        # Parse JSON input
        data = request.get_json()

        # Extract symptoms with default 'No Symptoms' if not provided
        symptoms = [
            data.get('symptom1', 'No Symptoms'),
            data.get('symptom2', 'No Symptoms'),
            data.get('symptom3', 'No Symptoms'),
            data.get('symptom4', 'No Symptoms'),
            data.get('symptom5', 'No Symptoms'),
            data.get('symptom6', 'No Symptoms'),
        ]

        # Encode symptoms
        encoded_symptoms = []
        for idx, symptom in enumerate(symptoms, start=1):
            column = f's{idx}'
            encoded_value = encode_symptom(symptom, column)
            encoded_symptoms.append(encoded_value)

        # If all symptoms are invalid (i.e., 0), return an error
        if all(value == 0 for value in encoded_symptoms):
            return jsonify({
                'disease': 'Invalid Symptoms',
                'medicines': []
            })

        # Create a DataFrame for model prediction
        user_input_df = pd.DataFrame([encoded_symptoms], columns=['s1', 's2', 's3', 's4', 's5', 's6'])

        try:
            # Predict disease using the trained model (input must be a DataFrame with correct columns)
            model_output = model.predict(user_input_df)[0]
            print(f"Model Output: {model_output}")  # Debug output

            # Convert numpy.int64 or float to Python int for consistency
            if isinstance(model_output, (np.int64, float, np.float64)):
                model_output = int(model_output)  # Convert to integer

            # Handle the case when model output is an integer
            predicted_disease = encoded_to_disease.get(model_output, "Unknown Disease")
            print(f"Predicted Disease after mapping: {predicted_disease}")

        except Exception as e:
            print(f"Prediction error: {e}")
            predicted_disease = "Error during prediction"

        # Send response back to the client
        return jsonify({
            'disease': predicted_disease,
            'medicines': ["Medicine 1", "Medicine 2", "Medicine 3"]  # Placeholder for medicines
        })



@app.route('/get_antibiotics', methods=['POST'])
def get_antibiotics():
    disease = request.json.get('Disease')
    if disease in antibiotic_data:
        return jsonify({
            'success': True,
            'data': antibiotic_data[disease]
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Disease not found'
        }), 404



if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0', port=5000)





