"""
Shared test utilities, parsers, mathematical color engines, and text analyzers
for the human-interface-design E2E test suite.
Zero external dependencies - pure Python 3 standard library.
"""

import math
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Exhaustive AI Cliché Blacklists from Survey Mining Specifications
BANNED_AI_WORDS_EN: Set[str] = {
    "unleash",
    "elevate",
    "supercharge",
    "revolutionize",
    "transform",
    "skyrocket",
    "maximize",
    "powerhouse",
    "delve",
    "tapestry",
    "beacon",
    "testament",
    "foster",
    "pivotal",
    "holistic",
    "intertwined",
    "navigate",
    "realm",
    "seamless",
    "seamlessly",
    "effortless",
    "effortlessly",
    "friction-free",
    "intuitive",
    "hassle-free",
    "magical",
    "painless",
    "empower",
    "empowering",
    "harness",
    "bespoke",
    "embark",
    "synergy",
    "cutting-edge",
    "unparalleled",
    "robust",
    "game-changer",
    "look no further",
}

BANNED_AI_WORDS_ES: Set[str] = {
    "empoderar",
    "empoderando",
    "sin fisuras",
    "desbloquear",
    "revolucionar",
    "transformar",
    "tapiz",
    "profundizar",
    "holístico",
    "holística",
    "de vanguardia",
    "sin precedentes",
    "potenciar al máximo",
    "navegar por el ámbito",
    "libera el potencial",
    "eleva tu",
}

FORMULAIC_HERO_PATTERNS: List[re.Pattern] = [
    re.compile(r"\bwhere\b.+?\bmeets\b", re.IGNORECASE),
    re.compile(r"\bwelcome to the future of\b", re.IGNORECASE),
    re.compile(r"\ball-in-one\s+platform\s+to\s+revolutionize\b", re.IGNORECASE),
    re.compile(r"\bsay goodbye to\s+.*,\s+say hello to\b", re.IGNORECASE),
    re.compile(r"\bdonde\b.+?\bse encuentra con\b", re.IGNORECASE),
]


def parse_yaml_frontmatter(content: str) -> Tuple[Dict[str, Any], str]:
    """
    Parses YAML frontmatter bounded by '---' from markdown content.
    Returns (metadata_dict, body_text).
    Raises ValueError if frontmatter delimiters are missing or invalid.
    """
    lines = content.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        raise ValueError("Missing starting '---' delimiter for YAML frontmatter")

    closing_index = -1
    for idx, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            closing_index = idx
            break

    if closing_index == -1:
        raise ValueError("Missing closing '---' delimiter for YAML frontmatter")

    frontmatter_lines = lines[1:closing_index]
    body = "".join(lines[closing_index + 1 :])

    meta: Dict[str, Any] = {}
    current_key: Optional[str] = None
    multiline_buf: List[str] = []
    is_folded_block = False

    for line in frontmatter_lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        match = re.match(r"^([a-zA-Z0-9_\-]+)\s*:\s*(.*)$", line)
        if match:
            if current_key and multiline_buf:
                if is_folded_block:
                    meta[current_key] = " ".join(" ".join(multiline_buf).split())
                else:
                    meta[current_key] = "\n".join(multiline_buf)
                multiline_buf = []
                is_folded_block = False

            key = match.group(1).strip()
            val = match.group(2).strip()
            current_key = key

            if val in (">-", ">", "|-", "|"):
                is_folded_block = val.startswith(">")
            elif val:
                # Remove quotes if present
                if (val.startswith('"') and val.endswith('"')) or (
                    val.startswith("'") and val.endswith("'")
                ):
                    val = val[1:-1]
                meta[key] = val
                current_key = None
        else:
            # Indented continuation line
            if current_key:
                multiline_buf.append(stripped)

    if current_key and multiline_buf:
        if is_folded_block:
            meta[current_key] = " ".join(" ".join(multiline_buf).split())
        else:
            meta[current_key] = "\n".join(multiline_buf)

    return meta, body


def get_markdown_links(content: str) -> List[Tuple[str, str]]:
    """
    Extracts all markdown links [text](target) from content.
    Returns list of (link_text, url_or_relative_path).
    """
    pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
    return pattern.findall(content)


def get_markdown_headers(content: str) -> List[Tuple[int, str]]:
    """
    Extracts markdown headers (# Header, ## Subheader).
    Returns list of (level, title).
    """
    headers = []
    for line in content.splitlines():
        match = re.match(r"^(#{1,6})\s+(.*)$", line.strip())
        if match:
            level = len(match.group(1))
            title = match.group(2).strip()
            headers.append((level, title))
    return headers


def parse_hex_color(hex_str: str) -> Tuple[int, int, int]:
    """
    Converts a hex color string ('#fff', '#13241D') to (r, g, b) tuple 0-255.
    """
    h = hex_str.strip().lstrip("#")
    if len(h) == 3:
        h = "".join([c * 2 for c in h])
    if len(h) != 6:
        raise ValueError(f"Invalid hex color code: '{hex_str}'")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def rgb_to_hsl(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """
    Converts (r, g, b) 0-255 to (h [0-360], s [0-100], l [0-100]).
    """
    r_f = r / 255.0
    g_f = g / 255.0
    b_f = b / 255.0
    c_max = max(r_f, g_f, b_f)
    c_min = min(r_f, g_f, b_f)
    delta = c_max - c_min

    l = (c_max + c_min) / 2.0

    if delta == 0:
        h = 0.0
        s = 0.0
    else:
        s = delta / (1 - abs(2 * l - 1))
        if c_max == r_f:
            h = 60 * (((g_f - b_f) / delta) % 6)
        elif c_max == g_f:
            h = 60 * (((b_f - r_f) / delta) + 2)
        else:
            h = 60 * (((r_f - g_f) / delta) + 4)

    return round(h, 2), round(s * 100, 2), round(l * 100, 2)


def calculate_srgb_luminance(r: int, g: int, b: int) -> float:
    """
    Calculates WCAG 2.1/2.2 relative luminance for an RGB tuple (0-255).
    """

    def channel_lum(val: int) -> float:
        c = val / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r_l = channel_lum(r)
    g_l = channel_lum(g)
    b_l = channel_lum(b)
    return 0.2126 * r_l + 0.7152 * g_l + 0.0722 * b_l


def calculate_wcag_contrast(hex1: str, hex2: str) -> float:
    """
    Calculates the exact WCAG contrast ratio between two hex colors.
    Returns float rounded to 2 decimal places (e.g. 15.80).
    """
    rgb1 = parse_hex_color(hex1)
    rgb2 = parse_hex_color(hex2)
    l1 = calculate_srgb_luminance(*rgb1)
    l2 = calculate_srgb_luminance(*rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    ratio = (lighter + 0.05) / (darker + 0.05)
    return round(ratio, 2)


def calculate_sentence_metrics(text: str) -> Dict[str, Any]:
    """
    Splits prose text into sentences and computes word count metrics.
    """
    # Clean code blocks or markdown markup
    cleaned = re.sub(r"```[\s\S]*?```", "", text)
    cleaned = re.sub(r"`[^`]*`", "", cleaned)
    cleaned = re.sub(r"#+.*", "", cleaned)

    # Split by sentence ending punctuation
    sentences = [s.strip() for s in re.split(r"[.!?]+", cleaned) if s.strip()]
    if not sentences:
        return {"count": 0, "mean": 0, "std_dev": 0, "min": 0, "max": 0, "lengths": []}

    lengths = [len(s.split()) for s in sentences if len(s.split()) > 0]
    if not lengths:
        return {"count": 0, "mean": 0, "std_dev": 0, "min": 0, "max": 0, "lengths": []}

    mean = sum(lengths) / len(lengths)
    variance = sum((x - mean) ** 2 for x in lengths) / len(lengths)
    std_dev = math.sqrt(variance)

    return {
        "count": len(lengths),
        "mean": round(mean, 2),
        "std_dev": round(std_dev, 2),
        "min": min(lengths),
        "max": max(lengths),
        "lengths": lengths,
    }


def scan_for_slop(text: str, lang: str = "all") -> List[Tuple[str, int]]:
    """
    Scans text for banned AI words.
    Returns list of (banned_word, line_number).
    """
    target_words = set()
    if lang in ("en", "all"):
        target_words.update(BANNED_AI_WORDS_EN)
    if lang in ("es", "all"):
        target_words.update(BANNED_AI_WORDS_ES)

    matches = []
    lines = text.splitlines()
    for line_idx, line in enumerate(lines, start=1):
        # Ignore markdown code blocks or comment lines
        if line.strip().startswith("//") or line.strip().startswith("/*"):
            continue
        words = re.findall(r"\b[a-zA-ZáéíóúÁÉÍÓÚñÑ\-]+\b", line.lower())
        for word in words:
            if word in target_words:
                matches.append((word, line_idx))
    return matches


def run_audit_copy_script(
    script_path: Path,
    target_path: Path,
    extra_args: Optional[List[str]] = None,
    timeout_sec: int = 15,
) -> Tuple[int, str, str]:
    """
    Executes scripts/audit_copy.py via subprocess.
    Returns (exit_code, stdout, stderr).
    """
    cmd = [sys.executable, str(script_path), str(target_path)]
    if extra_args:
        cmd.extend(extra_args)

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout_sec,
            encoding="utf-8",
            errors="replace",
        )
        return proc.returncode, proc.stdout, proc.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Process timed out"
    except Exception as exc:
        return -2, "", str(exc)
