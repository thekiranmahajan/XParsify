import fs from "fs";
import { parseAsync } from "json2csv";
import exceljs from "exceljs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import path from "path";

export const convertToCSV = async (data) => {
  try {
    return await parseAsync(data, { fields: ["id", "source", "target"] });
  } catch (error) {
    console.error("Error converting to CSV:", error);
    throw error;
  }
};

export const convertToExcel = async (data, filePath) => {
  try {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Translations");
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Source", key: "source", width: 30 },
      { header: "Target", key: "target", width: 30 },
    ];

    data.forEach((entry) => worksheet.addRow(entry));
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    console.error("Error converting to Excel:", error);
    throw error;
  }
};

export const convertToWord = async (data, filePath) => {
  try {
    const doc = new Document({
      sections: [
        {
          children: data.map(
            (entry) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${entry.id}: ${entry.source} -> ${entry.target}`,
                    break: 1,
                  }),
                ],
              })
          ),
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error("Error converting to Word:", error);
    throw error;
  }
};
