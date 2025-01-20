from flask import Flask, request, jsonify
from transformers import BartForConditionalGeneration, BartTokenizer

app = Flask(__name__)

# Load the fine-tuned model and tokenizer
model = BartForConditionalGeneration.from_pretrained("./fine_tuned_bart")
tokenizer = BartTokenizer.from_pretrained("./fine_tuned_bart")

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.json
    article = data.get("article", "")
    if not article:
        return jsonify({"error": "No article provided"}), 400

    # Tokenize the article
    inputs = tokenizer([article], max_length=1024, return_tensors="pt", truncation=True)

    # Generate the summary
    summary_ids = model.generate(inputs["input_ids"], max_length=200, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return jsonify({"summary": summary})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3002)
