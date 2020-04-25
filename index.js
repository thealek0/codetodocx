const fs = require("fs");
const util = require("util");
const path = require("path");
const args = require("args-parser")(process.argv)
const recursiveReaddir = require("recursive-readdir");
const { Paragraph, Packer, Document, TextRun, HeadingLevel } = require("docx");

const readDirRecursive = util.promisify(recursiveReaddir);
const fsReadFile = util.promisify(fs.readFile);
const fsWriteFile = util.promisify(fs.writeFile);

if (!args.dir) {
  console.warn('--dir is required');
  process.exit(0);
}

const INCLUDE_EXT = args.includeExt && args.includeExt.split(',') || [];
const EXCLUDE_DIR = args.excludeDir && args.excludeDir.split(',') || [];
const ROOT_DIR = args.dir;
const EXCLUDE_PART_PATH = args.excludePartPath || '';

async function processing() {
  try {
    const paths = await readDirRecursive(ROOT_DIR, [
      ...EXCLUDE_DIR,
      function (file, stats) {
        return stats.isFile() && !INCLUDE_EXT.includes(path.extname(file));
      },
    ]);

    const preparedObjs = await Promise.all(
      paths.map(async (path) => {
        const code = await fsReadFile(path, "utf8");
        return {
          path: path.replace(EXCLUDE_PART_PATH, ''),
          code,
        };
      })
    );

    const paragraphs = [];

    preparedObjs.forEach((item) => {
      const linesArr = item.code.split("\n");
      paragraphs.push(
        new Paragraph({
          text: item.path,
          heading: HeadingLevel.HEADING_4,
          border: {
            bottom: {
              color: "auto",
              space: 1,
              value: "single",
              size: 3,
            },
          },
        }),
        new Paragraph("\n"),
        ...linesArr.map(
          (str) =>
            new Paragraph({
              children: [new TextRun({ text: str, font: "source sans pro" })],
            })
        )
      );
    });

    const document = new Document();
    document.addSection({
      children: paragraphs,
    });

    const docBuffer = await Packer.toBuffer(document);
    return fsWriteFile(path.resolve(__dirname, "output.docx"), docBuffer);
  } catch (error) {
    console.log(error);
  }
}

processing().then();
