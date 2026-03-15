"""
Roasters Hub — Generator dokumentu biznesowego PDF

Generuje profesjonalny dokument PDF podsumowujący koncept biznesowy platformy
Roasters Hub: research rynkowy, persony, model biznesowy i strategię.
Dokument przeznaczony do dzielenia się z partnerami i wspólnikami.

Użycie:
    pip install reportlab
    python tools/generate_business_pdf.py

Output: .tmp/roasters_hub_business_overview.pdf
"""

import os
import sys
from datetime import date

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        PageBreak, HRFlowable, KeepTogether
    )
    from reportlab.platypus.flowables import Flowable
    from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon
    from reportlab.graphics import renderPDF
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
except ImportError:
    print("Brak biblioteki reportlab. Uruchom: pip install reportlab")
    sys.exit(1)

# ─── REJESTRACJA FONTÓW Z OBSŁUGĄ POLSKICH ZNAKÓW ───────────────────────────

_FONT_DIR = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("RH",        f"{_FONT_DIR}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("RH-Bold",   f"{_FONT_DIR}/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("RH-Italic", f"{_FONT_DIR}/DejaVuSans-Oblique.ttf" if
                                os.path.exists(f"{_FONT_DIR}/DejaVuSans-Oblique.ttf") else
                                f"{_FONT_DIR}/DejaVuSans.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("RH", normal="RH", bold="RH-Bold", italic="RH-Italic", boldItalic="RH-Bold")

FONT_NORMAL = "RH"
FONT_BOLD   = "RH-Bold"
FONT_ITALIC = "RH-Italic"

# ─── ŚCIEŻKI ────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, ".tmp")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "roasters_hub_business_overview.pdf")

# ─── PALETA KOLORÓW ──────────────────────────────────────────────────────────

COFFEE_DARK   = colors.HexColor("#3B1F0E")   # ciemny brąz — nagłówki, cover
COFFEE_MED    = colors.HexColor("#6B3A1F")   # średni brąz — subheadery
GOLD          = colors.HexColor("#C8973A")   # złoty — akcenty, linie
CREAM         = colors.HexColor("#FAFAF5")   # krem — tło tabel
LIGHT_GRAY    = colors.HexColor("#E8E5DF")   # jasny szary — separator
TEXT_DARK     = colors.HexColor("#1A1A1A")   # prawie czarny — body text
TEXT_MED      = colors.HexColor("#4A4A4A")   # szary — secondary text
GREEN_VERIF   = colors.HexColor("#2D6A4F")   # zielony — weryfikacja, pozytywne
WHITE         = colors.white
ORANGE_ACCENT = colors.HexColor("#C4621D")   # pomarańcz — highlights

# ─── STYLE TYPOGRAFICZNE ─────────────────────────────────────────────────────

def build_styles():
    base = getSampleStyleSheet()

    styles = {
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName=FONT_BOLD,
            fontSize=32,
            textColor=WHITE,
            leading=40,
            alignment=TA_LEFT,
            spaceAfter=8,
        ),
        "cover_subtitle": ParagraphStyle(
            "cover_subtitle",
            fontName=FONT_NORMAL,
            fontSize=14,
            textColor=colors.HexColor("#F0E8DA"),
            leading=20,
            alignment=TA_LEFT,
            spaceAfter=4,
        ),
        "cover_meta": ParagraphStyle(
            "cover_meta",
            fontName=FONT_NORMAL,
            fontSize=10,
            textColor=colors.HexColor("#C0B8A8"),
            leading=16,
            alignment=TA_LEFT,
        ),
        "h1": ParagraphStyle(
            "h1",
            fontName=FONT_BOLD,
            fontSize=16,
            textColor=COFFEE_DARK,
            leading=22,
            spaceBefore=22,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName=FONT_BOLD,
            fontSize=12,
            textColor=COFFEE_MED,
            leading=16,
            spaceBefore=14,
            spaceAfter=5,
        ),
        "h3": ParagraphStyle(
            "h3",
            fontName=FONT_BOLD,
            fontSize=10,
            textColor=TEXT_DARK,
            leading=14,
            spaceBefore=10,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "body",
            fontName=FONT_NORMAL,
            fontSize=9.5,
            textColor=TEXT_DARK,
            leading=14,
            spaceBefore=3,
            spaceAfter=3,
        ),
        "body_bold": ParagraphStyle(
            "body_bold",
            fontName=FONT_BOLD,
            fontSize=9.5,
            textColor=TEXT_DARK,
            leading=14,
            spaceBefore=3,
            spaceAfter=3,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            fontName=FONT_NORMAL,
            fontSize=9.5,
            textColor=TEXT_DARK,
            leading=14,
            spaceBefore=2,
            spaceAfter=2,
            leftIndent=14,
            bulletIndent=0,
        ),
        "quote": ParagraphStyle(
            "quote",
            fontName=FONT_ITALIC,
            fontSize=9,
            textColor=TEXT_MED,
            leading=14,
            spaceBefore=6,
            spaceAfter=6,
            leftIndent=18,
            rightIndent=10,
        ),
        "quote_source": ParagraphStyle(
            "quote_source",
            fontName=FONT_NORMAL,
            fontSize=8,
            textColor=colors.HexColor("#888888"),
            leading=12,
            leftIndent=18,
            spaceAfter=8,
        ),
        "callout": ParagraphStyle(
            "callout",
            fontName=FONT_BOLD,
            fontSize=9.5,
            textColor=COFFEE_DARK,
            leading=14,
            spaceBefore=6,
            spaceAfter=6,
            leftIndent=10,
        ),
        "small": ParagraphStyle(
            "small",
            fontName=FONT_NORMAL,
            fontSize=8,
            textColor=TEXT_MED,
            leading=11,
            spaceBefore=2,
            spaceAfter=2,
        ),
        "table_header": ParagraphStyle(
            "table_header",
            fontName=FONT_BOLD,
            fontSize=8.5,
            textColor=WHITE,
            leading=12,
            alignment=TA_LEFT,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            fontName=FONT_NORMAL,
            fontSize=8.5,
            textColor=TEXT_DARK,
            leading=12,
            alignment=TA_LEFT,
        ),
        "table_cell_bold": ParagraphStyle(
            "table_cell_bold",
            fontName=FONT_BOLD,
            fontSize=8.5,
            textColor=TEXT_DARK,
            leading=12,
            alignment=TA_LEFT,
        ),
        "stat_number": ParagraphStyle(
            "stat_number",
            fontName=FONT_BOLD,
            fontSize=18,
            textColor=COFFEE_DARK,
            leading=22,
            alignment=TA_CENTER,
        ),
        "stat_label": ParagraphStyle(
            "stat_label",
            fontName=FONT_NORMAL,
            fontSize=8,
            textColor=TEXT_MED,
            leading=11,
            alignment=TA_CENTER,
        ),
        "section_number": ParagraphStyle(
            "section_number",
            fontName=FONT_BOLD,
            fontSize=28,
            textColor=LIGHT_GRAY,
            leading=32,
            alignment=TA_RIGHT,
        ),
    }
    return styles


# ─── HELPERY DO TABEL ────────────────────────────────────────────────────────

def make_table_style(header_color=None, row_colors=True, grid=True):
    if header_color is None:
        header_color = COFFEE_DARK
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), header_color),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
        ("FONTSIZE", (0, 0), (-1, 0), 8.5),
        ("FONTNAME", (0, 1), (-1, -1), FONT_NORMAL),
        ("FONTSIZE", (0, 1), (-1, -1), 8.5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    if row_colors:
        cmds += [
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, WHITE]),
        ]
    if grid:
        cmds += [
            ("LINEBELOW", (0, 0), (-1, 0), 0.5, GOLD),
            ("LINEBELOW", (0, 1), (-1, -2), 0.3, LIGHT_GRAY),
            ("BOX", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ]
    return TableStyle(cmds)


def p(text, style_name, styles):
    return Paragraph(text, styles[style_name])


def bullet_item(text, styles):
    return Paragraph(f"\u2022\u2002{text}", styles["bullet"])


def sp(height=6):
    return Spacer(1, height)


def hr(color=LIGHT_GRAY, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=4, spaceBefore=4)


def gold_hr():
    return HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=6, spaceBefore=2)


# ─── COVER PAGE ──────────────────────────────────────────────────────────────

class CoverPage(Flowable):
    def __init__(self, width, height):
        Flowable.__init__(self)
        self.page_width = width
        self.page_height = height
        self.width = width - 4 * cm   # frame width (A4 - left/right margins)
        self.height = height - 4.5 * cm  # frame height (A4 - top/bottom margins)

    def wrap(self, availWidth, availHeight):
        return (availWidth, availHeight)

    def draw(self):
        c = self.canv
        # Use full page coordinates by translating back from frame origin
        # The frame starts at (leftMargin, bottomMargin) = (2cm, 2.5cm)
        left_m = 2 * cm
        bot_m = 2.5 * cm
        c.translate(-left_m, -bot_m)
        W, H = self.page_width, self.page_height

        # Ciemny brązowy panel — górna połowa
        c.setFillColor(COFFEE_DARK)
        c.rect(0, H * 0.42, W, H * 0.58, fill=1, stroke=0)

        # Złoty akcent — pozioma linia
        c.setStrokeColor(GOLD)
        c.setLineWidth(3)
        c.line(2 * cm, H * 0.42, W - 2 * cm, H * 0.42)

        # Tytuł
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 36)
        c.drawString(2 * cm, H * 0.70, "Roasters Hub")

        # Podtytuł
        c.setFillColor(colors.HexColor("#F0E8DA"))
        c.setFont(FONT_NORMAL, 16)
        c.drawString(2 * cm, H * 0.63, "Business Overview")

        # Tagline
        c.setFillColor(GOLD)
        c.setFont(FONT_ITALIC, 11)
        c.drawString(2 * cm, H * 0.56, "Discover the world's best specialty coffee roasters")

        # Sekcja dolna — lewa
        c.setFillColor(COFFEE_DARK)
        c.setFont(FONT_BOLD, 10)
        c.drawString(2 * cm, H * 0.28, "Trójstronna platforma discovery")

        c.setFillColor(TEXT_MED)
        c.setFont(FONT_NORMAL, 9)
        lines = [
            "Łączy palarnie specialty coffee, kawiarnie i konsumentów",
            "na jednej platformie — globalnie.",
        ]
        y = H * 0.23
        for line in lines:
            c.drawString(2 * cm, y, line)
            y -= 14

        # Złote akcenty — małe prostokąty dekoracyjne
        c.setFillColor(GOLD)
        c.rect(2 * cm, H * 0.34, 3 * cm, 0.08 * cm, fill=1, stroke=0)

        # Metadane dolny pasek
        c.setFillColor(CREAM)
        c.rect(0, 0, W, H * 0.10, fill=1, stroke=0)

        c.setFillColor(TEXT_MED)
        c.setFont(FONT_NORMAL, 8.5)
        today = date.today().strftime("%d %B %Y")
        c.drawString(2 * cm, H * 0.055, f"Dokument poufny  \u2022  Wersja 1.0  \u2022  {today}")

        c.setFont(FONT_BOLD, 8.5)
        c.setFillColor(COFFEE_DARK)
        c.drawString(2 * cm, H * 0.038, "Do użytku wewnętrznego — dla wspólników i partnerów")

        # Złota linia oddzielająca dolny pasek
        c.setStrokeColor(GOLD)
        c.setLineWidth(1)
        c.line(0, H * 0.10, W, H * 0.10)

        # Trzy ikony / statystyki w dolnym pasku
        stats = [
            ("90 000+", "palarni na świecie"),
            ("$24.8B", "globalny rynek 2024"),
            ("10.5%", "CAGR do 2033"),
        ]
        x_positions = [W * 0.55, W * 0.70, W * 0.85]
        for (num, label), x in zip(stats, x_positions):
            c.setFillColor(COFFEE_DARK)
            c.setFont(FONT_BOLD, 13)
            c.drawCentredString(x, H * 0.058, num)
            c.setFillColor(TEXT_MED)
            c.setFont(FONT_NORMAL, 7.5)
            c.drawCentredString(x, H * 0.042, label)


# ─── SEKCJA: EXECUTIVE SUMMARY ───────────────────────────────────────────────

def section_executive_summary(styles):
    elems = []

    elems.append(p("01   Executive Summary", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    elems.append(p(
        "Rynek specialty coffee ma trzy strony, które szukają się nawzajem — "
        "ale nie istnieje żadna infrastruktura, która je łączy. "
        "<b>Roasters Hub</b> to trójstronna platforma discovery, która rozwiązuje ten problem.",
        "body", styles
    ))
    elems.append(sp(12))

    # Trzy problemy
    elems.append(p("Trzy krytyczne luki rynkowe", "h2", styles))
    elems.append(sp(4))

    problems = [
        (
            "1. Brak centralnego kanału discovery",
            "Palarnie polegają na cold outreach (4% response rate) i targach kosztujących $2–10 tys. za event. "
            "Kawiarnie dostają dziesiątki cold maili tygodniowo i większość ignorują. "
            "<i>\"There really are no resources to guide specialty sourcing decisions\"</i> — SCA Transaction Guide 2024. "
            "Konsumenci rozkładają research na YouTube + Reddit + Instagram + Google Maps."
        ),
        (
            "2. Bariera zaufania i weryfikacji",
            "Palarnie nie mogą udowodnić wiarygodności online — wszyscy twierdzą \"direct trade\" i \"single origin\". "
            "Kawiarnie boją się ryzyka zmiany dostawcy (2–8 tygodni inwestycji). "
            "Konsumenci nie mogą weryfikować claims direct trade (greenwashing)."
        ),
        (
            "3. Ograniczona widoczność geograficzna",
            "68% rynku to micro-roasters, niewidoczni poza lokalnym rynkiem. "
            "Palarnie z krajów origin (Etiopia, Kenia, Brazylia) mają zerową widoczność globalną. "
            "Kawiarnie w rynkach wschodzących nie mają dostępu do globalnej oferty."
        ),
    ]

    for title, desc in problems:
        data = [[
            Paragraph(title, styles["h3"]),
            Paragraph(desc, styles["body"]),
        ]]
        t = Table(data, colWidths=["28%", "72%"])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ]))
        elems.append(t)

    elems.append(sp(14))

    # Rozwiązanie
    elems.append(p("Rozwiązanie", "h2", styles))
    elems.append(sp(4))
    elems.append(p(
        "<b>Roasters Hub</b> to globalny katalog palarni specialty coffee z weryfikacją, "
        "filtrami branżowymi i trójstronnym modelem discovery. "
        "Palarnia tworzy profil raz — ten sam rekord generuje wartość dla kawiarni (discovery dostawcy), "
        "konsumenta (discovery ziaren) i samej palarni (pasywny lead gen).",
        "body", styles
    ))
    elems.append(sp(12))

    # Stats
    elems.append(p("Szansa rynkowa", "h2", styles))
    elems.append(sp(6))

    stat_data = [[
        Paragraph("$24.8B", styles["stat_number"]),
        Paragraph("$47.8B", styles["stat_number"]),
        Paragraph("90 000+", styles["stat_number"]),
        Paragraph("45 000+", styles["stat_number"]),
    ], [
        Paragraph("globalny rynek\nspecialty 2024", styles["stat_label"]),
        Paragraph("rynek US\nspecialty 2024", styles["stat_label"]),
        Paragraph("small-batch\nroasters na świecie", styles["stat_label"]),
        Paragraph("indie kawiarni\nw Europie", styles["stat_label"]),
    ]]

    stat_table = Table(stat_data, colWidths=["25%", "25%", "25%", "25%"])
    stat_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("BOX", (0, 0), (-1, -1), 1, GOLD),
        ("LINEAFTER", (0, 0), (2, -1), 0.5, LIGHT_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elems.append(stat_table)

    return elems


# ─── SEKCJA: RYNEK ───────────────────────────────────────────────────────────

def section_market(styles):
    elems = []

    elems.append(p("02   Rynek i okazja", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    elems.append(p("Globalny rynek specialty coffee rośnie w tempie 10.5% rocznie — trzykrotnie szybciej niż ogólny rynek kawy.", "body", styles))
    elems.append(sp(10))

    # Tabela rozmiarów rynku
    elems.append(p("Wielkość rynku", "h2", styles))
    elems.append(sp(4))

    headers = [
        Paragraph("Rynek", styles["table_header"]),
        Paragraph("Wartość 2024", styles["table_header"]),
        Paragraph("Prognoza 2033", styles["table_header"]),
        Paragraph("CAGR", styles["table_header"]),
    ]
    rows = [
        ["Globalny specialty coffee", "$24.8 mld", "~$60.9 mld", "10.5%"],
        ["US specialty coffee", "$47.8 mld", "—", "9.5% (do 2030)"],
        ["EU specialty coffee", "$7.81 mld", "$18.01 mld", "9.73%"],
        ["Globalny rynek kawy (broad)", "$121.7 mld", "—", "—"],
    ]

    tc = styles["table_cell"]
    tb = styles["table_cell_bold"]
    data = [headers] + [[Paragraph(c if i > 0 else f"<b>{c}</b>", tb if i == 0 else tc) for i, c in enumerate(r)] for r in rows]

    t = Table(data, colWidths=["40%", "20%", "20%", "20%"])
    t.setStyle(make_table_style())
    elems.append(t)

    elems.append(sp(12))

    # Uczestnicy rynku
    elems.append(p("Uczestnicy rynku", "h2", styles))
    elems.append(sp(4))

    part_headers = [
        Paragraph("Segment", styles["table_header"]),
        Paragraph("Liczba", styles["table_header"]),
        Paragraph("Uwagi", styles["table_header"]),
    ]
    part_rows = [
        ["Small-batch roasters (świat)", "~90 000+", "68% to mikro-palarnie (<100 kg/dzień)"],
        ["Indie kawiarnie — Europa", "45 008 (2024)", "Prognoza: 52 800 do 2029 (World Coffee Portal)"],
        ["Specialty cafés w UE", "12 500+", "Aktywni kupcy kawy specialty"],
        ["Indie coffee shops — USA", "~35 000", "Szacunek"],
        ["Palarnie — Niemcy", "~2 800", "W tym ~650 w Berlinie"],
        ["Palarnie — Polska", "~200+", "Dynamicznie rosnąca scena"],
    ]
    pdata = [part_headers] + [[Paragraph(c, styles["table_cell"]) for c in r] for r in part_rows]
    pt = Table(pdata, colWidths=["38%", "22%", "40%"])
    pt.setStyle(make_table_style())
    elems.append(pt)

    elems.append(sp(12))

    # Kluczowe trendy
    elems.append(p("Kluczowe trendy 2024–2025", "h2", styles))
    elems.append(sp(4))

    trends = [
        ("<b>Home brewing boom</b>",
         "83% konsumentów US parzy kawę w domu (NCA 2024) — wzrost 4% vs. 2020. "
         "\"Prosumer culture\" — konsumenci chcą kawiarnianych doświadczeń w domu."),
        ("<b>Direct trade jako standard</b>",
         "Kawiarnie i konsumenci oczekują transparentności sourcingu. "
         "Direct trade za 77% wolumenu na platformie Algrano. Certyfikaty (Fair Trade, Organic) = kluczowy differentiator."),
        ("<b>Kryzys cen 2024</b>",
         "Arabica futures osiągnęły rekord $3.50/lb w grudniu 2024 (+40% YoY). "
         "Roasters zmuszeni do zmiany dostawców lub profilu ziaren — dyruptywne dla relacji."),
        ("<b>Emerging markets</b>",
         "Europa Wschodnia (PL, CZ, HU), Bliski Wschód (Dubai, Istanbul), Korea Płd., Tajwan — "
         "dynamiczny wzrost. Lokalne sceny w krajach origin (Etiopia, Kenia, Brazylia) — rosnące."),
        ("<b>Digitalizacja sourcingu</b>",
         "B2B digital marketplaces rosną. Roasters adopting SaaS (Cropster, RoasterTools). "
         "DTC e-commerce — sprzedaż bezpośrednia do konsumentów przez własne strony."),
    ]

    for title, desc in trends:
        data = [[
            Paragraph(title, styles["body_bold"]),
            Paragraph(desc, styles["body"]),
        ]]
        t = Table(data, colWidths=["26%", "74%"])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ]))
        elems.append(t)

    elems.append(sp(12))

    # Segmentacja geograficzna
    elems.append(p("Segmentacja geograficzna", "h2", styles))
    elems.append(sp(4))

    geo_headers = [
        Paragraph("Tier", styles["table_header"]),
        Paragraph("Regiony", styles["table_header"]),
        Paragraph("Uzasadnienie", styles["table_header"]),
    ]
    geo_rows = [
        ["Tier 1 — Priorytet launch", "UK, Niemcy, Polska + Czechy, Skandynawia",
         "Silne specialty sceny, angielski, dostępne eventy"],
        ["Tier 2 — Ekspansja", "Francja, Holandia, Belgia, Australia, Japonia",
         "Duże rynki EU, zaawansowane sceny"],
        ["Tier 3 — Przyszłość", "USA, Bliski Wschód, kraje origin (ET, KE, BR)",
         "Ogromne rynki, unikalne supply-side"],
    ]
    gdata = [geo_headers] + [[Paragraph(c, styles["table_cell"]) for c in r] for r in geo_rows]
    gt = Table(gdata, colWidths=["28%", "36%", "36%"])
    gt.setStyle(make_table_style())
    elems.append(gt)

    return elems


# ─── SEKCJA: ANALIZA KONKURENCJI ─────────────────────────────────────────────

def section_competitive(styles):
    elems = []

    elems.append(p("03   Analiza konkurencji", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    elems.append(p(
        "Żaden z istniejących graczy nie obsługuje trójkąta palarnia–kawiarnia–konsument. "
        "Roasters Hub zajmuje niezagospodarowaną niszę discovery.",
        "body", styles
    ))
    elems.append(sp(10))

    # Przegląd konkurentów
    elems.append(p("Główni gracze", "h2", styles))
    elems.append(sp(4))

    comp_headers = [
        Paragraph("Platforma", styles["table_header"]),
        Paragraph("Typ", styles["table_header"]),
        Paragraph("Co robi", styles["table_header"]),
        Paragraph("Mocne strony", styles["table_header"]),
        Paragraph("Luka vs. RH", styles["table_header"]),
    ]
    comp_rows = [
        ["European Coffee Trip", "Katalog kawiarni + media",
         "6 000+ specialty cafés w 39 krajach Europy, app mobilna, content",
         "Silna marka, 2M+ web views/rok, 250K+ users",
         "Brak palarni, brak B2B, tylko Europa"],
        ["Algrano", "B2B marketplace",
         "Producenci zielonej kawy → palarnie. Logistyka, QC, finansowanie.",
         "Rozwiązuje upstream supply chain, 33 kraje",
         "Inny layer (farma→roaster). Brak consumer layer."],
        ["Cropster", "SaaS operacyjny",
         "Roast profiling, inventory, QC, B2B ordering portal. $99–$600+/mies.",
         "Industry standard, deep hardware integration",
         "Narzędzie dla istniejących klientów. Brak discovery."],
        ["RoasterTools", "SaaS B2B wholesale",
         "Portal zamawiania dla stałych kawiarni. $199–$2 300/mies.",
         "Automatyzacja zamówień, integracje ERP",
         "Dla istniejących relacji. Drogi dla mikro-palarni."],
        ["Google / Instagram", "Generyczne",
         "Organiczne discovery przez wyszukiwarki i social media",
         "Zasięg globalny",
         "Brak filtrów specialty, brak weryfikacji, słabe SEO małych palarni"],
    ]
    cdata = [comp_headers]
    for r in comp_rows:
        cdata.append([Paragraph(c, styles["table_cell"]) for c in r])
    ct = Table(cdata, colWidths=["18%", "17%", "26%", "21%", "18%"])
    ct.setStyle(make_table_style())
    elems.append(ct)

    elems.append(sp(14))

    # Mapa luk
    elems.append(p("Mapa luk konkurencyjnych", "h2", styles))
    elems.append(sp(4))

    gap_headers = [
        Paragraph("Potrzeba", styles["table_header"]),
        Paragraph("Algrano", styles["table_header"]),
        Paragraph("ECT", styles["table_header"]),
        Paragraph("Cropster", styles["table_header"]),
        Paragraph("Google", styles["table_header"]),
        Paragraph("Roasters Hub", styles["table_header"]),
    ]

    CHECK = "\u2713"
    CROSS = "\u2717"
    PART = "\u25CB"

    gap_rows = [
        ["Katalog palarni dla kawiarni", CROSS, CROSS, CROSS, PART, CHECK],
        ["Katalog palarni dla konsumentów", CROSS, CROSS, CROSS, PART, CHECK],
        ["Filtry specialty (origin, certyfikaty)", CROSS, CROSS, CROSS, CROSS, CHECK],
        ["Mapa palarni", CROSS, "Kawiarnie", CROSS, PART, CHECK],
        ["Weryfikacja palarni", CROSS, "Kawiarnie", CROSS, CROSS, CHECK],
        ["B2B discovery (nowe relacje)", "Producenci", CROSS, CROSS, "Słabo", CHECK],
        ["DTC consumer link", CROSS, CROSS, CROSS, CROSS, CHECK],
        ["Trójkąt palarnia–kawiarnia–konsument", CROSS, CROSS, CROSS, CROSS, CHECK],
        ["Darmowy dostęp dla kawiarni", CROSS, CHECK, CROSS, CHECK, CHECK],
    ]

    def gap_cell(val, is_last_col=False):
        if val == CHECK:
            hex_color = "#2D6A4F" if is_last_col else "#4A4A4A"
            return Paragraph(f'<font color="{hex_color}"><b>{val}</b></font>', styles["table_cell"])
        elif val == CROSS:
            return Paragraph(f'<font color="#AA3333">{val}</font>', styles["table_cell"])
        else:
            return Paragraph(val, styles["table_cell"])

    gdata = [gap_headers]
    for r in gap_rows:
        row_cells = []
        for i, c in enumerate(r):
            is_last = (i == len(r) - 1)
            if c in (CHECK, CROSS):
                row_cells.append(gap_cell(c, is_last))
            else:
                style = styles["table_cell_bold"] if is_last else styles["table_cell"]
                row_cells.append(Paragraph(c, style))
        gdata.append(row_cells)

    # Specjalny styl — ostatnia kolumna wyróżniona
    ts = make_table_style()
    ts.add("BACKGROUND", (5, 0), (5, -1), colors.HexColor("#EDF7F1"))
    ts.add("BACKGROUND", (5, 0), (5, 0), GREEN_VERIF)

    gt = Table(gdata, colWidths=["30%", "12%", "10%", "12%", "10%", "16%"])
    gt.setStyle(ts)
    elems.append(gt)

    elems.append(sp(4))
    elems.append(p(
        "\u25CB = częściowo / \u2713 = tak / \u2717 = nie",
        "small", styles
    ))

    elems.append(sp(12))

    # Competitive moat
    elems.append(p("Bariery wejścia (competitive moat)", "h2", styles))
    elems.append(sp(4))

    moats = [
        ("Data moat", "Baza zweryfikowanych palarni z pełnymi danymi jest trudna do skopiowania — wymaga manualnej pracy i relacji z setkami palarni."),
        ("Network effects", "Każda nowa palarnia przyciąga więcej kawiarni i konsumentów, co przyciąga więcej palarni. Niemożliwe do odtworzenia \"cold start\"."),
        ("Community moat", "Palarnie, które raz otrzymają \"Verified\" status i zbudują profil, niechętnie go porzucają."),
        ("SEO moat", "Tysiące landing pages per palarnia, miasto i kraj. Pozycja organiczna trudna do powtórzenia przez nowego gracza."),
    ]

    for i, (title, desc) in enumerate(moats, 1):
        data = [[
            Paragraph(f"{i}.", styles["stat_number"]),
            Paragraph(f"<b>{title}</b><br/>{desc}", styles["body"]),
        ]]
        t = Table(data, colWidths=["8%", "92%"])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        elems.append(t)

    return elems


# ─── SEKCJA: PERSONY ─────────────────────────────────────────────────────────

def section_personas(styles):
    elems = []

    elems.append(p("04   Trzy persony", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    elems.append(p(
        "Roasters Hub obsługuje trzy typy użytkowników jednocześnie. "
        "Kluczowy insight: jeden profil palarni generuje wartość dla wszystkich trzech person równocześnie.",
        "body", styles
    ))
    elems.append(sp(10))

    personas = [
        {
            "num": "01",
            "title": "Palarnia kawy",
            "role": "Supply side — płaci",
            "color": COFFEE_DARK,
            "archetyp": "Właściciel lub współzałożyciel małej/micro palarni specialty. 1–10 FTE, pasja do rzemiosła. Łączy craft (selekcja ziarna, profil palenia) z koniecznością bycia przedsiębiorcą.",
            "jtbd": [
                "\"Pomóż mi być widocznym dla kawiarni szukających dostawcy\"",
                "\"Pomóż mi wyglądać wiarygodnie i profesjonalnie online\"",
                "\"Pomóż mi dotrzeć do kawiarni poza moim lokalnym rynkiem\"",
            ],
            "pains": [
                "Brak kanału discovery — nie ma jednego miejsca, gdzie kawiarnie szukają dostawcy",
                "Niski zwrot z cold outreach — 50 emaili → 2 odpowiedzi (Reddit r/roasting)",
                "Brak wiarygodności online — nowa palarnia wygląda jak każda inna",
                "Skyrocketing koszty zielonej kawy — arabica +40% w 2024",
            ],
            "wtp": "Aktualnie wydają $99–$2 300/mies. na narzędzia ops. WTP dla RH Featured: $39–$79/mies. — najtańszy i najbardziej mierzalny kanał discovery.",
            "quote": "\"The hardest part isn't roasting great coffee, it's getting anyone to know you exist.\"",
            "quote_src": "— Coffee Forums UK",
        },
        {
            "num": "02",
            "title": "Kawiarnia / Kupiec",
            "role": "Demand side — nie płaci",
            "color": COFFEE_MED,
            "archetyp": "Właściciel indie café lub head barista z uprawnieniami zakupowymi. Odpowiada za to, jaką kawę serwuje lokal. Rozumie się na kawie, ale ma ograniczony czas na systematyczny sourcing.",
            "jtbd": [
                "\"Pomóż mi znaleźć palarnię pasującą do mojego profilu (origin, certyfikaty, dostawa)\"",
                "\"Pomóż mi zweryfikować, że palarnia jest wiarygodna zanim zainwestuję czas\"",
                "\"Daj mi punkt startowy gdy muszę szybko zmienić dostawcę\"",
            ],
            "pains": [
                "Brak jednego miejsca do odkrywania palarni — Google, Instagram, targi, rekomendacje: chaotyczne",
                "Brak transparentności cen i warunków hurtowych bez cold outreach",
                "Problem zaufania wobec nieznanej palarni (2–8 tygodni inwestycji przy zmianie)",
                "Price volatility 2024 — arabica +40% zmusiła wielu do nagłej zmiany dostawcy",
            ],
            "wtp": "Kawiarnie NIE płacą za discovery — standard branżowy (ECT, Google Maps, Yelp darmowe). Monetyzacja wyłącznie przez stronę podażową (palarnie).",
            "quote": "\"We get tons of emails from roasters every week. We ignore most of them. If they're not recommended by someone we trust, it goes to spam.\"",
            "quote_src": "— r/barista, Reddit",
        },
        {
            "num": "03",
            "title": "Miłośnik kawy",
            "role": "Growth engine — nie płaci",
            "color": colors.HexColor("#8B5A2B"),
            "archetyp": "Home brewer, podróżnik kawowy, świadomy konsument. Gen Z + Millennials. Traktuje kawę jako doświadczenie, nie commodity. Inwestuje w sprzęt i wiedzę.",
            "jtbd": [
                "\"Pomóż mi odkryć palarnie pasujące do moich preferencji (origin, proces, certyfikaty)\"",
                "\"Pomóż mi znaleźć palarnie specialty gdy podróżuję do nowego miasta\"",
                "\"Pomóż mi kupić ziarna bezpośrednio od palarni, którą właśnie odkryłem\"",
            ],
            "pains": [
                "Rozproszenie informacji — YouTube + Reddit + Instagram + Google: 4 niespójne kanały",
                "Brak filtrów po preferencjach (origin, certyfikaty, profil smakowy, dostawa do kraju)",
                "Brak wiarygodności — jak zweryfikować claims direct trade i greenwashing?",
                "Trudność odkrywania palarni podczas podróży (Google Maps brak specialty kontekstu)",
            ],
            "wtp": "Konsumenci zawsze darmowi. Wartość dla platformy: wolumen ruchu → trigger upgradu palarni do Featured. Potencjalne przyszłe przychody: affiliate prowizje 5–15% od \"Shop online\" kliknięć.",
            "quote": "\"The amount of time I spend researching where to buy specialty coffee online is embarrassing. There has to be a better way.\"",
            "quote_src": "— r/Coffee, Reddit",
        },
    ]

    for persona in personas:
        elems.append(sp(8))

        # Nagłówek persony
        header_data = [[
            Paragraph(f"{persona['num']}", ParagraphStyle(
                "pnum", fontName=FONT_BOLD, fontSize=22, textColor=WHITE, leading=26
            )),
            Paragraph(f"<b>{persona['title']}</b>", ParagraphStyle(
                "ptitle", fontName=FONT_BOLD, fontSize=14, textColor=WHITE, leading=18
            )),
            Paragraph(persona["role"], ParagraphStyle(
                "prole", fontName=FONT_ITALIC, fontSize=9, textColor=colors.HexColor("#F0E8DA"), leading=13
            )),
        ]]
        ht = Table(header_data, colWidths=["10%", "55%", "35%"])
        ht.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), persona["color"]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("ALIGN", (2, 0), (2, 0), "RIGHT"),
        ]))
        elems.append(ht)

        # Treść persony
        content_data = [[
            # Lewa kolumna: Archetyp + JTBD
            [
                Paragraph("<b>Archetyp</b>", styles["h3"]),
                Paragraph(persona["archetyp"], styles["body"]),
                sp(8),
                Paragraph("<b>Jobs to Be Done</b>", styles["h3"]),
            ] + [Paragraph(f"\u2022\u2002{j}", styles["bullet"]) for j in persona["jtbd"]],
            # Prawa kolumna: Pain points + WTP + Quote
            [
                Paragraph("<b>Krytyczne bóle</b>", styles["h3"]),
            ] + [Paragraph(f"\u2022\u2002{pp}", styles["bullet"]) for pp in persona["pains"]] + [
                sp(8),
                Paragraph("<b>Gotowość do płacenia (WTP)</b>", styles["h3"]),
                Paragraph(persona["wtp"], styles["body"]),
                sp(8),
                Paragraph(persona["quote"], styles["quote"]),
                Paragraph(persona["quote_src"], styles["quote_source"]),
            ],
        ]]

        def flatten(lst):
            result = []
            for item in lst:
                if isinstance(item, list):
                    result.extend(item)
                else:
                    result.append(item)
            return result

        from reportlab.platypus import ListFlowable as LF

        left_items = flatten(content_data[0][0])
        right_items = flatten(content_data[0][1])

        from reportlab.platypus import Frame, BaseDocTemplate

        # Używamy prostszej tabeli dwukolumnowej z listą flowables
        left_col = [
            Paragraph("<b>Archetyp</b>", styles["h3"]),
            Paragraph(persona["archetyp"], styles["body"]),
            sp(6),
            Paragraph("<b>Jobs to Be Done</b>", styles["h3"]),
        ] + [bullet_item(j, styles) for j in persona["jtbd"]]

        right_col = [
            Paragraph("<b>Krytyczne bóle</b>", styles["h3"]),
        ] + [bullet_item(pp, styles) for pp in persona["pains"]] + [
            sp(6),
            Paragraph("<b>Gotowość do płacenia</b>", styles["h3"]),
            Paragraph(persona["wtp"], styles["body"]),
            sp(6),
            Paragraph(persona["quote"], styles["quote"]),
            Paragraph(persona["quote_src"], styles["quote_source"]),
        ]

        # Renderowanie jako 2-kolumnowa tabela
        max_rows = max(len(left_col), len(right_col))
        while len(left_col) < max_rows:
            left_col.append(sp(1))
        while len(right_col) < max_rows:
            right_col.append(sp(1))

        two_col_data = [[left_col[i], right_col[i]] for i in range(max_rows)]
        tct = Table(two_col_data, colWidths=["48%", "52%"])
        tct.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("BACKGROUND", (0, 0), (-1, -1), CREAM),
            ("LINEAFTER", (0, 0), (0, -1), 0.5, LIGHT_GRAY),
            ("BOX", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ]))
        elems.append(tct)

    return elems


# ─── SEKCJA: VALUE PROPOSITION ───────────────────────────────────────────────

def section_value_prop(styles):
    elems = []

    elems.append(p("05   Propozycja wartości i efekty sieciowe", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    elems.append(p(
        "Kluczowe pytanie: dlaczego platforma &gt; suma trzech oddzielnych rozwiązań?",
        "body", styles
    ))
    elems.append(sp(10))

    # Dlaczego platforma
    elems.append(p("Jeden profil — trzy wartości", "h2", styles))
    elems.append(sp(4))

    values_data = [
        [
            Paragraph("Bez platformy", styles["table_header"]),
            Paragraph("Z Roasters Hub", styles["table_header"]),
        ],
        [
            Paragraph("Palarnia: własna strona + Instagram + cold outreach → lokalnie ograniczona, pasywna", styles["table_cell"]),
            Paragraph("<b>Palarnia:</b> pasywny lead gen globalny — profil dostępny 24/7, filtrowalny przez wszystkich", styles["table_cell"]),
        ],
        [
            Paragraph("Kawiarnia: Google + rekomendacje + targi → chaotyczne, czasochłonne", styles["table_cell"]),
            Paragraph("<b>Kawiarnia:</b> aktywne discovery z kontekstem — filtry, weryfikacja, jedna baza", styles["table_cell"]),
        ],
        [
            Paragraph("Konsument: YouTube + Reddit + Google Maps → rozproszone, bez struktury", styles["table_cell"]),
            Paragraph("<b>Konsument:</b> jedna destinacja zamiast 5 chaotycznych źródeł", styles["table_cell"]),
        ],
    ]
    vt = Table(values_data, colWidths=["50%", "50%"])
    vt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COFFEE_DARK),
        ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#FFF0E8")),
        ("BACKGROUND", (1, 1), (1, -1), colors.HexColor("#EDF7F1")),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("BOX", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ("LINEAFTER", (0, 0), (0, -1), 0.5, LIGHT_GRAY),
        ("LINEBELOW", (0, 1), (-1, -2), 0.3, LIGHT_GRAY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTSIZE", (0, 1), (-1, -1), 8.5),
    ]))
    elems.append(vt)

    elems.append(sp(12))

    # Efekty sieciowe
    elems.append(p("Cross-side network effects", "h2", styles))
    elems.append(sp(4))

    effects = [
        "Więcej palarni → Większa wartość dla kawiarni (więcej opcji sourcingu)",
        "Więcej palarni → Większa wartość dla konsumentów (więcej do odkrycia)",
        "Więcej kawiarni → Większa wartość dla palarni (więcej potencjalnych klientów)",
        "Więcej konsumentów → Większy ruch → Więcej wartości dla palarni (kanał DTC)",
        "Więcej konsumentów → Więcej recenzji → Lepsze SEO → Więcej użytkowników wszystkich typów",
    ]
    for e in effects:
        elems.append(bullet_item(e, styles))

    elems.append(sp(4))
    elems.append(p(
        "<b>Formuła:</b> Każda nowa palarnia zwiększa wartość platformy dla WSZYSTKICH kawiarni i konsumentów jednocześnie.",
        "callout", styles
    ))

    elems.append(sp(12))

    # Flywheel
    elems.append(p("Flywheel — koło zamachowe", "h2", styles))
    elems.append(sp(6))

    flywheel_steps = [
        ("1", "Palarnie dołączają do RH (supply side)"),
        ("2", "Katalog rośnie → platforma nabiera wartości"),
        ("3", "Kawiarnie i konsumenci odkrywają RH (SEO, share, palarnia promuje)"),
        ("4", "Ruch rośnie → palarnia widzi wartość w statystykach profilu"),
        ("5", "Palarnia upgradeuje do Featured → przychód"),
        ("6", "Przychód → lepszy produkt → więcej palarni [LOOP]"),
    ]

    fw_data = []
    for num, step in flywheel_steps:
        fw_data.append([
            Paragraph(num, ParagraphStyle(
                "fnum", fontName=FONT_BOLD, fontSize=14, textColor=WHITE,
                alignment=TA_CENTER, leading=18
            )),
            Paragraph(step, styles["body"]),
            Paragraph("\u2192" if num != "6" else "\u21BA", ParagraphStyle(
                "farrow", fontName=FONT_BOLD, fontSize=16, textColor=GOLD,
                alignment=TA_CENTER, leading=20
            )),
        ])

    fwt = Table(fw_data, colWidths=["8%", "82%", "10%"])
    fwt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), COFFEE_DARK),
        ("BACKGROUND", (1, 0), (1, -1), CREAM),
        ("BACKGROUND", (2, 0), (2, -1), CREAM),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (0, -1), 4),
        ("LEFTPADDING", (1, 0), (1, -1), 10),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, LIGHT_GRAY),
        ("BOX", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
    ]))
    elems.append(fwt)

    elems.append(sp(12))

    # Punkt wejścia
    elems.append(p("Punkt wejścia (cold start)", "h3", styles))
    elems.append(Paragraph(
        "Supply side (palarnie) musi kręcić kołem pierwsza. "
        "Strategia: <b>ręczne wypełnienie bazy 100 palarni</b> zanim platforma jest publiczna, "
        "przed otwarciem dla kawiarni i konsumentów. To inicjuje flywheel bez czekania na naturalny growth.",
        styles["body"]
    ))

    elems.append(sp(12))

    # Przecięcia wartości
    elems.append(p("Pięć przecięć wartości (wszystkie trzy persony)", "h2", styles))
    elems.append(sp(4))

    inter_headers = [
        Paragraph("Przecięcie", styles["table_header"]),
        Paragraph("Dla kogo", styles["table_header"]),
        Paragraph("Główna funkcja", styles["table_header"]),
    ]
    inter_rows = [
        ["Transparentność i zaufanie", "Palarnia + Kawiarnia + Konsument", "Verified badge + certyfikaty + direct trade info"],
        ["Discovery i połączenie", "Palarnia + Kawiarnia + Konsument", "Katalog z filtrami specialty + mapa"],
        ["Opowieść i różnicowanie", "Palarnia + Konsument", "Bogaty profil — raz napisany, trzy odbiorniki"],
        ["Bezpośredni dostęp", "Palarnia + Kawiarnia + Konsument", "Dane kontaktowe + \"Shop online\" link"],
        ["Kontekst jakości", "Kawiarnia + Konsument", "Filtry specialty wykluczające commodity brands"],
    ]
    idata = [inter_headers] + [[Paragraph(c, styles["table_cell"]) for c in r] for r in inter_rows]
    it = Table(idata, colWidths=["28%", "28%", "44%"])
    it.setStyle(make_table_style())
    elems.append(it)

    return elems


# ─── SEKCJA: MODEL BIZNESOWY ─────────────────────────────────────────────────

def section_business_model(styles):
    elems = []

    elems.append(p("06   Model biznesowy i cennik", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    elems.append(p(
        "Model freemium — palarnie płacą za widoczność, kawiarnie i konsumenci zawsze darmowi. "
        "Monetyzacja startuje w miesiącu 6, po walidacji product-market fit.",
        "body", styles
    ))
    elems.append(sp(10))

    # Tiery cenowe
    elems.append(p("Tiers cenowe", "h2", styles))
    elems.append(sp(4))

    price_headers = [
        Paragraph("Tier", styles["table_header"]),
        Paragraph("Cena", styles["table_header"]),
        Paragraph("Co zawiera", styles["table_header"]),
        Paragraph("Kiedy", styles["table_header"]),
    ]
    price_rows = [
        ["Free", "$0 / mies.",
         "Profil palarni, badge \"Verified Roaster\", widoczność w katalogu, dane kontaktowe, 3 zdjęcia",
         "Od dnia 1"],
        ["Featured", "$49 / mies.\n($39 rocznie)",
         "Wyróżnienie w wynikach, badge \"Featured\", 15+ zdjęć, priorytet w sortowaniu, statystyki profilu",
         "Miesiąc 6+"],
        ["Pro", "$89 / mies.",
         "Statystyki zaawansowane (profil odwiedzin, kliknięcia), priorytetowe wsparcie, sample management",
         "Rok 1+"],
        ["Kampanie", "$99–$499 / jednorazowo",
         "Homepage banner, region spotlight (\"Roasters in Berlin\"), featured w newsletterze",
         "Miesiąc 9+"],
    ]
    pdata = [price_headers]
    for r in price_rows:
        pdata.append([Paragraph(c, styles["table_cell"]) for c in r])
    pt = Table(pdata, colWidths=["16%", "20%", "42%", "22%"])
    ts = make_table_style()
    ts.add("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#F0EDE5"))
    pt.setStyle(ts)
    elems.append(pt)

    elems.append(sp(4))
    elems.append(p(
        "Kawiarnie i konsumenci: zawsze darmowi. Standard discovery platforms (ECT, Google Maps, Yelp).",
        "small", styles
    ))

    elems.append(sp(12))

    # Porównanie z alternatywami
    elems.append(p("Benchmark WTP — co palarnie porównają", "h2", styles))
    elems.append(sp(4))

    bench_headers = [
        Paragraph("Alternatywa", styles["table_header"]),
        Paragraph("Koszt / mies.", styles["table_header"]),
        Paragraph("Problem", styles["table_header"]),
    ]
    bench_rows = [
        ["Targi (SCA Expo)", "$500–$2 000+", "2× /rok, geograficznie ograniczone, brak follow-up"],
        ["Instagram Ads (B2B)", "$200–$500", "Algorytm, kawiarnie nie sourcują z IG systematycznie"],
        ["Cold outreach (własny czas)", "$1 200+ (szac.)", "10h/tydzień × $30/h, niski conversion, nie skaluje się"],
        ["Cropster Commerce", "$200–$400", "Tylko dla istniejących klientów — nie pomaga znaleźć nowych"],
        ["RH Featured", "$49 / mies.", "Pasywny, globalny, mierzalny lead gen — najtańsza opcja"],
    ]
    bdata = [bench_headers]
    for r in bench_rows:
        bdata.append([Paragraph(c, styles["table_cell"]) for c in r])

    bts = make_table_style()
    bts.add("BACKGROUND", (0, 5), (-1, 5), colors.HexColor("#EDF7F1"))
    bts.add("FONTNAME", (0, 5), (-1, 5), FONT_BOLD)
    bts.add("TEXTCOLOR", (0, 5), (-1, 5), GREEN_VERIF)

    bt = Table(bdata, colWidths=["34%", "22%", "44%"])
    bt.setStyle(bts)
    elems.append(bt)

    elems.append(sp(12))

    # Projekcje przychodów
    elems.append(p("Projekcje przychodów", "h2", styles))
    elems.append(sp(4))

    rev_headers = [
        Paragraph("Scenariusz", styles["table_header"]),
        Paragraph("Palarnie", styles["table_header"]),
        Paragraph("Konwersja Featured", styles["table_header"]),
        Paragraph("Przychód / mies.", styles["table_header"]),
    ]
    rev_rows = [
        ["Konserwatywny (3 mies.)", "500", "5% = 25 Featured", "$1 225"],
        ["Bazowy (6 mies.)", "2 000", "5% = 100 Featured", "$4 900"],
        ["Optymistyczny (6 mies.)", "2 000", "8% = 160 Featured", "$7 840"],
    ]
    rdata = [rev_headers] + [[Paragraph(c, styles["table_cell"]) for c in r] for r in rev_rows]
    rt = Table(rdata, colWidths=["36%", "16%", "26%", "22%"])
    rt.setStyle(make_table_style())
    elems.append(rt)

    elems.append(sp(4))
    elems.append(p(
        "Pierwsze 6 miesięcy: zero przychodów — fokus na growth i walidację PMF. "
        "Monetyzacja startuje gdy platforma ma mierzalną wartość dla palarni.",
        "small", styles
    ))

    elems.append(sp(12))

    # Przyszłe strumienie
    elems.append(p("Przyszłe strumienie przychodów (V2+)", "h2", styles))
    elems.append(sp(4))

    future_rows = [
        ["Affiliate / DTC", "Prowizja 5–15% od kliknięć \"Shop online\" → zakup u palarni", "V2+"],
        ["Konto premium kawiarni", "$0–$19/mies. za ulubione, historia, alerty, notatki", "V2+"],
        ["Konto premium konsumenta", "$3–9/mies. za wishlist, notatki degustacyjne, rekomendacje", "V3+"],
        ["API dla partnerów", "Dostęp do bazy palarni dla narzędzi branżowych", "V3+"],
    ]
    fheaders = [
        Paragraph("Stream", styles["table_header"]),
        Paragraph("Opis", styles["table_header"]),
        Paragraph("Kiedy", styles["table_header"]),
    ]
    fdata = [fheaders] + [[Paragraph(c, styles["table_cell"]) for c in r] for r in future_rows]
    ft = Table(fdata, colWidths=["22%", "60%", "18%"])
    ft.setStyle(make_table_style())
    elems.append(ft)

    return elems


# ─── SEKCJA: GO-TO-MARKET ────────────────────────────────────────────────────

def section_gtm(styles):
    elems = []

    elems.append(p("07   Strategia wejścia na rynek", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    elems.append(p(
        "Kluczowe wyzwanie: chicken-and-egg — bez palarni nie ma kawiarni, bez kawiarni nie ma wartości dla palarni. "
        "Rozwiązanie: seeding 100 palarni przed launchem + konsumenci jako cold start.",
        "body", styles
    ))
    elems.append(sp(10))

    # Fazy
    elems.append(p("Fazy wdrożenia", "h2", styles))
    elems.append(sp(4))

    phases = [
        {
            "phase": "Faza 0",
            "name": "Pre-launch (2–4 tygodnie)",
            "color": COFFEE_DARK,
            "items": [
                "Ręcznie wprowadzić 100 palarni przed otwarciem platformy",
                "60 gotowych rekordów w seed-roasters.md (ze wszystkich kontynentów)",
                "Zweryfikować wszystkie jako \"Verified Roaster\" — wysoka jakość od dnia 1",
                "Pełne profile: opis, zdjęcia z publicznych źródeł, certyfikaty, linki do sklepu",
            ],
        },
        {
            "phase": "Faza 1",
            "name": "Soft Launch (tygodnie 1–4)",
            "color": COFFEE_MED,
            "items": [
                "Otworzyć platformę z 100+ profilami",
                "Personalny email do każdej z 100 palarni: \"Twój profil jest już na Roasters Hub\"",
                "Zaproponować \"Listed on RH\" badge → backlinki + ruch zwrotny",
                "Posty na Reddit r/Coffee, r/roasting (autentycznie, nie spam)",
                "Submission na Product Hunt",
            ],
        },
        {
            "phase": "Faza 2",
            "name": "Growth (miesiące 2–6)",
            "color": colors.HexColor("#8B5A2B"),
            "items": [
                "SEO zaczyna działać — landing pages per miasto i kraj",
                "Palarnie zapraszają inne palarnie (network effect)",
                "Konsumenci generują ruch organiczny",
                "Newsletter \"Roasters Hub Weekly\" dla kawiarni i konsumentów",
                "Aktywacja Featured tier i Stripe (miesiąc 6+)",
            ],
        },
    ]

    for phase in phases:
        phase_data = [[
            Paragraph(f"<b>{phase['phase']}</b>", ParagraphStyle(
                "ph", fontName=FONT_BOLD, fontSize=11, textColor=WHITE, leading=15
            )),
            Paragraph(phase["name"], ParagraphStyle(
                "phn", fontName=FONT_ITALIC, fontSize=9, textColor=colors.HexColor("#F0E8DA"), leading=13
            )),
        ]]
        ph_header = Table(phase_data, colWidths=["20%", "80%"])
        ph_header.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), phase["color"]),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elems.append(ph_header)

        items_data = [[
            [bullet_item(item, styles) for item in phase["items"]]
        ]]
        items_table = Table([[col for col in row] for row in items_data], colWidths=["100%"])

        flat_items = [bullet_item(item, styles) for item in phase["items"]]
        it = Table([[item] for item in flat_items], colWidths=["100%"])
        it.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CREAM),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 16),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("BOX", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ]))
        elems.append(it)
        elems.append(sp(6))

    elems.append(sp(10))

    # Strategia geograficzna
    elems.append(p("Strategia geograficzna", "h2", styles))
    elems.append(sp(4))

    geo_items = [
        ("<b>Katalog: globalny od dnia 1</b>",
         "Core value proposition to global discovery. Seed database zawiera 60 palarni z 6 regionów."),
        ("<b>Marketing: Polska + Niemcy (pierwsze 6 mies.)</b>",
         "Silna specialty scena, dostępne eventy (Warsaw Coffee Festival, Berlin Coffee Festival), znajomość lokalnego rynku."),
        ("<b>Język: angielski jako base</b>",
         "Lingua franca rynku specialty coffee. Hard Beans, Friedhats, Tim Wendelboe — wszyscy operują po angielsku. "
         "i18n PL + DE w fazie 2."),
    ]

    for title, desc in geo_items:
        data = [[
            Paragraph(title, styles["body_bold"]),
            Paragraph(desc, styles["body"]),
        ]]
        t = Table(data, colWidths=["30%", "70%"])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ]))
        elems.append(t)

    elems.append(sp(12))

    # Kanały pozyskiwania palarni
    elems.append(p("Kanały pozyskiwania palarni", "h2", styles))
    elems.append(sp(4))

    ch_headers = [
        Paragraph("Kanał", styles["table_header"]),
        Paragraph("Efektywność", styles["table_header"]),
        Paragraph("Uwagi", styles["table_header"]),
    ]
    ch_rows = [
        ["\"Listed on RH\" badge", "\u2605\u2605\u2605\u2605\u2605", "Palarnia sama promuje profil na swojej stronie → viral + backlinki"],
        ["Reddit r/roasting, r/Coffee", "\u2605\u2605\u2605\u2605\u2605", "Wysoka w niszy, autentyczna społeczność — 3.5M users"],
        ["Instagram DM", "\u2605\u2605\u2605\u2605", "Palarnie aktywne na IG, kontakt bezpośredni"],
        ["Cold email", "\u2605\u2605\u2605", "Targetowalny, niski open rate, ale skaluje się"],
        ["Targi (SCA, WoC)", "\u2605\u2605\u2605\u2605\u2605", "Bezpośredni kontakt, wymaga budżetu"],
        ["Importerzy zielonej kawy", "\u2605\u2605\u2605\u2605", "Rekomendacja z zaufanego źródła"],
    ]
    chdata = [ch_headers] + [[Paragraph(c, styles["table_cell"]) for c in r] for r in ch_rows]
    cht = Table(chdata, colWidths=["32%", "20%", "48%"])
    cht.setStyle(make_table_style())
    elems.append(cht)

    return elems


# ─── SEKCJA: METRYKI ─────────────────────────────────────────────────────────

def section_metrics(styles):
    elems = []

    elems.append(p("08   Metryki sukcesu i walidacja PMF", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    # North Star
    elems.append(p("North Star Metric", "h2", styles))
    elems.append(sp(6))

    ns_data = [[
        Paragraph(
            "<b>Kliknięcia w dane kontaktowe palarni</b>",
            ParagraphStyle("ns", fontName=FONT_BOLD, fontSize=13, textColor=WHITE, leading=17)
        ),
        Paragraph(
            "To jest moment, w którym platforma generuje realną wartość: "
            "bezpośrednie połączenie między palarnią a kawiarnią lub konsumentem.",
            ParagraphStyle("nsd", fontName=FONT_NORMAL, fontSize=9.5, textColor=colors.HexColor("#F0E8DA"), leading=14)
        ),
    ]]
    nst = Table(ns_data, colWidths=["35%", "65%"])
    nst.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), COFFEE_DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEAFTER", (0, 0), (0, 0), 1, GOLD),
    ]))
    elems.append(nst)

    elems.append(sp(10))

    # PMF Test
    pmf_data = [[
        Paragraph(
            "\u26A0  Test PMF: Jeśli po 3 miesiącach od launch < 50 kliknięć/mies. w dane kontaktowe "
            "— PMF niezwalidowany, pivot required.",
            ParagraphStyle("pmf", fontName=FONT_BOLD, fontSize=9.5, textColor=COFFEE_DARK, leading=14)
        )
    ]]
    pmft = Table(pmf_data, colWidths=["100%"])
    pmft.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF8E8")),
        ("BOX", (0, 0), (-1, -1), 1.5, GOLD),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    elems.append(pmft)

    elems.append(sp(12))

    # Tabela metryk
    elems.append(p("Cele — 3 i 6 miesięcy", "h2", styles))
    elems.append(sp(4))

    met_headers = [
        Paragraph("Metryka", styles["table_header"]),
        Paragraph("3 miesiące", styles["table_header"]),
        Paragraph("6 miesięcy", styles["table_header"]),
    ]
    met_rows = [
        ["Zweryfikowane palarnie w katalogu", "100", "300"],
        ["MAU (monthly active users)", "1 000", "5 000"],
        ["Kliknięcia w dane kontaktowe / mies.", "50 ← TEST PMF", "200"],
        ["Kliknięcia \"Shop online\" / mies.", "100", "500"],
        ["Newsletter signups (łącznie)", "200", "1 000"],
        ["Ruch organiczny SEO (%)", "30%", "50%"],
        ["Featured conversions (plarnie płacące)", "0", "5% bazy"],
    ]
    mdata = [met_headers] + [[Paragraph(c, styles["table_cell"]) for c in r] for r in met_rows]

    mts = make_table_style()
    mts.add("FONTNAME", (0, 3), (-1, 3), FONT_BOLD)
    mts.add("TEXTCOLOR", (1, 3), (1, 3), ORANGE_ACCENT)

    mt = Table(mdata, colWidths=["50%", "25%", "25%"])
    mt.setStyle(mts)
    elems.append(mt)

    return elems


# ─── SEKCJA: RYZYKA ──────────────────────────────────────────────────────────

def section_risks(styles):
    elems = []

    elems.append(p("09   Ryzyka i mitygacja", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    risk_headers = [
        Paragraph("Ryzyko", styles["table_header"]),
        Paragraph("Prawdop.", styles["table_header"]),
        Paragraph("Wpływ", styles["table_header"]),
        Paragraph("Mitygacja", styles["table_header"]),
    ]
    risk_rows = [
        ["Chicken-and-egg (brak masy krytycznej)",
         "Wysokie", "Krytyczny",
         "100 palarni pre-launch; konsumenci jako cold start (wartość DTC niezależna od kawiarni)"],
        ["Brak product-market fit",
         "Średnie", "Wysoki",
         "Research waliduje problem; niski koszt testu (6–7 tygodni build); PMF gate w mies. 3"],
        ["Jakość vs. skala (zbyt duże luzy w weryfikacji)",
         "Średnie", "Średni",
         "Manualna weryfikacja jako filtr. Lepiej 200 świetnych profili niż 2 000 pustych."],
        ["Disintermediation (palarnia i kawiarnia \"wymykają się\")",
         "Niskie", "Niski",
         "RH nie pośredniczy w transakcji — bezpośredni kontakt TO jest cel. Plarnia nadal potrzebuje profilu."],
        ["Konkurent wchodzi w niszę",
         "Niskie", "Średni",
         "Data moat + SEO moat + first-mover advantage. Trudne do skopiowania bez manualnej pracy."],
    ]
    rdata = [risk_headers]
    for r in risk_rows:
        rdata.append([Paragraph(c, styles["table_cell"]) for c in r])

    rts = make_table_style()
    rt = Table(rdata, colWidths=["28%", "12%", "12%", "48%"])
    rt.setStyle(rts)
    elems.append(rt)

    elems.append(sp(12))

    # Ogólna ocena ryzyka
    elems.append(p("Ogólna ocena ryzyka: Średnio-niskie", "h2", styles))
    elems.append(sp(4))
    elems.append(Paragraph(
        "Główne ryzyko to egzekucja i timing rynkowy, nie walidacja problemu. "
        "Research potwierdza istnienie luki — wszystkie trzy persony mają ostre, udokumentowane bóle. "
        "Koszt testu MVP jest niski, gate PMF jest jasno zdefiniowany (3 miesiące, 50 kliknięć/mies.).",
        styles["body"]
    ))

    return elems


# ─── SEKCJA: APPENDIX SEED ROASTERS ─────────────────────────────────────────

def section_appendix(styles):
    elems = []

    elems.append(p("Appendix   Przykładowe palarnie startowe (seed data)", "h1", styles))
    elems.append(gold_hr())
    elems.append(sp(4))

    elems.append(p(
        "Przed launchem platforma będzie zasilona 60+ palarniami ze wszystkich kontynentów. "
        "Poniżej reprezentatywna próbka — w tym laureatów Global Coffee Awards 2025.",
        "body", styles
    ))
    elems.append(sp(10))

    seed_headers = [
        Paragraph("Palarnia", styles["table_header"]),
        Paragraph("Miasto", styles["table_header"]),
        Paragraph("Kraj", styles["table_header"]),
        Paragraph("Direct trade", styles["table_header"]),
        Paragraph("Nagrody / wyróżnienia", styles["table_header"]),
    ]
    seed_rows = [
        ["Tim Wendelboe", "Oslo", "Norwegia", "\u2713", "Ikona third wave specialty coffee"],
        ["Origin Coffee", "Londyn", "UK", "\u2713", "Best Roaster in Europe 2025 (Global Coffee Awards)"],
        ["Onyx Coffee Lab", "Rogers AR", "USA", "\u2713", "#1 Coffee Shop in North America 2025"],
        ["Utopian Coffee", "Fort Wayne", "USA", "\u2713", "Overall Winner — Global Coffee Awards US&Canada 2025"],
        ["Toby's Estate", "Sydney", "Australia", "\u2713", "#1 World's 100 Best Coffee Shops 2025"],
        ["Coffee Collective", "Kopenhaga", "Dania", "\u2713", "Pionierzy transparentnych cen skupu"],
        ["La Cabra", "Aarhus", "Dania", "\u2713", "Silna pozycja w konkursach SCA"],
        ["The Barn", "Berlin", "Niemcy", "\u2713", "Pionier specialty w Niemczech"],
        ["Five Elephant", "Berlin", "Niemcy", "\u2713", "Direct trade, sustainability focus"],
        ["L'Arbre à Café", "Paryż", "Francja", "\u2713", "Lider French specialty scene"],
        ["Hard Beans", "Opole", "Polska", "\u2713", "Liderzy polskiej sceny konkursowej"],
        ["HAYB", "Warszawa", "Polska", "\u2713", "Certyfikowany Q-Grader, filter specialty"],
        ["Garden of Coffee", "Addis Abeba", "Etiopia", "\u2713", "Ręczne palenie, tradycja etiopska"],
        ["Barista & Co.", "Nairobi", "Kenia", "\u2713", "Farm-to-cup, bezpośrednie relacje z farmami"],
        ["O'Coffee", "São Paulo", "Brazylia", "\u2713", "7 mln drzewek, direct trade do 15+ krajów"],
    ]

    sdata = [seed_headers] + [[Paragraph(c, styles["table_cell"]) for c in r] for r in seed_rows]
    st = Table(sdata, colWidths=["24%", "15%", "12%", "12%", "37%"])
    st.setStyle(make_table_style())
    elems.append(st)

    elems.append(sp(8))

    region_data = [[
        Paragraph("Europa Zach. / Skandynawia", styles["table_cell_bold"]),
        Paragraph("18 palarni", styles["table_cell"]),
        Paragraph("Ameryka Północna", styles["table_cell_bold"]),
        Paragraph("14 palarni", styles["table_cell"]),
    ], [
        Paragraph("Europa Środkowa (Polska)", styles["table_cell_bold"]),
        Paragraph("8 palarni", styles["table_cell"]),
        Paragraph("Azja–Pacyfik", styles["table_cell_bold"]),
        Paragraph("8 palarni", styles["table_cell"]),
    ], [
        Paragraph("Afryka (Etiopia + Kenia)", styles["table_cell_bold"]),
        Paragraph("9 palarni", styles["table_cell"]),
        Paragraph("Ameryka Łacińska", styles["table_cell_bold"]),
        Paragraph("3 palarnie", styles["table_cell"]),
    ]]
    regt = Table(region_data, colWidths=["35%", "15%", "35%", "15%"])
    regt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("BOX", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, LIGHT_GRAY),
        ("LINEAFTER", (1, 0), (1, -1), 0.5, LIGHT_GRAY),
    ]))
    elems.append(regt)
    elems.append(sp(4))
    elems.append(Paragraph("Łącznie: 60 palarni — baza robocza do uzupełnienia przed launchem do 100.", styles["small"]))

    return elems


# ─── PAGE TEMPLATE (header/footer) ───────────────────────────────────────────

def on_page(canvas, doc):
    canvas.saveState()
    W, H = A4

    # Footer line
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(0.8)
    canvas.line(2 * cm, 1.6 * cm, W - 2 * cm, 1.6 * cm)

    # Footer text left
    canvas.setFillColor(TEXT_MED)
    canvas.setFont(FONT_NORMAL, 7.5)
    canvas.drawString(2 * cm, 1.1 * cm, "Roasters Hub  \u2014  Business Overview  \u2014  Dokument poufny")

    # Footer page number right
    canvas.setFont(FONT_BOLD, 7.5)
    canvas.drawRightString(W - 2 * cm, 1.1 * cm, str(doc.page))

    canvas.restoreState()


def on_first_page(canvas, doc):
    pass  # Cover page draws itself


# ─── MAIN ────────────────────────────────────────────────────────────────────

def build_pdf():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    styles = build_styles()

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2.5 * cm,
        title="Roasters Hub — Business Overview",
        author="Roasters Hub",
        subject="Business Overview — For Co-Founders",
    )

    W, H = A4

    story = []

    # Cover page
    story.append(CoverPage(W, H))
    story.append(PageBreak())

    # Sections
    section_builders = [
        section_executive_summary,
        section_market,
        section_competitive,
        section_personas,
        section_value_prop,
        section_business_model,
        section_gtm,
        section_metrics,
        section_risks,
        section_appendix,
    ]

    for i, builder in enumerate(section_builders):
        story.extend(builder(styles))
        if i < len(section_builders) - 1:
            story.append(PageBreak())

    doc.build(story, onFirstPage=on_first_page, onLaterPages=on_page)

    print(f"PDF wygenerowany: {OUTPUT_PATH}")
    size_kb = os.path.getsize(OUTPUT_PATH) // 1024
    print(f"Rozmiar pliku: {size_kb} KB")


if __name__ == "__main__":
    build_pdf()
