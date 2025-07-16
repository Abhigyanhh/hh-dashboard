from flask import Flask, request, jsonify
from flask_cors import CORS
from bedrock_analyzer import analyze_journal

PORT = 8000

app = Flask(__name__)
CORS(app) 

@app.route("/")
def home():
    return jsonify({"message": "Running Flask on Google Colab!"})

@app.route('/analyze', methods=['POST'])
def analyze_personality():
    data = request.get_json()

    user_input = data.get("userInput", "")
    system_prompt = data.get("systemPrompt", "")
    model = data.get("model", "mistral.mixtral-8x7b-instruct-v0:1")

    if not user_input or not system_prompt:
        return jsonify({"error": "userInput and systemPrompt are required"}), 400

    # Pass both values to the analyzer
    result = analyze_journal(user_input, system_prompt, model)

    return jsonify(result)

if __name__ == '__main__':   
    app.run(host="127.0.0.1", port=PORT)
