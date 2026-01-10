# app.py
# =========================
# Engine v1 – LOCKED
# =========================

import os
import cv2
import numpy as np
import json
import re
import requests
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from paddleocr import PaddleOCR
import traceback
from datetime import datetime
from pdf2image import convert_from_bytes
import fitz  # ✅ REQUIRED
from fastapi import BackgroundTasks
from pydantic import BaseModel
import fitz  # PyMuPDF
from docx import Document
import io
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
load_dotenv()

# =========================
# Config
# =========================

ENGINE_VERSION = "v1.0.0"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not set")

ocr = PaddleOCR(lang="en", use_textline_orientation=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict this
    allow_credentials=True,
    allow_methods=["*"],  # IMPORTANT
    allow_headers=["*"],
)

API_KEY = os.getenv("HANDW_API_KEY")
if not API_KEY:
    raise RuntimeError(
        "HANDW_API_KEY is NOT set. "
        "Start the server with HANDW_API_KEY environment variable."
    )
    
@app.middleware("http")
async def api_key_guard(request, call_next):
    # allow docs & openapi
    if request.url.path in ["/docs", "/openapi.json", "/redoc"]:
        return await call_next(request)

    # protect only API routes
    if request.url.path.startswith("/api"):
        key = request.headers.get("x-api-key")
        if not API_KEY or key != API_KEY:
            return JSONResponse(
                status_code=401,
                content={"error": "UNAUTHORIZED"}
            )

    return await call_next(request)



# =========================
# Job Store (IN-MEMORY)
# =========================

JOB_STORE = {}

def load_job(jobId: str):
    return JOB_STORE.get(jobId)

def update_job(jobId: str, **updates):
    if jobId not in JOB_STORE:
        JOB_STORE[jobId] = {"jobId": jobId}
    JOB_STORE[jobId].update(updates)

# =========================
# OCR Structures
# =========================

class OCRBox:
    def __init__(self, text, x, y, w, h, conf):
        self.text = text
        self.x = x
        self.y = y
        self.w = w
        self.h = h
        self.conf = conf

def log(step, data=None):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"\n🟦 [{ts}] STEP: {step}")
    if data is not None:
        print(data)


def normalize_ocr(result):
    page = result[0]
    boxes = []

    for text, conf, box in zip(
        page["rec_texts"],
        page["rec_scores"],
        page["rec_boxes"]
    ):
        x1, y1, x2, y2 = box
        boxes.append(
            OCRBox(
                text=text,
                x=x1,
                y=y1,
                w=x2 - x1,
                h=y2 - y1,
                conf=conf
            )
        )
    return boxes



# =========================
# Layout Logic
# =========================

def group_rows(boxes, y_threshold=12):
    boxes = sorted(boxes, key=lambda b: (b.y, b.x))
    rows, current = [], []

    for b in boxes:
        if not current or abs(b.y - current[-1].y) <= y_threshold:
            current.append(b)
        else:
            rows.append(current)
            current = [b]

    if current:
        rows.append(current)

    return rows


def detect_baseline_x(rows):
    xs = sorted([b.x for row in rows for b in row])
    return xs[len(xs) // 2]


def similar_x_positions(a, b, tol=12):
    if len(a) != len(b):
        return False
    return all(abs(a[i].x - b[i].x) < tol for i in range(len(a)))


def detect_tables(rows):
    table_rows = set()
    for i in range(len(rows) - 1):
        if len(rows[i]) >= 3 and similar_x_positions(rows[i], rows[i + 1]):
            table_rows.update({i, i + 1})
    return table_rows


def extract_geometry_hints(rows, page_width):
    baseline_x = detect_baseline_x(rows)
    table_rows = detect_tables(rows)

    hints = {}

    for i, row in enumerate(rows):
        xs = [b.x for b in row]
        ws = [b.w for b in row]
        hs = [b.h for b in row]

        left = min(xs)
        right = max(x + w for x, w in zip(xs, ws))
        center = (left + right) / 2
        row_width = right - left

        text = " ".join(b.text for b in row).strip()

        hint = {}

        # 🔹 CENTERED (STRICT)
        # Titles only: centered AND narrow
        if (
            abs(center - page_width / 2) < page_width * 0.03
            and row_width < page_width * 0.6
        ):
            hint["is_centered"] = True

        # 🔹 RIGHT ALIGNED (dates, page numbers)
        if left > page_width * 0.55:
            hint["is_right_aligned"] = True

        # 🔹 FONT SIZE SIGNAL
        hint["avg_font_height"] = round(sum(hs) / len(hs), 1)

        # 🔹 OCR CONFIDENCE
        hint["confidence"] = round(
            sum(b.conf for b in row) / len(row), 2
        )

        # 🔹 DATE SIGNAL
        if re.search(r"\d{1,2}[./-]\d{1,2}[./-]\d{2,4}", text):
            hint["looks_like_date"] = True

        # 🔹 PAGE CONTINUATION
        if text.startswith("...") or text.strip().isdigit():
            hint["is_page_continuation"] = True

        # 🔹 INDENTATION (ONLY FOR BODY-LIKE ROWS)
        if row_width > page_width * 0.4:
            indent_px = left - baseline_x
            if indent_px > page_width * 0.05:
                hint["indent_level"] = int(
                    indent_px // (page_width * 0.05)
                )

        # 🔹 TABLE SIGNAL
        if i in table_rows:
            hint["looks_like_table"] = True
            hint["column_count"] = len(row)

        if hint:
            hints[i] = hint

    return hints


# =========================
# LLM
# =========================

def build_prompt(raw_text, geometry_hints):
    return f"""
You are given OCR text extracted from a scanned document.

TASK:
Convert this content into valid TipTap editor JSON.

ABSOLUTE SCHEMA RULES (DO NOT VIOLATE):
- Output ONLY valid JSON (no markdown, no explanations).
- Root node MUST be: {{ "type": "doc", "content": [...] }}

HEADING RULES (CRITICAL):
- ALL heading nodes MUST follow this exact structure:
  {{
    "type": "heading",
    "attrs": {{
      "level": 2,
      "textAlign": "center" | "left"
    }},
    "content": [...]
  }}
- NEVER place "level" outside "attrs".
- NEVER omit "attrs" on a heading.
- NEVER use heading levels other than 2.

TITLE RULES:
- The main document title MUST be:
  - heading level 2
  - attrs.textAlign = "center"
  - text marked as bold
- Section headings MUST be:
  - heading level 2
  - attrs.textAlign = "left"
  - text marked as bold

PARAGRAPH RULES:
- Paragraphs MUST use:
  {{
    "type": "paragraph",
    "content": [...]
  }}
- Do NOT add attrs unless alignment is explicitly required.

TEXT RULES:
- Bold text MUST be represented using marks:
  {{
    "type": "text",
    "text": "...",
    "marks": [{{ "type": "bold" }}]
  }}

FIELDS (IMPORTANT):
- Visible blanks or placeholders MUST be written as "__________".
- Do NOT invent field names.
- Do NOT convert fields into form inputs.
- Keep fields inline where they appear.

GEOMETRY RULES:
- Geometry hints describe visual appearance only.
- Use them ONLY when helpful.
- Do NOT invent structure based on geometry alone.



OCR TEXT:
\"\"\"
{raw_text}
\"\"\"

GEOMETRY HINTS:
{json.dumps(geometry_hints, indent=2)}
"""


def call_llm(prompt):
    res = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Doc-Reconstructor-Test",
        },
        json={
            "model": "openai/gpt-4o-mini",
            "temperature": 0,
            "max_tokens": 3500,
            "messages": [
                {
                    "role": "system",
                    "content": "Return valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt   # ✅ FIXED
                }
            ],
        },
        timeout=90,
    )

    return res.json()["choices"][0]["message"]["content"]



# =========================
# JSON Safety
# =========================

def extract_json_safe(text: str) -> dict:
    if not text or not text.strip():
        raise ValueError("Empty LLM response")

    # 1️⃣ Remove markdown fences
    text = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip()

    # 2️⃣ Find first JSON object using brace counting
    start = text.find("{")
    if start == -1:
        raise ValueError("No JSON object start found")

    brace_count = 0
    end = None

    for i in range(start, len(text)):
        if text[i] == "{":
            brace_count += 1
        elif text[i] == "}":
            brace_count -= 1
            if brace_count == 0:
                end = i + 1
                break

    if end is None:
        raise ValueError("Unbalanced JSON braces")

    json_str = text[start:end]

    # 3️⃣ Try strict parse
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        pass

    # 4️⃣ Repair common LLM issues
    repaired = json_str

    # Remove trailing commas
    repaired = re.sub(r",\s*([}\]])", r"\1", repaired)

    # Replace smart quotes
    repaired = repaired.replace("“", '"').replace("”", '"')

    try:
        return json.loads(repaired)
    except json.JSONDecodeError as e:
        raise ValueError("Failed to parse JSON after repair") from e


def normalize_tiptap(doc: dict) -> dict:
    assert doc.get("type") == "doc"

    def normalize_node(node):
        if node["type"] == "heading":
            # move level into attrs if misplaced
            if "level" in node:
                node.setdefault("attrs", {})["level"] = node.pop("level")

            # ensure attrs exist
            node.setdefault("attrs", {})
            node["attrs"].setdefault("level", 2)

            # default alignment
            node["attrs"].setdefault("textAlign", "left")

        # recurse
        for child in node.get("content", []):
            normalize_node(child)

    for node in doc.get("content", []):
        normalize_node(node)

    return doc


# =========================
# MAIN ENGINE ENTRY (LOCKED)
# =========================

def parse_document(image_bytes):
    try:
        log("START parse_document", f"bytes={len(image_bytes)}")

        # ---------- Decode ----------
        np_img = np.frombuffer(image_bytes, np.uint8)
        log("np.frombuffer OK")

        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        log("cv2.imdecode", "OK" if img is not None else "FAILED")

        if img is None:
            raise ValueError("Invalid image")

        h, w = img.shape[:2]
        log("image shape", f"{w}x{h}")

        # ---------- OCR ----------
        log("OCR start")
        ocr_result = ocr.ocr(img)
        log("OCR done", f"type={type(ocr_result)}, len={len(ocr_result)}")

        if not ocr_result or not ocr_result[0]:
            raise ValueError("Empty OCR result")

        log("OCR sample type", type(ocr_result[0]))

        # ---------- Normalize ----------
        log("normalize_ocr start")
        boxes = normalize_ocr(ocr_result)
        log("normalize_ocr done", f"boxes={len(boxes)}")

        if not boxes:
            raise ValueError("No boxes after normalization")

        # ---------- Rows ----------
        log("group_rows start")
        rows = group_rows(boxes)
        log("group_rows done", f"rows={len(rows)}")

        # ---------- Geometry ----------
        log("extract_geometry_hints start")
        geometry_hints = extract_geometry_hints(rows, w)
        log("extract_geometry_hints done", f"hints={len(geometry_hints)}")

        # ---------- Raw text ----------
        raw_text = "\n".join(" ".join(b.text for b in row) for row in rows)
        log("raw_text length", len(raw_text))

        # ---------- Prompt ----------
        prompt = build_prompt(raw_text, geometry_hints)
        log("prompt built", f"chars={len(prompt)}")

        # ---------- LLM ----------
        log("LLM call start")
        llm_output = call_llm(prompt)
        log("LLM call done", llm_output[:200])

        # ---------- JSON ----------
        log("extract_json_safe start")
        doc = extract_json_safe(llm_output)
        log("extract_json_safe done")

        log("normalize_tiptap start")
        doc = normalize_tiptap(doc)
        log("normalize_tiptap done")

        log("SUCCESS parse_document")
        return doc

    except Exception as e:
        log("❌ ERROR", repr(e))
        traceback.print_exc()
        raise


def is_pdf(data: bytes) -> bool:
    return data[:4] == b"%PDF"


def pdf_first_page_to_image(pdf_bytes: bytes) -> np.ndarray:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc.load_page(0)

    pix = page.get_pixmap(dpi=300)
    img = np.frombuffer(pix.samples, dtype=np.uint8)
    img = img.reshape(pix.height, pix.width, pix.n)

    # RGBA → BGR (only if needed)
    if pix.n == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

    return img

# =========================
# Background OCR Worker
# =========================

def run_ocr_job(jobId: str):
    try:
        log("JOB START", jobId)

        job = load_job(jobId)
        if not job:
            raise RuntimeError("Job not found")

        update_job(jobId, state="processing")

        file_path = job.get("filePath")
        if not file_path or not os.path.exists(file_path):
            raise RuntimeError("File path missing or invalid")

        with open(file_path, "rb") as f:
            raw_bytes = f.read()

        # PDF → image
        if is_pdf(raw_bytes):
            img = pdf_first_page_to_image(raw_bytes)
            ok, buffer = cv2.imencode(".png", img)
            image_bytes = buffer.tobytes()
        else:
            image_bytes = raw_bytes

        document = parse_document(image_bytes)

        update_job(
            jobId,
            state="ready",
            contentJson=document
        )

        log("JOB DONE", jobId)

    except Exception as e:
        log("JOB ERROR", repr(e))
        update_job(jobId, state="error")

def detect_pdf_type(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    pages_to_check = min(len(doc), 3)

    for i in range(pages_to_check):
        page = doc.load_page(i)
        text = page.get_text().strip()

        if len(text) > 0:
            return "digital"

    return "scanned"

class ProcessRequest(BaseModel):
    jobId: str

@app.post("/api/handwritten/process")
async def start_handwritten_process(
    payload: ProcessRequest,
    background_tasks: BackgroundTasks
):
    jobId = payload.jobId

    print("🔥 Starting background OCR job:", jobId)

    # ✅ ENSURE JOB EXISTS
    update_job(jobId, state="queued")

    background_tasks.add_task(run_ocr_job, jobId)

    return { "started": True }


@app.post("/api/job-register")
async def register_job(payload: dict):
    jobId = payload["jobId"]

    update_job(
        jobId,
        filePath=payload["filePath"],
        source=payload.get("source", "scanned"),
        strict=payload.get("strict", True),
        state="uploaded",
    )

    return {"ok": True}

@app.get("/api/job-status")
async def job_status(jobId: str):
    job = load_job(jobId)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return job

@app.post("/api/job-complete-free")
async def complete_free_job(payload: dict):
    jobId = payload["jobId"]

    update_job(
        jobId,
        state="free-ready",
        source="digital-pdf",
    )

    return {"ok": True}    

@app.post("/api/detect-pdf-type")
async def detect_pdf_type(file: UploadFile = File(...)):
    data = await file.read()

    # Open PDF from bytes
    doc = fitz.open(stream=data, filetype="pdf")

    pages_to_check = min(len(doc), 3)

    for i in range(pages_to_check):
        page = doc.load_page(i)
        text = page.get_text().strip()

        if len(text) > 0:
            return { "type": "digital" }

    return { "type": "scanned" }


class ExportRequest(BaseModel):
    filePath: str

@app.post("/api/export-digital-docx")
async def export_digital_docx(payload: ExportRequest):
    file_path = payload.filePath

    # ---------- Safety ----------
    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="FILE_NOT_FOUND")

    with open(file_path, "rb") as f:
        pdf_bytes = f.read()

    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")

    # ---------- CREATE WORD DOC FIRST ----------
    word_doc = Document()

    # ---------- THEN SET MARGINS ----------
    section = word_doc.sections[0]
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

    # ---------- Extract + Normalize ----------
    for page in pdf:
        raw_text = page.get_text().strip()

        if not raw_text:
            continue

        blocks = [
            b.strip()
            for b in raw_text.split("\n\n")
            if b.strip()
        ]

        for block in blocks:
            p = word_doc.add_paragraph(block)

            # Paragraph formatting
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(12)
            p.paragraph_format.space_before = Pt(0)

            # Font normalization
            for run in p.runs:
                run.font.name = "Times New Roman"
                run.font.size = Pt(12)

    # ---------- Stream DOCX ----------
    buffer = io.BytesIO()
    word_doc.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
        headers={
            "Content-Disposition": "attachment; filename=Converted_Document.docx"
        }
    )

@app.post("/api/parse-document")
async def parse_document_route(
    file: UploadFile = File(...),
    strict: bool = Form(True),
    source: str = Form("scanned"),
):
    print("🔥🔥🔥 FINAL ROUTE (PyMuPDF) RUNNING 🔥🔥🔥")
    log("API HIT")

    try:
        raw_bytes = await file.read()

        if not raw_bytes:
            raise HTTPException(status_code=400, detail="EMPTY_FILE")

        log("Bytes read", len(raw_bytes))
        log("First 8 bytes", raw_bytes[:8])

        # ============================
        # 📄 PDF (magic bytes)
        # ============================
        if is_pdf(raw_bytes):
            log("PDF detected via magic bytes")

            img = pdf_first_page_to_image(raw_bytes)

        # ============================
        # 🖼️ IMAGE
        # ============================
        else:
            log("Image detected")

            np_img = np.frombuffer(raw_bytes, np.uint8)
            img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        # ============================
        # 🚨 SAFETY CHECK
        # ============================
        if img is None:
            raise HTTPException(status_code=400, detail="INVALID_IMAGE_DATA")

        # ============================
        # 🔁 NORMALIZE → PNG
        # ============================
        ok, buffer = cv2.imencode(".png", img)
        if not ok:
            raise HTTPException(status_code=500, detail="IMAGE_ENCODE_FAILED")

        document = parse_document(buffer.tobytes())

        log("parse_document SUCCESS")

        return {
            "success": True,
            "engine_version": ENGINE_VERSION,
            "document": document,
        }

    except HTTPException:
        raise
    except Exception as e:
        log("❌ ROUTE ERROR", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="PROCESSING_FAILED")

