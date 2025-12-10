// ============================================
// 方案 3: 進階版 - 支援術語表和程式碼區塊保護
// 檔名: translate-advanced.js
// ============================================
require('dotenv').config();

const deepl = require('deepl-node');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const authKey = process.env.DEEPL_API_KEY;
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
};

/**
 * 保護程式碼區塊不被翻譯
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
  text = text.replace(/`[^`]+`/g, (match) => {
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
 * 建立 DeepL 術語表
 */
async function createGlossary(name, sourceLang, targetLang, entries) {
  try {
    // 檢查是否已存在同名術語表
    const glossaries = await translator.listGlossaries();
    const existing = glossaries.find((g) => g.name === name);

    if (existing) {
      console.log(`✅ 使用現有術語表: ${name}`);
      return existing;
    }

    // 建立新術語表
    const glossary = await translator.createGlossary(
      name,
      sourceLang,
      targetLang,
      entries,
    );

    console.log(`✅ 建立新術語表: ${name}`);
    return glossary;
  } catch (error) {
    console.error(`⚠️  無法建立術語表: ${error.message}`);
    return null;
  }
}

/**
 * 進階翻譯函數(支援術語表和程式碼保護)
 */
async function translateAdvanced(
  inputFile,
  outputFile,
  targetLang = 'zh',
  useGlossary = true,
) {
  try {
    console.log(`📖 讀取: ${inputFile}`);

    let text = await fs.readFile(inputFile, 'utf-8');

    // 保護程式碼區塊
    const {
      text: protectedText,
      codeBlocks,
      inlineCode,
    } = protectCodeBlocks(text);

    console.log(`🔄 翻譯中... (${protectedText.length} 字元)`);

    // 建立翻譯選項
    const options = {
      tagHandling: 'html',
      preserveFormatting: true,
    };

    // 使用術語表(如果啟用)
    if (useGlossary) {
      try {
        const glossary = await createGlossary(
          'XState-Terminology',
          'en',
          targetLang,
          XSTATE_GLOSSARY,
        );
        if (glossary) {
          options.glossary = glossary;
        }
      } catch (error) {
        console.log('⚠️  繼續翻譯(不使用術語表)');
      }
    }

    // 翻譯
    const result = await translator.translateText(
      protectedText,
      null,
      targetLang,
      options,
    );

    // 還原程式碼區塊
    const translatedText = restoreCodeBlocks(
      result.text,
      codeBlocks,
      inlineCode,
    );

    // 建立輸出目錄並儲存
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, translatedText, 'utf-8');

    console.log(`✅ 完成: ${outputFile}\n`);

    return {
      success: true,
      originalLength: text.length,
      translatedLength: translatedText.length,
      codeBlocksProtected: codeBlocks.length,
      inlineCodeProtected: inlineCode.length,
    };
  } catch (error) {
    console.error(`❌ 失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 批量進階翻譯
 */
async function batchTranslateAdvanced(
  sourceDir,
  outputDir,
  targetLang = 'zh-Hant',
) {
  try {
    const files = await glob('**/*.{md,mdx}', { cwd: sourceDir });

    console.log(`\n🚀 開始翻譯 ${files.length} 個檔案...\n`);

    let stats = {
      success: 0,
      failed: 0,
      totalCodeBlocks: 0,
      totalInlineCode: 0,
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const inputFile = path.join(sourceDir, file);
      const outputFile = path.join(outputDir, file);

      console.log(`[${i + 1}/${files.length}] ${file}`);

      const result = await translateAdvanced(inputFile, outputFile, targetLang);

      if (result.success) {
        stats.success++;
        stats.totalCodeBlocks += result.codeBlocksProtected;
        stats.totalInlineCode += result.inlineCodeProtected;
      } else {
        stats.failed++;
      }

      // 避免 API 限流
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 顯示最終統計
    console.log('\n' + '='.repeat(60));
    console.log('🎉 翻譯完成!');
    console.log('='.repeat(60));
    console.log(`✅ 成功: ${stats.success} 個檔案`);
    console.log(`❌ 失敗: ${stats.failed} 個檔案`);
    console.log(`🔒 保護的程式碼區塊: ${stats.totalCodeBlocks} 個`);
    console.log(`🔒 保護的行內程式碼: ${stats.totalInlineCode} 個`);
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
  } catch (error) {
    console.error('批量翻譯失敗:', error);
    throw error;
  }
}

// 使用範例
(async () => {
  try {
    await batchTranslateAdvanced(
      'docs',
      'i18n/zh-Hant/docusaurus-plugin-content-docs/current/',
      'zh-Hant',
    );
  } catch (error) {
    console.error('執行失敗:', error);
    process.exit(1);
  }
})();
