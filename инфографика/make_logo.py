# -*- coding: utf-8 -*-
"""
Генератор логотипа команды TATARINNOVATION — строгий вектор, без игрового стиля.
Запуск:  python make_logo.py
Результат: логотип/*.svg, *.png  +  logo-serious.html (лист для выбора)

Геометрия задаётся один раз в примитивах (512×512) и рендерится двумя путями:
в SVG (масштабируется без потерь) и в PNG через Pillow с суперсэмплингом.
"""
import os

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)                      # запускать можно из любой папки

OUT = "логотип"                     # assets\img\logo больше не используется
SHEET = "logo-serious.html"

INK = "#0B1220"      # графит
WHITE = "#FFFFFF"
MUTED = "#8A93A6"
ACCENTS = {"green": "#22C55E", "blue": "#2F6BFF"}

SANS = ("Inter, 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', "
        "Arial, sans-serif")


# ---------------------------------------------------------------- примитивы
def tile(r=104, fill=INK):
    return {"type": "rrect", "x": 0, "y": 0, "w": 512, "h": 512, "r": r, "fill": fill}


def mark_a(accent):
    """Знак A: плитка + монограмма T (белая перекладина, акцентная стойка)."""
    return [
        tile(),
        {"type": "rect", "x": 116, "y": 128, "w": 280, "h": 76, "fill": WHITE},
        {"type": "rect", "x": 214, "y": 204, "w": 84, "h": 180, "fill": accent},
    ]


def mark_a_mono(color):
    """Моно: только монограмма, без плитки."""
    return [
        {"type": "rect", "x": 116, "y": 128, "w": 280, "h": 76, "fill": color},
        {"type": "rect", "x": 214, "y": 204, "w": 84, "h": 180, "fill": color},
    ]


def mark_b(accent):
    """Знак B: круглая печать, T выворотом, тонкое акцентное кольцо."""
    top = (512 - (66 + 156)) // 2
    return [
        {"type": "circle", "cx": 256, "cy": 256, "r": 236, "fill": INK},
        {"type": "ring", "cx": 256, "cy": 256, "r": 192, "w": 9, "fill": accent},
        {"type": "rect", "x": 136, "y": top, "w": 240, "h": 66, "fill": WHITE},
        {"type": "rect", "x": 214, "y": top + 66, "w": 84, "h": 156, "fill": WHITE},
    ]


# ---------------------------------------------------------------- SVG
def prim_svg(p):
    t = p["type"]
    if t == "rect":
        return ('<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>'
                % (p["x"], p["y"], p["w"], p["h"], p["fill"]))
    if t == "rrect":
        return ('<rect x="%d" y="%d" width="%d" height="%d" rx="%d" fill="%s"/>'
                % (p["x"], p["y"], p["w"], p["h"], p["r"], p["fill"]))
    if t == "circle":
        return ('<circle cx="%d" cy="%d" r="%d" fill="%s"/>'
                % (p["cx"], p["cy"], p["r"], p["fill"]))
    if t == "ring":
        return ('<circle cx="%d" cy="%d" r="%d" fill="none" stroke="%s" stroke-width="%d"/>'
                % (p["cx"], p["cy"], p["r"], p["fill"], p["w"]))
    raise ValueError(t)


def svg(prims, path, title="TATARINNOVATION"):
    body = "\n".join(prim_svg(p) for p in prims)
    doc = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" '
           'width="512" height="512" role="img" aria-label="%s">\n'
           '<title>%s</title>\n%s\n</svg>\n' % (title, title, body))
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(doc)


# ---------------------------------------------------------------- PNG
def png(prims, path, size, ss=8):
    big = size * ss
    k = big / 512.0
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for p in prims:
        c = p["fill"]
        if p["type"] == "rect":
            d.rectangle([p["x"] * k, p["y"] * k, (p["x"] + p["w"]) * k, (p["y"] + p["h"]) * k],
                        fill=c)
        elif p["type"] == "rrect":
            d.rounded_rectangle([0, 0, big - 1, big - 1], radius=p["r"] * k, fill=c)
        elif p["type"] == "circle":
            d.ellipse([(p["cx"] - p["r"]) * k, (p["cy"] - p["r"]) * k,
                       (p["cx"] + p["r"]) * k, (p["cy"] + p["r"]) * k], fill=c)
        elif p["type"] == "ring":
            w = p["w"] * k
            r = p["r"] * k
            d.ellipse([p["cx"] * k - r, p["cy"] * k - r, p["cx"] * k + r, p["cy"] * k + r],
                      outline=c, width=max(1, int(round(w))))
    img = img.resize((size, size), Image.LANCZOS)
    img.save(path)


# ---------------------------------------------------------------- лок-апы
def lockup(path, vertical=False, dark=False):
    """Лок-ап: знак + название + подпись. dark=True — версия для тёмного фона."""
    text_c = "#F5F5F0" if dark else INK
    sub_c = "#9AA0B8" if dark else MUTED
    tile_c = "#0E1526" if dark else INK
    stroke = ' stroke="#31405E" stroke-width="4"' if dark else ""
    green = ACCENTS["green"]
    title = "вертикальный" if vertical else "горизонтальный"

    if vertical:
        w, h = 720, 460
        tile = (296, 40)
        name_xy, name_size = (360, 252), 58
        sub_xy, sub_size = (360, 302), 26
        anchor = ' text-anchor="middle"'
        sub_text = "IT-КОМАНДА · КНИТУ-КХТИ"
    else:
        w, h = 900, 200
        tile = (0, 36)
        name_xy, name_size = (172, 106), 60
        sub_xy, sub_size = (174, 148), 22
        anchor = ""
        sub_text = "IT-КОМАНДА · КНИТУ-КХТИ · ВОЛГА.ТОП 2026"

    doc = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"
     width="{w}" height="{h}" role="img" aria-label="TATARINNOVATION">
<title>TATARINNOVATION — {title} лок-ап</title>
<g transform="translate({tile[0]},{tile[1]}) scale(0.25)">
  <rect x="0" y="0" width="512" height="512" rx="104" fill="{tile_c}"{stroke}/>
  <rect x="116" y="128" width="280" height="76" fill="{WHITE}"/>
  <rect x="214" y="204" width="84" height="180" fill="{green}"/>
</g>
<text x="{name_xy[0]}" y="{name_xy[1]}"{anchor} font-family="{SANS}" font-size="{name_size}"
      font-weight="600" letter-spacing="7" fill="{text_c}">TATARINNOVATION</text>
<text x="{sub_xy[0]}" y="{sub_xy[1]}"{anchor} font-family="{SANS}" font-size="{sub_size}"
      font-weight="500" letter-spacing="4.5" fill="{sub_c}">{sub_text}</text>
</svg>
"""
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(doc)


# ---------------------------------------------------------------- лист
def sheet():
    def sizes(key, accent_name, max_px=176):
        out = []
        for px in (176, 96, 48, 32, 24):
            out.append('<figure><img src="логотип/mark-%s-%s.svg" width="%d" '
                       'height="%d" alt=""><figcaption>%d</figcaption></figure>'
                       % (key, accent_name, px, px, px))
        return "".join(out)

    html = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Логотип TATARINNOVATION — варианты</title>
<style>
  :root {
    --ink:#0B1220; --panel:#111A2B; --line:#1E2A3E; --text:#E7EAF0;
    --muted:#8A93A6; --green:#22C55E;
  }
  * { box-sizing:border-box; }
  body {
    margin:0; padding:48px clamp(20px,5vw,72px) 96px; background:#070C16; color:var(--text);
    font-family: Inter, 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  header { border-bottom:1px solid var(--line); padding-bottom:28px; margin-bottom:8px; }
  h1 { font-size:22px; font-weight:600; letter-spacing:.16em; margin:0 0 10px; }
  .sub { color:var(--muted); font-size:14px; letter-spacing:.02em; margin:0; max-width:74ch; line-height:1.7; }
  section { border-bottom:1px solid var(--line); padding:44px 0; }
  h2 { font-size:12px; font-weight:600; letter-spacing:.2em; color:var(--muted); margin:0 0 26px; text-transform:uppercase; }
  .sizes { display:flex; gap:34px; align-items:flex-end; flex-wrap:wrap; }
  .sizes figure { margin:0; text-align:center; }
  .sizes img { display:block; margin:0 auto 10px; }
  .sizes figcaption { font-size:11px; color:var(--muted); letter-spacing:.08em; }
  .split { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:28px; }
  .card { background:var(--panel); border:1px solid var(--line); padding:30px; }
  .card--light { background:#F3F4F6; border-color:#E2E5EA; }
  .card p { margin:14px 0 0; font-size:12px; letter-spacing:.06em; color:var(--muted); }
  .lockup-h { display:flex; align-items:center; gap:22px; }
  .lockup-h img { width:76px; height:76px; }
  .lockup-h .word { font-size:26px; font-weight:600; letter-spacing:.14em; line-height:1.1; }
  .lockup-h .desc { display:block; font-size:10px; font-weight:500; letter-spacing:.24em; color:var(--muted); margin-top:8px; }
  .lockup-v { text-align:center; }
  .lockup-v img { width:92px; height:92px; margin:0 auto 18px; display:block; }
  .lockup-v .word { font-size:20px; font-weight:600; letter-spacing:.2em; display:block; }
  .lockup-v .desc { font-size:10px; letter-spacing:.24em; color:var(--muted); margin-top:10px; display:block; }
  .type-only { font-size:30px; font-weight:600; letter-spacing:.18em; }
  .type-only span { color:var(--green); }
  .type-desc { display:block; font-size:10px; letter-spacing:.26em; color:var(--muted); margin-top:12px; font-weight:500; }
  .palette { display:flex; gap:12px; flex-wrap:wrap; }
  .chip { width:96px; }
  .chip i { display:block; height:52px; border:1px solid var(--line); margin-bottom:8px; }
  .chip b { display:block; font-size:11px; font-weight:500; color:var(--muted); letter-spacing:.06em; }
  .tab { display:inline-flex; align-items:center; gap:10px; background:#111A2B; border:1px solid var(--line);
         padding:9px 16px 9px 10px; font-size:12px; letter-spacing:.04em; }
  .tab img { width:16px; height:16px; }
  footer { margin-top:48px; color:var(--muted); font-size:13px; line-height:1.9; }
  footer b { color:var(--text); font-weight:600; }
  code { color:var(--text); background:#111A2B; border:1px solid var(--line); padding:2px 6px; font-size:12px; }
</style>
</head>
<body>
<header>
  <h1>ЛОГОТИП · TATARINNOVATION</h1>
  <p class="sub">Строгий векторный знак: геометрическая монограмма, один акцент, крупная типографика.
  Пиксель-арт и аркадные мотивы убраны. Ниже — три направления, размеры под интерфейс и печать.</p>
</header>

<section>
  <h2>A · Плитка с монограммой T</h2>
  <div class="sizes">__SIZES_A__</div>
</section>

<section>
  <h2>Тот же знак в синем акценте</h2>
  <div class="sizes">__SIZES_BLUE__</div>
</section>

<section>
  <h2>B · Круглая печать</h2>
  <div class="sizes">__SIZES_SEAL__</div>
</section>

<section>
  <h2>Лок-апы</h2>
  <div class="split">
    <div class="card">
      <div class="lockup-h">
        <img src="логотип/mark-a-green.svg" alt="">
        <div><span class="word">TATARINNOVATION</span>
        <span class="desc">IT-КОМАНДА · КНИТУ-КХТИ · ВОЛГА.ТОП 2026</span></div>
      </div>
      <p>горизонтальный — шапка сайта, презентация, письмо</p>
    </div>
    <div class="card">
      <div class="lockup-v">
        <img src="логотип/mark-a-green.svg" alt="">
        <span class="word">TATARINNOVATION</span>
        <span class="desc">IT-КОМАНДА · КНИТУ-КХТИ</span>
      </div>
      <p>вертикальный — обложка, квадратный аватар, печать</p>
    </div>
    <div class="card">
      <div class="type-only">TATAR<span>·</span>INNOVATION
        <span class="type-desc">ТОЛЬКО ТИПОГРАФИКА · БЕЗ ЗНАКА</span>
      </div>
      <p>если знак не нужен: работают буквы и точка-акцент</p>
    </div>
  </div>
</section>

<section>
  <h2>Моно и светлая подложка</h2>
  <div class="split">
    <div class="card">
      <img src="логотип/mark-a-mono-white.svg" width="96" height="96" alt="">
      <p>моно, белый — тёмные фоны, вышивка, гравировка</p>
    </div>
    <div class="card card--light">
      <img src="логотип/mark-a-mono-ink.svg" width="96" height="96" alt="">
      <p>моно, графит — документы, печать, факс-качество</p>
    </div>
  </div>
</section>

<section>
  <h2>Палитра</h2>
  <div class="palette">
    <div class="chip"><i style="background:#0B1220"></i><b>#0B1220 графит</b></div>
    <div class="chip"><i style="background:#22C55E"></i><b>#22C55E акцент</b></div>
    <div class="chip"><i style="background:#2F6BFF"></i><b>#2F6BFF альтернатива</b></div>
    <div class="chip"><i style="background:#8A93A6"></i><b>#8A93A6 подписи</b></div>
    <div class="chip"><i style="background:#FFFFFF"></i><b>#FFFFFF</b></div>
  </div>
</section>

<section>
  <h2>Как это выглядит во вкладке</h2>
  <div class="tab"><img src="логотип/favicon-32.png" alt="">TATARINNOVATION — сайт команды</div>
</section>

<footer>
  <b>Что дальше:</b> скажите «A» или «B» и цвет — зелёный или синий. Поставлю знак в шапку сайта
  вместо пиксельной эмблемы, сделаю favicon и соберу нужные размеры.<br>
  Пересборка: <code>python make_logo.py</code>
</footer>
</body>
</html>
"""
    html = (html.replace("__SIZES_A__", sizes("a", "green"))
                .replace("__SIZES_BLUE__", sizes("a", "blue"))
                .replace("__SIZES_SEAL__", sizes("b", "green")))
    with open(SHEET, "w", encoding="utf-8") as fh:
        fh.write(html)


def main():
    os.makedirs(OUT, exist_ok=True)

    for name, accent in ACCENTS.items():
        prims = mark_a(accent)
        svg(prims, os.path.join(OUT, "mark-a-%s.svg" % name))
        for px in (512, 128, 64, 32):
            png(prims, os.path.join(OUT, "mark-a-%s-%d.png" % (name, px)), px)

    seal = mark_b(ACCENTS["green"])
    svg(seal, os.path.join(OUT, "mark-b-green.svg"))
    for px in (512, 128):
        png(seal, os.path.join(OUT, "mark-b-green-%d.png" % px), px)

    for name, color in (("ink", INK), ("white", WHITE)):
        mono = mark_a_mono(color)
        svg(mono, os.path.join(OUT, "mark-a-mono-%s.svg" % name))
        png(mono, os.path.join(OUT, "mark-a-mono-%s-512.png" % name), 512)

    png(mark_a(ACCENTS["green"]), os.path.join(OUT, "favicon-32.png"), 32)

    for dark in (False, True):
        suffix = "-dark" if dark else ""
        lockup(os.path.join(OUT, "lockup-h%s.svg" % suffix), vertical=False, dark=dark)
        lockup(os.path.join(OUT, "lockup-v%s.svg" % suffix), vertical=True, dark=dark)

    sheet()
    print("Готово: %s и %s" % (OUT, SHEET))


if __name__ == "__main__":
    main()
