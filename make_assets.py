# -*- coding: utf-8 -*-
"""
Генератор пиксель-арта для сайта-автомата «Волга.ТОП 2026».
Запуск:  python make_assets.py
Результат: team-site/assets/{img,sprites}/*.png  (нативный размер, масштаб — в CSS
через image-rendering: pixelated).
"""
import math
import os
import random

from PIL import Image, ImageDraw

OUT = os.path.join("team-site", "assets")

# единая палитра сайта
OUTL = (5, 7, 15)
SKIN = (240, 182, 140)
SKIN_D = (198, 138, 100)
WHITE = (245, 245, 240)
GREEN = (57, 255, 106)
GREEN_D = (26, 140, 66)
AMBER = (255, 179, 71)
AMBER_D = (176, 108, 30)
RED = (255, 71, 87)
RED_D = (150, 32, 44)
STEEL = (92, 102, 130)
STEEL_D = (46, 52, 72)
NAVY = (10, 14, 42)


def rgba(c, a=255):
    return (c[0], c[1], c[2], a)


def darker(c, k=0.62):
    return tuple(max(0, min(255, int(v * k))) for v in c[:3])


def lighter(c, k=0.28):
    return tuple(min(255, int(v + (255 - v) * k)) for v in c[:3])


def rect(d, x0, y0, x1, y1, c):
    d.rectangle([x0, y0, x1, y1], fill=c)


def post_process(img):
    """Чистый 1px контур + подсветка сверху/тень снизу. Делает спрайт «честным»."""
    w, h = img.size
    px = img.load()
    src = [[px[x, y] for x in range(w)] for y in range(h)]
    out = [row[:] for row in src]

    for y in range(h):
        for x in range(w):
            c = src[y][x]
            if c[3] == 0:
                # сосед непрозрачный -> контур
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and src[ny][nx][3] > 0:
                        if src[ny][nx][:3] != OUTL:
                            out[y][x] = rgba(OUTL)
                            break

    for y in range(h):
        for x in range(w):
            c = out[y][x]
            if c[3] == 0 or c[:3] == OUTL:
                continue
            below = out[y + 1][x] if y + 1 < h else (0, 0, 0, 0)
            above = out[y - 1][x] if y > 0 else (0, 0, 0, 0)
            col = c[:3]
            if below[3] == 0 or below[:3] == OUTL:
                col = darker(col, 0.58)
            elif above[3] == 0:
                col = lighter(col, 0.18)
            out[y][x] = rgba(col)

    res = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    res.putdata([out[y][x] for y in range(h) for x in range(w)])
    return res


# портреты участников (CHARACTER SELECT)
W = H = 24

VARIANTS = [
    dict(key="mage", skin=SKIN, style="hood", armor=(24, 46, 34), armor_l=(34, 66, 48),
         accent=GREEN, accent_d=(26, 140, 66), eye=GREEN, hair=(36, 90, 58)),
    dict(key="knight", skin=SKIN, style="helm", armor=(58, 62, 86), armor_l=(84, 90, 118),
         accent=AMBER, accent_d=AMBER_D, eye=AMBER, hair=AMBER),
    dict(key="ranger", skin=(214, 158, 116), style="cap", armor=(38, 44, 68), armor_l=(56, 64, 96),
         accent=RED, accent_d=RED_D, eye=(190, 240, 255), hair=(120, 46, 52)),
    dict(key="engineer", skin=(232, 172, 130), style="headset", armor=(46, 40, 64), armor_l=(68, 60, 92),
         accent=GREEN, accent_d=GREEN_D, eye=GREEN, hair=(58, 66, 88)),
]


def draw_portrait(v):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    skin, skin_d = v["skin"], darker(v["skin"], 0.78)
    armor, armor_l = v["armor"], v["armor_l"]

    # плечи и корпус
    d.polygon([(1, 23), (2, 19), (5, 17), (18, 17), (21, 19), (22, 23)], fill=rgba(armor))
    rect(d, 6, 18, 17, 22, rgba(armor_l))
    rect(d, 8, 19, 15, 22, rgba(armor))
    # воротник
    rect(d, 8, 17, 15, 18, rgba(v["accent_d"]))
    # эмблема
    rect(d, 11, 20, 12, 21, rgba(v["accent"]))
    # шея
    rect(d, 10, 14, 13, 17, rgba(skin_d))

    # голова
    rect(d, 8, 5, 15, 14, rgba(skin))
    for cx, cy in ((8, 5), (15, 5)):
        img.putpixel((cx, cy), (0, 0, 0, 0))
    # тень под подбородком
    rect(d, 9, 13, 14, 13, rgba(skin_d))

    if v["style"] == "hood":
        rect(d, 6, 3, 17, 13, rgba(v["accent_d"]))
        d.polygon([(4, 17), (4, 9), (7, 3), (16, 3), (19, 9), (19, 17)],
                  fill=rgba(v["accent_d"]))
        rect(d, 7, 4, 16, 12, rgba(v["accent_d"]))
        rect(d, 8, 7, 15, 14, rgba(skin))          # лицо в капюшоне
        rect(d, 9, 13, 14, 13, rgba(skin_d))
        rect(d, 6, 14, 17, 16, rgba(v["accent_d"]))  # капюшон на плечах
        rect(d, 4, 15, 5, 17, rgba(v["accent_d"]))
        rect(d, 18, 15, 19, 17, rgba(v["accent_d"]))
        rect(d, 6, 3, 17, 4, rgba(lighter(v["accent_d"], 0.25)))
    elif v["style"] == "helm":
        rect(d, 7, 3, 16, 11, rgba(STEEL))
        rect(d, 7, 3, 16, 4, rgba(lighter(STEEL, 0.3)))
        rect(d, 8, 5, 15, 6, rgba(v["accent"]))       # гребень
        rect(d, 8, 8, 15, 9, rgba(OUTL))              # прорезь визора
        rect(d, 10, 8, 11, 9, rgba(v["eye"]))
        rect(d, 13, 8, 14, 9, rgba(v["eye"]))
        rect(d, 6, 10, 7, 13, rgba(STEEL_D))          # науши
        rect(d, 16, 10, 17, 13, rgba(STEEL_D))
        rect(d, 9, 10, 14, 13, rgba(skin))
        rect(d, 9, 12, 14, 13, rgba(skin_d))
    elif v["style"] == "cap":
        rect(d, 8, 4, 15, 7, rgba(v["hair"]))
        rect(d, 6, 5, 17, 7, rgba(v["accent"]))       # кепка
        rect(d, 5, 7, 18, 8, rgba(darker(v["accent"], 0.7)))
        rect(d, 8, 8, 15, 10, rgba(STEEL_D))          # очки-гоггл
        rect(d, 9, 8, 10, 9, rgba(v["eye"]))
        rect(d, 13, 8, 14, 9, rgba(v["eye"]))
        rect(d, 8, 11, 15, 14, rgba(skin))
        rect(d, 10, 12, 13, 12, rgba(skin_d))
        rect(d, 4, 17, 7, 19, rgba(v["accent"]))      # шарф
        rect(d, 16, 17, 19, 19, rgba(v["accent"]))
    else:  # headset
        rect(d, 8, 4, 15, 7, rgba(v["hair"]))
        rect(d, 7, 5, 16, 6, rgba(v["armor_l"]))      # обруч
        rect(d, 4, 7, 6, 13, rgba(v["accent_d"]))     # чашки
        rect(d, 17, 7, 19, 13, rgba(v["accent_d"]))
        rect(d, 5, 9, 5, 11, rgba(v["accent"]))
        rect(d, 18, 9, 18, 11, rgba(v["accent"]))
        rect(d, 7, 8, 16, 10, rgba(STEEL_D))          # визор
        rect(d, 9, 9, 10, 9, rgba(v["eye"]))
        rect(d, 13, 9, 14, 9, rgba(v["eye"]))
        rect(d, 8, 11, 15, 14, rgba(skin))
        rect(d, 10, 13, 13, 13, rgba(skin_d))

    # глаза (для стилей без собственной отрисовки)
    if v["style"] in ("hood",):
        rect(d, 10, 9, 11, 10, rgba(v["eye"]))
        rect(d, 13, 9, 14, 10, rgba(v["eye"]))

    return post_process(img)


# логотип-эмблема: пиксельный картридж
def draw_emblem():
    s = 32
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # корпус картриджа
    rect(d, 6, 2, 25, 25, rgba((38, 40, 58)))
    rect(d, 7, 3, 24, 4, rgba((64, 68, 92)))
    # наклейка
    rect(d, 8, 6, 21, 16, rgba(AMBER_D))
    rect(d, 9, 7, 20, 15, rgba(AMBER))
    rect(d, 9, 7, 20, 8, rgba(lighter(AMBER, 0.32)))
    # PLAY-треугольник на наклейке
    d.polygon([(12, 9), (12, 14), (17, 11)], fill=rgba(GREEN_D))
    d.polygon([(13, 10), (13, 13), (16, 11)], fill=rgba(GREEN))
    # рёбра хвата сбоку корпуса
    for y in range(6, 17, 2):
        rect(d, 22, y, 24, y, rgba((26, 28, 42)))
    # монетоприёмник
    rect(d, 8, 19, 15, 21, rgba((20, 22, 34)))
    rect(d, 9, 20, 14, 20, rgba(AMBER))
    # зелёный индикатор
    rect(d, 18, 19, 20, 21, rgba(GREEN_D))
    rect(d, 19, 19, 19, 20, rgba(GREEN))
    # контакты
    rect(d, 8, 23, 23, 25, rgba((26, 28, 42)))
    for x in range(9, 23, 2):
        rect(d, x, 23, x, 24, rgba(AMBER))
    return post_process(img)


# иконки инвентаря 16x16
def icon_base():
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def icon_sword():
    img, d = icon_base()
    d.polygon([(12, 2), (13, 3), (7, 9), (6, 8)], fill=rgba(STEEL))
    rect(d, 13, 2, 14, 3, rgba(WHITE))
    rect(d, 4, 8, 8, 9, rgba(AMBER))      # гарда
    rect(d, 5, 9, 6, 13, rgba(AMBER_D))   # рукоять
    rect(d, 4, 12, 7, 13, rgba(AMBER))
    return post_process(img)


def icon_shield():
    img, d = icon_base()
    d.polygon([(3, 3), (12, 3), (12, 9), (8, 13), (3, 9)], fill=rgba(STEEL))
    d.polygon([(4, 4), (11, 4), (11, 8), (8, 11), (4, 8)], fill=rgba(GREEN_D))
    rect(d, 6, 4, 9, 4, rgba(GREEN))
    rect(d, 7, 5, 8, 7, rgba(GREEN))
    return post_process(img)


def icon_potion():
    img, d = icon_base()
    rect(d, 6, 3, 9, 4, rgba(WHITE))       # горлышко
    rect(d, 7, 4, 8, 6, rgba(STEEL))
    d.ellipse([4, 6, 11, 13], fill=rgba(RED))
    rect(d, 4, 10, 11, 12, rgba(RED))
    rect(d, 5, 8, 6, 9, rgba(lighter(RED, 0.5)))
    return post_process(img)


def icon_scroll():
    img, d = icon_base()
    rect(d, 4, 3, 11, 12, rgba(WHITE))
    rect(d, 3, 2, 12, 3, rgba(AMBER_D))
    rect(d, 3, 12, 12, 13, rgba(AMBER_D))
    rect(d, 5, 5, 10, 5, rgba(STEEL_D))
    rect(d, 5, 7, 10, 7, rgba(STEEL_D))
    rect(d, 5, 9, 8, 9, rgba(STEEL_D))
    return post_process(img)


def icon_gem():
    img, d = icon_base()
    d.polygon([(8, 2), (13, 5), (8, 14), (3, 5)], fill=rgba(GREEN))
    d.polygon([(8, 2), (13, 5), (8, 7), (3, 5)], fill=rgba(lighter(GREEN, 0.45)))
    rect(d, 7, 8, 8, 11, rgba(GREEN_D))
    return post_process(img)


def icon_key():
    img, d = icon_base()
    d.ellipse([3, 3, 8, 8], fill=rgba(AMBER))
    d.ellipse([5, 5, 6, 6], fill=(0, 0, 0, 0))
    rect(d, 7, 7, 8, 13, rgba(AMBER))
    rect(d, 8, 10, 11, 11, rgba(AMBER))
    rect(d, 8, 12, 10, 13, rgba(AMBER))
    return post_process(img)


def icon_coin():
    img, d = icon_base()
    d.ellipse([3, 2, 12, 13], fill=rgba(AMBER_D))
    d.ellipse([4, 3, 11, 12], fill=rgba(AMBER))
    rect(d, 7, 5, 8, 10, rgba(AMBER_D))
    rect(d, 5, 4, 6, 5, rgba(WHITE))
    return post_process(img)


def icon_lock():
    img, d = icon_base()
    # дужка
    rect(d, 5, 3, 10, 4, rgba((150, 155, 175)))
    rect(d, 4, 4, 4, 7, rgba((150, 155, 175)))
    rect(d, 11, 4, 11, 7, rgba((150, 155, 175)))
    # корпус
    rect(d, 3, 7, 12, 13, rgba((120, 126, 148)))
    rect(d, 4, 8, 11, 12, rgba((150, 155, 175)))
    rect(d, 7, 9, 8, 11, rgba((40, 44, 60)))
    return post_process(img)


def icon_arrow():
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(3, 2), (12, 8), (3, 14), (3, 11), (7, 8), (3, 5)], fill=rgba(AMBER))
    return post_process(img)


# фон уровня: ночной пейзаж с рекой
def draw_landscape():
    w, h = 240, 90
    rnd = random.Random(2026)
    img = Image.new("RGB", (w, h), NAVY)
    d = ImageDraw.Draw(img)

    top, horiz = (6, 8, 26), (20, 30, 70)
    for y in range(h):
        t = min(1.0, y / (h * 0.62))
        c = tuple(int(top[i] + (horiz[i] - top[i]) * t) for i in range(3))
        d.line([(0, y), (w, y)], fill=c)

    # звёзды
    for _ in range(90):
        x = rnd.randrange(0, w)
        y = rnd.randrange(0, 40)
        k = rnd.random()
        if k > 0.85:
            c = WHITE
        elif k > 0.6:
            c = (190, 215, 245)
        else:
            c = (120, 140, 190)
        d.point((x, y), fill=c)
        if k > 0.93:
            d.point((x + 1, y), fill=(90, 110, 160))
            d.point((x, y + 1), fill=(90, 110, 160))

    # луна + ореол
    mx, my, mr = 188, 15, 7
    d.ellipse([mx - mr - 3, my - mr - 3, mx + mr + 3, my + mr + 3], fill=(26, 36, 82))
    d.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=WHITE)
    for cx, cy, cr in ((-2, -2, 1), (2, 1, 2), (-1, 4, 1)):
        d.ellipse([mx + cx - cr, my + cy - cr, mx + cx + cr, my + cy + cr],
                  fill=(222, 228, 240))

    # гребни гор
    def ridge(base, amp, color, rim=None, sharp=1.0):
        pts = []
        x = 0
        y = base
        while x <= w:
            pts.append((x, y))
            step = rnd.randint(4, 11)
            if rnd.random() < 0.55:
                y = base - rnd.randint(0, amp)
            else:
                y = base + rnd.randint(0, int(amp * 0.25) + 1)
            x += step
        pts.append((w, base))
        poly = pts + [(w, h), (0, h)]
        d.polygon(poly, fill=color)
        if rim:
            d.line(pts, fill=rim)
        return pts

    ridge(44, 22, (28, 40, 78), (44, 66, 118))
    ridge(54, 16, (19, 28, 56), (32, 50, 92))
    ridge(63, 12, (13, 22, 40), (22, 62, 44))

    # река: сужается к горизонту
    river = [(112, 52), (128, 52), (176, h), (64, h)]
    d.polygon(river, fill=(26, 48, 96))
    for y in range(53, h):
        t = (y - 52) / (h - 52)
        left = 112 - 48 * t
        right = 128 + 48 * t
        col = (26, 48, 96) if (y // 3) % 2 == 0 else (32, 58, 112)
        d.line([(int(left), y), (int(right), y)], fill=col)
        # блики
        if y % 4 == 0:
            cx = int(left + (right - left) * rnd.uniform(0.15, 0.85))
            ln = rnd.randint(1, 4)
            c = AMBER if rnd.random() < 0.55 else GREEN
            d.line([(cx, y), (cx + ln, y)], fill=c if y > 60 else darker(c, 0.75))
    # отражение луны
    for i in range(8):
        yy = 54 + i * 4
        xx = int(120 + math.sin(i) * 3)
        d.line([(xx, yy), (xx + 3, yy)], fill=lighter(AMBER, 0.5))

    # берёга
    d.polygon([(0, h), (0, 56), (26, 58), (52, 66), (74, h)], fill=(10, 24, 20))
    d.polygon([(w, h), (w, 54), (212, 57), (186, 64), (166, h)], fill=(10, 24, 20))

    # лес
    def tree(x, y, scale, c1, c2):
        for i in range(3):
            ty = y - i * 2 * scale
            half = (3 - i) * scale
            d.polygon([(x - half, ty), (x + half, ty), (x, ty - 3 * scale)], fill=c1)
        d.rectangle([x - scale, y, x + scale, y + 2 * scale], fill=c2)

    for _ in range(26):
        x = rnd.randrange(2, w - 2)
        on_left = x < 108
        base = 58 + int(10 * math.sin(x / 9.0)) if on_left else 60 + int(8 * math.cos(x / 7.0))
        base += rnd.randint(-2, 3)
        tree(x, base, rnd.choice([1, 1, 2]), rnd.choice([(14, 46, 30), (18, 58, 36)]),
             (22, 26, 20))

    # передний план: трава и камыши
    d.rectangle([0, h - 4, w, h], fill=(8, 16, 14))
    for _ in range(40):
        x = rnd.randrange(0, w)
        d.line([(x, h - 4), (x + rnd.randint(-1, 1), h - 4 - rnd.randint(1, 4))],
               fill=(16, 60, 34))
    return img


# заглушка скриншота проекта
def draw_shot_placeholder():
    w, h = 160, 90
    img = Image.new("RGB", (w, h), (16, 22, 34))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w - 1, h - 1], outline=(40, 48, 70))
    d.rectangle([2, 2, w - 3, h - 3], outline=(26, 32, 48))
    d.rectangle([0, 0, w - 1, 6], fill=(26, 32, 48))
    for i, c in enumerate((RED, AMBER, GREEN)):
        d.rectangle([3 + i * 5, 2, 5 + i * 5, 4], fill=c)
    # пиксельная «картинка»-заглушка: солнце и горы
    d.ellipse([62, 18, 98, 54], fill=(58, 66, 96))
    d.polygon([(20, 74), (58, 34), (96, 74)], fill=(44, 52, 78))
    d.polygon([(66, 74), (100, 44), (134, 74)], fill=(38, 46, 70))
    d.polygon([(84, 74), (110, 52), (140, 74)], fill=(32, 40, 62))
    # пиксельный курсор/«нет кадра»
    d.rectangle([70, 62, 90, 64], fill=(70, 80, 110))
    d.rectangle([70, 66, 84, 68], fill=(56, 64, 92))
    return img


def save_img(img, *path):
    p = os.path.join(OUT, *path)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    img.save(p)
    print("saved", p, img.size)


def main():
    for v in VARIANTS:
        save_img(draw_portrait(v), "sprites", f"{v['key']}.png")
    save_img(draw_emblem(), "img", "logo-emblem.png")
    save_img(draw_emblem().resize((16, 16), Image.NEAREST), "img", "favicon.png")
    save_img(draw_landscape(), "img", "level-bg.png")
    save_img(draw_shot_placeholder(), "img", "shot-placeholder.png")
    for name, fn in (("sword", icon_sword), ("shield", icon_shield), ("potion", icon_potion),
                     ("scroll", icon_scroll), ("gem", icon_gem), ("key", icon_key),
                     ("coin", icon_coin), ("lock", icon_lock), ("arrow", icon_arrow)):
        save_img(fn(), "sprites", f"icon-{name}.png")

    # превью-лист для проверки (не используется сайтом)
    sheet = Image.new("RGBA", (24 * 4 + 40, 60), (10, 14, 42, 255))
    for i, v in enumerate(VARIANTS):
        sheet.alpha_composite(draw_portrait(v), (i * 26, 4))
    for i, fn in enumerate((icon_sword, icon_shield, icon_potion, icon_scroll,
                            icon_gem, icon_key, icon_coin, icon_lock, icon_arrow)):
        sheet.alpha_composite(fn(), (i * 18 + 2, 34))
    sheet.alpha_composite(draw_emblem(), (24 * 4 + 8, 4))
    sheet = sheet.resize((sheet.width * 6, sheet.height * 6), Image.NEAREST)
    save_img(sheet, "..", "..", "_preview_sprites.png")


if __name__ == "__main__":
    main()
