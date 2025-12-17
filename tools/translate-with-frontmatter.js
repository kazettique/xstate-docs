// ============================================
// 完整版翻譯腳本 - 保護 Front Matter 和程式碼區塊
// 檔名: translate-with-frontmatter.js
// ============================================
require('dotenv').config();

const deepl = require('deepl-node');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const MY_GLOSSARY = require('./glossary_zh-tw.json');

// const filePath = path.join('glossary_zh-tw.json');
// const fileContent = readFileSync(filePath, 'utf-8');

const authKey = process.env.DEEPL_API_KEY;

if (!authKey) {
  console.error('❌ 請設置 DEEPL_API_KEY 環境變數');
  process.exit(1);
}

const translator = new deepl.Translator(authKey);

// XState 專用術語表
const XSTATE_GLOSSARY = {
  'state machine': '狀態機',
  actor: 'Actor',
  transition: '轉換',
  context: '上下文',
  event: '事件',
  action: '動作',
  guard: '守衛',
  service: '服務',
  invoke: '調用',
  spawn: '生成',
  interpret: '解釋器',
  machine: '機器',
  state: '狀態',
  'final state': '最終狀態',
  'parallel state': '並行狀態',
  'history state': '歷史狀態',
  snapshot: '快照',
  subscription: '訂閱',
};

/**
 * 解析 Front Matter 並分離 keys 和 values
 */
function parseFrontMatter(text) {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = text.match(frontMatterRegex);

  if (!match) {
    return {
      text,
      frontMatterContent: null,
      hasFrontMatter: false,
      frontMatterData: null,
    };
  }

  const fullFrontMatter = match[0];
  const frontMatterContent = match[1]; // YAML 內容(不含 ---)
  const content = text.slice(fullFrontMatter.length);

  // 解析 YAML 內容,提取 key-value pairs
  const frontMatterData = parseFrontMatterYaml(frontMatterContent);

  return {
    text: content,
    frontMatterContent,
    hasFrontMatter: true,
    frontMatterData,
  };
}

/**
 * 簡單的 YAML 解析器(處理常見的 Front Matter 格式)
 */
function parseFrontMatterYaml(yamlContent) {
  const lines = yamlContent.split('\n');
  const data = [];
  let currentKey = null;
  let currentValue = '';
  let isMultiline = false;
  let arrayItems = [];
  let isArray = false;

  for (let line of lines) {
    const trimmedLine = line.trim();

    // 跳過空行和註解
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      if (currentKey && isMultiline) {
        currentValue += '\n';
      }
      continue;
    }

    // 檢查是否為 array item
    if (trimmedLine.startsWith('- ')) {
      if (!isArray && currentKey) {
        // 儲存前一個 key
        data.push({
          key: currentKey,
          value: currentValue.trim(),
          type: 'simple',
          originalLine: null,
        });
        currentKey = null;
        currentValue = '';
      }

      isArray = true;
      const item = trimmedLine.substring(2).trim();
      arrayItems.push(item);
      continue;
    }

    // 如果之前在處理 array,現在結束了
    if (isArray) {
      data.push({
        key: currentKey,
        value: arrayItems,
        type: 'array',
        originalLine: null,
      });
      isArray = false;
      currentKey = null;
      arrayItems = [];
    }

    // 檢查是否為新的 key-value pair
    const kvMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);

    if (kvMatch) {
      // 儲存前一個 key (如果有)
      if (currentKey) {
        data.push({
          key: currentKey,
          value: currentValue.trim(),
          type: isMultiline ? 'multiline' : 'simple',
          originalLine: null,
        });
      }

      currentKey = kvMatch[1];
      currentValue = kvMatch[2];

      // 檢查是否為多行字串開始 (|, >, |-, >-)
      if (currentValue.match(/^[|>][-+]?\s*$/)) {
        isMultiline = true;
        currentValue = '';
      } else {
        isMultiline = false;
      }
    } else if (currentKey && isMultiline) {
      // 多行內容的延續
      currentValue += (currentValue ? '\n' : '') + line;
    }
  }

  // 處理最後一個 key
  if (isArray) {
    data.push({
      key: currentKey,
      value: arrayItems,
      type: 'array',
      originalLine: null,
    });
  } else if (currentKey) {
    data.push({
      key: currentKey,
      value: currentValue.trim(),
      type: isMultiline ? 'multiline' : 'simple',
      originalLine: null,
    });
  }

  return data;
}

/**
 * 提取需要翻譯的 Front Matter values
 */
function extractTranslatableValues(frontMatterData) {
  if (!frontMatterData) return { values: [], indices: [] };

  const values = [];
  const indices = [];

  frontMatterData.forEach((item, index) => {
    // 決定哪些 key 的 value 需要翻譯
    const translatableKeys = [
      'title',
      'description',
      'summary',
      'excerpt',
      'caption',
      'label',
      'alt',
      'placeholder',
    ];

    // 不翻譯的 keys
    const nonTranslatableKeys = [
      'id',
      'slug',
      'date',
      'author',
      'email',
      'url',
      'tags',
      'categories',
      'layout',
      'template',
      'draft',
      'published',
      'permalink',
      'redirect_from',
    ];

    const keyLower = item.key.toLowerCase();
    const shouldTranslate =
      translatableKeys.includes(keyLower) &&
      !nonTranslatableKeys.includes(keyLower);

    if (shouldTranslate && item.type === 'simple' && item.value) {
      // 只翻譯簡單的字串值
      values.push(item.value);
      indices.push(index);
    }
  });

  return { values, indices };
}

/**
 * 重建 Front Matter(包含翻譯後的 values)
 */
function reconstructFrontMatter(frontMatterData, translatedValues, indices) {
  if (!frontMatterData) return '';

  // 複製資料
  const data = JSON.parse(JSON.stringify(frontMatterData));

  // 替換翻譯後的值
  indices.forEach((dataIndex, i) => {
    data[dataIndex].value = translatedValues[i];
  });

  // 重建 YAML
  let yaml = '';

  data.forEach((item) => {
    if (item.type === 'array') {
      yaml += `${item.key}:\n`;
      item.value.forEach((v) => {
        yaml += `  - ${v}\n`;
      });
    } else if (item.type === 'multiline') {
      yaml += `${item.key}: |\n`;
      const lines = item.value.split('\n');
      lines.forEach((line) => {
        yaml += `  ${line}\n`;
      });
    } else {
      // 簡單的 key: value
      yaml += `${item.key}: ${item.value}\n`;
    }
  });

  return `---\n${yaml}---\n`;
}

/**
 * 保護程式碼區塊
 */
function protectCodeBlocks(text) {
  const codeBlocks = [];
  const inlineCode = [];

  // 保護程式碼區塊 ```...```
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // 保護行內程式碼 `...`
  text = text.replace(/`[^`\n]+`/g, (match) => {
    inlineCode.push(match);
    return `__INLINE_CODE_${inlineCode.length - 1}__`;
  });

  return { text, codeBlocks, inlineCode };
}

/**
 * 還原程式碼區塊
 */
function restoreCodeBlocks(text, codeBlocks, inlineCode) {
  // 還原程式碼區塊
  codeBlocks.forEach((code, index) => {
    text = text.replace(`__CODE_BLOCK_${index}__`, code);
  });

  // 還原行內程式碼
  inlineCode.forEach((code, index) => {
    text = text.replace(`__INLINE_CODE_${index}__`, code);
  });

  return text;
}

/**
 * 保護 HTML 標籤
 */
function protectHtmlTags(text) {
  const htmlTags = [];

  // 保護 HTML 標籤 <tag>...</tag> 或 <tag />
  text = text.replace(/<[^>]+>/g, (match) => {
    htmlTags.push(match);
    return `__HTML_TAG_${htmlTags.length - 1}__`;
  });

  return { text, htmlTags };
}

/**
 * 還原 HTML 標籤
 */
function restoreHtmlTags(text, htmlTags) {
  htmlTags.forEach((tag, index) => {
    text = text.replace(`__HTML_TAG_${index}__`, tag);
  });
  return text;
}

/**
 * 保護 URLs 和連結
 */
function protectUrls(text) {
  const urls = [];

  // 保護 Markdown 連結 [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    urls.push({ match, linkText, url });
    return `__MD_LINK_${urls.length - 1}__`;
  });

  // 保護純 URL
  text = text.replace(/https?:\/\/[^\s]+/g, (match) => {
    const index = urls.length;
    urls.push({ match, url: match, linkText: null });
    return `__URL_${index}__`;
  });

  return { text, urls };
}

/**
 * 還原 URLs (需要翻譯連結文字)
 */
function restoreUrls(text, urls, shouldTranslateLinkText = true) {
  urls.forEach((item, index) => {
    if (item.linkText && shouldTranslateLinkText) {
      // 從翻譯後的文本中提取對應的翻譯文字
      const placeholder = `__MD_LINK_${index}__`;
      const translatedLinkTextMatch = text.match(
        new RegExp(`([^\\[\\]]+)${placeholder}`),
      );
      const translatedLinkText = translatedLinkTextMatch
        ? translatedLinkTextMatch[1].trim()
        : item.linkText;

      text = text.replace(placeholder, `[${translatedLinkText}](${item.url})`);
    } else if (item.linkText) {
      text = text.replace(
        `__MD_LINK_${index}__`,
        `[${item.linkText}](${item.url})`,
      );
    } else {
      text = text.replace(`__URL_${index}__`, item.url);
    }
  });

  return text;
}

/**
 * 建立或獲取術語表
 */
async function getOrCreateGlossary(name, sourceLang, targetLang, entries) {
  try {
    const glossaries = await translator.listGlossaries();
    const existing = glossaries.find((g) => g.name === name);

    if (existing) {
      console.log(`✅ 使用現有術語表: ${name}`);
      return existing;
    }

    const glossary = await translator.createGlossary(
      name,
      sourceLang,
      targetLang,
      new deepl.GlossaryEntries({ entries: entries }),
    );

    console.log(`✅ 建立新術語表: ${name}`);
    return glossary;
  } catch (error) {
    console.error(`⚠️  無法建立術語表: ${error.message}`);
    return null;
  }
}

/**
 * 進階翻譯函數 - 完整保護版本(支援 Front Matter value 翻譯)
 */
async function translateMarkdown(
  inputFile,
  outputFile,
  targetLang = 'zh-Hant',
  options = {},
) {
  const {
    useGlossary = true,
    preserveLinkText = false, // 是否保留連結文字不翻譯
    translateFrontMatter = true, // 是否翻譯 Front Matter values
    logProgress = true,
  } = options;

  try {
    if (logProgress) {
      console.log(`📖 讀取: ${inputFile}`);
    }

    let text = await fs.readFile(inputFile, 'utf-8');
    const originalLength = text.length;

    // 步驟 1: 解析 Front Matter
    const {
      text: contentWithoutFM,
      frontMatterContent,
      hasFrontMatter,
      frontMatterData,
    } = parseFrontMatter(text);

    let translatedFrontMatter = null;
    let frontMatterValuesToTranslate = [];
    let frontMatterIndices = [];

    if (hasFrontMatter && translateFrontMatter) {
      // 提取需要翻譯的 Front Matter values
      const { values, indices } = extractTranslatableValues(frontMatterData);
      frontMatterValuesToTranslate = values;
      frontMatterIndices = indices;

      if (logProgress) {
        console.log(
          `   🔒 偵測到 Front Matter,將翻譯 ${values.length} 個欄位值`,
        );
      }
    } else if (hasFrontMatter) {
      if (logProgress) {
        console.log(`   🔒 偵測到 Front Matter,已完整保護`);
      }
    }

    // 步驟 2: 保護程式碼區塊
    const {
      text: contentWithoutCode,
      codeBlocks,
      inlineCode,
    } = protectCodeBlocks(contentWithoutFM);

    // 步驟 3: 保護 HTML 標籤
    const { text: contentWithoutHtml, htmlTags } =
      protectHtmlTags(contentWithoutCode);

    // 步驟 4: 保護 URLs
    const { text: protectedText, urls } = protectUrls(contentWithoutHtml);

    if (logProgress) {
      console.log(`   📊 保護統計:`);
      console.log(`      - Front Matter: ${hasFrontMatter ? '1 個' : '無'}`);
      if (hasFrontMatter && translateFrontMatter) {
        console.log(
          `        → 需翻譯的欄位: ${frontMatterValuesToTranslate.length} 個`,
        );
      }
      console.log(`      - 程式碼區塊: ${codeBlocks.length} 個`);
      console.log(`      - 行內程式碼: ${inlineCode.length} 個`);
      console.log(`      - HTML 標籤: ${htmlTags.length} 個`);
      console.log(`      - URLs/連結: ${urls.length} 個`);
      console.log(`   🔄 翻譯中... (${protectedText.length} 字元)`);
    }

    // 步驟 5: 設定翻譯選項
    const translationOptions = {
      tagHandling: 'html',
      preserveFormatting: true,
      formality: 'default',
    };

    if (useGlossary) {
      try {
        const glossary = await getOrCreateGlossary(
          'XState-Terminology',
          'en',
          targetLang,
          MY_GLOSSARY,
        );
        if (glossary) {
          translationOptions.glossary = glossary;
        }
      } catch (error) {
        if (logProgress) {
          console.log('   ⚠️  繼續翻譯(不使用術語表)');
        }
      }
    }

    // 步驟 6: 翻譯主要內容
    const result = await translator.translateText(
      protectedText,
      'en',
      targetLang,
      translationOptions,
    );

    let translatedText = result.text;

    // 步驟 7: 翻譯 Front Matter values (如果需要)
    if (
      hasFrontMatter &&
      translateFrontMatter &&
      frontMatterValuesToTranslate.length > 0
    ) {
      if (logProgress) {
        console.log(`   🔄 翻譯 Front Matter 欄位值...`);
      }

      const translatedValues = [];

      // 逐個翻譯 Front Matter values
      for (const value of frontMatterValuesToTranslate) {
        try {
          const valueResult = await translator.translateText(
            value,
            'en',
            targetLang,
            translationOptions,
          );
          translatedValues.push(valueResult.text);
        } catch (error) {
          // 如果翻譯失敗,保留原值
          console.warn(`      ⚠️  翻譯 Front Matter 值失敗: ${value}`);
          translatedValues.push(value);
        }
      }

      // 重建 Front Matter
      translatedFrontMatter = reconstructFrontMatter(
        frontMatterData,
        translatedValues,
        frontMatterIndices,
      );
    } else if (hasFrontMatter) {
      // 保持 Front Matter 不變
      translatedFrontMatter = `---\n${frontMatterContent}\n---\n`;
    }

    // 步驟 8: 還原所有保護的內容
    translatedText = restoreUrls(translatedText, urls, !preserveLinkText);
    translatedText = restoreHtmlTags(translatedText, htmlTags);
    translatedText = restoreCodeBlocks(translatedText, codeBlocks, inlineCode);

    // 添加翻譯後的 Front Matter
    if (translatedFrontMatter) {
      translatedText = translatedFrontMatter + translatedText;
    }

    // 步驟 9: 儲存結果
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, translatedText, 'utf-8');

    if (logProgress) {
      console.log(`   ✅ 完成: ${outputFile}`);
      console.log(
        `   📏 字元數: ${originalLength} → ${translatedText.length}\n`,
      );
    }

    return {
      success: true,
      originalLength,
      translatedLength: translatedText.length,
      protectionStats: {
        frontMatter: hasFrontMatter ? 1 : 0,
        frontMatterTranslated: frontMatterValuesToTranslate.length,
        codeBlocks: codeBlocks.length,
        inlineCode: inlineCode.length,
        htmlTags: htmlTags.length,
        urls: urls.length,
      },
    };
  } catch (error) {
    console.error(`   ❌ 失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 批量翻譯
 */
async function batchTranslate(
  sourceDir,
  outputDir,
  targetLang = 'zh-Hant',
  options = {},
) {
  const {
    filePattern = '**/*.{md,mdx}',
    maxConcurrent = 3,
    skipExisting = false,
    delay = 1000,
    useGlossary = true,
    preserveLinkText = false,
    translateFrontMatter = true, // 新增選項
  } = options;

  try {
    console.log('\n🔍 搜尋 Markdown 檔案...\n');

    const files = await glob(filePattern, {
      cwd: sourceDir,
      absolute: false,
    });

    console.log(`📚 找到 ${files.length} 個檔案需要翻譯\n`);

    if (files.length === 0) {
      console.log('⚠️  沒有找到任何檔案');
      return;
    }

    let stats = {
      success: 0,
      failed: 0,
      skipped: 0,
      totalProtected: {
        frontMatter: 0,
        frontMatterTranslated: 0,
        codeBlocks: 0,
        inlineCode: 0,
        htmlTags: 0,
        urls: 0,
      },
    };

    // 分批處理
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);

      await Promise.all(
        batch.map(async (file, batchIndex) => {
          const fileNumber = i + batchIndex + 1;
          const inputFile = path.join(sourceDir, file);
          const outputFile = path.join(outputDir, file);

          // 檢查是否跳過已存在的檔案
          if (skipExisting) {
            try {
              await fs.access(outputFile);
              console.log(
                `⏭️  [${fileNumber}/${files.length}] 跳過(已存在): ${file}`,
              );
              stats.skipped++;
              return;
            } catch {
              // 檔案不存在,繼續翻譯
            }
          }

          console.log(`🔄 [${fileNumber}/${files.length}] ${file}`);

          const result = await translateMarkdown(
            inputFile,
            outputFile,
            targetLang,
            {
              useGlossary,
              preserveLinkText,
              translateFrontMatter,
              logProgress: true,
            },
          );

          if (result.success) {
            stats.success++;
            if (result.protectionStats) {
              stats.totalProtected.frontMatter +=
                result.protectionStats.frontMatter;
              stats.totalProtected.frontMatterTranslated +=
                result.protectionStats.frontMatterTranslated || 0;
              stats.totalProtected.codeBlocks +=
                result.protectionStats.codeBlocks;
              stats.totalProtected.inlineCode +=
                result.protectionStats.inlineCode;
              stats.totalProtected.htmlTags += result.protectionStats.htmlTags;
              stats.totalProtected.urls += result.protectionStats.urls;
            }
          } else {
            stats.failed++;
          }

          // 延遲避免 API 限流
          await new Promise((resolve) => setTimeout(resolve, delay));
        }),
      );
    }

    // 顯示最終統計
    console.log('\n' + '='.repeat(60));
    console.log('🎉 翻譯完成!');
    console.log('='.repeat(60));
    console.log(`✅ 成功: ${stats.success} 個檔案`);
    if (stats.skipped > 0) {
      console.log(`⏭️  跳過: ${stats.skipped} 個檔案`);
    }
    if (stats.failed > 0) {
      console.log(`❌ 失敗: ${stats.failed} 個檔案`);
    }
    console.log('\n🔒 保護內容統計:');
    console.log(`   - Front Matter: ${stats.totalProtected.frontMatter} 個`);
    if (translateFrontMatter) {
      console.log(
        `     → 已翻譯的欄位: ${stats.totalProtected.frontMatterTranslated} 個`,
      );
    }
    console.log(`   - 程式碼區塊: ${stats.totalProtected.codeBlocks} 個`);
    console.log(`   - 行內程式碼: ${stats.totalProtected.inlineCode} 個`);
    console.log(`   - HTML 標籤: ${stats.totalProtected.htmlTags} 個`);
    console.log(`   - URLs/連結: ${stats.totalProtected.urls} 個`);
    console.log('='.repeat(60));

    // API 使用量
    const usage = await translator.getUsage();
    console.log('\n📊 DeepL API 使用統計:');
    console.log(
      `   已使用: ${usage.character.count.toLocaleString()} / ${usage.character.limit.toLocaleString()} 字元`,
    );
    console.log(
      `   剩餘額度: ${(
        usage.character.limit - usage.character.count
      ).toLocaleString()} 字元`,
    );
    console.log(
      `   使用率: ${(
        (usage.character.count / usage.character.limit) *
        100
      ).toFixed(2)}%`,
    );

    if (usage.character.count > usage.character.limit * 0.8) {
      console.log('   ⚠️  警告: 已使用超過 80% 額度!');
    }
  } catch (error) {
    console.error('批量翻譯失敗:', error);
    throw error;
  }
}

// ============================================
// 使用範例
// ============================================
const TARGET_FILE = 'xstate';

const EXTENSION = '.mdx';
const SOURCE_DIRECTORY = 'docs/';
const TARGET_DIRECTORY = 'i18n/zh-Hant/docusaurus-plugin-content-docs/current/';
const TARGET_LANG = 'zh-Hant';

// 範例 1: 翻譯單一檔案
async function single() {
  await translateMarkdown(
    SOURCE_DIRECTORY + TARGET_FILE + EXTENSION,
    TARGET_DIRECTORY + TARGET_FILE + EXTENSION,
    TARGET_LANG,
    {
      useGlossary: true,
      preserveLinkText: false, // 翻譯連結文字
      logProgress: true,
    },
  );
}

// 範例 2: 批量翻譯整個資料夾
async function batch() {
  await batchTranslate(SOURCE_DIRECTORY, TARGET_DIRECTORY, TARGET_LANG, {
    filePattern: '**/*.{md,mdx}',
    maxConcurrent: 3,
    skipExisting: true,
    delay: 1000,
    useGlossary: true,
    preserveLinkText: false,
    translateFrontMatter: true, // 翻譯 Front Matter values
  });
}

// 執行主程式
async function execute() {
  try {
    // 使用範例 2 進行批量翻譯
    await single();
  } catch (error) {
    console.error('執行失敗:', error);
    process.exit(1);
  }
}

execute();

// ============================================
// 測試 Front Matter 保護功能
// 檔名: test-frontmatter.js
// ============================================

async function testFrontMatterProtection() {
  const testContent = `---
title: Introduction to XState
description: Learn about state machines and statecharts
summary: A comprehensive guide to XState
tags: [xstate, tutorial]
author: John Doe
date: 2024-01-15
published: true
---

# Introduction

This is a test document with \`code\` and [links](https://example.com).

\`\`\`javascript
const machine = createMachine({
  initial: 'idle'
});
\`\`\`

## More content

Here's some text to translate about state machines and actors.
`;

  // 寫入測試檔案
  await fs.writeFile('test-input.md', testContent, 'utf-8');

  console.log('🧪 測試 Front Matter 翻譯功能\n');
  console.log('原始內容:');
  console.log(testContent);
  console.log('\n' + '='.repeat(60) + '\n');

  // 測試 1: 翻譯 Front Matter values
  console.log('📝 測試 1: 翻譯 Front Matter values\n');
  await translateMarkdown('test-input.md', 'test-output-translated.md', 'zh', {
    useGlossary: true,
    translateFrontMatter: true, // 翻譯 Front Matter values
    logProgress: true,
  });

  const result1 = await fs.readFile('test-output-translated.md', 'utf-8');
  console.log('\n翻譯結果 (Front Matter values 已翻譯):');
  console.log(result1);
  console.log('\n' + '='.repeat(60) + '\n');

  // 測試 2: 不翻譯 Front Matter
  console.log('📝 測試 2: 完整保護 Front Matter\n');
  await translateMarkdown('test-input.md', 'test-output-protected.md', 'zh', {
    useGlossary: true,
    translateFrontMatter: false, // 完全不翻譯 Front Matter
    logProgress: true,
  });

  const result2 = await fs.readFile('test-output-protected.md', 'utf-8');
  console.log('\n翻譯結果 (Front Matter 完整保護):');
  console.log(result2);

  console.log('\n' + '='.repeat(60));
  console.log('✅ 測試完成!');
  console.log('   - test-output-translated.md: Front Matter values 已翻譯');
  console.log('   - test-output-protected.md: Front Matter 完全保護');
  console.log('='.repeat(60));

  // 清理測試檔案(可選)
  // await fs.unlink('test-input.md');
  // await fs.unlink('test-output-translated.md');
  // await fs.unlink('test-output-protected.md');
}

// 取消註解以測試 Front Matter 翻譯功能
// testFrontMatterProtection();
