#!/usr/bin/env python3
"""
Genera un PDF por módulo a partir de las guías `guias/NN-modulo.md` y las capturas `img/<modulo>/*.png`.

Uso:  python docs/manual/scripts/build_pdfs.py            (todas las guías)
      python docs/manual/scripts/build_pdfs.py 05         (solo la guía 05)
Requiere: reportlab y Pillow.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
ACCENT = HexColor("#1F6FEB")
INK = HexColor("#1B2430")
MUTED = HexColor("#5B6676")
SOFT = HexColor("#EEF3FD")
W, H = A4
MARGIN = 1.6 * cm

body = ParagraphStyle("body", fontName="Helvetica", fontSize=10.5, leading=15, textColor=INK, alignment=TA_LEFT)
small = ParagraphStyle("small", parent=body, fontSize=9, leading=12.5, textColor=MUTED)
label = ParagraphStyle("label", parent=body, fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=ACCENT)
title_style = ParagraphStyle("title", parent=body, fontName="Helvetica-Bold", fontSize=17, leading=21)


def clean(text: str) -> str:
    text = text.replace("−", "-").replace("→", "->").replace("≤", "<=")
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    return re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", text)


def parse(md: Path) -> dict:
    lines = md.read_text(encoding="utf-8").splitlines()
    head = re.match(r"# (\d+) · (.+)", lines[0])
    guide = {"num": head.group(1), "title": head.group(2), "steps": []}
    for line in lines[1:]:
        if line.startswith("**Roles:**"):
            guide["roles"] = line.split(":**", 1)[1].strip()
        elif line.startswith("**Objetivo:**"):
            guide["goal"] = line.split(":**", 1)[1].strip()
        elif line.startswith("**Datos demo:**"):
            guide["data"] = line.split(":**", 1)[1].strip()
        elif line.startswith("### "):
            m = re.match(r"### (\d+) · (.+)", line)
            guide["steps"].append({"n": m.group(1), "title": m.group(2)})
        elif guide["steps"] and line.startswith("- **"):
            key, value = re.match(r"- \*\*(.+?):\*\* (.+)", line).groups()
            guide["steps"][-1][key] = value.strip("`")
    return guide


def footer(c: canvas.Canvas, guide: dict, page: int) -> None:
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, 1.0 * cm, f"Manual de usuario · {guide['title']}")
    c.drawRightString(W - MARGIN, 1.0 * cm, f"Página {page}")


def draw_par(c: canvas.Canvas, text: str, style: ParagraphStyle, x: float, y: float, width: float) -> float:
    p = Paragraph(clean(text), style)
    _, h = p.wrap(width, 10000)
    p.drawOn(c, x, y - h)
    return y - h


def cover(c: canvas.Canvas, guide: dict) -> None:
    c.setFillColor(ACCENT)
    c.rect(0, H - 9.5 * cm, W, 9.5 * cm, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica", 11)
    c.drawString(MARGIN, H - 2.4 * cm, "MANUAL DE USUARIO")
    c.setFont("Helvetica-Bold", 34)
    c.drawString(MARGIN, H - 5.2 * cm, guide["title"])
    c.setFont("Helvetica", 12)
    c.drawString(MARGIN, H - 6.4 * cm, f"Módulo {guide['num']} de 11")
    y = H - 11.2 * cm
    for key, text in (("QUÉ HACE", guide["goal"]), ("QUIÉN LO USA", guide["roles"]), ("DATOS DE EJEMPLO", guide["data"])):
        y = draw_par(c, key, label, MARGIN, y, W - 2 * MARGIN) - 3
        y = draw_par(c, text, body, MARGIN, y, W - 2 * MARGIN) - 16
    y = draw_par(c, "EN ESTE MÓDULO", label, MARGIN, y, W - 2 * MARGIN) - 4
    for step in guide["steps"]:
        y = draw_par(c, f"{int(step['n'])}. {step['title']}", body, MARGIN, y, W - 2 * MARGIN) - 3
    footer(c, guide, 1)
    c.showPage()


def step_page(c: canvas.Canvas, guide: dict, step: dict, page: int) -> None:
    c.setFillColor(SOFT)
    c.rect(0, H - 2.5 * cm, W, 2.5 * cm, stroke=0, fill=1)
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN, H - 1.2 * cm, f"{guide['title'].upper()}  ·  PASO {int(step['n'])} DE {len(guide['steps'])}")
    draw_par(c, step["title"], title_style, MARGIN, H - 1.55 * cm, W - 2 * MARGIN)

    top = H - 3.1 * cm
    avail_h = top - 1.8 * cm
    img_path = ROOT / step["Archivo"]
    text_x = MARGIN
    text_w = W - 2 * MARGIN
    if img_path.exists():
        with Image.open(img_path) as im:
            iw, ih = im.size
        img_w = 8.2 * cm
        img_h = img_w * ih / iw
        if img_h > avail_h:
            img_h = avail_h
            img_w = img_h * iw / ih
        c.setFillColor(INK)
        c.roundRect(MARGIN - 0.12 * cm, top - img_h - 0.12 * cm, img_w + 0.24 * cm, img_h + 0.24 * cm, 8, stroke=0, fill=1)
        c.drawImage(str(img_path), MARGIN, top - img_h, width=img_w, height=img_h)
        text_x = MARGIN + img_w + 0.9 * cm
        text_w = W - MARGIN - text_x
    y = top
    y = draw_par(c, "CÓMO LLEGAR", label, text_x, y, text_w) - 3
    y = draw_par(c, f"Ruta: {step['URL']}", small, text_x, y, text_w) - 3
    y = draw_par(c, step["Preparar"], body, text_x, y, text_w) - 16
    y = draw_par(c, "CÓMO FUNCIONA", label, text_x, y, text_w) - 3
    y = draw_par(c, step["Explicación"], body, text_x, y, text_w)
    if not img_path.exists():
        y = draw_par(c, "Este módulo no es visible para el usuario de las capturas (rol Super); solo se explica.", small, text_x, y - 14, text_w)
    footer(c, guide, page)
    c.showPage()


def build(md: Path) -> Path:
    guide = parse(md)
    out = ROOT / "pdf" / f"{md.stem}.pdf"
    out.parent.mkdir(exist_ok=True)
    c = canvas.Canvas(str(out), pagesize=A4)
    c.setTitle(f"Manual Kobros - {guide['title']}")
    cover(c, guide)
    for i, step in enumerate(guide["steps"], start=2):
        step_page(c, guide, step, i)
    c.save()
    return out


if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for md in sorted((ROOT / "guias").glob("*.md")):
        if only and not md.name.startswith(only):
            continue
        print("PDF:", build(md).relative_to(ROOT))
