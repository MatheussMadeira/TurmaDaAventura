"""
Gera public/fonts/Fraunces-Italic-subset.woff2 a partir da Fraunces itálica variável (original intocado).

Só o .tagline usa a itálica (Fraunces 400, opsz 36, SOFT 100, WONK 0 — ver tokens.json), então:
  1. instancer fixa wght=400, opsz=36, SOFT=100, WONK=0 (some o fvar: fonte estática);
  2. subset para Latin básico + acentos do português;
  3. woff2.

Uso: python scripts/build-fonts.py   (requer: pip install fonttools brotli)
"""
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/fonts/Fraunces-Variable-Italic.woff2"
OUT = ROOT / "public/fonts/Fraunces-Italic-subset.woff2"

UNICODES = (
    list(range(0x0000, 0x0100))  # U+0000-00FF
    + [0x0131, 0x0152, 0x0153, 0x02C6]
    + [0x2013, 0x2014]
    + list(range(0x2018, 0x201F))  # U+2018-201E
    + [0x2026]
)

font = TTFont(SRC)
font = instancer.instantiateVariableFont(font, {"wght": 400, "opsz": 36, "SOFT": 100, "WONK": 0})

options = subset.Options()
options.flavor = "woff2"
options.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk"]
options.name_IDs = [1, 2, 3, 4, 6]
options.notdef_outline = True
options.drop_tables += ["DSIG"]

subsetter = subset.Subsetter(options)
subsetter.populate(unicodes=UNICODES)
subsetter.subset(font)
font.flavor = "woff2"
font.save(OUT)

print(f"{SRC.name}: {SRC.stat().st_size / 1024:.0f} KB -> {OUT.name}: {OUT.stat().st_size / 1024:.1f} KB")
