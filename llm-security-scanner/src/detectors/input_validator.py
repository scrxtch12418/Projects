"""
Input Validator - Detects prompt injection attempts in user input
"""

import re
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class AttackType(Enum):
    """Types of attacks that can be detected"""
    PROMPT_INJECTION = "Prompt Injection"
    ROLE_MANIPULATION = "Role Manipulation"
    INSTRUCTION_OVERRIDE = "Instruction Override"
    SYSTEM_PROMPT_EXTRACTION = "System Prompt Extraction"
    JAILBREAK_ATTEMPT = "Jailbreak Attempt"
    ENCODING_EVASION = "Encoding Evasion"


class Severity(Enum):
    """Severity levels for detected attacks"""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


@dataclass
class DetectionResult:
    """Result of input validation"""
    detected: bool
    attack_types: List[AttackType]
    severity: Severity
    confidence: float
    evidence: List[str]
    recommendations: List[str]
    
    def to_dict(self) -> dict:
        return {
            "detected": self.detected,
            "attack_types": [at.value for at in self.attack_types],
            "severity": self.severity.value,
            "confidence": round(self.confidence, 2),
            "evidence": self.evidence,
            "recommendations": self.recommendations
        }


class PatternLibrary:
    """Centralized library of attack patterns"""
    
    # Basic prompt injection patterns
    INSTRUCTION_OVERRIDE = [
        r"ignore (all|previous|earlier|prior) (instructions|directives|rules|commands)",
        r"disregard (all|previous|the) (instructions|rules|commands)",
        r"forget (all|previous|everything) (instructions|rules|commands)",
        r"skip (all|previous) (instructions|rules)",
    ]
    
    # Role manipulation patterns
    ROLE_MANIPULATION = [
        r"you are now (a|an|the)",
        r"act as (a|an|the)",
        r"pretend (to be|you are)",
        r"roleplay as",
        r"simulate (a|an|the)",
        r"behave like (a|an|the)",
    ]
    
    # System access attempts
    SYSTEM_ACCESS = [
        r"(show|reveal|display|print|output) (your|the) (system|original) prompt",
        r"what (is|are) your (instructions|rules|guidelines)",
        r"repeat your (instructions|prompt|rules)",
        r"tell me your (instructions|configuration|settings)",
    ]
    
    # Jailbreak patterns
    JAILBREAK = [
        r"developer mode",
        r"DAN mode",
        r"sudo mode",
        r"admin mode",
        r"unrestricted mode",
        r"bypass (safety|filters|restrictions|guardrails)",
        r"override (safety|security|restrictions)",
    ]
    
    # Encoding/obfuscation indicators
    ENCODING_INDICATORS = [
        r"base64|b64encode|decode this",
        r"rot13|caesar cipher",
        r"hex encode|hexadecimal",
        r"\\x[0-9a-f]{2}",  # Hex escapes
        r"\\u[0-9a-f]{4}",  # Unicode escapes
    ]
    
    # Delimiters often used in attacks
    DELIMITER_ABUSE = [
        r"---|===|###|\*\*\*",
        r"\[INST\]|\[/INST\]",
        r"<\|im_start\|>|<\|im_end\|>",
        r"<system>|</system>",
    ]


class InputValidator:
    """Validates user input for prompt injection and other attacks"""
    
    def __init__(self, strict_mode: bool = False):
        """
        Args:
            strict_mode: If True, increases sensitivity (more false positives)
        """
        self.strict_mode = strict_mode
        self.pattern_library = PatternLibrary()
    
    def normalize_text(self, text: str) -> str:
        """Normalize text for pattern matching"""
        # Preserve structure but normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        return text.strip().lower()
    
    def detect_pattern_group(self, text: str, patterns: List[str]) -> List[str]:
        """Detect matches from a group of patterns"""
        matches = []
        normalized = self.normalize_text(text)
        
        for pattern in patterns:
            if re.search(pattern, normalized):
                matches.append(pattern)
        
        return matches
    
    def calculate_confidence(self, evidence_count: int, text_length: int) -> float:
        """Calculate confidence score based on evidence and context"""
        # Base confidence from number of matches
        base_confidence = min(0.9, evidence_count * 0.25)
        
        # Adjust for text length (short suspicious text = higher confidence)
        length_factor = 1.0
        if text_length < 50 and evidence_count > 0:
            length_factor = 1.2  # Boost for short, suspicious text
        elif text_length > 200:
            length_factor = 0.9  # Slight penalty for long text
        
        confidence = min(1.0, base_confidence * length_factor)
        
        # In strict mode, boost confidence
        if self.strict_mode:
            confidence = min(1.0, confidence * 1.15)
        
        return confidence
    
    def severity_from_confidence(self, confidence: float, attack_types: List[AttackType]) -> Severity:
        """Determine severity based on confidence and attack types"""
        # Critical attacks always get higher severity
        critical_attacks = {AttackType.SYSTEM_PROMPT_EXTRACTION, AttackType.JAILBREAK_ATTEMPT}
        has_critical = any(at in critical_attacks for at in attack_types)
        
        if has_critical and confidence > 0.6:
            return Severity.CRITICAL
        elif confidence > 0.75:
            return Severity.HIGH
        elif confidence > 0.5:
            return Severity.MEDIUM
        elif confidence > 0.25:
            return Severity.LOW
        return Severity.INFO
    
    def generate_recommendations(self, attack_types: List[AttackType]) -> List[str]:
        """Generate actionable recommendations based on detected attacks"""
        recommendations = []
        
        if AttackType.PROMPT_INJECTION in attack_types:
            recommendations.append("Implement input sanitization before processing")
            recommendations.append("Use a separate system prompt context that cannot be overridden")
        
        if AttackType.ROLE_MANIPULATION in attack_types:
            recommendations.append("Reinforce system role in every interaction")
            recommendations.append("Implement role-based access controls")
        
        if AttackType.SYSTEM_PROMPT_EXTRACTION in attack_types:
            recommendations.append("Never include system prompt in accessible context")
            recommendations.append("Log and flag repeated extraction attempts")
        
        if AttackType.JAILBREAK_ATTEMPT in attack_types:
            recommendations.append("Implement multi-layer content filtering")
            recommendations.append("Rate limit users showing jailbreak patterns")
        
        if AttackType.ENCODING_EVASION in attack_types:
            recommendations.append("Decode and validate all encoded inputs")
            recommendations.append("Block or normalize suspicious encoding patterns")
        
        if not recommendations:
            recommendations.append("Monitor for evolving attack patterns")
        
        return recommendations
    
    def validate(self, user_input: str) -> DetectionResult:
        """
        Main validation method - checks input for various attack patterns
        
        Args:
            user_input: The user's input text to validate
            
        Returns:
            DetectionResult with detection status, severity, and recommendations
        """
        evidence = []
        attack_types = []
        
        # Check for instruction override
        instruction_matches = self.detect_pattern_group(
            user_input, 
            self.pattern_library.INSTRUCTION_OVERRIDE
        )
        if instruction_matches:
            evidence.extend(instruction_matches)
            attack_types.append(AttackType.INSTRUCTION_OVERRIDE)
        
        # Check for role manipulation
        role_matches = self.detect_pattern_group(
            user_input,
            self.pattern_library.ROLE_MANIPULATION
        )
        if role_matches:
            evidence.extend(role_matches)
            attack_types.append(AttackType.ROLE_MANIPULATION)
        
        # Check for system prompt extraction
        system_matches = self.detect_pattern_group(
            user_input,
            self.pattern_library.SYSTEM_ACCESS
        )
        if system_matches:
            evidence.extend(system_matches)
            attack_types.append(AttackType.SYSTEM_PROMPT_EXTRACTION)
        
        # Check for jailbreak attempts
        jailbreak_matches = self.detect_pattern_group(
            user_input,
            self.pattern_library.JAILBREAK
        )
        if jailbreak_matches:
            evidence.extend(jailbreak_matches)
            attack_types.append(AttackType.JAILBREAK_ATTEMPT)
        
        # Check for encoding evasion
        encoding_matches = self.detect_pattern_group(
            user_input,
            self.pattern_library.ENCODING_INDICATORS
        )
        if encoding_matches:
            evidence.extend(encoding_matches)
            attack_types.append(AttackType.ENCODING_EVASION)
        
        # Check for delimiter abuse
        delimiter_matches = self.detect_pattern_group(
            user_input,
            self.pattern_library.DELIMITER_ABUSE
        )
        if delimiter_matches:
            evidence.extend(delimiter_matches)
            if AttackType.PROMPT_INJECTION not in attack_types:
                attack_types.append(AttackType.PROMPT_INJECTION)
        
        # Calculate metrics
        detected = len(evidence) > 0
        confidence = self.calculate_confidence(len(evidence), len(user_input))
        severity = self.severity_from_confidence(confidence, attack_types)
        recommendations = self.generate_recommendations(attack_types)
        
        return DetectionResult(
            detected=detected,
            attack_types=attack_types,
            severity=severity,
            confidence=confidence,
            evidence=evidence,
            recommendations=recommendations
        )


# Convenience function for backward compatibility
def check_for_prompt_injection(user_input: str) -> dict:
    """
    Legacy function - validates input and returns dict format
    
    Args:
        user_input: Text to validate
        
    Returns:
        Dictionary with detection results
    """
    validator = InputValidator()
    result = validator.validate(user_input)
    return result.to_dict()