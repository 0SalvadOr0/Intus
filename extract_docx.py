import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text_from_docx(filename):
    try:
        with zipfile.ZipFile(filename, 'r') as docx_file:
            # Extract the main document content
            document_xml = docx_file.read('word/document.xml')
            
            # Parse the XML
            root = ET.fromstring(document_xml)
            
            # Namespace for Word documents
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Extract text content from paragraphs
            paragraphs = []
            for p in root.findall('.//w:p', ns):
                paragraph_text = []
                for r in p.findall('.//w:r', ns):
                    for t in r.findall('.//w:t', ns):
                        if t.text:
                            paragraph_text.append(t.text)
                if paragraph_text:
                    paragraphs.append(''.join(paragraph_text))
            
            return '\n'.join(paragraphs)
            
    except Exception as e:
        return f'Error extracting content: {e}'

if __name__ == '__main__':
    content = extract_text_from_docx('cronistoria.docx')
    print(content)
