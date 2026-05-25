"""
Interactive CLI for running input validation checks
"""

import json
import os
import argparse
from datetime import datetime
from typing import Optional

from src.detectors.input_validator import InputValidator, DetectionResult


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def colorize(text: str, color: str) -> str:
    """Add color to text"""
    return f"{color}{text}{Colors.ENDC}"


def save_report(result: DetectionResult, input_text: str, folder: str = "reports") -> str:
    """
    Save detection result to JSON report
    
    Args:
        result: Detection result to save
        input_text: Original input text
        folder: Directory to save reports
        
    Returns:
        Path to saved report
    """
    os.makedirs(folder, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"input_validation_{timestamp}.json"
    path = os.path.join(folder, filename)
    
    report_data = {
        "timestamp": datetime.now().isoformat(),
        "input_text": input_text,
        "input_preview": input_text[:120] + ("..." if len(input_text) > 120 else ""),
        "validation_result": result.to_dict()
    }
    
    with open(path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=4, ensure_ascii=False)
    
    return path


def print_result_formatted(result: DetectionResult, input_text: str):
    """Print formatted result to console"""
    print("\n" + "="*70)
    print(colorize("INPUT VALIDATION RESULT", Colors.BOLD))
    print("="*70 + "\n")
    
    # Input preview
    preview = input_text[:200] + ("..." if len(input_text) > 200 else "")
    print(colorize("Input:", Colors.BOLD))
    print(f"  {preview}\n")
    
    # Detection status
    if result.detected:
        status_color = Colors.FAIL if result.severity.value in ["CRITICAL", "HIGH"] else Colors.WARNING
        print(colorize(f"⚠️  THREAT DETECTED", status_color))
    else:
        print(colorize(f"✓ NO THREATS DETECTED", Colors.OKGREEN))
    
    print()
    
    # Details
    print(colorize("Details:", Colors.BOLD))
    print(f"  Severity:   {colorize(result.severity.value, Colors.FAIL if result.severity.value == 'CRITICAL' else Colors.WARNING)}")
    print(f"  Confidence: {result.confidence:.2%}")
    
    if result.attack_types:
        print(f"\n  Attack Types:")
        for attack_type in result.attack_types:
            print(f"    • {attack_type.value}")
    
    if result.evidence:
        print(f"\n  Evidence (matched patterns):")
        for evidence in result.evidence[:5]:  # Show first 5
            print(f"    • {evidence}")
        if len(result.evidence) > 5:
            print(f"    ... and {len(result.evidence) - 5} more")
    
    if result.recommendations:
        print(f"\n{colorize('Recommendations:', Colors.BOLD)}")
        for i, rec in enumerate(result.recommendations, 1):
            print(f"  {i}. {rec}")
    
    print("\n" + "="*70 + "\n")


def interactive_mode():
    """Run in interactive mode - keep asking for input"""
    print(colorize("\n🔒 LLM Input Validator - Interactive Mode", Colors.HEADER))
    print(colorize("="*70, Colors.HEADER))
    print("\nEnter text to check for prompt injection and attacks.")
    print("Type 'quit' or 'exit' to stop.\n")
    
    validator = InputValidator()
    
    while True:
        try:
            print(colorize("Enter text to check:", Colors.OKBLUE))
            text = input("> ")
            
            if text.lower() in ['quit', 'exit', 'q']:
                print(colorize("\nExiting...", Colors.OKCYAN))
                break
            
            if not text.strip():
                print(colorize("Please enter some text.\n", Colors.WARNING))
                continue
            
            # Validate input
            result = validator.validate(text)
            
            # Print result
            print_result_formatted(result, text)
            
            # Ask to save
            save = input(colorize("Save report? (y/n): ", Colors.OKBLUE))
            if save.lower() in ['y', 'yes']:
                report_path = save_report(result, text)
                print(colorize(f"✓ Report saved to: {report_path}\n", Colors.OKGREEN))
            
        except KeyboardInterrupt:
            print(colorize("\n\nInterrupted. Exiting...", Colors.WARNING))
            break
        except Exception as e:
            print(colorize(f"\n❌ Error: {str(e)}\n", Colors.FAIL))


def batch_mode(input_file: str, output_dir: str = "reports"):
    """Process multiple inputs from a file"""
    print(colorize(f"\n🔒 LLM Input Validator - Batch Mode", Colors.HEADER))
    print(colorize("="*70, Colors.HEADER))
    print(f"\nProcessing inputs from: {input_file}\n")
    
    validator = InputValidator()
    
    with open(input_file, 'r', encoding='utf-8') as f:
        inputs = [line.strip() for line in f if line.strip()]
    
    results = []
    for i, text in enumerate(inputs, 1):
        print(f"[{i}/{len(inputs)}] Processing...")
        result = validator.validate(text)
        results.append((text, result))
        
        if result.detected:
            print(colorize(f"  ⚠️  Threat detected ({result.severity.value})", Colors.WARNING))
        else:
            print(colorize(f"  ✓ Safe", Colors.OKGREEN))
    
    # Save batch report
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    report_path = os.path.join(output_dir, f"batch_report_{timestamp}.json")
    
    batch_report = {
        "timestamp": datetime.now().isoformat(),
        "total_inputs": len(inputs),
        "threats_detected": sum(1 for _, r in results if r.detected),
        "results": [
            {
                "input": text,
                "validation": result.to_dict()
            }
            for text, result in results
        ]
    }
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(batch_report, f, indent=4, ensure_ascii=False)
    
    print(colorize(f"\n✓ Batch report saved to: {report_path}", Colors.OKGREEN))
    print(f"  Total: {len(inputs)} | Threats: {batch_report['threats_detected']}\n")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="LLM Input Validator - Detect prompt injection and attacks"
    )
    parser.add_argument(
        '-i', '--interactive',
        action='store_true',
        help="Run in interactive mode"
    )
    parser.add_argument(
        '-f', '--file',
        type=str,
        help="Process inputs from file (batch mode)"
    )
    parser.add_argument(
        '-t', '--text',
        type=str,
        help="Check a single text string"
    )
    parser.add_argument(
        '-o', '--output',
        type=str,
        default="reports",
        help="Output directory for reports (default: reports)"
    )
    parser.add_argument(
        '-s', '--strict',
        action='store_true',
        help="Enable strict mode (higher sensitivity)"
    )
    
    args = parser.parse_args()
    
    # Interactive mode
    if args.interactive:
        interactive_mode()
    
    # Batch mode
    elif args.file:
        if not os.path.exists(args.file):
            print(colorize(f"❌ File not found: {args.file}", Colors.FAIL))
            return
        batch_mode(args.file, args.output)
    
    # Single text check
    elif args.text:
        validator = InputValidator(strict_mode=args.strict)
        result = validator.validate(args.text)
        print_result_formatted(result, args.text)
        
        save = input(colorize("\nSave report? (y/n): ", Colors.OKBLUE))
        if save.lower() in ['y', 'yes']:
            report_path = save_report(result, args.text, args.output)
            print(colorize(f"✓ Report saved to: {report_path}\n", Colors.OKGREEN))
    
    # Default to interactive if no args
    else:
        interactive_mode()


if __name__ == "__main__":
    main()