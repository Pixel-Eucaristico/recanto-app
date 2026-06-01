import JSZip from 'jszip';
import { bookEpubImporter } from '@/application/library/BookEpubImporter';

async function buildEpub(): Promise<File> {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Livro de Teste</dc:title>
    <dc:creator>Autora</dc:creator>
    <dc:language>pt-BR</dc:language>
    <dc:description>Descrição curta.</dc:description>
    <dc:date>2024-01-01</dc:date>
    <dc:identifier>9781234567890</dc:identifier>
    <meta name="cover" content="cover-img"/>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="c1" href="Text/chapter-1.xhtml" media-type="application/xhtml+xml"/>
    <item id="c2" href="Text/chapter-2.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover-img" href="Images/cover.jpg" media-type="image/jpeg"/>
    <item id="back-cover-img" href="Images/back-cover.jpg" media-type="image/jpeg"/>
  </manifest>
  <spine>
    <itemref idref="nav" linear="no"/>
    <itemref idref="c1"/>
    <itemref idref="c2"/>
  </spine>
</package>`);
  zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <body>
    <nav epub:type="toc">
      <ol>
        <li><a href="Text/chapter-1.xhtml">Título pelo NAV</a></li>
        <li><a href="Text/chapter-2.xhtml">Segundo pelo NAV</a></li>
      </ol>
    </nav>
  </body>
</html>`);
  zip.file('OEBPS/Text/chapter-1.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <body>
    <h1>Introdução</h1>
    <p>Um <strong>parágrafo</strong> com <em>ênfase</em>.<a href="#fn1">1</a></p>
    <blockquote><p>Uma citação.</p></blockquote>
    <aside id="fn1" epub:type="footnote">
      <p>Nota importada <a href="#ref1">voltar</a>.</p>
    </aside>
  </body>
</html>`);
  zip.file('OEBPS/Text/chapter-2.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <body>
    <h1>Capítulo Primeiro</h1>
    <ul><li>Item A</li><li>Item B</li></ul>
    <table>
      <thead><tr><th>Ano</th><th>Evento</th></tr></thead>
      <tbody><tr><td>1567</td><td>Nascimento</td></tr></tbody>
    </table>
  </body>
</html>`);
  zip.file('OEBPS/Images/cover.jpg', new Uint8Array([1, 2, 3]));
  zip.file('OEBPS/Images/back-cover.jpg', new Uint8Array([4, 5, 6]));

  const buffer = await zip.generateAsync({ type: 'arraybuffer' });
  return new File([buffer], 'book.epub', { type: 'application/epub+zip' });
}

describe('BookEpubImporter', () => {
  it('converte metadata, spine e XHTML em rascunho de livro', async () => {
    const draft = await bookEpubImporter.parse(await buildEpub());

    expect(draft.title).toBe('Livro de Teste');
    expect(draft.author).toBe('Autora');
    expect(draft.language).toBe('pt-BR');
    expect(draft.isbn).toBe('9781234567890');
    expect(draft.year).toBe(2024);
    expect(draft.coverImage?.file.name).toBe('cover.jpg');
    expect(draft.coverImage?.mediaType).toBe('image/jpeg');
    expect(draft.backCoverImage?.file.name).toBe('back-cover.jpg');
    expect(draft.chapters).toHaveLength(2);
    expect(draft.chapters[0]).toMatchObject({ title: 'Título pelo NAV', kind: 'chapter' });
    expect(draft.chapters[0].blocks.map(block => block.kind)).toEqual(['heading', 'paragraph', 'quote']);
    expect(draft.chapters[0].blocks[1].content).toContain('[^1]');
    expect(draft.chapters[0].footnotes).toEqual([
      expect.objectContaining({ number: 1, content: 'Nota importada .' }),
    ]);
    expect(draft.chapters[1].blocks.map(block => block.kind)).toEqual(['heading', 'list', 'paragraph']);
    expect(draft.chapters[1].blocks[2].content).toContain('| Ano | Evento |');
  });
});
