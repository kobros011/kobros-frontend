#!/usr/bin/env python3
"""
Genera un PDF por módulo a partir de las guías `guias/NN-modulo.md`, con el formato de la guía de referencia
(título, subtítulo, introducción, pasos numerados con viñetas y capturas con pie, y "Notas importantes"). Sin logos de fondo.

Uso:  python docs/manual/scripts/build_pdfs.py            (todas las guías)
      python docs/manual/scripts/build_pdfs.py 05         (solo la guía 05)
Requiere: reportlab y Pillow.
"""
from __future__ import annotations

import io
import re
import sys
from pathlib import Path

from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Flowable, HRFlowable, KeepTogether, ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
ACCENT = HexColor("#2F6FDE")
INK = HexColor("#1F2933")
MUTED = HexColor("#6B7683")
LINE = HexColor("#D9DEE5")
FRAME = HexColor("#C9D1DC")
W, H = A4
MARGIN = 2.0 * cm
CONTENT_W = W - 2 * MARGIN

S = {
    "title": ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=24, leading=29, textColor=INK, spaceAfter=8),
    "subtitle": ParagraphStyle("subtitle", fontName="Helvetica", fontSize=11, leading=15, textColor=MUTED, spaceAfter=12),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=10, leading=14.5, textColor=INK, spaceAfter=6),
    "intro": ParagraphStyle("intro", fontName="Helvetica", fontSize=10.5, leading=15.5, textColor=MUTED, spaceAfter=10),
    "step": ParagraphStyle("step", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=INK),
    "caption": ParagraphStyle("caption", fontName="Helvetica", fontSize=8.5, leading=11, textColor=MUTED, alignment=TA_CENTER, spaceBefore=4, spaceAfter=10),
    "notes": ParagraphStyle("notes", fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=INK, spaceBefore=6, spaceAfter=6),
    "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=10, leading=14.5, textColor=INK),
}


class StepHeading(Flowable):
    """Círculo azul con el número del paso y el título al lado."""

    def __init__(self, number: int, text: str):
        super().__init__()
        self.number, self.text = number, text
        self.height = 0.9 * cm
        self.keepWithNext = True

    def wrap(self, avail_w, avail_h):
        self.avail_w = avail_w
        return avail_w, self.height + 0.5 * cm

    def draw(self):
        c = self.canv
        r = 0.36 * cm
        cy = self.height / 2 + 0.25 * cm
        c.setFillColor(ACCENT)
        c.circle(r, cy, r, stroke=0, fill=1)
        c.setFillColor(HexColor("#FFFFFF"))
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(r, cy - 3.2, str(self.number))
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(2 * r + 0.3 * cm, cy - 4.8, self.text)


def clean(text: str) -> str:
    text = text.replace("−", "-").replace("→", "->").replace("≤", "<=")
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    return re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", text)


def parse(md: Path) -> dict:
    guide: dict = {"intro": [], "steps": [], "notes": []}
    section, step = None, None
    for raw in md.read_text(encoding="utf-8").splitlines():
        line = raw.rstrip()
        if line.startswith("# "):
            guide["title"] = re.match(r"# \d+ · (.+)", line).group(1)
        elif line.startswith("> Subtítulo:"):
            guide["subtitle"] = line.split(":", 1)[1].strip()
        elif line.startswith("## "):
            section = line[3:].strip()
        elif line.startswith("### "):
            m = re.match(r"### (\d+) · (.+)", line)
            step = {"n": int(m.group(1)), "title": m.group(2), "blocks": []}
            guide["steps"].append(step)
        elif line.startswith(">"):
            continue  # metadatos de la guía (URL, preparar): no van en el PDF
        elif not line:
            continue
        elif section == "Introducción":
            guide["intro"].append(line)
        elif section == "Notas importantes":
            guide["notes"].append(line[2:] if line.startswith("- ") else line)
        elif step is not None:
            img = re.match(r"!\[(.*)\]\((.+)\)", line)
            if img:
                step["blocks"].append(("img", img.group(2), img.group(1)))
            elif line.startswith("- "):
                if step["blocks"] and step["blocks"][-1][0] == "bullets":
                    step["blocks"][-1][1].append(line[2:])
                else:
                    step["blocks"].append(("bullets", [line[2:]]))
            else:
                step["blocks"].append(("p", line))
    return guide


def framed_image(path: Path, width: float) -> Flowable:
    with Image.open(path) as im:
        im = im.convert("RGB")
        iw, ih = im.size
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=82)
    height = width * ih / iw
    reader = ImageReader(io.BytesIO(buf.getvalue()))

    class Framed(Flowable):
        def wrap(self, aw, ah):
            return width + 0.3 * cm, height + 0.3 * cm

        def draw(self):
            c = self.canv
            c.setStrokeColor(FRAME)
            c.setLineWidth(0.8)
            c.roundRect(0, 0, width + 0.3 * cm, height + 0.3 * cm, 6, stroke=1, fill=0)
            c.drawImage(reader, 0.15 * cm, 0.15 * cm, width=width, height=height)

    return Framed()


def image_rows(images: list[tuple[str, str]]) -> list:
    """Hasta dos capturas por fila, centradas, cada una con su pie."""
    out = []
    for i in range(0, len(images), 2):
        pair = images[i:i + 2]
        width = 6.3 * cm if len(pair) == 2 else 6.8 * cm
        cells = []
        for rel, caption in pair:
            path = ROOT / rel
            cell = [framed_image(path, width), Paragraph(clean(caption), S["caption"])] if path.exists() else [Paragraph(clean(f"({caption}: sin captura)"), S["caption"])]
            cells.append(cell)
        table = Table([cells], colWidths=[CONTENT_W / len(cells)] * len(cells))
        table.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
        table.hAlign = "CENTER"
        out.append(KeepTogether([table]))
    return out


def bullets(items: list[str], style: ParagraphStyle) -> ListFlowable:
    return ListFlowable([ListItem(Paragraph(clean(t), style), leftIndent=14) for t in items], bulletType="bullet", start="•", leftIndent=14, bulletFontSize=9)


def build(md: Path) -> Path:
    guide = parse(md)
    out = ROOT / "pdf" / f"{md.stem}.pdf"
    out.parent.mkdir(exist_ok=True)
    doc = SimpleDocTemplate(str(out), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=1.8 * cm, bottomMargin=1.8 * cm,
                            title=f"Manual - {guide['title']}", author="")
    flow: list = [Paragraph(clean(f"Cómo usar el módulo de {guide['title']}"), S["title"]),
                  Paragraph(clean(guide["subtitle"]), S["subtitle"])]
    flow += [Paragraph(clean(p), S["intro"]) for p in guide["intro"]]
    for step in guide["steps"]:
        flow += [Spacer(1, 6), StepHeading(step["n"], step["title"])]
        pending: list[tuple[str, str]] = []

        def flush():
            if pending:
                flow.extend(image_rows(list(pending)))
                pending.clear()

        for block in step["blocks"]:
            if block[0] == "img":
                pending.append((block[1], block[2]))
                continue
            flush()
            if block[0] == "p":
                flow.append(Paragraph(clean(block[1]), S["body"]))
            else:
                flow.append(bullets(block[1], S["bullet"]))
                flow.append(Spacer(1, 6))
        flush()
    if guide["notes"]:
        flow += [Spacer(1, 8), HRFlowable(width="100%", thickness=0.6, color=LINE, spaceAfter=6), Paragraph("Notas importantes", S["notes"]), bullets(guide["notes"], S["bullet"])]

    def page_number(canvas, doc_):
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawRightString(W - MARGIN, 1.0 * cm, f"{doc_.page}")

    doc.build(flow, onFirstPage=page_number, onLaterPages=page_number)
    return out


if __name__ == "__main__":
    only = sys.argv[1] if len(sys.argv) > 1 else None
    for md in sorted((ROOT / "guias").glob("*.md")):
        if only and not md.name.startswith(only):
            continue
        print("PDF:", build(md).relative_to(ROOT))
