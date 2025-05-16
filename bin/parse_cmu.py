import json
from pathlib import Path

# paths
DICT_PATH = Path(__file__).resolve().parent.parent / "data" / "cmudict-0.7b.txt"
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "cmudict-0.7b.json"

ARPAVOWELS = {
    "AA", "AE", "AH", "AO", "AW", "AY",
    "EH", "ER", "EY", "IH", "IY",
    "OW", "OY", "UH", "UW"
}

def parse_cmudict(path):
    cmu = {}
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if line.startswith(";;;"):
                continue
            word, *phonemes = line.strip().split()
            word = word.split('(')[0]  # remove variant suffix
            cmu.setdefault(word, []).append(phonemes)
    return cmu

def count_syllables(phonemes):
    return sum(1 for p in phonemes if p.strip("012") in ARPAVOWELS)

def main():
    print(f"parsing cmudict from {DICT_PATH}...")
    raw = parse_cmudict(DICT_PATH)

    reduced = {
        word: count_syllables(phonemes[0])
        for word, phonemes in raw.items()
    }

    print(f"writing output to {OUT_PATH}...")
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(reduced, f, indent=2)

    print("done.")

if __name__ == "__main__":
    main()
