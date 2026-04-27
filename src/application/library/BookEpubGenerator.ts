import JSZip from 'jszip';
import type { Book, BookChapter } from '@/domain/library/types';
import { BookExportEntity } from '@/domain/library/entities/BookExport';

export class BookEpubGenerator {
  async generate(book: Book, chapters: BookChapter[], coverImageBuffer?: Buffer): Promise<Buffer> {
    const sorted = [...chapters].sort((a, b) => a.order - b.order);
    const bookId = `urn:uuid:${book.id}`;
    const hasCover = !!coverImageBuffer;

    const zip = new JSZip();

    // mimetype MUST be first entry and MUST be uncompressed (EPUB spec §3.3)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // META-INF
    zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // OEBPS
    zip.file('OEBPS/content.opf', BookExportEntity.buildContentOpf(book, sorted, bookId, hasCover));
    zip.file('OEBPS/toc.xhtml', BookExportEntity.buildTocXhtml(book, sorted));
    zip.file('OEBPS/toc.ncx', BookExportEntity.buildTocNcx(book, sorted, bookId));
    zip.file('OEBPS/Styles/book.css', BookExportEntity.buildEpubCss());

    // Cover image
    if (hasCover && coverImageBuffer) {
      zip.file('OEBPS/Images/cover.jpg', coverImageBuffer);
      zip.file('OEBPS/Text/cover.xhtml', BookExportEntity.buildCoverXhtml(book));
    }

    // Title page
    zip.file('OEBPS/Text/titlepage.xhtml', BookExportEntity.buildTitlePageXhtml(book));

    // Sections (chapters, preface, appendix, etc.)
    for (const ch of sorted) {
      const filename = `section-${String(ch.order).padStart(2, '0')}.xhtml`;
      zip.file(`OEBPS/Text/${filename}`, BookExportEntity.buildChapterXhtml(ch, book.title));
    }

    const arrayBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return Buffer.from(arrayBuffer);
  }
}

export const bookEpubGenerator = new BookEpubGenerator();
