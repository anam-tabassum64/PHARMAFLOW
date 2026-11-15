# Security configuration and utility helpers
import secrets


def generate_reference_number(prefix: str = "REF") -> str:
    """Generate human-readable unique reference numbers for stock movements"""
    random_hex = secrets.token_hex(4).upper()
    return f"{prefix}-{random_hex}"
