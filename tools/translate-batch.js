// ============================================
// 方案 2: 批量翻譯資料夾
// 檔名: translate-batch.js
// ============================================
require('dotenv').config();

const deepl = require('deepl-node');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const authKey = process.env.DEEPL_API_KEY;

if (!authKey) {
  console.error('❌ 請設置 DEEPL_API_KEY 環境變數');
  process.exit(1);
}

const translator = new deepl.Translator(authKey);

/**
 * 批量翻譯資料夾中的所有 Markdown 檔案
 * @param {string} sourceDir - 來源目錄
 * @param {string} outputDir - 輸出目錄
 * @param {string} targetLang - 目標語言
 * @param {object} options - 額外選項
 */
async function translateFolder(
  sourceDir,
  outputDir,
  targetLang = 'zh',
  options = {},
) {
  const {
    filePattern = '**/*.md', // 檔案匹配模式
    maxConcurrent = 3, // 同時翻譯的最大檔案數
    skipExisting = false, // 是否跳過已存在的翻譯檔案
    delay = 1000, // 每個請求之間的延遲(毫秒)
  } = options;

  try {
    console.log('🔍 搜尋 Markdown 檔案...\n');

    // 尋找所有 Markdown 檔案
    const files = await glob(filePattern, {
      cwd: sourceDir,
      absolute: false,
    });

    console.log(`📚 找到 ${files.length} 個檔案需要翻譯\n`);

    if (files.length === 0) {
      console.log('⚠️  沒有找到任何檔案');
      return;
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // 分批處理檔案
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);

      await Promise.all(
        batch.map(async (relativeFile) => {
          const inputFile = path.join(sourceDir, relativeFile);
          const outputFile = path.join(outputDir, relativeFile);

          try {
            // 檢查輸出檔案是否已存在
            if (skipExisting) {
              try {
                await fs.access(outputFile);
                console.log(
                  `⏭️  [${i + 1}/${
                    files.length
                  }] 跳過(已存在): ${relativeFile}`,
                );
                skipCount++;
                return;
              } catch {
                // 檔案不存在,繼續翻譯
              }
            }

            console.log(
              `🔄 [${i + 1}/${files.length}] 翻譯中: ${relativeFile}`,
            );

            // 讀取檔案
            const text = await fs.readFile(inputFile, 'utf-8');

            // 翻譯
            const result = await translator.translateText(
              text,
              null,
              targetLang,
              {
                tagHandling: 'html',
                preserveFormatting: true,
              },
            );

            // 建立輸出目錄
            await fs.mkdir(path.dirname(outputFile), { recursive: true });

            // 儲存結果
            await fs.writeFile(outputFile, result.text, 'utf-8');

            console.log(
              `   ✅ 完成: ${outputFile} (${text.length} → ${result.text.length} 字元)\n`,
            );
            successCount++;

            // 延遲以避免過度請求
            await new Promise((resolve) => setTimeout(resolve, delay));
          } catch (error) {
            console.error(`   ❌ 失敗: ${relativeFile}`);
            console.error(`      原因: ${error.message}\n`);
            errorCount++;
          }
        }),
      );
    }

    // 顯示統計結果
    console.log('\n' + '='.repeat(50));
    console.log('📊 翻譯統計');
    console.log('='.repeat(50));
    console.log(`✅ 成功: ${successCount} 個檔案`);
    if (skipCount > 0) console.log(`⏭️  跳過: ${skipCount} 個檔案`);
    if (errorCount > 0) console.log(`❌ 失敗: ${errorCount} 個檔案`);
    console.log('='.repeat(50));

    // 顯示 API 使用量
    const usage = await translator.getUsage();
    console.log('\n📈 DeepL API 使用量:');
    console.log(`   已使用: ${usage.character.count.toLocaleString()} 字元`);
    console.log(`   額度上限: ${usage.character.limit.toLocaleString()} 字元`);
    console.log(
      `   剩餘額度: ${(
        usage.character.limit - usage.character.count
      ).toLocaleString()} 字元`,
    );

    const percentage = (
      (usage.character.count / usage.character.limit) *
      100
    ).toFixed(2);
    console.log(`   使用率: ${percentage}%`);

    if (usage.character.count > usage.character.limit * 0.8) {
      console.log('   ⚠️  警告: 已使用超過 80% 額度!');
    }
  } catch (error) {
    console.error('執行失敗:', error);
    throw error;
  }
}

// 使用範例
(async () => {
  try {
    await translateFolder(
      '/docs', // 來源目錄
      'i18n/zh-Hant/docusaurus-plugin-content-docs/current/', // 輸出目錄
      'zh-Hant', // 目標語言
      {
        filePattern: '**/*.{md,mdx}', // 包含 .md 和 .mdx
        maxConcurrent: 3, // 同時處理 3 個檔案
        skipExisting: true, // 跳過已翻譯的檔案
        delay: 1000, // 每個請求間隔 1 秒
      },
    );
  } catch (error) {
    console.error('翻譯過程發生錯誤:', error);
    process.exit(1);
  }
})();
