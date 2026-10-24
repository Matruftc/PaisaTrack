#!/usr/bin/env python3
"""
PaisaTrack - Python UPI Details Fetcher & Local Expense Tracker
Zero-Database • Local JSON Storage • Privacy First
"""

import json
import re
import os
from datetime import datetime
from typing import Dict, Any, Optional

DATA_FILE = "paisa_records.json"

CATEGORIES = {
    "Food & Dining": ["swiggy", "zomato", "mcdonald", "kfc", "starbucks", "cafe", "coffee", "chai", "dhaba", "food", "restaurant"],
    "Groceries & Essentials": ["blinkit", "zepto", "instamart", "bigbasket", "grocery", "supermarket", "mart", "kirana"],
    "Travel & Transport": ["uber", "ola", "rapido", "metro", "petrol", "fuel", "hpcl", "bpcl", "flight", "train", "bus"],
    "Shopping & Retail": ["amazon", "flipkart", "myntra", "ajio", "retail", "croma", "zara"],
    "Bills & Utilities": ["electricity", "bescom", "airtel", "jio", "water", "gas", "recharge", "broadband"],
    "Entertainment & OTT": ["netflix", "prime", "hotstar", "spotify", "bookmyshow", "movie", "pvr"],
    "Salary & Earnings": ["salary", "payroll", "stipend", "wages", "bonus"],
}

def infer_category(text: str, tx_type: str) -> str:
    lower = text.lower()
    if tx_type == "income":
        if any(w in lower for w in ["salary", "payroll", "stipend"]):
            return "Salary & Earnings"
        return "Transfers & Family"
    
    for category, keywords in CATEGORIES.items():
        if any(kw in lower for kw in keywords):
            return category
    return "General & Others"

def parse_upi_string(input_text: str) -> Optional[Dict[str, Any]]:
    """
    Parses UPI URI or Bank SMS to extract transaction details.
    """
    text = input_text.strip()
    if not text:
        return None

    # 1. Check if UPI URI
    if text.startswith("upi://pay") or "upi://pay" in text:
        from urllib.parse import urlparse, parse_qs
        url = text if text.startswith("upi://") else text[text.find("upi://"):]
        parsed_url = urlparse(url)
        params = parse_qs(parsed_url.query)
        
        pa = params.get("pa", [""])[0]
        pn = params.get("pn", [""])[0]
        am = float(params.get("am", ["0"])[0]) if params.get("am") else 0.0
        tn = params.get("tn", [""])[0]
        
        return {
            "title": pn or (pa.split("@")[0] if pa else "UPI Payment"),
            "amount": am,
            "type": "expense",
            "category": infer_category(f"{pn} {tn} {pa}", "expense"),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "time": datetime.now().strftime("%H:%M"),
            "paymentMethod": "UPI",
            "upi_vpa": pa,
            "notes": tn,
        }

    # 2. Check SMS format
    lower = text.lower()
    is_credit = any(w in lower for w in ["credited", "received", "deposited", "cashback", "refund"])
    tx_type = "income" if is_credit else "expense"

    # Extract Amount
    amt_match = re.search(r"(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)", text, re.IGNORECASE)
    amount = 0.0
    if amt_match:
        cleaned = amt_match.group(1).replace(",", "")
        amount = float(cleaned)

    # Extract Payee / Merchant
    payee_match = re.search(r"(?:to|towards|at|from)\s+([A-Za-z0-9\s&.'-]{2,30}?)(?=\s+(?:on|via|ref|upi|bal|\.|$))", text, re.IGNORECASE)
    party = payee_match.group(1).strip() if payee_match else ""

    # Extract VPA
    vpa_match = re.search(r"\b([a-zA-Z0-9.\-_]{2,40}@[a-zA-Z0-9]{2,20})\b", text)
    vpa = vpa_match.group(1) if vpa_match else ""

    # Extract UTR / Ref
    utr_match = re.search(r"(?:ref|utr|rrn)[\s:/-]*([0-9]{8,16})", text, re.IGNORECASE)
    ref = utr_match.group(1) if utr_match else ""

    title = party.title() if party else (vpa.split("@")[0].title() if vpa else "UPI Payment")
    category = infer_category(f"{title} {text}", tx_type)

    return {
        "title": title,
        "amount": amount,
        "type": tx_type,
        "category": category,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time": datetime.now().strftime("%H:%M"),
        "paymentMethod": "UPI",
        "upi_vpa": vpa,
        "ref_number": ref,
        "notes": f"Raw: {text[:50]}...",
    }

def load_records():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return []

def save_record(record):
    records = load_records()
    records.insert(0, record)
    with open(DATA_FILE, "w") as f:
        json.dump(records, f, indent=2)
    print(f"✅ Successfully saved record: {record['title']} | ₹{record['amount']} ({record['type']})")

if __name__ == "__main__":
    print("=== PaisaTrack Python UPI Fetcher & Local Storage ===")
    sample = "Paid Rs. 380.00 on 16-Oct-2026 to SWIGGY UPI Ref 429381928192. Bal Rs 18,200.00"
    print(f"Testing sample SMS: {sample}")
    res = parse_upi_string(sample)
    print("Fetched Details:")
    print(json.dumps(res, indent=2))
