
const axios = require("axios");
const { extractTextFromPDF } = require("../../ai-Learning-POC/specExtractor");
const AppError = require("../../../utils/AppError");

const isPageNumberLine = (line) => {
    const normalized = line.trim();
    return (
        /^\d+$/.test(normalized) ||
        /^page\s*\d+(\s*(of|\/)\s*\d+)?$/i.test(normalized) ||
        /^\d+\s*(of|\/)\s*\d+$/i.test(normalized)
    );
};

const stripHeadersAndFooters = (pages) => {
    if (pages.length === 1) {
        return pages[0].filter((line) => !isPageNumberLine(line));
    }

    const headerCounts = new Map();
    const footerCounts = new Map();

    for (const lines of pages) {
        const first = lines.find((l) => l.trim().length > 0);
        const last = [...lines].reverse().find((l) => l.trim().length > 0);

        if (first) {
            const key = first.trim();
            headerCounts.set(key, (headerCounts.get(key) || 0) + 1);
        }
        if (last) {
            const key = last.trim();
            footerCounts.set(key, (footerCounts.get(key) || 0) + 1);
        }
    }

    const threshold = Math.max(2, Math.ceil(pages.length / 2));
    const commonHeaders = new Set(
        [...headerCounts.entries()].filter(([, count]) => count >= threshold).map(([line]) => line)
    );
    const commonFooters = new Set(
        [...footerCounts.entries()].filter(([, count]) => count >= threshold).map(([line]) => line)
    );

    return pages.flatMap((lines) => {
        let start = 0;
        let end = lines.length;

        while (start < end) {
            const candidate = lines[start].trim();
            if (candidate && (isPageNumberLine(candidate) || commonHeaders.has(candidate))) {
                start += 1;
            } else {
                break;
            }
        }

        while (end > start) {
            const candidate = lines[end - 1].trim();
            if (candidate && (isPageNumberLine(candidate) || commonFooters.has(candidate))) {
                end -= 1;
            } else {
                break;
            }
        }

        return lines
            .slice(start, end)
            .filter((line) => !isPageNumberLine(line.trim()));
    });
};

const cleanExtractedText = (text) => {
    const pages = text
        .split(/\f/g)
        .map((page) => page.split(/\r?\n/));

    const strippedLines = stripHeadersAndFooters(pages);

    return strippedLines
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n");
};

const downloadPdfToBuffer = async (url) => {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
};

const parseDocumentForSpec = async (url) => {
    try {
        const pdfBuffer = await downloadPdfToBuffer(url);
        const rawText = await extractTextFromPDF(pdfBuffer);
        if (!rawText) {
            throw new Error("Unable to extract text from PDF");
        }

        const cleanedText = cleanExtractedText(rawText);
        return cleanedText;
    } catch (err) {
        console.error("Failed to parse document for spec:", err.message || err);
        throw new AppError(err.message || "Failed to parse document", 500);
    }
};

module.exports = { parseDocumentForSpec };
