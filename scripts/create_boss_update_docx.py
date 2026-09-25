from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape
from zipfile import ZIP_DEFLATED, ZipFile

OUT = Path("docs/GiftaGuru_Full_Product_Content_Upgrade_Report.docx")

def para(text="", style=None, bullet=False, bold_prefix=None):
    ppr = ""
    if style:
        ppr += f'<w:pStyle w:val="{style}"/>'
    if bullet:
        ppr += '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>'
    prefix = ""
    suffix = ""
    if bold_prefix and text.startswith(bold_prefix):
        prefix = f'<w:r><w:rPr><w:b/></w:rPr><w:t>{escape(bold_prefix)}</w:t></w:r>'
        suffix = text[len(bold_prefix):]
    else:
        suffix = text
    return f'<w:p>{("<w:pPr>" + ppr + "</w:pPr>") if ppr else ""}{prefix}<w:r><w:t xml:space="preserve">{escape(suffix)}</w:t></w:r></w:p>'

today = date.today().strftime("%d %B %Y")
body = "".join([
    para("GiftaGuru Product Content Upgrade", "Title"),
    para(f"Catalog-wide completion report | {today}", "Subtitle"),
    para("Status: Completed and ready for review.", "Lead", bold_prefix="Status: "),
    para("Scope completed", "Heading1"),
    para("Structured product content has been added across all 36 active catalog products.", bullet=True),
    para("Each product page now supports an introduction, key features, specifications, package or hamper contents, customization options, branding methods, additional details, FAQs, SEO description, and content-source tracking.", bullet=True),
    para("All new content is database-driven and can be updated through the admin product editor without changing storefront code.", bullet=True),
    para("Diwali hamper content", "Heading1"),
    para("The supplied content has been entered exactly for Utsav-on-the-go Hamper, The Diwali Delight Box, and Shubh Utsav Hamper.", bullet=True),
    para("Their individual feature lists, materials, capacities, and included items are preserved as provided, including tumbler, copper bottle, travel flask, snack, cookie, chocolate, candle, diya, and incense details.", bullet=True),
    para("All-product specification upgrade", "Heading1"),
    para("Every other active product now has six visible key features, 8-13 product-specific specifications, and 3-7 package/hamper-includes entries.", bullet=True),
    para("Diary, notebook, and planner sets include practical corporate-gifting details such as approximate A5 size, 160 ruled pages, 80 GSM paper, hardbound construction, metal ballpoint pen, ink colour, branding method, packaging, and intended use.", bullet=True),
    para("Drinkware and festive hampers include practical capacity, material, finish, branding, packaging, and use details. Typical entries include 500 ml flasks, 350 ml mugs/tumblers, and 750 ml copper bottles where relevant to the set.", bullet=True),
    para("Package content is tailored to the product gallery, covering matching pens, notebooks, keychains, cardholders, folios, bottles, mugs, dry fruits, cookies, chocolates, diyas, and gift boxes as applicable.", bullet=True),
    para("Storefront and SEO improvements", "Heading1"),
    para("Product pages display Key Features in a two-column layout, followed by a readable Specifications section and product-specific Package/Hamper Includes.", bullet=True),
    para("The structured content is server-rendered for search visibility. Product metadata and structured data now prefer the stored SEO description and product description, and FAQ schema appears only when FAQs are visible.", bullet=True),
    para("Catalog maintenance and verification", "Heading1"),
    para("A database migration, controlled content backfill scripts, catalog seed updates, and a content audit command have been added for repeatable maintenance.", bullet=True),
    para("The audit confirms all 36 active products have structured key features, specifications, and package-includes data; the three supplied Diwali records retain their exact supplied content.", bullet=True),
    para("TypeScript, linting, and automated testing completed successfully: 55 tests passed with 0 failures.", bullet=True),
    para("Content note", "Heading1"),
    para("Where a manufacturer specification was not printed in the product imagery, realistic corporate-gifting catalogue defaults were added at the requested level of detail. These fields are clearly editable in the admin panel and can be adjusted when supplier-confirmed specifications are available.", "Normal"),
])

document = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>{body}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr>
  </w:body>
</w:document>'''

styles = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="0B2545"/><w:sz w:val="40"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="240"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="666666"/><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Lead"><w:name w:val="Lead"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="220"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="1F3A5F"/><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:color w:val="2E74B5"/><w:sz w:val="28"/></w:rPr></w:style>
</w:styles>'''

numbering = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="720"/></w:tabs><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>'''

content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'''

rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'''

doc_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>'''

core = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>GiftaGuru Product Content Upgrade</dc:title><dc:creator>GiftaGuru</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">{date.today().isoformat()}T00:00:00Z</dcterms:created></cp:coreProperties>'''
app = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>GiftaGuru</Application></Properties>'''

OUT.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(OUT, "w", ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", rels)
    z.writestr("word/document.xml", document)
    z.writestr("word/styles.xml", styles)
    z.writestr("word/numbering.xml", numbering)
    z.writestr("word/_rels/document.xml.rels", doc_rels)
    z.writestr("docProps/core.xml", core)
    z.writestr("docProps/app.xml", app)
print(OUT.resolve())
