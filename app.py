import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template
import urllib.request
import urllib.error

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
ATOM_NS = "http://www.w3.org/2005/Atom"


def fetch_release_notes():
    """Fetch and parse the BigQuery Atom release-notes feed."""
    try:
        req = urllib.request.Request(
            FEED_URL,
            headers={"User-Agent": "BigQuery-Release-Notes-Viewer/1.0"},
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            xml_bytes = response.read()
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Failed to fetch feed: {exc}") from exc

    root = ET.fromstring(xml_bytes)
    entries = []

    for entry in root.findall(f"{{{ATOM_NS}}}entry"):
        title_el = entry.find(f"{{{ATOM_NS}}}title")
        updated_el = entry.find(f"{{{ATOM_NS}}}updated")
        link_el = entry.find(f"{{{ATOM_NS}}}link[@rel='alternate']")
        content_el = entry.find(f"{{{ATOM_NS}}}content")

        title = title_el.text.strip() if title_el is not None and title_el.text else ""
        updated = (
            updated_el.text.strip() if updated_el is not None and updated_el.text else ""
        )
        link = link_el.get("href", "") if link_el is not None else ""
        content_html = (
            content_el.text.strip() if content_el is not None and content_el.text else ""
        )

        entries.append(
            {
                "title": title,
                "updated": updated,
                "link": link,
                "content": content_html,
            }
        )

    return entries


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/release-notes")
def release_notes():
    try:
        entries = fetch_release_notes()
        return jsonify({"status": "ok", "entries": entries})
    except RuntimeError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 502


if __name__ == "__main__":
    app.run(debug=True, port=5000)
