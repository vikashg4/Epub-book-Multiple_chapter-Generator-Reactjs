import React, { useState } from "react";
import JSZip from "jszip";
import './Epubgen.css'
function EpubGenerator() {
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [chapters, setChapters] = useState([{ heading: "", content: "" }]);

  const generateEpub = async () => {
    const contentFiles = chapters.map((chapter, index) => {
      return `
        <?xml version="1.0" encoding="UTF-8"?>
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
          </head>
          <body>
            <h2>${chapter.heading}</h2>  
            <p>${chapter.content}</p>  
          </body>
        </html>
      `;
    });

    const tocItems = chapters.map((chapter, index) => {
      return `
        <navPoint id="navpoint-${index + 1}" playOrder="${index + 1}">
          <navLabel>
            <text>${chapter.heading}</text>
          </navLabel>
          <content src="contentdata-${index}.xhtml" />
        </navPoint>
      `;
    });

    const contentfile = `
      <?xml version="1.0" encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>${bookName}</dc:title>
          <dc:creator>${author}</dc:creator>
          <meta property="rendition:layout">reflowable</meta>
        </metadata>
        <manifest>
          <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
          ${chapters
            .map(
              (_, index) => `
            <item id="contentdata-${index}" href="contentdata-${index}.xhtml" media-type="application/xhtml+xml" />
          `
            )
            .join("")}
        </manifest>
        <spine toc="ncx">
          ${chapters
            .map(
              (_, index) => `
            <itemref idref="contentdata-${index}" />
          `
            )
            .join("")}
        </spine>
        <guide>
          <reference type="cover" title="Cover" href="contentdata-0.xhtml" />
        </guide>
      </package>`;

    const toc = `<?xml version="1.0" encoding="UTF-8"?>
      <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
        <head>
          <meta name="dtb:uid" content="urn:uuid:1234567890" />
          <meta name="dtb:depth" content="1" />
          <meta name="dtb:totalPageCount" content="0" />
          <meta name="dtb:maxPageNumber" content="0" />
        </head>
        <docTitle>
          <text>${bookName}</text>
        </docTitle>
        <navMap>
          ${tocItems.join("")}
        </navMap>
      </ncx>`;

    const zip = new JSZip();

    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file(
      "META-INF/container.xml",
      `<?xml version="1.0" ?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
          <rootfiles>
            <rootfile full-path="OEBPS/package.opf" media-type="application/oebps-package+xml" />
          </rootfiles>
        </container>`
    );

    chapters.forEach((chapter, index) => {
      zip.file(`OEBPS/contentdata-${index}.xhtml`, contentFiles[index].trim());
    });
    zip.file("OEBPS/package.opf", contentfile.trim());
    zip.file("OEBPS/toc.ncx", toc.trim());
    zip.generateAsync({ type: "blob" }).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${bookName}.epub`;
      a.click();
    });
  };

  const addChapter = () => {
    setChapters([...chapters, { heading: "", content: "" }]);
  };

  const removeChapter = (indexToRemove) => {
    const updatedChapters = chapters.filter((_, index) => index !== indexToRemove);
    setChapters(updatedChapters);
  };

  
  return (
    <div className="container  shadow p-4 mt-5 bgcolor shadow-box "
    style={{  boxShadow: '10px 10px 5px 12px lightblue' 
    }}
    >
      <h3 className="pb-3 text-center ">Epub Generator</h3>

      <div class="row justify-content-around">
        <div class="col-4">
          <input
            className="form-control"
            type="text"
            placeholder="Enter Book Name"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
          />
        </div>
        <div class="col-4">
          <input
            className="form-control"
            type="text"
            placeholder="Enter Writter Name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
      </div>

      {chapters.map((chapter, index) => (
  <div className="mb-3 mt-4 pt-2" key={index}>
    <input
      className="form-control mb-2"
      id={`heading-${index}`}
      placeholder={`Enter Heading for Chapter ${index + 1}`}
      value={chapter.heading}
      onChange={(e) => {
        const updatedChapters = [...chapters];
        updatedChapters[index].heading = e.target.value;
        setChapters(updatedChapters);
      }}
    />
    <textarea
      className="form-control"
      id={`content-${index}`}
      placeholder={`Enter Content for Chapter ${index + 1}`}
      value={chapter.content}
      onChange={(e) => {
        const updatedChapters = [...chapters];
        updatedChapters[index].content = e.target.value;
        setChapters(updatedChapters);
      }}
      style={{ minHeight: "50vh" }}
    />
    <button className="btn btn-danger mt-2" onClick={() => removeChapter(index)}
    style={{borderRadius:10}}
    >
      Remove Chapter
    </button>
  </div>
))}


    <div className="pt-5">

    <button
          className="btn btn-primary  "
          onClick={addChapter}
          style={{ borderRadius:10}}
        >
          Add Chapter
        </button>

        <button
          className="btn btn-primary "
          onClick={generateEpub}
          style={{ float: "right" , borderRadius:10  }}
        >
          Generate Epub
        </button>

    </div>
 

    </div>
  );
}

export default EpubGenerator;
