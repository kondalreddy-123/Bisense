# BISENSE

> **“Understand Requirements. Discover the Right Indian Standards.”**

BISENSE is an AI-powered multilingual semantic discovery and recommendation platform for Indian Standards (IS) published by the Bureau of Indian Standards (BIS). It bridges the gap between natural-language product requirements and formal technical standards specifications, helping procurement officers, tender evaluators, and engineering teams discover applicable standards with explainable AI rationales.

---

## 📌 Domain Focus

BISENSE strictly focuses on **Electrical & Electronic Products** for the prototype:
* Electric Cookers (IS 302-2-15)
* Electric Dry & Steam Irons (IS 302-2-3 / IS 366)
* Electric Ceiling & Table Fans (IS 374 / IS 302-2-80)
* Domestic Refrigerators (IS 17550 / IS 15750)
* Clothes Washing Machines (IS 14155 / IS 302-2-7)
* Self-Ballasted LED Lamps (IS 16102)
* Modular Domestic Switches (IS 3854)
* Plugs & Socket-Outlets (IS 1293)
* PVC Insulated Electrical Cables (IS 694 / IS 8130)
* Cord Extension Boards (IS 15111)
* Electric Storage Water Heaters / Geysers (IS 302-2-21)
* Domestic Microwave Ovens (IS 302-2-25)
* Master General Safety Standard (IS 302-1)
* Environmental Testing Standard (IS 9000)

---

## 🌟 Key Features

1. **Natural Language Requirement Search**: Describe physical specifications (wattage, voltage, application, thermal protection) instead of needing to know an IS number beforehand.
2. **Multilingual NLP (10 Indian Regional Languages + English)**:
   - English, हिन्दी (Hindi), తెలుగు (Telugu), தமிழ் (Tamil), ಕನ್ನಡ (Kannada), മലയാളം (Malayalam), मराठी (Marathi), বাংলা (Bengali), ગુજરાતી (Gujarati), ਪੰਜਾਬੀ (Punjabi).
   - Auto Detect automatically determines script and matches across languages to the same standards knowledge base.
3. **Multi-Chunk Semantic Embeddings & FAISS Vector Search**:
   - Chunks standards into independent semantic sections: *Scope, Construction, Quality/Performance, Safety, Testing Methods, Marking/ISI, and Sampling*.
   - Evaluates multi-section cosine similarity with FAISS Inner Product indexing.
4. **Transparent Explainable AI ("Why this result?")**:
   - Explicitly explains which extracted parameters (power, domestic application, thermal cut-off) triggered the match.
5. **Interactive 3D Visual Experience (Three.js)**:
   - **Hero AI Engine**: Central glowing icosahedron core, orbital rings, floating product/standard nodes, dynamic search particles, and raycasting HUD.
   - **Semantic Search Relevance Graph**: 3D query-to-candidate graph scaling node sizes by similarity score.
   - **Related Standards Network**: 3D constellation connecting Product, Safety, Testing, and Installation standards.
   - **3D System Architecture Stack**: Layered floating architecture planes with data flows.
6. **Zero External Frontend Frameworks**:
   - Pure HTML5, CSS3 Glassmorphism, and Vanilla ES6 JavaScript (No React, Vue, Angular, Tailwind, or Bootstrap).
7. **Production-Ready Python Backend**:
   - Lightweight Flask REST API with CORS, disk embedding caching, and sub-second query response times.

---

## 🛠️ Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 Glassmorphism, Vanilla JavaScript ES6, Three.js (r128) |
| **Backend API** | Python 3, Flask, Flask-CORS |
| **NLP & Vectors** | Multilingual Semantic Subword/N-Gram Encoder, Sentence Transformers (optional) |
| **Vector Search** | FAISS (`faiss-cpu`), NumPy vector cosine similarity |
| **Data Store** | JSON Multi-Chunk Standards Knowledge Base (PostgreSQL + pgvector ready) |

---

## 📂 Project Structure

```text
bisense/
│
├── app.py                         # Main Flask application & REST API routes
├── requirements.txt               # Python package dependencies
├── README.md                      # Project documentation
├── .gitignore                     # Git ignore rules
│
├── data/
│   ├── products.json              # Electrical & Electronic products catalog
│   ├── standards.json             # Multi-chunk Indian Standards knowledge base
│   └── cache/                     # Cached 384-dim embeddings and metadata
│
├── services/
│   ├── nlp_service.py             # Language detection & characteristic extraction
│   ├── embedding_service.py       # Multilingual vectorizer & chunking
│   ├── semantic_search.py         # FAISS cosine similarity index
│   └── recommendation_engine.py   # Multi-stage ranking & explanation generator
│
├── templates/
│   └── index.html                 # Complete semantic HTML5 web page
│
└── static/
    ├── css/
    │   └── style.css              # Dark theme, glassmorphism & responsive CSS
    └── js/
        ├── api.js                 # Client-side API fetch module
        ├── three-scene.js         # Three.js 3D visualizations (Hero, Graph, Stack)
        ├── search.js              # Search workflow, animation & card rendering
        └── main.js                # App coordinator & event initialization
```

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Web browser (Chrome, Edge, Firefox, or Safari) with WebGL support

### 2. Install Dependencies
Navigate to the project directory and install the requirements:
```bash
pip install -r requirements.txt
```

### 3. Run the Application
Start the Flask development server:
```bash
python app.py
```

### 4. Open in Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🎯 Demo Walkthrough for Hackathon Judges

1. **Hero Experience**:
   - Inspect the interactive **BISENSE AI Engine** in the hero section. Move your mouse to observe camera perspective shifts, and click any orbital node to open the 3D HUD card.
2. **Direct Requirement Search (No Product Selection Needed)**:
   - Users directly enter their requirement in natural language without having to manually pick a product from a dropdown.
   - You can also click **Discover Standards** on any product card in **Explore Products** to automatically populate that product's sample requirement into the search box.
3. **English Query Test**:
   - Input: `"Domestic electric cooker 2000W with automatic temperature control"`
   - Click **Find Standards**.
   - Watch the 7-stage animated pipeline: *Language Detection → Requirement Extraction → Semantic Search → Ranked Results*.
   - Inspect the **Requirement Understanding Card** (Product: Electric Cooker, Application: Domestic, Power: 2000W, Feature: Temperature Control).
   - Inspect the **3D Relevance Graph**: Hover over the candidate nodes to see relevance scores, and click `IS 302-2-15` to jump to its clauses.
   - Explore tabs: **Scope**, **Requirements**, **Safety**, **Testing**, **Marking**, and **Technical Specs**.
4. **Multilingual Test (Hindi)**:
   - Click the prompt chip: `घरेलू 2000W कुकर (Hindi)` or type `"घरेलू उपयोग के लिए 2000W इलेक्ट्रिक कुकर"`.
   - Result: Detected Language = `Hindi`, correctly maps to `IS 302-2-15`.
5. **Multilingual Test (Telugu)**:
   - Click the prompt chip: `గృహ కుక్కర్ 2000W (Telugu)` or type `"గృహ వినియోగం కోసం 2000W ఎలక్ట్రిక్ కుక్కర్"`.
   - Result: Detected Language = `Telugu`, correctly maps to `IS 302-2-15`.
6. **Related Standards 3D Network**:
   - On the `IS 302-2-15` card, click **Related Standards**.
   - Inspect the 3D constellation showing links to `IS 302-1` (Master Safety Standard), `IS 9000` (Testing Standard), and `IS 732` (Installation Standard).
7. **No-Result Fallback**:
   - Enter an out-of-domain query like `"tractor diesel engine for agriculture"`.
   - BISENSE gracefully informs the user that no standard in the Electrical & Electronic Products domain matches, and offers actionable query refinement tips.

---

## ⚖️ Regulatory Notice & Demo Disclaimer

> **DEMO DATA NOTICE**: The Indian Standards data included in this prototype is formatted for demonstration and educational testing. BISENSE assists with discovery and navigation. Recommendations must always be verified against the latest authoritative publications from the Bureau of Indian Standards (BIS) and applicable statutory procurement requirements.
