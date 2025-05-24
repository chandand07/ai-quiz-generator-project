import os
import shutil
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel 
import whisper

from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import json

TEMP_UPLOADS_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOADS_DIR, exist_ok=True)

app = FastAPI()


try:
    print("Loading Whisper model (using 'base')...")
    whisper_model = whisper.load_model("base") 
    print("Whisper model loaded successfully.")
except Exception as e:
    print(f"Error loading Whisper model: {e}")
    whisper_model = None

try:
    print("Initializing Ollama LLM (gemma:2b)...")
    llm = Ollama(model="llama3:latest")
    print("Ollama LLM initialized.")
except Exception as e:
    print(f"Error initializing Ollama LLM: {e}. Ensure Ollama is running and model is pulled.")
    llm = None


class McqRequest(BaseModel):
    transcript_segment: str
    num_questions: int = 3 


@app.post("/transcribe")
async def transcribe_video(file: UploadFile = File(...)):
    if not whisper_model:
        raise HTTPException(status_code=500, detail="Whisper model not loaded.")

    if not file.filename.endswith((".mp4", ".mov", ".avi", ".mkv")):
        raise HTTPException(status_code=400, detail="Invalid file type.")

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(TEMP_UPLOADS_DIR, unique_filename)

    try:
        print(f"Saving uploaded file to: {file_path}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print("File saved successfully.")

        print(f"Starting transcription for: {file_path}")
        result = whisper_model.transcribe(file_path, language="en", fp16=False)
        print("Transcription completed.")

        return JSONResponse(content={
            "filename": file.filename,
            "full_transcript": result["text"],
            "segments": result["segments"]
        })
    except Exception as e:
        print(f"Error during transcription: {e}")
        if "ffmpeg" in str(e).lower() or "[WinError 2]" in str(e):
             print("FFMPEG ERROR HINT: Ensure ffmpeg is installed and in your system's PATH, and restart terminal/IDE.")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        if os.path.exists(file_path):
            print(f"Deleting temporary file: {file_path}")
            os.remove(file_path)
            print("Temporary file deleted.")
        if hasattr(file, 'file') and hasattr(file.file, 'close'):
            file.file.close()

@app.post("/generate_mcqs")
async def generate_mcqs_from_segment(request: McqRequest):
    if not llm:
        raise HTTPException(status_code=500, detail="Ollama LLM not initialized. Check server logs.")

    transcript_chunk = request.transcript_segment
    num_mcqs = request.num_questions


    prompt_text = """
    You are an AI assistant that generates multiple-choice questions (MCQs) based on a given text.
    Given a transcript segment, please generate exactly {num_mcqs} distinct multiple-choice questions.
    Each question MUST have:
    1. A "question" string.
    2. An "options" array of EXACTLY 4 strings (potential answers).
    3. A "correctOptionIndex" integer (0-3), indicating the index of the correct answer in the "options" array.

    The output MUST be a valid JSON array of objects, with no other text before or after the JSON.
    Do not include explanations or any conversational text. Don't include any other text such as "Here are the MCQs" or "The following is the JSON output".
    or "Please find the MCQs below". Just return the JSON array directly.

    Here are some examples of the desired input and output format:

    Example 1:
    Transcript Segment:
    ```The cat sat on the mat. It was a fluffy, black cat.```
    JSON Array of MCQs (for num_mcqs = 1):
    ```json
    [
      {{
        "question": "What color was the cat?",
        "options": ["White", "Black", "Ginger", "Grey"],
        "correctOptionIndex": 1
      }}
    ]
    ```

    Example 2:
    Transcript Segment:
    ```Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to create their own food and release oxygen.```
    JSON Array of MCQs (for num_mcqs = 2):
    ```json
    [
      {{
        "question": "What do green plants use to create their food during photosynthesis?",
        "options": ["Sunlight, water, and oxygen", "Sunlight, soil, and carbon dioxide", "Sunlight, water, and carbon dioxide", "Water, oxygen, and soil"],
        "correctOptionIndex": 2
      }},
      {{
        "question": "What gas is released by plants during photosynthesis?",
        "options": ["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
        "correctOptionIndex": 2
      }}
    ]
    ```

    Now, generate the MCQs for the following:

    Transcript Segment:
    ```{transcript_chunk}```

    JSON Array of MCQs:
    """
    prompt = PromptTemplate(
        input_variables=["transcript_chunk", "num_mcqs"],
        template=prompt_text
    )

    chain = LLMChain(llm=llm, prompt=prompt)

    try:
        print(f"Generating {num_mcqs} MCQs for segment: '{transcript_chunk[:100]}...'")
        
        llm_response_str = chain.invoke({
            "transcript_chunk": transcript_chunk,
            "num_mcqs": num_mcqs
        })
        
        actual_llm_output = ""
        if isinstance(llm_response_str, dict) and 'text' in llm_response_str:
            actual_llm_output = llm_response_str['text']
        elif isinstance(llm_response_str, str):
            actual_llm_output = llm_response_str
        else:
            print(f"Unexpected LLM response format: {llm_response_str}")
            raise HTTPException(status_code=500, detail="LLM returned unexpected data format.")

        print(f"Raw LLM Output:\n{actual_llm_output}")

        
        try:
            
            cleaned_output = actual_llm_output.strip()
            if cleaned_output.startswith("```json"):
                cleaned_output = cleaned_output[7:]
            if cleaned_output.endswith("```"):
                cleaned_output = cleaned_output[:-3]
            cleaned_output = cleaned_output.strip()
            
            generated_mcqs = json.loads(cleaned_output)
            
            
            if not isinstance(generated_mcqs, list):
                raise ValueError("LLM output is not a JSON list.")
            for mcq in generated_mcqs:
                if not all(key in mcq for key in ["question", "options", "correctOptionIndex"]):
                    raise ValueError("MCQ object is missing required keys.")
                if not (isinstance(mcq["options"], list) and len(mcq["options"]) == 4):
                    raise ValueError("MCQ options are not a list of 4 strings.")
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse LLM output as JSON: {e}")
            print(f"Problematic LLM output was: {actual_llm_output}")
            raise HTTPException(status_code=500, detail="Failed to parse MCQs from LLM response. The LLM may not have returned valid JSON.")
        except ValueError as e: # For our custom validation
            print(f"Invalid MCQ structure from LLM: {e}")
            raise HTTPException(status_code=500, detail=f"LLM returned data with invalid MCQ structure: {e}")


        print(f"Successfully generated {len(generated_mcqs)} MCQs.")
        return {"mcqs": generated_mcqs}

    except Exception as e:
        print(f"Error during MCQ generation: {e}")
        raise HTTPException(status_code=500, detail=f"MCQ generation failed: {str(e)}")


@app.get("/")
def read_root():
    return {"message": "AI Service is running. Endpoints: /transcribe, /generate_mcqs"}
