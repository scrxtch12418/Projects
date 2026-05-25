"""
Output Validator - Detects sensitive information in LLM outputs
"""

import re
from typing import Dict, List, Set
from dataclasses import dataclass
from enum import Enum


class LeakType(Enum):
    """Types of information leaks"""
    CREDIT_CARD = "Credit Card"
    SSN = "Social Security Number"
    EMAIL = "Email Address"
    PHONE = "Phone Number"
    API_KEY = "API Key"
    AWS_KEY = "AWS Access Key"
    JWT_TOKEN = "JWT Token"
    PASSWORD = "Password Disclosure"
    IP_ADDRESS = "IP Address"
    PRIVATE_KEY = "Private Key"
    DATABASE_CONNECTION = "Database Connection String"


class LeakSeverity(Enum):
    """Severity of information leak"""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass
class LeakDetection:
    """Represents a detected information leak"""
    leak_type: LeakType
    severity: LeakSeverity
    value: str  # The actual leaked value (masked)
    position: int  # Character position in text
    context: str  # Surrounding context
    
    def to_dict(self) -> dict:
        return {
            "leak_type": self.leak_type.value,
            "severity": self.severity.value,
            "value": self.value,
            "position": self.position,
            "context": self.context
        }


@dataclass
class OutputValidationResult:
    """Result of output validation"""
    has_leaks: bool
    leaks: List[LeakDetection]
    total_leaks: int
    severity: LeakSeverity
    safe_to_display: bool
    sanitized_output: str
    
    def to_dict(self) -> dict:
        return {
            "has_leaks": self.has_leaks,
            "total_leaks": self.total_leaks,
            "severity": self.severity.value,
            "safe_to_display": self.safe_to_display,
            "leaks": [leak.to_dict() for leak in self.leaks],
            "sanitized_output": self.sanitized_output
        }


class SensitivePatterns:
    """Regex patterns for detecting sensitive information"""
    
    # Financial information
    CREDIT_CARD = r'\b(?:\d{4}[-\s]?){3}\d{4}\b'
    SSN = r'\b\d{3}-\d{2}-\d{4}\b'
    
    # Contact information
    EMAIL = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    PHONE = r'\b(?:\+\d{1,2}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
    
    # API Keys and Secrets
    GITHUB_TOKEN = r'\b(ghp_|gho_|ghu_|ghs_|ghr_)[a-zA-Z0-9]{36,}\b'
    GITHUB_PAT = r'\bgithub_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}\b'
    OPENAI_KEY = r'\bsk-[a-zA-Z0-9]{48}\b'
    ANTHROPIC_KEY = r'\bsk-ant-[a-zA-Z0-9\-]{95}\b'
    GENERIC_API_KEY = r'\b(api[_-]?key|apikey)\s*[:=]\s*[\'"]?([a-zA-Z0-9_\-]{20,})[\'"]?\b'
    
    # AWS Credentials
    AWS_ACCESS_KEY = r'\b(AKIA|ASIA)[0-9A-Z]{16}\b'
    AWS_SECRET = r'\baws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*[\'"]?([a-zA-Z0-9/+=]{40})[\'"]?\b'
    
    # Tokens
    JWT = r'\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\b'
    BEARER_TOKEN = r'\bBearer\s+[a-zA-Z0-9\-._~+/]+=*\b'
    
    # Passwords
    PASSWORD = r'\b(password|passwd|pwd)\s*[:=]\s*[\'"]?([^\s\'"]{8,})[\'"]?\b'
    
    # Network
    IP_ADDRESS = r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b'
    
    # Private Keys
    PRIVATE_KEY = r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----'
    
    # Database
    DB_CONNECTION = r'\b(mongodb|mysql|postgresql|postgres|mssql):\/\/[^\s]+\b'


class OutputValidator:
    """Validates LLM outputs for sensitive information leaks"""
    
    # Define severity for each leak type
    SEVERITY_MAP = {
        LeakType.CREDIT_CARD: LeakSeverity.CRITICAL,
        LeakType.SSN: LeakSeverity.CRITICAL,
        LeakType.API_KEY: LeakSeverity.CRITICAL,
        LeakType.AWS_KEY: LeakSeverity.CRITICAL,
        LeakType.PASSWORD: LeakSeverity.CRITICAL,
        LeakType.PRIVATE_KEY: LeakSeverity.CRITICAL,
        LeakType.DATABASE_CONNECTION: LeakSeverity.CRITICAL,
        LeakType.JWT_TOKEN: LeakSeverity.HIGH,
        LeakType.EMAIL: LeakSeverity.MEDIUM,
        LeakType.PHONE: LeakSeverity.MEDIUM,
        LeakType.IP_ADDRESS: LeakSeverity.LOW,
    }
    
    def __init__(self, mask_leaks: bool = True):
        """
        Args:
            mask_leaks: If True, mask sensitive values in detection results
        """
        self.mask_leaks = mask_leaks
        self.patterns = SensitivePatterns()
    
    def mask_value(self, value: str, leak_type: LeakType) -> str:
        """Mask sensitive value for safe display"""
        if not self.mask_leaks:
            return value
        
        if leak_type == LeakType.CREDIT_CARD:
            # Show last 4 digits only
            return f"****-****-****-{value[-4:]}"
        elif leak_type == LeakType.SSN:
            return "***-**-****"
        elif leak_type == LeakType.EMAIL:
            parts = value.split('@')
            if len(parts) == 2:
                return f"{parts[0][:2]}***@{parts[1]}"
        elif leak_type == LeakType.PHONE:
            return "***-***-" + value[-4:] if len(value) >= 4 else "***"
        else:
            # Generic masking
            if len(value) > 8:
                return f"{value[:4]}...{value[-4:]}"
            return "***"
    
    def get_context(self, text: str, position: int, window: int = 40) -> str:
        """Extract context around a position"""
        start = max(0, position - window)
        end = min(len(text), position + window)
        context = text[start:end]
        
        if start > 0:
            context = "..." + context
        if end < len(text):
            context = context + "..."
        
        return context
    
    def detect_pattern(self, text: str, pattern: str, leak_type: LeakType) -> List[LeakDetection]:
        """Detect a specific pattern in text"""
        detections = []
        
        for match in re.finditer(pattern, text, re.IGNORECASE):
            value = match.group(0)
            position = match.start()
            context = self.get_context(text, position)
            masked_value = self.mask_value(value, leak_type)
            severity = self.SEVERITY_MAP.get(leak_type, LeakSeverity.MEDIUM)
            
            detection = LeakDetection(
                leak_type=leak_type,
                severity=severity,
                value=masked_value,
                position=position,
                context=context
            )
            detections.append(detection)
        
        return detections
    
    def validate(self, output_text: str) -> OutputValidationResult:
        """
        Validate LLM output for sensitive information leaks
        
        Args:
            output_text: The LLM's response text to validate
            
        Returns:
            OutputValidationResult with all detected leaks
        """
        all_leaks = []
        
        # Check for credit cards
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.CREDIT_CARD, LeakType.CREDIT_CARD
        ))
        
        # Check for SSN
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.SSN, LeakType.SSN
        ))
        
        # Check for emails
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.EMAIL, LeakType.EMAIL
        ))
        
        # Check for phone numbers
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.PHONE, LeakType.PHONE
        ))
        
        # Check for GitHub tokens
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.GITHUB_TOKEN, LeakType.API_KEY
        ))
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.GITHUB_PAT, LeakType.API_KEY
        ))
        
        # Check for OpenAI keys
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.OPENAI_KEY, LeakType.API_KEY
        ))
        
        # Check for Anthropic keys
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.ANTHROPIC_KEY, LeakType.API_KEY
        ))
        
        # Check for generic API keys
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.GENERIC_API_KEY, LeakType.API_KEY
        ))
        
        # Check for AWS keys
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.AWS_ACCESS_KEY, LeakType.AWS_KEY
        ))
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.AWS_SECRET, LeakType.AWS_KEY
        ))
        
        # Check for JWT tokens
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.JWT, LeakType.JWT_TOKEN
        ))
        
        # Check for Bearer tokens
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.BEARER_TOKEN, LeakType.API_KEY
        ))
        
        # Check for passwords
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.PASSWORD, LeakType.PASSWORD
        ))
        
        # Check for IP addresses
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.IP_ADDRESS, LeakType.IP_ADDRESS
        ))
        
        # Check for private keys
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.PRIVATE_KEY, LeakType.PRIVATE_KEY
        ))
        
        # Check for database connections
        all_leaks.extend(self.detect_pattern(
            output_text, self.patterns.DB_CONNECTION, LeakType.DATABASE_CONNECTION
        ))
        
        # Determine overall severity
        has_leaks = len(all_leaks) > 0
        if has_leaks:
            highest_severity = max(leak.severity for leak in all_leaks)
        else:
            highest_severity = LeakSeverity.LOW
        
        # Determine if safe to display (no critical leaks)
        safe_to_display = not any(
            leak.severity == LeakSeverity.CRITICAL for leak in all_leaks
        )
        
        # Create sanitized output
        sanitized = self.sanitize_output(output_text, all_leaks)
        
        return OutputValidationResult(
            has_leaks=has_leaks,
            leaks=all_leaks,
            total_leaks=len(all_leaks),
            severity=highest_severity,
            safe_to_display=safe_to_display,
            sanitized_output=sanitized
        )
    
    def sanitize_output(self, text: str, leaks: List[LeakDetection]) -> str:
        """Remove or mask all detected sensitive information"""
        if not leaks:
            return text
        
        sanitized = text
        
        # Sort leaks by position (reverse) to maintain positions during replacement
        sorted_leaks = sorted(leaks, key=lambda x: x.position, reverse=True)
        
        for leak in sorted_leaks:
            # Replace with masked value or generic placeholder
            if leak.severity == LeakSeverity.CRITICAL:
                placeholder = f"[REDACTED {leak.leak_type.value.upper()}]"
            else:
                placeholder = leak.value  # Already masked
            
            # Find the original value in context and replace
            # This is approximate - in production you'd want exact position tracking
            sanitized = re.sub(
                re.escape(leak.context),
                lambda m: m.group(0).replace(leak.value, placeholder),
                sanitized,
                count=1
            )
        
        return sanitized


# Convenience function for quick checks
def check_output_for_leaks(output_text: str) -> dict:
    """
    Quick check for sensitive information in output
    
    Args:
        output_text: LLM output to check
        
    Returns:
        Dictionary with validation results
    """
    validator = OutputValidator()
    result = validator.validate(output_text)
    return result.to_dict()