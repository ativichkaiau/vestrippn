"""Draw the drug cards' skeletal formulas.

Reads content/drugs/drugs.json and writes content/drugs/structures.json: for
each drug with a SMILES, 2D coordinates from RDKit (CoordGen) turned into
plain line, wedge, hash and label geometry that components/system/Structure
draws as SVG in the text colour, the same way as the dexmedetomidine
watermark. Also records the formula and molar mass RDKit computes, so the
cards never carry a hand-typed formula.

    pip install rdkit
    python scripts/generate-drug-structures.py
"""

import json
import math
import pathlib

from rdkit import Chem
from rdkit.Chem import Descriptors, rdDepictor, rdMolDescriptors

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "content/drugs/drugs.json"
TARGET = ROOT / "content/drugs/structures.json"

SCALE = 40  # px per Å-ish CoordGen unit
PAD = 22
LABEL_GAP = 9  # keep bonds off atom labels
DOUBLE_OFFSET = 5
INNER_TRIM = 0.16
SUB = str.maketrans("0123456789+-", "₀₁₂₃₄₅₆₇₈₉⁺⁻")


def label_for(atom):
    symbol = atom.GetSymbol()
    charge = atom.GetFormalCharge()
    hs = atom.GetTotalNumHs()
    if symbol == "C" and charge == 0:
        return None
    text = symbol
    if hs:
        text += "H" + (str(hs).translate(SUB) if hs > 1 else "")
    if charge:
        text += ("+" if charge > 0 else "-").translate(SUB)
    return text


def shrink(p, q, d):
    dx, dy = q[0] - p[0], q[1] - p[1]
    length = math.hypot(dx, dy)
    return (p[0] + dx / length * d, p[1] + dy / length * d)


def r(v):
    return round(v, 1)


def draw(smiles):
    mol = Chem.MolFromSmiles(smiles)
    formula = rdMolDescriptors.CalcMolFormula(mol)
    mass = round(Descriptors.MolWt(mol), 2)
    rdDepictor.SetPreferCoordGen(True)
    rdDepictor.Compute2DCoords(mol)
    Chem.Kekulize(mol, clearAromaticFlags=True)
    Chem.WedgeMolBonds(mol, mol.GetConformer())
    conf = mol.GetConformer()
    pts = {}
    for atom in mol.GetAtoms():
        pos = conf.GetAtomPosition(atom.GetIdx())
        pts[atom.GetIdx()] = (pos.x * SCALE, -pos.y * SCALE)
    xs = [p[0] for p in pts.values()]
    ys = [p[1] for p in pts.values()]
    minx, miny = min(xs) - PAD, min(ys) - PAD
    pts = {k: (x - minx, y - miny) for k, (x, y) in pts.items()}
    width = r(max(xs) - min(xs) + 2 * PAD)
    height = r(max(ys) - min(ys) + 2 * PAD)

    labels = {a.GetIdx(): label_for(a) for a in mol.GetAtoms()}
    labels = {k: v for k, v in labels.items() if v}
    rings = [set(ring) for ring in mol.GetRingInfo().AtomRings()]

    def ring_centre(i, j):
        candidates = [ring for ring in rings if i in ring and j in ring]
        if not candidates:
            return None
        ring = min(candidates, key=len)
        return (sum(pts[k][0] for k in ring) / len(ring), sum(pts[k][1] for k in ring) / len(ring))

    lines, wedges, hashes = [], [], []
    for bond in mol.GetBonds():
        i, j = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
        p, q = pts[i], pts[j]
        if i in labels:
            p = shrink(p, q, LABEL_GAP)
        if j in labels:
            q = shrink(q, p, LABEL_GAP)
        dx, dy = q[0] - p[0], q[1] - p[1]
        length = math.hypot(dx, dy)
        nx, ny = -dy / length, dx / length
        direction = str(bond.GetBondDir())
        if direction == "BEGINWEDGE":
            wedges.append([r(p[0]), r(p[1]), r(q[0] + nx * 3.5), r(q[1] + ny * 3.5), r(q[0] - nx * 3.5), r(q[1] - ny * 3.5)])
            continue
        if direction == "BEGINDASH":
            steps = 6
            for s in range(1, steps + 1):
                t = s / steps
                half = 3.5 * t
                cx, cy = p[0] + dx * t, p[1] + dy * t
                hashes.append([r(cx + nx * half), r(cy + ny * half), r(cx - nx * half), r(cy - ny * half)])
            continue
        kind = str(bond.GetBondType())
        if kind == "DOUBLE":
            centre = ring_centre(i, j)
            if centre:
                # Ring double bond: full line plus a shorter inner line.
                lines.append([r(p[0]), r(p[1]), r(q[0]), r(q[1])])
                mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
                if (centre[0] - mx) * nx + (centre[1] - my) * ny < 0:
                    nx, ny = -nx, -ny
                a = (p[0] + dx * INNER_TRIM + nx * DOUBLE_OFFSET, p[1] + dy * INNER_TRIM + ny * DOUBLE_OFFSET)
                b = (q[0] - dx * INNER_TRIM + nx * DOUBLE_OFFSET, q[1] - dy * INNER_TRIM + ny * DOUBLE_OFFSET)
                lines.append([r(a[0]), r(a[1]), r(b[0]), r(b[1])])
            else:
                # Chain double bond: two lines either side of the axis.
                h = DOUBLE_OFFSET / 2
                lines.append([r(p[0] + nx * h), r(p[1] + ny * h), r(q[0] + nx * h), r(q[1] + ny * h)])
                lines.append([r(p[0] - nx * h), r(p[1] - ny * h), r(q[0] - nx * h), r(q[1] - ny * h)])
        elif kind == "TRIPLE":
            for k in (-1, 0, 1):
                lines.append([r(p[0] + nx * DOUBLE_OFFSET * k), r(p[1] + ny * DOUBLE_OFFSET * k), r(q[0] + nx * DOUBLE_OFFSET * k), r(q[1] + ny * DOUBLE_OFFSET * k)])
        else:
            lines.append([r(p[0]), r(p[1]), r(q[0]), r(q[1])])

    text = [[r(pts[k][0]), r(pts[k][1]), v] for k, v in labels.items()]
    return {
        "formula": formula,
        "mass": mass,
        "width": width,
        "height": height,
        "lines": lines,
        "wedges": wedges,
        "hashes": hashes,
        "labels": text,
    }


def main():
    catalog = json.loads(SOURCE.read_text())
    out = {}
    for drug in catalog["drugs"]:
        if drug.get("smiles"):
            out[drug["slug"]] = draw(drug["smiles"])
    TARGET.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"{len(out)} structures -> {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
