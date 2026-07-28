from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse


ALLOWED_TAGS = {
    "p",
    "br",
    "strong",
    "em",
    "s",
    "h1",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "ul",
    "ol",
    "li",
    "pre",
    "code",
    "a",
    "hr",
}
VOID_TAGS = {"br", "hr"}
SUPPRESSED_TAGS = {"script", "style", "iframe", "object", "embed", "svg", "math"}


def _safe_url(value: str) -> bool:
    parsed = urlparse(value.strip())
    return not parsed.scheme or parsed.scheme.lower() in {"http", "https", "mailto"}


class _Sanitizer(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.suppressed_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in SUPPRESSED_TAGS:
            self.suppressed_depth += 1
            return
        if self.suppressed_depth or tag not in ALLOWED_TAGS:
            return
        rendered_attrs = ""
        if tag == "a":
            href = next((value for name, value in attrs if name.lower() == "href"), None)
            if href and _safe_url(href):
                rendered_attrs = (
                    f' href="{escape(href, quote=True)}" rel="nofollow noopener noreferrer"'
                )
        self.parts.append(f"<{tag}{rendered_attrs}>")

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag.lower() not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in SUPPRESSED_TAGS:
            self.suppressed_depth = max(0, self.suppressed_depth - 1)
            return
        if not self.suppressed_depth and tag in ALLOWED_TAGS and tag not in VOID_TAGS:
            self.parts.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        if not self.suppressed_depth:
            self.parts.append(escape(data))


def sanitize_editorial_html(content: str) -> str:
    sanitizer = _Sanitizer()
    sanitizer.feed(content)
    sanitizer.close()
    return "".join(sanitizer.parts).strip()
