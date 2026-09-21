"""
NLP Service for BISENSE
Handles language detection (English + 10 Indian languages), text normalization,
and product requirement/characteristic extraction.
"""

import re
from typing import Dict, Any, List, Optional

# Supported language definitions
SUPPORTED_LANGUAGES = {
    "auto": {"name": "Auto Detect", "code": "auto"},
    "en": {"name": "English", "code": "en", "native": "English"},
    "hi": {"name": "Hindi", "code": "hi", "native": "हिन्दी"},
    "te": {"name": "Telugu", "code": "te", "native": "తెలుగు"},
    "ta": {"name": "Tamil", "code": "ta", "native": "தமிழ்"},
    "kn": {"name": "Kannada", "code": "kn", "native": "ಕನ್ನಡ"},
    "ml": {"name": "Malayalam", "code": "ml", "native": "മലയാളം"},
    "mr": {"name": "Marathi", "code": "mr", "native": "मराठी"},
    "bn": {"name": "Bengali", "code": "bn", "native": "বাংলা"},
    "gu": {"name": "Gujarati", "code": "gu", "native": "ગુજરાતી"},
    "pa": {"name": "Punjabi", "code": "pa", "native": "ਪੰਜਾਬੀ"}
}

# Unicode script ranges for Indian languages
SCRIPT_RANGES = [
    (r'[\u0900-\u097F]', "hi"),     # Devanagari (Hindi / Marathi)
    (r'[\u0C00-\u0C7F]', "te"),     # Telugu
    (r'[\u0B80-\u0BFF]', "ta"),     # Tamil
    (r'[\u0C80-\u0CFF]', "kn"),     # Kannada
    (r'[\u0D00-\u0D7F]', "ml"),     # Malayalam
    (r'[\u0980-\u09FF]', "bn"),     # Bengali
    (r'[\u0A80-\u0AFF]', "gu"),     # Gujarati
    (r'[\u0A00-\u0A7F]', "pa"),     # Gurmukhi / Punjabi
]

# Marathi distinctive patterns
MARATHI_WORDS = ["आहे", "करावे", "वापर", "उपकरण", "विद्युत", "घरगुती", "साठी"]

# Multilingual product aliases
PRODUCT_PATTERNS = {
    "electric_cooker": [
        r"\b(?:electric\s+)?cooker\b", r"\brice\s+cooker\b", r"\binduction\s+(?:cooker|plate|stove)\b",
        r"\bheating\s+pan\b", r"\bpressure\s+cooker\b", r"कुकर", r"इलेक्ट्रिक कुकर", r"కుక్కర్",
        r"குக்கர்", r"കുക്കർ", r"ಕುಕ್ಕರ್", r"কূকার", r"કૂકર"
    ],
    "electric_iron": [
        r"\b(?:electric\s+)?iron\b", r"\bsteam\s+iron\b", r"\bdry\s+iron\b", r"\bpressing\s+iron\b",
        r"इस्त्री", r"आयरन", r"ఇస్త్రీ", r"இஸ்திரி", r"ಇಸ್ತ್ರಿ", r"ഇസ്തിരി", r"ইস্ত্রি"
    ],
    "electric_fan": [
        r"\bceiling\s+fan\b", r"\btable\s+fan\b", r"\bpedestal\s+fan\b", r"\belectric\s+fan\b",
        r"\bfan\b", r"\bexhaust\s+fan\b", r"\bbldc\s+fan\b", r"पंखा", r"सीलिंग फैन", r"ఫ్యాన్",
        r"மின்விசிறி", r"ವಿசிறಿ", r"വിசிறി", r"ফ্যান"
    ],
    "refrigerator": [
        r"\brefrigerator\b", r"\bfridge\b", r"\bfrost[\s-]free\b", r"\bfreezer\b",
        r"रेफ्रिजरेटर", r"फ्रिज", r"రిఫ్రిజిరేటర్", r"ఫ్రిజ్", r"குளிரூட்டி", r"রেফ্রিজারেটর"
    ],
    "washing_machine": [
        r"\bwashing\s+machine\b", r"\bclothes\s+washer\b", r"\bwasher\b", r"\blaundry\b",
        r"वॉशिंग मशीन", r"वाशिंग मशीन", r"వాషింగ్ మెషిನ್", r"வாஷிங் மெஷின்", r"വാwashing മെഷീൻ"
    ],
    "electric_bulb": [
        r"\belectric\s+bulb\b", r"\bincandescent\b", r"\btungsten\b", r"\bfilament\s+lamp\b",
        r"\bfilament\s+bulb\b", r"\bfilament\b", r"बिजली का बल्ब", r"फिलामेंट बल्ब", r"విద్యుత్ బల్బ్"
    ],
    "led_lamp": [
        r"\bled\s+(?:lamp|bulb|light)\b", r"\bself-ballasted\b", r"\bled\b",
        r"एलईडी बल्ब", r"ఎల్ఈడీ బల్బ్", r"எல்இடி விளக்கு", r"ಎಲ್ಇಡಿ ಬಲ್ಬ್"
    ],
    "bulb": [
        r"\blight\s+bulb\b", r"\bbulb\b", r"\bb22\b", r"\blamp\b", r"\blighting\b",
        r"बल्ब", r"బల్బు", r"மின் விளக்கு", r"விளக்கு"
    ],
    "switches": [
        r"\bmodular\s+switch\b", r"\bswitches\b", r"\bswitch\b", r"\blight\s+switch\b",
        r"स्विच", r"స్విచ్", r"சுவிட்ச்", r"ಸ್ವಿಚ್", r"സ്വിച്ച്"
    ],
    "plugs_sockets": [
        r"\bplug\b", r"\bsocket\b", r"\bpower\s+socket\b", r"\b3[\s-]pin\b", r"\bwall\s+socket\b",
        r"प्लग", r"सॉकेट", r"ప్లగ్", r"సాకెట్", r"பிளக்", r"சாக்கெட்"
    ],
    "electrical_cables": [
        r"\bcable\b", r"\bcables\b", r"\bwire\b", r"\bwires\b", r"\bpvc\s+insulated\b",
        r"\bcopper\s+wire\b", r"\bbuilding\s+wire\b", r"\bfrls\b",
        r"बिजली का तार", r"तार", r"వైరు", r"వైర్లు", r"கேபிள்", r"மின் கம்பி"
    ],
    "extension_boards": [
        r"\bextension\s+board\b", r"\bextension\s+cord\b", r"\bpower\s+strip\b", r"\bspike\s+guard\b",
        r"एक्सटेंशन बोर्ड", r"ఎక్స్‌టెన్షన్ బోర్డు", r"நீட்டிப்பு பலகை"
    ],
    "water_heater": [
        r"\bwater\s+heater\b", r"\bgeyser\b", r"\bstorage\s+water\s+heater\b", r"\bwater\s+geyser\b",
        r"गीज़र", r"वॉटर हीटर", r"వాటర్ హీటర్", r"గీజర్", r"வாட்டர் ஹீட்டர்", r"ഗീസർ"
    ],
    "microwave_oven": [
        r"\bmicrowave\b", r"\bmicrowave\s+oven\b", r"\bconvection\s+oven\b",
        r"माइक्रोवेव", r"माइक्रोवेव ओवन", r"మైక్రోవేవ్ ఓవెన్", r"மைக்ரோவேவ் அடுப்பு"
    ]
}

# Application terms (domestic vs commercial vs industrial)
APPLICATION_PATTERNS = [
    (r"\b(?:domestic|household|home|residential|residential use|kitchen)\b|"
     r"घरेलू|घर|गार्हस्थ्य|గృహ|ఇంటి|வீட்டு|ಗೃಹ|ഗാർഹിക|গৃহস্থালী|ઘરેલું|ਘਰੇਲੂ", "Domestic"),
    (r"\b(?:commercial|hotel|restaurant|office|catering)\b|"
     r"व्यावसायिक|वाणिज्यिक|వాణిజ్య|வணிக|ಕಮರ್ಷಿಯಲ್|വാണിജ്യ|বাণিজ্যিক|વાણિજ્યિક|ਵਪਾਰਕ", "Commercial"),
    (r"\b(?:industrial|heavy[\s-]duty|factory|plant)\b|"
     r"औद्योगिक|పారిశ్రామిక|தொழில்துறை|ಕೈಗಾರಿಕಾ|വ്യാവസായിക|শিল্প|ઔદ્યોગિક|ਉਦਯੋਗਿਕ", "Industrial"),
    (r"\b(?:outdoor|weatherproof|garden)\b|"
     r"बाहरी|బహిరంగ|வெளிப்புற|ಹೊರಾಂಗಣ", "Outdoor")
]

# Power and rating extraction patterns
POWER_PATTERNS = [
    r"(\d+(?:\.\d+)?\s*(?:[kK][wW]|kW|KW|watts?|Watts?|W\b|वाट|వాట్స్|வாட்ஸ்))",
    r"(\d+(?:\.\d+)?\s*(?:[vV]olts?|[vV]\b|वोल्ट|వోల్ట్|வோல்ட்))",
    r"(\d+(?:\.\d+)?\s*(?:[aA]mps?|[aA]mperes?|[aA]\b|एम्पीयर|ఆంప్స్))",
    r"(\d+(?:\.\d+)?\s*(?:sq\s*mm|sqmm|mm²|वर्ग\s*मिमी|మిమీ²))",
    r"(\d+(?:\.\d+)?\s*(?:mm\s*sweep|मिमी\s*स्वीप|మిమీ\s*స్వీప్))",
    r"(\d+(?:\.\d+)?\s*(?:litres?|liters?|ltr|L\b|लीटर|లీటర్లు))",
    r"(\d+(?:\.\d+)?\s*(?:kg|KG|किलो|కిలో))"
]

# Feature extraction keywords
FEATURE_PATTERNS = [
    (r"\b(?:automatic\s+temperature\s+control|temp(?:erature)?\s+control|thermostat)\b|"
     r"तापमान\s*नियंत्रण|ఉష్ణోగ్రత\s*నియంత్రణ|வெப்பநிலை\s*கட்டுப்பாடு|ಉಷ್ಣಾಂಶ\s*ನಿಯಂತ್ರಣ", "Automatic temperature control"),
    (r"\b(?:thermal\s+cut[\s-]?off|thermal\s+fuse|overheat\s+protection)\b|"
     r"थर्मल कटऑफ|ఓవర్‌హీట్ రక్షణ", "Thermal cut-off"),
    (r"\b(?:bldc|brushless|energy\s+efficient|5\s*star|star\s*rated)\b|"
     r"बीएलडीसी|ऊर्जा दक्ष|శక్తి సామర్థ్యం", "BLDC / Energy efficient"),
    (r"\b(?:surge\s+protect(?:ed|ion)|spike\s+guard|varistor)\b|"
     r"सर्ज सुरक्षा|సర్జ్ ప్రొటెక్షన్", "Surge protection"),
    (r"\b(?:child\s+lock|safety\s+shutter|safety\s+interlock)\b|"
     r"सुरक्षा शटर|చైల్డ్ లాక్|సేఫ్టీ షట్టర్", "Safety shutter / Interlock"),
    (r"\b(?:frost[\s-]free|auto\s+defrost)\b|"
     r"फ्रॉस्ट फ्री|ఆటో డిఫ్రాస్ట్", "Frost-free"),
    (r"\b(?:water\s+resist(?:ant|ance)|splash[\s-]proof|ipx[1-8])\b|"
     r"वॉटर प्रूफ|స్ప్లాష్ ప్రూఫ్", "Water resistance / Ingress protection"),
    (r"\b(?:non[\s-]stick|teflon|coated\s+soleplate)\b|"
     r"नॉन स्टिक|నాన్-స్టిక్", "Non-stick surface"),
    (r"\b(?:earthing|ground(?:ing)?|earthed)\b|"
     r"अर्थिंग|గ్రౌండింగ్", "Earthing protection"),
    (r"\b(?:fire\s+retardant|frls?|flame\s+retardant)\b|"
     r"अग्नि रोधक|ఫైర్ రిటార్డెంట్", "Flame retardant (FRLS)"),
    (r"\b(?:digital\s+display|timer|electronic\s+control)\b|"
     r"टाइमर|టైమర్", "Timer / Digital control")
]

PRODUCT_NAME_MAP = {
    "electric_cooker": "Electric Cooker",
    "electric_iron": "Electric Iron",
    "electric_fan": "Electric Fan",
    "refrigerator": "Refrigerator",
    "washing_machine": "Washing Machine",
    "electric_bulb": "Electric Bulb (Tungsten Filament)",
    "led_lamp": "LED Bulb / Lamp",
    "bulb": "Bulb (Electric / LED)",
    "switches": "Switches",
    "plugs_sockets": "Plugs & Sockets",
    "electrical_cables": "Electrical Cables",
    "extension_boards": "Extension Boards",
    "water_heater": "Electric Water Heater",
    "microwave_oven": "Microwave Oven"
}


class NLPService:
    def __init__(self):
        pass

    def detect_language(self, text: str, user_selected: str = "auto") -> Dict[str, str]:
        """
        Detects language from query text or respects explicit user selection.
        """
        if user_selected and user_selected != "auto" and user_selected in SUPPORTED_LANGUAGES:
            info = SUPPORTED_LANGUAGES[user_selected]
            return {"code": user_selected, "name": info["name"]}

        if not text or not text.strip():
            return {"code": "en", "name": "English"}

        # Scan text for Indian script unicode matches
        for pattern, lang_code in SCRIPT_RANGES:
            if re.search(pattern, text):
                # If Devanagari, check if Marathi specific words exist
                if lang_code == "hi":
                    for m_word in MARATHI_WORDS:
                        if m_word in text:
                            return {"code": "mr", "name": "Marathi"}
                    return {"code": "hi", "name": "Hindi"}
                return {"code": lang_code, "name": SUPPORTED_LANGUAGES[lang_code]["name"]}

        return {"code": "en", "name": "English"}

    def extract_characteristics(self, text: str, preselected_product: Optional[str] = None) -> Dict[str, Any]:
        """
        Extracts structured product requirements:
        - Product name / key
        - Application / intended use (Domestic, Commercial, Industrial)
        - Power / Ratings
        - Features (e.g., Automatic temperature control, safety lock)
        """
        lower_text = text.lower() if text else ""

        # 1. Product extraction
        extracted_product = None
        extracted_product_key = None

        if preselected_product and preselected_product in PRODUCT_NAME_MAP:
            extracted_product = PRODUCT_NAME_MAP[preselected_product]
            extracted_product_key = preselected_product
        else:
            for p_key, patterns in PRODUCT_PATTERNS.items():
                for pat in patterns:
                    if re.search(pat, text, re.IGNORECASE):
                        extracted_product = PRODUCT_NAME_MAP[p_key]
                        extracted_product_key = p_key
                        break
                if extracted_product:
                    break

        if not extracted_product:
            extracted_product = "Electrical / Electronic Equipment"
            extracted_product_key = None

        # 2. Application extraction
        extracted_app = "Domestic"
        for pat, app_name in APPLICATION_PATTERNS:
            if re.search(pat, text, re.IGNORECASE):
                extracted_app = app_name
                break

        # 3. Power / Rating extraction
        extracted_power = None
        for pat in POWER_PATTERNS:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                extracted_power = match.group(1).strip()
                break

        if not extracted_power:
            # Fallback default if not specified
            if extracted_product_key == "electric_cooker":
                extracted_power = "2000W"
            elif extracted_product_key == "electric_iron":
                extracted_power = "1200W"
            elif extracted_product_key == "electric_fan":
                extracted_power = "50W / 1200mm"
            elif extracted_product_key == "water_heater":
                extracted_power = "2000W"
            elif extracted_product_key == "led_lamp":
                extracted_power = "9W"
            elif extracted_product_key == "electrical_cables":
                extracted_power = "2.5 sq mm, 1100V"
            else:
                extracted_power = "230V AC"

        # 4. Features extraction
        features: List[str] = []
        for pat, feat_name in FEATURE_PATTERNS:
            if re.search(pat, text, re.IGNORECASE):
                features.append(feat_name)

        if not features:
            if extracted_product_key and "cooker" in extracted_product_key:
                features.append("Automatic temperature control")
                features.append("Thermal cut-off")
            elif extracted_product_key and "iron" in extracted_product_key:
                features.append("Adjustable thermostat")
                features.append("Soleplate non-stick coating")
            elif extracted_product_key and "fan" in extracted_product_key:
                features.append("Electronic speed regulator")
            elif extracted_product_key and "cable" in extracted_product_key:
                features.append("Flame retardant (FRLS)")
            elif extracted_product_key and ("socket" in extracted_product_key or "extension" in extracted_product_key):
                features.append("Child safety shutter")
            else:
                features.append("Standard safety compliance")

        return {
            "product": extracted_product,
            "product_key": extracted_product_key,
            "application": extracted_app,
            "power": extracted_power,
            "features": features
        }

    def process_query(self, query: str, user_selected_lang: str = "auto", preselected_product: Optional[str] = None) -> Dict[str, Any]:
        """
        Runs full NLP understanding pipeline on query.
        """
        lang_info = self.detect_language(query, user_selected_lang)
        understanding = self.extract_characteristics(query, preselected_product)
        understanding["language"] = lang_info["name"]

        return {
            "detected_language": lang_info["name"],
            "language_code": lang_info["code"],
            "understanding": understanding
        }

    def process_specification_document(self, text: str) -> Dict[str, Any]:
        """
        Processes multi-line document/spec text, finds relevant clauses/parameters,
        and constructs an optimized search query for BISENSE.
        """
        if not text or not text.strip():
            return {
                "extracted_text": "",
                "suggested_query": "",
                "specs": {}
            }

        cleaned_text = text[:10000]
        specs = self.extract_characteristics(cleaned_text)

        parts = []
        if specs.get("product") and specs["product"] != "Electrical / Electronic Equipment":
            parts.append(specs["product"])
        elif specs.get("product_key"):
            parts.append(specs["product_key"].replace("_", " "))

        if specs.get("power"):
            parts.append(f"rated at {specs['power']}")

        if specs.get("application"):
            parts.append(f"for {specs['application'].lower()} use")

        if specs.get("features"):
            features_str = ", ".join(specs["features"][:3])
            parts.append(f"with {features_str}")

        if not parts:
            lines = [line.strip() for line in cleaned_text.splitlines() if line.strip()]
            relevant_lines = []
            keywords = ["volt", "watt", "amp", "hz", "safety", "standard", "electric", "power", "temperature", "is "]
            for line in lines:
                if any(kw in line.lower() for kw in keywords):
                    relevant_lines.append(line)
                    if len(relevant_lines) >= 3:
                        break
            if relevant_lines:
                suggested_query = " ".join(relevant_lines)[:250]
            else:
                suggested_query = cleaned_text[:200].strip()
        else:
            suggested_query = " ".join(parts)

        return {
            "extracted_text": cleaned_text[:2000],
            "suggested_query": suggested_query,
            "specs": specs
        }

    def detect_product_typo(self, query: str) -> Dict[str, Any]:
        """
        Detects misspellings of product names in user input.
        Returns suggestions without automatically altering the user's query.
        """
        import difflib

        if not query or not query.strip():
            return {"has_typo": False, "suggestions": []}

        text_lower = query.lower().strip()
        words = re.findall(r"\b[a-zA-Z\u0900-\u097F\u0C00-\u0C7F\u0B80-\u0BFF]+\b", text_lower)

        products_typo_map = [
            {
                "id": "refrigerator",
                "name": "Refrigerator",
                "canonical_terms": ["refrigerator", "fridge", "freezer"],
                "common_typos": ["refregerator", "refrigarator", "refridgerator", "refrizirator", "fridg", "freezr", "refrigeratr"]
            },
            {
                "id": "electric_cooker",
                "name": "Electric Cooker",
                "canonical_terms": ["electric cooker", "cooker", "kettle", "pressure cooker"],
                "common_typos": ["coker", "cookr", "elctric cooker", "coocker", "kettl", "ketle", "presure cooker"]
            },
            {
                "id": "electric_iron",
                "name": "Electric Iron",
                "canonical_terms": ["electric iron", "iron", "steam iron", "dry iron"],
                "common_typos": ["irn", "elctric iron", "stem iron", "steme iron", "ironn"]
            },
            {
                "id": "electric_fan",
                "name": "Electric Fan",
                "canonical_terms": ["ceiling fan", "fan", "table fan", "pedestal fan", "exhaust fan"],
                "common_typos": ["celing fan", "ceeling fan", "fann", "pedistal fan", "exaust fan", "elctric fan"]
            },
            {
                "id": "washing_machine",
                "name": "Washing Machine",
                "canonical_terms": ["washing machine", "washer", "laundry"],
                "common_typos": ["washng machine", "washin machine", "wasing machine", "washng machne"]
            },
            {
                "id": "led_lamp",
                "name": "Electric Bulb / LED Lamp",
                "canonical_terms": ["electric bulb", "bulb", "led lamp", "lamp", "light bulb"],
                "common_typos": ["bulbb", "electrik bulb", "light bulp", "blub", "lanp"]
            },
            {
                "id": "switches",
                "name": "Switches",
                "canonical_terms": ["switches", "switch", "modular switch"],
                "common_typos": ["swich", "switche", "moduler switch", "switeches"]
            },
            {
                "id": "plugs_sockets",
                "name": "Plugs & Sockets",
                "canonical_terms": ["plug", "socket", "power socket", "plugs", "sockets"],
                "common_typos": ["soket", "sokets", "plugg", "sockt"]
            },
            {
                "id": "electrical_cables",
                "name": "Electrical Cables",
                "canonical_terms": ["cables", "cable", "wire", "copper wire"],
                "common_typos": ["cabl", "cabls", "wir", "copr wire", "electrik cable"]
            },
            {
                "id": "extension_boards",
                "name": "Extension Boards",
                "canonical_terms": ["extension board", "extension cord", "power strip"],
                "common_typos": ["extention board", "extenshion board", "extention cord", "powerstrip"]
            },
            {
                "id": "water_heater",
                "name": "Water Heater",
                "canonical_terms": ["water heater", "geyser", "water geyser"],
                "common_typos": ["watr heater", "geysr", "geeser", "water heeter", "gyser"]
            },
            {
                "id": "microwave_oven",
                "name": "Microwave Oven",
                "canonical_terms": ["microwave oven", "microwave", "convection oven"],
                "common_typos": ["microwav", "microwav oven", "micro wave oven", "microven"]
            }
        ]

        suggestions = []
        seen_products = set()

        # 1. Check explicit known common typos first (e.g. "celing fan", "refregerator", "coker")
        for p in products_typo_map:
            for typo in p["common_typos"]:
                pattern = r"\b" + re.escape(typo) + r"\b"
                if re.search(pattern, text_lower):
                    if p["id"] not in seen_products:
                        corrected_query = re.sub(pattern, p["name"].lower(), text_lower, flags=re.IGNORECASE)
                        suggestions.append({
                            "original_word": typo,
                            "product_name": p["name"],
                            "product_id": p["id"],
                            "corrected_query": corrected_query
                        })
                        seen_products.add(p["id"])
                    break

        if suggestions:
            return {
                "has_typo": True,
                "original_query": query,
                "suggestions": suggestions
            }

        # 2. If an exact canonical product term is explicitly present, no typo
        for p in products_typo_map:
            for term in p["canonical_terms"]:
                if re.search(r"\b" + re.escape(term) + r"\b", text_lower):
                    return {"has_typo": False, "suggestions": []}

        # 3. Fuzzy matching for unlisted variations
        if not suggestions:
            for word in words:
                if len(word) < 4:
                    continue
                for p in products_typo_map:
                    for term in p["canonical_terms"]:
                        for t_word in term.split():
                            sim = difflib.SequenceMatcher(None, word, t_word).ratio()
                            if 0.74 <= sim < 1.0:
                                if p["id"] not in seen_products:
                                    pattern = r"\b" + re.escape(word) + r"\b"
                                    corrected_query = re.sub(pattern, t_word, text_lower, flags=re.IGNORECASE)
                                    suggestions.append({
                                        "original_word": word,
                                        "product_name": p["name"],
                                        "product_id": p["id"],
                                        "corrected_query": corrected_query
                                    })
                                    seen_products.add(p["id"])
                                break

        return {
            "has_typo": len(suggestions) > 0,
            "original_query": query,
            "suggestions": suggestions
        }


# Global singleton
nlp_service = NLPService()
