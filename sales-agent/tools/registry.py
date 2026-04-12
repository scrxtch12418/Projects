TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_contacts",
            "description": "Search for sales contacts in the CRM by name or company.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Name or company to search for"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_emails",
            "description": "Fetch recent emails from Outlook for a given contact email address.",
            "parameters": {
                "type": "object",
                "properties": {
                    "contact_email": {
                        "type": "string",
                        "description": "The contact's email address"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Max number of emails to return",
                        "default": 5
                    }
                },
                "required": ["contact_email"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_deals",
            "description": "Get open deals from the CRM, optionally filtered by contact ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "contact_id": {
                        "type": "string",
                        "description": "CRM contact ID to filter deals by (optional)"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_crm_note",
            "description": "Log a note against a contact in the CRM.",
            "parameters": {
                "type": "object",
                "properties": {
                    "contact_id": {
                        "type": "string",
                        "description": "The CRM contact ID"
                    },
                    "note": {
                        "type": "string",
                        "description": "The note content to log"
                    }
                },
                "required": ["contact_id", "note"]
            }
        }
    }
]