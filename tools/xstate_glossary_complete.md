# XState 完整術語表 - 中英對照翻譯指南

這份術語表包含 XState 和狀態機相關的所有重要術語,適合用於文件翻譯和技術溝通。

---

## 🎯 核心概念 (Core Concepts)

### 基礎術語

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **State Machine** | 狀態機 | 描述系統行為的模型 |
| **Finite State Machine (FSM)** | 有限狀態機 | 具有有限數量狀態的狀態機 |
| **Statechart** | 狀態圖 | 擴展的狀態機,支援層級和並行狀態 |
| **Actor** | Actor / 執行者 | 狀態機的執行實例 |
| **Actor Model** | Actor 模型 | 基於訊息傳遞的並發計算模型 |
| **Machine** | 機器 / 狀態機定義 | XState 中的狀態機配置 |
| **State** | 狀態 | 系統在特定時刻的表現 |
| **Event** | 事件 | 觸發狀態轉換的訊號 |
| **Transition** | 轉換 / 轉移 | 從一個狀態到另一個狀態的變化 |
| **Context** | 上下文 / 情境資料 | 狀態機的擴展狀態資料 |
| **Extended State** | 擴展狀態 | 無法用有限狀態表示的資料 |

---

## 📊 狀態類型 (State Types)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Initial State** | 初始狀態 | 狀態機啟動時的預設狀態 |
| **Final State** | 最終狀態 | 狀態機的終止狀態 |
| **Finite State** | 有限狀態 | 可枚舉的離散狀態 |
| **Parent State** | 父狀態 | 包含子狀態的階層狀態 |
| **Child State** | 子狀態 | 被父狀態包含的狀態 |
| **Nested State** | 嵌套狀態 | 階層結構中的狀態 |
| **Parallel State** | 並行狀態 | 同時存在的多個狀態 |
| **History State** | 歷史狀態 | 記憶之前活躍狀態的特殊狀態 |
| **Atomic State** | 原子狀態 | 不包含子狀態的簡單狀態 |
| **Compound State** | 複合狀態 | 包含子狀態的狀態 |

---

## 🔄 轉換相關 (Transitions)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Transition** | 轉換 | 狀態之間的變化 |
| **Eventless Transition** | 無事件轉換 | 自動發生的轉換(always) |
| **Always Transition** | 持續轉換 | 立即評估的無事件轉換 |
| **Delayed Transition** | 延遲轉換 | 延遲後自動觸發的轉換 |
| **After Transition** | 定時轉換 | 使用 after 定義的延遲轉換 |
| **Self Transition** | 自我轉換 | 轉換到自身狀態 |
| **Internal Transition** | 內部轉換 | 不離開當前狀態的轉換 |
| **External Transition** | 外部轉換 | 會離開當前狀態的轉換 |
| **Guarded Transition** | 守衛轉換 | 帶條件的轉換 |
| **Target** | 目標狀態 | 轉換的目的地狀態 |
| **Source** | 來源狀態 | 轉換的起始狀態 |

---

## 🎬 動作 (Actions)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Action** | 動作 / 行為 | 狀態轉換時執行的副作用 |
| **Entry Action** | 進入動作 | 進入狀態時執行的動作 |
| **Exit Action** | 離開動作 | 離開狀態時執行的動作 |
| **Transition Action** | 轉換動作 | 轉換過程中執行的動作 |
| **Fire-and-forget** | 觸發即忘 | 不等待完成的動作執行方式 |
| **Side Effect** | 副作用 | 改變外部狀態的操作 |
| **Assign** | 賦值 / 指派 | 更新 context 的特殊動作 |
| **Raise** | 發出 / 觸發 | 在狀態機內部發送事件 |
| **Send** | 發送 | 向其他 Actor 發送事件 |
| **SendTo** | 發送至 | 向特定 Actor 發送事件 |
| **Log** | 記錄 | 輸出日誌的動作 |
| **Pure Action** | 純動作 | 根據當前狀態計算的動作 |
| **Enqueue Actions** | 排隊動作 | 批次執行多個動作 |

---

## 🛡️ 守衛 (Guards)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Guard** | 守衛 / 條件 | 決定轉換是否執行的條件 |
| **Condition** | 條件 | 守衛的判斷邏輯 |
| **Predicate** | 判定式 | 返回布林值的函數 |
| **In-state Guard** | 狀態判斷守衛 | 檢查是否在特定狀態的守衛 |
| **Guard Check** | 守衛檢查 | 評估守衛條件 |

---

## 🎭 Actor 相關 (Actors)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Actor** | Actor / 執行者 | 獨立的計算實體 |
| **Actor Logic** | Actor 邏輯 | 定義 Actor 行為的邏輯 |
| **State Machine Actor** | 狀態機 Actor | 基於狀態機的 Actor |
| **Promise Actor** | Promise Actor | 基於 Promise 的 Actor |
| **Callback Actor** | 回調 Actor | 基於回調函數的 Actor |
| **Observable Actor** | 可觀察 Actor | 基於 Observable 的 Actor |
| **Transition Actor** | 轉換 Actor | 基於轉換函數的 Actor |
| **Invoke** | 調用 / 啟用 | 在狀態中啟動子 Actor |
| **Spawn** | 生成 / 派生 | 動態建立子 Actor |
| **System** | 系統 | 管理多個 Actor 的容器 |
| **Parent Actor** | 父 Actor | 調用其他 Actor 的 Actor |
| **Child Actor** | 子 Actor | 被其他 Actor 調用的 Actor |

---

## 📨 事件 (Events)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Event** | 事件 | 觸發狀態轉換的訊號 |
| **Event Type** | 事件類型 | 事件的種類標識 |
| **Event Object** | 事件物件 | 包含事件資料的物件 |
| **Event Payload** | 事件載荷 | 事件攜帶的資料 |
| **Custom Event** | 自訂事件 | 使用者定義的事件 |
| **Wildcard Event** | 萬用事件 | 匹配所有事件的特殊事件 |
| **Error Event** | 錯誤事件 | 表示錯誤的事件 |
| **Done Event** | 完成事件 | 表示完成的事件 |
| **Event Emitter** | 事件發射器 | 發出事件的機制 |

---

## 🔧 設定與實作 (Setup & Implementation)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Setup** | 設定 / 配置 | 定義狀態機的初始配置 |
| **Implementation** | 實作 / 實現 | 具體的執行邏輯 |
| **Config** | 配置 | 狀態機的配置物件 |
| **Machine Config** | 機器配置 | 定義狀態機的配置 |
| **Type Definition** | 型別定義 | TypeScript 型別宣告 |
| **Schema** | 結構定義 | 資料結構的定義 |
| **Provide** | 提供 / 注入 | 提供實作給狀態機 |
| **Default Implementation** | 預設實作 | 預先定義的實作 |
| **Override** | 覆寫 / 重載 | 替換預設實作 |

---

## 📥📤 輸入輸出 (Input & Output)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Input** | 輸入 | 傳入 Actor 的初始資料 |
| **Output** | 輸出 | Actor 完成時返回的資料 |
| **Initial Context** | 初始上下文 | 狀態機啟動時的 context 值 |
| **Snapshot** | 快照 | 狀態機在特定時刻的完整狀態 |
| **State Value** | 狀態值 | 當前狀態的識別值 |
| **Event Data** | 事件資料 | 事件攜帶的資料 |

---

## 🔍 檢查與測試 (Inspection & Testing)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Inspection** | 檢查 / 偵測 | 監控狀態機的執行狀態 |
| **Inspector** | 檢查器 | 用於偵測狀態機的工具 |
| **Visualizer** | 視覺化工具 | 圖形化顯示狀態機的工具 |
| **Testing** | 測試 | 驗證狀態機行為 |
| **Model-based Testing** | 基於模型的測試 | 從狀態機生成測試案例 |
| **Test Path** | 測試路徑 | 狀態機的執行路徑 |
| **Coverage** | 覆蓋率 | 測試覆蓋的狀態和轉換 |

---

## 🎯 特殊功能 (Special Features)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Delay** | 延遲 | 定時執行的時間設定 |
| **Timer** | 計時器 | 觸發延遲事件的機制 |
| **Tag** | 標籤 | 標記狀態的元資料 |
| **Meta** | 元資料 | 狀態的附加資訊 |
| **Description** | 描述 | 狀態或轉換的說明文字 |
| **ID** | 識別碼 | 狀態或狀態機的唯一標識 |
| **Type** | 類型 | 元素的類別標識 |
| **Persistence** | 持久化 | 保存和恢復狀態機狀態 |

---

## 🔗 整合 (Integration)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Interpreter** | 解釋器 | 執行狀態機的引擎(舊版) |
| **Service** | 服務 | 執行中的狀態機實例(舊版) |
| **Create Actor** | 建立 Actor | 從邏輯建立 Actor |
| **Create Machine** | 建立機器 | 建立狀態機定義 |
| **Start** | 啟動 | 開始執行 Actor |
| **Stop** | 停止 | 停止執行 Actor |
| **Subscribe** | 訂閱 | 監聽狀態變化 |
| **Subscription** | 訂閱 | 狀態變化的監聽器 |
| **Unsubscribe** | 取消訂閱 | 移除狀態監聽 |

---

## 📚 框架整合 (Framework Integration)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **React Hook** | React Hook | React 的 Hook 整合 |
| **useMachine** | useMachine | React 使用狀態機的 Hook |
| **useActor** | useActor | React 使用 Actor 的 Hook |
| **useSelector** | useSelector | React 選擇狀態的 Hook |
| **Vue Composition** | Vue 組合式 API | Vue 3 的整合方式 |
| **Svelte Store** | Svelte Store | Svelte 的狀態整合 |

---

## 🏗️ 進階概念 (Advanced Concepts)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **SCXML** | SCXML 規範 | 狀態圖 XML 標準 |
| **Hierarchical State** | 階層狀態 | 包含子狀態的狀態結構 |
| **Orthogonal Region** | 正交區域 | 並行執行的獨立區域 |
| **Compound Transition** | 複合轉換 | 跨越多個層級的轉換 |
| **Boolean Explosion** | 布林值爆炸 | 用布林值管理狀態的複雜度問題 |
| **Impossible State** | 不可能狀態 | 邏輯上不應存在的狀態組合 |
| **State Explosion** | 狀態爆炸 | 狀態數量指數增長的問題 |

---

## 🔄 生命週期 (Lifecycle)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Lifecycle** | 生命週期 | Actor 從創建到銷毀的過程 |
| **Mount** | 掛載 | Actor 開始執行 |
| **Unmount** | 卸載 | Actor 停止執行 |
| **Initialization** | 初始化 | Actor 的啟動過程 |
| **Cleanup** | 清理 | Actor 停止時的清理工作 |
| **Disposal** | 釋放 | 銷毀 Actor 並釋放資源 |

---

## 📝 常見組合詞 (Common Phrases)

| 英文 | 繁體中文 |
|------|---------|
| **State Management** | 狀態管理 |
| **State Transition** | 狀態轉換 |
| **State Chart** | 狀態圖 |
| **Event-driven** | 事件驅動 |
| **Declarative** | 宣告式 |
| **Imperative** | 命令式 |
| **Pure Function** | 純函數 |
| **Side Effect** | 副作用 |
| **Async Operation** | 異步操作 |
| **Synchronous** | 同步的 |
| **Asynchronous** | 異步的 |
| **Deterministic** | 確定性的 |
| **Non-deterministic** | 非確定性的 |
| **Reactive** | 響應式 / 反應式 |
| **Observable** | 可觀察的 |

---

## 💻 程式碼相關術語 (Code-Related Terms)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **createMachine** | 建立機器 | XState 的機器建立函數 |
| **createActor** | 建立 Actor | XState 的 Actor 建立函數 |
| **setup** | 設定 | XState 的設定函數 |
| **assign** | 賦值 | 更新 context 的函數 |
| **fromPromise** | 從 Promise | 建立 Promise Actor |
| **fromTransition** | 從轉換 | 建立轉換 Actor |
| **fromObservable** | 從 Observable | 建立 Observable Actor |
| **fromCallback** | 從回調 | 建立回調 Actor |
| **waitFor** | 等待 | 等待狀態達到條件 |
| **resolveState** | 解析狀態 | 解析狀態物件 |

---

## 🎨 視覺化術語 (Visualization Terms)

| 英文 | 繁體中文 | 說明 |
|------|---------|------|
| **Node** | 節點 | 狀態圖中的狀態 |
| **Edge** | 邊 / 連線 | 狀態之間的轉換線 |
| **Arrow** | 箭頭 | 指示轉換方向 |
| **Diagram** | 圖表 | 狀態機的視覺表示 |
| **Graph** | 圖 | 狀態和轉換的結構 |
| **Flow** | 流程 | 狀態轉換的順序 |

---

## 📋 使用建議

### 1. 保持一致性
在同一份文件中,相同術語應使用相同翻譯。建議:
- **Actor** → 統一使用 "Actor"(不翻譯)
- **Context** → 統一使用 "上下文"
- **Event** → 統一使用 "事件"

### 2. 可不翻譯的術語
以下術語建議保持英文:
- Actor
- Hook (在 React 環境中)
- SCXML
- XState
- API 名稱(如 `createMachine`, `useMachine`)

### 3. 需要注意的術語
- **State**: 根據語境可能是「狀態」或「狀態值」
- **Machine**: 可譯為「機器」或「狀態機」,需看語境
- **Service**: XState v5 已改用 Actor,舊文件才會看到
- **Interpreter**: XState v5 已廢棄,改用 Actor

### 4. 括號註釋建議
首次出現時可加註英文:
```
Actor(執行者)
上下文(Context)
守衛(Guard)
```

後續可省略英文,直接使用中文。

---

## 🔄 版本差異術語

### XState v4 → v5 變更

| v4 術語 | v5 術語 | 中文 |
|---------|---------|------|
| **Interpreter** | **Actor** | 解釋器 → Actor |
| **Service** | **Actor** | 服務 → Actor |
| **Machine.start()** | **createActor()** | 啟動方式變更 |
| **invoke** | **invoke** | 保持不變 |
| **spawn** | **spawn** | 保持不變 |

---

## 📖 參考資源

- [XState 官方文件](https://stately.ai/docs)
- [狀態機維基百科](https://zh.wikipedia.org/wiki/有限状态机)
- [Actor 模型](https://zh.wikipedia.org/wiki/參與者模式)

---

## 💡 翻譯範例

### 原文
```
A state machine actor is created using the createActor function. 
The actor can receive events and transition to different states 
based on the current state and the event received.
```

### 翻譯
```
狀態機 Actor 使用 createActor 函數建立。
Actor 可以接收事件,並根據當前狀態和接收到的事件轉換到不同的狀態。
```

---

需要我:
- 🔍 補充更多特定領域的術語?
- 📝 提供更多翻譯範例?
- 🛠️ 調整某些術語的翻譯方式?