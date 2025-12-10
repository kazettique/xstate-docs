// ============================================
// 方案 4: 監控工具 - 查詢 API 使用量
// 檔名: check-usage.js
// ============================================
require('dotenv').config();

const deepl = require('deepl-node');

const authKey = process.env.DEEPL_API_KEY;

if (!authKey) {
  console.error('❌ 請設置 DEEPL_API_KEY 環境變數');
  process.exit(1);
}

const translator = new deepl.Translator(authKey);

async function checkUsage() {
  try {
    const usage = await translator.getUsage();

    console.log('\n' + '='.repeat(50));
    console.log('📊 DeepL API 使用量報告');
    console.log('='.repeat(50));

    console.log('\n字元使用量:');
    console.log(`  已使用: ${usage.character.count.toLocaleString()} 字元`);
    console.log(`  額度上限: ${usage.character.limit.toLocaleString()} 字元`);
    console.log(
      `  剩餘額度: ${(
        usage.character.limit - usage.character.count
      ).toLocaleString()} 字元`,
    );

    const percentage = (usage.character.count / usage.character.limit) * 100;
    console.log(`  使用率: ${percentage.toFixed(2)}%`);

    // 進度條
    const barLength = 40;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    console.log(`  [${bar}] ${percentage.toFixed(1)}%`);

    // 警告訊息
    if (percentage >= 90) {
      console.log('\n⚠️  警告: 已使用超過 90% 額度!');
    } else if (percentage >= 80) {
      console.log('\n⚠️  注意: 已使用超過 80% 額度');
    } else {
      console.log('\n✅ 額度充足');
    }

    // 估算剩餘可翻譯的字元數
    const remaining = usage.character.limit - usage.character.count;
    const estimatedPages = Math.floor(remaining / 2000); // 假設每頁約 2000 字元
    console.log(`\n預估可翻譯約 ${estimatedPages} 頁文件 (以每頁 2000 字計算)`);

    console.log('\n' + '='.repeat(50));
  } catch (error) {
    console.error('查詢失敗:', error.message);
    process.exit(1);
  }
}

checkUsage();
