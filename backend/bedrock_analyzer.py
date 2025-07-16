import boto3
import json
from botocore.exceptions import ClientError

client = boto3.client("bedrock-runtime", region_name="ap-south-1")

def load_traits_file(file_path="traits.json"):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except Exception as e:
        raise RuntimeError(f"Unable to load traits file. Reason: {e}")

def analyze_journal(journal_text, system_prompt, model_id="mistral.mixtral-8x7b-instruct-v0:1"):
    traits_data = load_traits_file("traits.json")

    # Begin prompt with user-defined system prompt
    prompt = system_prompt.strip() + "\n\n"

    trait_definitions = "## Traits and Subtraits:\n"
    for trait_name, trait_info in traits_data.items():
        trait_definitions += f"\n**{trait_name}**\n"
        if "subtraits" in trait_info:
            for subtrait_name in trait_info["subtraits"]:
                trait_definitions += f"  - {subtrait_name}\n"
    prompt += trait_definitions

    prompt += f"\n\n### Journal Text:\n{journal_text.strip()}\n"

    prompt += (
        "\n\n## Output Format:\n"
        "Return ONLY a JSON object in this exact format with no additional text:\n"
        "{\n"
        '  "TraitName": {\n'
        '    "subtrait_name": {\n'
        '      "present": true,\n'
        '      "score": 0.7,\n'
        '      "evidence": "quoted or paraphrased journal excerpt",\n'
        '      "analysis": "brief explanation of why this score was chosen"\n'
        "    }\n"
        "  },\n"
        '  "AnotherTrait": "if it\'s there"\n'
        "}\n"
        "\n"
        "CRITICAL CONSTRAINTS:\n"
        "- Output ONLY the JSON object, no other text\n"
        "- Score must be between 0.0 and 1.0\n"
        "- Do NOT include subtraits with a score of 0.0\n"
        "- Follow this format exactly\n"
    )

    

    conversation = [
        {
            "role": "user",
            "content": [{"text": prompt}],
        }
    ]

    try:
        response = client.converse(
            modelId=model_id,
            messages=conversation,
            inferenceConfig={"maxTokens": 2048, "temperature": 0.3, "topP": 0.9},
        )
        result = response["output"]["message"]["content"][0]["text"]
        return result
    except (ClientError, Exception) as e:
        return {"error": str(e)}
