---
title: Check a sitemap change with a small Python inventory
summary: Compare two XML sitemap snapshots locally with the Python standard library. The report lists added, removed, unchanged, and duplicate URLs.
tags: Python, Web development, Release checks
source: https://www.sitemaps.org/protocol.html
sourceName: The Sitemaps protocol
contributor: Jake Tao
publishedAt: 2026-11-21T02:45:56.604631+00:00
slug: python-sitemap-release-inventory
---

A release can remove a category's pages while adding the same number of resource pages. The sitemap count stays unchanged. A count check reports a normal-looking result and misses the thing you need to check before promoting the release.

Save the sitemap from the release you are replacing, and save a second copy from the build you want to ship. Compare the URL sets and report duplicates separately. The comparison can run offline. It needs two XML files and the expected hostname, and never follows the URLs that happen to be in the files.

## Treat the sitemap as a declared inventory

The Sitemap protocol puts each URL in a `loc` inside a `url` element. Parse the XML instead of splitting lines or filtering strings. A parser handles namespaced tags, entity escaping, and a generator that minifies its XML. Use an XML sitemap from a trusted build or your own host for this simple tool.

Keep the location string intact after removing surrounding whitespace. For example, `/guide` and `/guide/` may be aliases, but the comparison cannot determine that from XML. If one disappears while the other appears, show both entries. Separately check the redirect and canonical policy before calling it a move.

## Keep duplicate detection beside the set comparison

The example script reads a single URL sitemap and rejects a sitemap index with a clear message. It parses each location as an HTTPS URL on the supplied host. That rejects surprisingly useful mistakes, such as a staging domain copied into the production build. It stores duplicate locations before its set removes them, so a duplicate cannot silently disappear from the report.

```python
import argparse
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET


def inventory(path, expected_host):
    root = ET.parse(path).getroot()
    if root.tag.rsplit("}", 1)[-1] != "urlset":
        raise ValueError(f"{path}: expected a URL sitemap, not a sitemap index")

    urls = set()
    duplicates = set()
    for item in root.findall("{*}url"):
        location = (item.findtext("{*}loc") or "").strip()
        parsed = urlsplit(location)
        if (
            parsed.scheme != "https"
            or parsed.netloc.lower() != expected_host
            or parsed.fragment
        ):
            raise ValueError(f"{path}: unexpected sitemap URL {location!r}")
        if location in urls:
            duplicates.add(location)
        urls.add(location)
    return urls, duplicates


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("host")
    parser.add_argument("before", type=Path)
    parser.add_argument("after", type=Path)
    args = parser.parse_args()
    old, before_duplicates = inventory(args.before, args.host.lower())
    new, after_duplicates = inventory(args.after, args.host.lower())
    for label, values in (
        ("added", new - old),
        ("removed", old - new),
        ("duplicate before", before_duplicates),
        ("duplicate after", after_duplicates),
    ):
        print(f"{label}: {len(values)}")
        for value in sorted(values):
            print(f"  {value}")
    print(f"unchanged: {len(old & new)}")


if __name__ == "__main__":
    main()
```

Save the script as `sitemap_inventory.py`, then run it with two snapshots:

```text
python sitemap_inventory.py example.com before.xml after.xml
added: 1
  https://example.com/resources/new/
removed: 1
  https://example.com/resources/old/
duplicate before: 0
duplicate after: 1
  https://example.com/resources/new/
unchanged: 1
```

The fixture started with one list page and one detail page. The second file kept the list page and repeated its new detail URL twice. This is a deliberately small fixture. It demonstrates that the same number of distinct URLs can hide both a removal and a duplicate.

The two snapshots from [Resource Planet](https://resources.packscena.com/), a small study and creative-resource directory, give a useful second test. We captured the public sitemap twice on November 21, 2026. The first copy held 551 locations. The second held 609. The script found 58 additions, no removals, 551 unchanged URLs, and no duplicates in either file. The difference in counts happened to match the additions in this release. Comparing both sets is what confirmed that the previous URLs were still present. These are observations about the public XML at capture time. Search-engine coverage is a separate check.

## Decide which changes deserve a closer look

Expected category additions are easy to spot in the sorted output. For a route removal, check the release notes or migration list before assuming the URL can disappear. When the removal is intentional and there is a useful replacement, verify the redirect destination and check that the sitemap lists only the intended canonical location.

Keep the release identifier beside each snapshot. If a build later gets rolled back, the team can recover the same two files and rerun the comparison on the exact artifacts that produced the alert. For a site with a sitemap index, collect the child snapshots within that same build, then combine the resulting inventories and detect duplicates across files.

References: [Sitemaps protocol](https://www.sitemaps.org/protocol.html) and [Google Search Central’s sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

Disclosure: Jake Tao operates Resource Planet. An AI assistant helped draft this article and ran the Python example on the example fixtures and the two public sitemap captures.
