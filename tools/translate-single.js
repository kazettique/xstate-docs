// ============================================
// 方案 1: 單一檔案翻譯
// 檔名: translate-single.js
// ============================================
require('dotenv').config();

const deepl = require('deepl-node');
const fs = require('fs').promises;
const path = require('path');

// 從環境變數讀取 API Key
const authKey = process.env.DEEPL_API_KEY;

if (!authKey) {
  console.error('❌ 錯誤: 請設置 DEEPL_API_KEY 環境變數');
  console.error('   執行: export DEEPL_API_KEY="你的API_KEY"');
  process.exit(1);
}

// 建立 DeepL 翻譯器實例
const translator = new deepl.Translator(authKey);

/**
 * 翻譯單一 Markdown 檔案
 * @param {string} inputFile - 輸入檔案路徑
 * @param {string} outputFile - 輸出檔案路徑
 * @param {string} targetLang - 目標語言 ('zh', 'ja', 'ko' 等)
 */
async function translateMarkdownFile(
  inputFile,
  outputFile,
  targetLang = 'zh-Hant',
) {
  try {
    console.log(`📖 讀取檔案: ${inputFile}`);

    // 讀取原始檔案
    const text = await fs.readFile(inputFile, 'utf-8');

    console.log(`🔄 翻譯中... (${text.length} 字元)`);

    // 使用 DeepL 翻譯
    const result = await translator.translateText(text, null, targetLang, {
      tagHandling: 'html', // 保留 Markdown 標籤
      preserveFormatting: true, // 保持格式
      formality: 'default', // 正式程度: 'default', 'more', 'less'
    });

    // 建立輸出目錄
    await fs.mkdir(path.dirname(outputFile), { recursive: true });

    // 儲存翻譯結果
    await fs.writeFile(outputFile, result.text, 'utf-8');

    console.log(`✅ 翻譯完成: ${outputFile}`);
    console.log(`   原始字元數: ${text.length}`);
    console.log(`   翻譯字元數: ${result.text.length}`);
  } catch (error) {
    console.error(`❌ 翻譯失敗: ${error.message}`);
    throw error;
  }
}

// 使用範例
(async () => {
  const TARGET_FILE = 'about';
  const EXTENSION = '.mdx';
  const SOURCE_DIRECTORY = 'docs/';
  const TARGET_DIRECTORY =
    'i18n/zh-Hant/docusaurus-plugin-content-docs/current/';
  const TARGET_LANG = 'zh-Hant';

  try {
    await translateMarkdownFile(
      SOURCE_DIRECTORY + TARGET_FILE + EXTENSION,
      TARGET_DIRECTORY + TARGET_FILE + EXTENSION,
      TARGET_LANG,
    );

    // 查詢 API 使用量
    const usage = await translator.getUsage();
    console.log('\n📊 API 使用量:');
    console.log(`   已使用: ${usage.character.count.toLocaleString()} 字元`);
    console.log(`   額度上限: ${usage.character.limit.toLocaleString()} 字元`);
    console.log(
      `   剩餘額度: ${(
        usage.character.limit - usage.character.count
      ).toLocaleString()} 字元`,
    );
  } catch (error) {
    console.error('執行失敗:', error);
    process.exit(1);
  }
})();
