from datasets import load_dataset
from transformers import BartTokenizer, BartForConditionalGeneration, Trainer, TrainingArguments

# Load the CNN/DailyMail dataset (version 3.0.0)
data_files = {
    "train": [
        "./cnn_dailymail/train-00000-of-00003.parquet",
        "./cnn_dailymail/train-00001-of-00003.parquet",
        "./cnn_dailymail/train-00002-of-00003.parquet",
    ],
    "validation": "./cnn_dailymail/validation-00000-of-00001.parquet",
    "test": "./cnn_dailymail/test-00000-of-00001.parquet",
}

# Load the dataset
dataset = load_dataset("parquet", data_files=data_files)

# Load pre-trained BART tokenizer
tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")

# Tokenization function
def tokenize_function(examples):
    inputs = tokenizer(
        examples["article"], 
        max_length=1024, 
        truncation=True, 
        padding="max_length",
    )
    labels = tokenizer(
        examples["highlights"], 
        max_length=128, 
        truncation=True, 
        padding="max_length",
    )
    inputs["labels"] = labels["input_ids"]
    return inputs

# Apply the tokenization function to dataset
tokenized_datasets = dataset.map(tokenize_function, batched=True)

# Load pre-trained BART model
model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")

# Set up training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir="./logs",
)

# Initialize the trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],  # Use validation set for evaluation
)

# Train the model
trainer.train()

# Generate summaries for new articles
def generate_summary(article_text):
    inputs = tokenizer([article_text], max_length=1024, return_tensors="pt", truncation=True)
    summary_ids = model.generate(inputs["input_ids"], max_length=200, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

# Example usage
article_text = "Your long article content here."
summary = generate_summary(article_text)
print("Generated Summary:", summary)

# Evaluate the model
results = trainer.evaluate()
print(results)