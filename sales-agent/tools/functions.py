import json

def get_contacts(query: str) -> str:
    mock = [
        {"id": "c001", "name": "John Smith", "company": "Acme Corp", "email": "john@acme.com"},
        {"id": "c002", "name": "Jane Doe", "company": "Globex Ltd", "email": "jane@globex.com"},
        {"id": "c003", "name": "Raj Patel", "company": "Initech", "email": "raj@initech.com"},
    ]
    results = [c for c in mock if query.lower() in c["name"].lower() or query.lower() in c["company"].lower()]
    return json.dumps(results or mock)

def get_emails(contact_email: str, limit: int = 5) -> str:
    mock = [
        {"subject": "Follow up on proposal", "from": contact_email, "date": "2026-04-01", "snippet": "Just checking in on the proposal we sent last week..."},
        {"subject": "Meeting next week?", "from": contact_email, "date": "2026-03-28", "snippet": "Are you free for a call on Thursday at 3pm?"},
        {"subject": "Re: Pricing questions", "from": contact_email, "date": "2026-03-25", "snippet": "Thanks for the breakdown. We had a few more questions..."},
    ]
    return json.dumps(mock[:limit])

def get_deals(contact_id: str = None) -> str:
    mock = [
        {"id": "d001", "name": "Acme Corp - Enterprise", "stage": "Proposal Sent", "value": 12000, "contact_id": "c001"},
        {"id": "d002", "name": "Globex - Starter Plan", "stage": "Negotiation", "value": 3500, "contact_id": "c002"},
        {"id": "d003", "name": "Initech - Pro Plan", "stage": "Closed Won", "value": 7200, "contact_id": "c003"},
    ]
    if contact_id:
        mock = [d for d in mock if d["contact_id"] == contact_id]
    return json.dumps(mock)

def create_crm_note(contact_id: str, note: str) -> str:
    return json.dumps({"status": "success", "contact_id": contact_id, "note": note})

# Maps tool names to functions
FUNCTION_MAP = {
    "get_contacts": get_contacts,
    "get_emails": get_emails,
    "get_deals": get_deals,
    "create_crm_note": create_crm_note,
}

def run_tool(name: str, args: dict) -> str:
    func = FUNCTION_MAP.get(name)
    if not func:
        return json.dumps({"error": f"Unknown tool: {name}"})
    return func(**args)