const questions = [
  {
    number: 1, category: '基础', categoryLabel: '基础查询', difficulty: '简单', title: '筛选本月的新用户',
    description: '从 users 表中找出本月注册的用户，按注册时间从新到旧排列。', table: 'users', columns: [['id', 'INT'], ['name', 'TEXT'], ['email', 'TEXT'], ['created_at', 'DATE']],
    starter: "SELECT name, email\nFROM users\nWHERE created_at >= '2026-09-01'\nORDER BY created_at DESC;", result: [['name', 'email'], ['林默', 'linmo@example.com'], ['周宁', 'zhouning@example.com']]
  },
  {
    number: 2, category: '基础', categoryLabel: '基础查询', difficulty: '简单', title: '找出价格最高的商品',
    description: '查询商品表中价格最高的三个商品，展示商品名称和价格。', table: 'products', columns: [['product_id', 'INT'], ['product_name', 'TEXT'], ['price', 'DECIMAL'], ['stock', 'INT']],
    starter: 'SELECT product_name, price\nFROM products\nORDER BY price DESC\nLIMIT 3;', result: [['product_name', 'price'], ['无线耳机 Pro', '¥899'], ['机械键盘', '¥699'], ['桌面音箱', '¥499']]
  },
  {
    number: 3, category: '聚合', categoryLabel: '聚合查询', difficulty: '中等', title: '找出消费次数最多的用户',
    description: '统计每位用户的订单数量，返回订单数最多的用户姓名和订单数。', table: 'orders', columns: [['order_id', 'INT'], ['user_name', 'TEXT'], ['amount', 'DECIMAL'], ['created_at', 'DATE']],
    starter: 'SELECT user_name, COUNT(*) AS order_count\nFROM orders\nGROUP BY user_name\nORDER BY order_count DESC\nLIMIT 1;', result: [['user_name', 'order_count'], ['陈思远', '18']]
  },
  {
    number: 4, category: '聚合', categoryLabel: '聚合查询', difficulty: '中等', title: '计算每月的平均订单金额',
    description: '按月份统计订单平均金额，只展示平均金额超过 300 元的月份。', table: 'orders', columns: [['order_id', 'INT'], ['amount', 'DECIMAL'], ['created_at', 'DATE'], ['status', 'TEXT']],
    starter: "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,\n       ROUND(AVG(amount), 2) AS avg_amount\nFROM orders\nGROUP BY month\nHAVING avg_amount > 300;", result: [['month', 'avg_amount'], ['2026-08', '428.50'], ['2026-09', '361.25']]
  },
  {
    number: 5, category: '连接', categoryLabel: '多表连接', difficulty: '困难', title: '列出每位用户的最后一笔订单',
    description: '连接 users 和 orders 表，找出每位用户最近一次订单的金额和日期。', table: 'users + orders', columns: [['user_id', 'INT'], ['user_name', 'TEXT'], ['amount', 'DECIMAL'], ['created_at', 'DATE']],
    starter: 'SELECT u.name, o.amount, o.created_at\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE o.created_at = (SELECT MAX(created_at) FROM orders);', result: [['name', 'amount', 'created_at'], ['林默', '¥268', '2026-09-28'], ['陈思远', '¥899', '2026-09-27']]
  }
];

let currentIndex = 2;
let selectedFilter = 'all';
const $ = (id) => document.getElementById(id);

function renderQuestion(index) {
  const question = questions[index];
  currentIndex = index;
  $('questionNumber').textContent = `第 ${String(question.number).padStart(2, '0')} 题`;
  $('difficultyLabel').textContent = question.difficulty;
  $('difficultyLabel').className = `difficulty ${question.difficulty === '困难' ? 'hard' : question.difficulty === '简单' ? 'easy' : 'medium'}`;
  $('challengeCategory').textContent = question.categoryLabel;
  $('challengeTitle').textContent = question.title;
  $('challengeDescription').textContent = question.description;
  $('schemaColumns').innerHTML = question.columns.map(([name, type]) => `<span>${name} <em>${type}</em></span>`).join('');
  document.querySelector('.schema-heading span:nth-child(2)').textContent = question.table;
  $('sqlInput').value = question.starter;
  updateLineNumbers();
  $('feedback').hidden = true;
  $('resultStatus').textContent = '等待运行';
  $('resultStatus').className = 'result-status';
  $('resultContent').innerHTML = '<span class="result-placeholder">运行查询后，结果会显示在这里</span>';
  $('progressText').textContent = `${question.number} / 8`;
  $('progressFill').style.width = `${Math.min(question.number / 8 * 100, 100)}%`;
  $('bookmarkButton').classList.remove('saved');
  $('bookmarkButton').innerHTML = '<span aria-hidden="true">☆</span>';
}

function updateLineNumbers() {
  const count = $('sqlInput').value.split('\n').length;
  $('lineNumbers').innerHTML = Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1).join('<br>');
}

function renderResult(question) {
  const [headers, ...rows] = question.result;
  $('resultContent').innerHTML = `<table class="result-table"><thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function runQuery() {
  const sql = $('sqlInput').value.trim();
  if (!sql) {
    showToast('先写一点 SQL，再运行查询');
    $('sqlInput').focus();
    return;
  }
  renderResult(questions[currentIndex]);
  $('resultStatus').textContent = '执行成功 · 2 行';
  $('resultStatus').className = 'result-status success';
  showToast('查询执行完成');
}

function submitAnswer() {
  const sql = $('sqlInput').value.trim().toLowerCase();
  const question = questions[currentIndex];
  renderResult(question);
  $('resultStatus').textContent = '执行成功 · 2 行';
  $('resultStatus').className = 'result-status success';
  const hasSelect = sql.includes('select');
  const hasGroup = question.category === '聚合' ? sql.includes('group by') : true;
  const feedback = $('feedback');
  feedback.hidden = false;
  feedback.classList.toggle('incorrect', !(hasSelect && hasGroup));
  $('feedbackIcon').textContent = hasSelect && hasGroup ? '✓' : '!';
  $('feedbackTitle').textContent = hasSelect && hasGroup ? '回答正确' : '再检查一下';
  $('feedbackText').textContent = hasSelect && hasGroup ? '很漂亮，这个查询返回了正确的结果。' : '记得从目标表中查询，并使用题目需要的聚合条件。';
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelectorAll('.category-tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.category-tab').forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  selectedFilter = tab.dataset.filter;
  const matching = questions.findIndex((question) => selectedFilter === 'all' || question.category === selectedFilter);
  if (matching >= 0) renderQuestion(matching);
}));

$('runButton').addEventListener('click', submitAnswer);
$('resetButton').addEventListener('click', () => { renderQuestion(currentIndex); showToast('已恢复本题初始答案'); });
$('nextButton').addEventListener('click', () => {
  const next = (currentIndex + 1) % questions.length;
  renderQuestion(next);
  showToast(`已切换到第 ${questions[next].number} 题`);
});
$('bookmarkButton').addEventListener('click', () => {
  const button = $('bookmarkButton');
  const saved = button.classList.toggle('saved');
  button.innerHTML = `<span aria-hidden="true">${saved ? '★' : '☆'}</span>`;
  showToast(saved ? '已加入收藏' : '已取消收藏');
});
$('allQuestionsButton').addEventListener('click', () => { document.querySelector('[data-filter="all"]').click(); showToast('已显示全部题目'); });
$('profileButton').addEventListener('click', () => showToast('个人学习档案即将开放'));
document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('active'));
  item.classList.add('active');
  if (item.dataset.nav !== '练习') showToast(`${item.dataset.nav}模块即将开放`);
}));
$('sqlInput').addEventListener('input', updateLineNumbers);
$('sqlInput').addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); submitAnswer(); } });

renderQuestion(currentIndex);
