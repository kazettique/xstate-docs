// ============================================
// 測試 DeepL 術語表功能
// 檔名: test-glossary.js
// ============================================
require('dotenv').config();

const deepl = require('deepl-node');
const MY_GLOSSARY = require('./glossary_zh-tw.json');

const authKey = process.env.DEEPL_API_KEY;

if (!authKey) {
  console.error('❌ 請設置 DEEPL_API_KEY 環境變數');
  console.error('   執行: export DEEPL_API_KEY="你的API_KEY"');
  process.exit(1);
}

const translator = new deepl.Translator(authKey);

// 測試用的術語表
// const TEST_GLOSSARY = {
//   'state machine': '狀態機',
//   actor: 'Actor',
//   transition: '轉換',
//   context: '上下文',
//   event: '事件',
// };

/**
 * 測試 1: 建立術語表
 */
async function testCreateGlossary() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 測試 1: 建立術語表');
  console.log('='.repeat(60));

  try {
    // 正確的方式:使用 GlossaryEntries
    const glossary = await translator.createGlossary(
      'Test-XState-Glossary',
      'en',
      'zh-Hant',
      new deepl.GlossaryEntries({ entries: MY_GLOSSARY }),
    );

    console.log('✅ 術語表建立成功!');
    console.log(`   ID: ${glossary.glossaryId}`);
    console.log(`   名稱: ${glossary.name}`);
    console.log(`   來源語言: ${glossary.sourceLang}`);
    console.log(`   目標語言: ${glossary.targetLang}`);
    console.log(`   詞條數量: ${glossary.entryCount}`);

    return glossary;
  } catch (error) {
    console.error('❌ 建立失敗:', error.message);

    // 如果是因為已存在,嘗試刪除後重建
    if (error.message.includes('already exists')) {
      console.log('⚠️  術語表已存在,嘗試刪除後重建...');
      await deleteGlossaryByName('Test-XState-Glossary');
      return await testCreateGlossary(); // 遞迴重試
    }

    throw error;
  }
}

/**
 * 測試 2: 列出所有術語表
 */
async function testListGlossaries() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 測試 2: 列出所有術語表');
  console.log('='.repeat(60));

  try {
    const glossaries = await translator.listGlossaries();

    console.log(`✅ 找到 ${glossaries.length} 個術語表:\n`);

    glossaries.forEach((g, index) => {
      console.log(`   ${index + 1}. ${g.name}`);
      console.log(`      ID: ${g.glossaryId}`);
      console.log(`      語言對: ${g.sourceLang} → ${g.targetLang}`);
      console.log(`      詞條數: ${g.entryCount}`);
      console.log(`      建立時間: ${g.creationTime}`);
      console.log();
    });

    return glossaries;
  } catch (error) {
    console.error('❌ 列出失敗:', error.message);
    throw error;
  }
}

/**
 * 測試 3: 使用術語表翻譯
 */
async function testTranslateWithGlossary(glossary) {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 測試 3: 使用術語表翻譯');
  console.log('='.repeat(60));

  const testText = `
A state machine is a mathematical model that describes the behavior of a system.
An actor is an entity that can send and receive events.
When an event occurs, the state machine performs a transition to a new state.
The context stores additional data for the state machine.
  `.trim();

  console.log('📝 原文:');
  console.log(testText);
  console.log();

  try {
    // 不使用術語表翻譯
    console.log('🔄 翻譯中 (不使用術語表)...');
    const resultWithout = await translator.translateText(
      testText,
      'en',
      'zh-Hant',
    );

    console.log('\n✅ 翻譯結果 (不使用術語表):');
    console.log(resultWithout.text);
    console.log();

    // 使用術語表翻譯
    console.log('🔄 翻譯中 (使用術語表)...');
    const resultWith = await translator.translateText(
      testText,
      'en',
      'zh-Hant',
      {
        glossary: glossary,
      },
    );

    console.log('\n✅ 翻譯結果 (使用術語表):');
    console.log(resultWith.text);
    console.log();

    // 比較差異
    console.log('📊 術語使用情況:');
    for (const [en, zh] of Object.entries(MY_GLOSSARY)) {
      const usedInResult = resultWith.text.includes(zh);
      console.log(
        `   ${en} → ${zh}: ${usedInResult ? '✅ 已使用' : '⚠️  未使用'}`,
      );
    }
  } catch (error) {
    console.error('❌ 翻譯失敗:', error.message);
    throw error;
  }
}

/**
 * 測試 4: 獲取術語表內容
 */
async function testGetGlossaryEntries(glossary) {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 測試 4: 獲取術語表內容');
  console.log('='.repeat(60));

  try {
    const entries = await translator.getGlossaryEntries(glossary.glossaryId);

    console.log('✅ 術語表內容:\n');

    // entries 是一個 GlossaryEntries 對象
    const entriesObj = entries.entries;

    for (const [source, target] of Object.entries(entriesObj)) {
      console.log(`   ${source} → ${target}`);
    }
  } catch (error) {
    console.error('❌ 獲取內容失敗:', error.message);
    throw error;
  }
}

/**
 * 測試 5: 刪除術語表
 */
async function testDeleteGlossary(glossary) {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 測試 5: 刪除術語表');
  console.log('='.repeat(60));

  try {
    await translator.deleteGlossary(glossary.glossaryId);
    console.log(`✅ 術語表已刪除: ${glossary.name}`);
  } catch (error) {
    console.error('❌ 刪除失敗:', error.message);
    throw error;
  }
}

/**
 * 輔助函數: 根據名稱刪除術語表
 */
async function deleteGlossaryByName(name) {
  try {
    const glossaries = await translator.listGlossaries();
    const target = glossaries.find((g) => g.name === name);

    if (target) {
      await translator.deleteGlossary(target.glossaryId);
      console.log(`✅ 已刪除術語表: ${name}`);
    } else {
      console.log(`⚠️  找不到術語表: ${name}`);
    }
  } catch (error) {
    console.error('❌ 刪除失敗:', error.message);
  }
}

/**
 * 測試 6: 檢查 API 使用量
 */
async function testCheckUsage() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 測試 6: 檢查 API 使用量');
  console.log('='.repeat(60));

  try {
    const usage = await translator.getUsage();

    console.log('✅ API 使用量:');
    console.log(`   已使用: ${usage.character.count.toLocaleString()} 字元`);
    console.log(`   額度上限: ${usage.character.limit.toLocaleString()} 字元`);
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
    console.error('❌ 查詢失敗:', error.message);
    throw error;
  }
}

/**
 * 執行所有測試
 */
async function runAllTests() {
  console.log('\n🚀 開始測試 DeepL 術語表功能\n');

  let glossary = null;

  try {
    // 測試 1: 建立術語表
    glossary = await testCreateGlossary();

    // 測試 2: 列出術語表
    await testListGlossaries();

    // 測試 3: 使用術語表翻譯
    await testTranslateWithGlossary(glossary);

    // 測試 4: 獲取術語表內容
    await testGetGlossaryEntries(glossary);

    // 測試 5: 刪除術語表
    await testDeleteGlossary(glossary);

    // 測試 6: 檢查使用量
    await testCheckUsage();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 所有測試完成!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ 測試過程發生錯誤:', error);

    // 清理:嘗試刪除測試術語表
    if (glossary) {
      console.log('\n🧹 清理測試資料...');
      try {
        await translator.deleteGlossary(glossary.glossaryId);
        console.log('✅ 測試術語表已清理');
      } catch (cleanupError) {
        console.error('⚠️  清理失敗:', cleanupError.message);
      }
    }

    process.exit(1);
  }
}

/**
 * 快速測試:只建立和使用術語表
 */
async function quickTest() {
  console.log('\n🚀 快速測試術語表功能\n');

  try {
    // 建立術語表
    console.log('📝 建立術語表...');
    const glossary = await translator.createGlossary(
      'Quick-Test-Glossary',
      'en',
      'zh-Hant',
      new deepl.GlossaryEntries({
        entries: {
          'state machine': '狀態機',
          actor: 'Actor',
          code: '程式碼55566',
        },
      }),
    );

    console.log('✅ 術語表已建立\n');

    // 使用術語表翻譯
    console.log('🔄 翻譯測試文字...');
    const result = await translator.translateText(
      'A state machine with an actor with writing any code',
      'en',
      'zh-Hant',
      { glossary: glossary },
    );

    console.log('✅ 翻譯結果:', result.text);
    console.log();

    // 清理
    console.log('🧹 清理測試資料...');
    await translator.deleteGlossary(glossary.glossaryId);
    console.log('✅ 完成!');
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);

    // 嘗試清理
    try {
      await deleteGlossaryByName('Quick-Test-Glossary');
    } catch (e) {
      // 忽略清理錯誤
    }
  }
}

// ============================================
// 執行測試
// ============================================

// 選擇執行模式
const mode = process.argv[2] || 'all';

if (mode === 'quick') {
  // 快速測試
  quickTest();
} else if (mode === 'all') {
  // 完整測試
  runAllTests();
} else if (mode === 'clean') {
  // 清理所有測試術語表
  (async () => {
    console.log('🧹 清理所有測試術語表...\n');
    await deleteGlossaryByName('Test-XState-Glossary');
    await deleteGlossaryByName('Quick-Test-Glossary');
    console.log('\n✅ 清理完成');
  })();
} else {
  console.log('使用方式:');
  console.log('  node test-glossary.js [mode]');
  console.log('');
  console.log('模式:');
  console.log('  all   - 執行完整測試 (預設)');
  console.log('  quick - 快速測試');
  console.log('  clean - 清理測試術語表');
}
