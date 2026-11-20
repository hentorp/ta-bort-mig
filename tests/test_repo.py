"""Offline checks: never open real sites or send removal requests."""
import csv
import os
from pathlib import Path
import subprocess
import tempfile
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

with (ROOT / "sajter.tsv").open(encoding="utf-8", newline="") as handle:
    reader = csv.DictReader(handle, delimiter="\t")
    assert reader.fieldnames == ["namn", "url", "steg"], reader.fieldnames
    rows = list(reader)

assert rows, "sajter.tsv must contain sites"
for row in rows:
    assert all(row.values()), f"Missing value: {row}"
    assert urlsplit(row["url"]).scheme in ("https", "mailto"), row["url"]
    if row["url"].startswith("https:"):
        assert urlsplit(row["url"]).netloc, row["url"]

with tempfile.TemporaryDirectory() as temp:
    temp = Path(temp)
    browser = temp / "fake-browser"
    opened = temp / "opened.txt"
    browser.write_text('#!/bin/sh\nprintf "%s\\n" "$1" >> "$OPENED_URLS"\n')
    browser.chmod(0o755)
    env = {**os.environ, "BROWSER": str(browser), "OPENED_URLS": str(opened)}

    stop = subprocess.run(
        ["bash", str(ROOT / "oppna-sidorna.sh")],
        input="a\n", text=True, capture_output=True, env=env, check=True,
        cwd=ROOT,
    )
    assert opened.read_text().splitlines() == [rows[0]["url"]]
    assert f"Avbrutet efter 1 av {len(rows)} sajter" in stop.stdout

    opened.unlink()
    finish = subprocess.run(
        ["bash", str(ROOT / "oppna-sidorna.sh")],
        input="\n" * len(rows), text=True, capture_output=True,
        env=env, check=True, cwd=ROOT,
    )
    assert opened.read_text().splitlines() == [r["url"] for r in rows]
    assert f"Alla {len(rows)} sajter genomgångna" in finish.stdout

print(f"OK: {len(rows)} sites validated, stop and finish flows passed")
