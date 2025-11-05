const exprEl = document.getElementById('expr');
const outEl = document.getElementById('out');
const keys = document.getElementById('keys');
let expression = '';

function refresh() {
  exprEl.textContent = expression || ' ';
}

keys.addEventListener('click', e => {
  const btn = e.target.closest('button[data-val]');
  if (!btn) return;
  const v = btn.dataset.val;
  if (v === '=') return;
  expression += v;
  outEl.textContent = expression;
  refresh();
});

document.getElementById('btnEquals').onclick = () => compute(expression);
document.getElementById('btnClear').onclick = () => {
  expression = '';
  outEl.textContent = '0';
  refresh();
};
document.getElementById('btnDel').onclick = () => {
  expression = expression.slice(0, -1);
  outEl.textContent = expression || '0';
  refresh();
};

function compute(expr) {
  try {

    if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
      outEl.textContent = "Xato!";
      return;
    }
    const val = Function("return " + expr)();
    if (isFinite(val)) {
      outEl.textContent = val;
      expression = String(val);
    } else {
      outEl.textContent = "Xato!";
    }
  } catch (e) {
    outEl.textContent = "Xato!";
  }
}


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const btnVoice = document.getElementById('btnVoice');
const status = document.getElementById('status');
let rec = null;

if (SpeechRecognition) {
  rec = new SpeechRecognition();
  rec.lang = 'uz-UZ';
  rec.interimResults = false;

  rec.onstart = () => status.textContent = '🎙️ Tinglanmoqda...';
  rec.onend = () => status.textContent = 'Holat: tayyor';
  rec.onerror = e => status.textContent = 'Xato: ' + (e.error || e.message);

  rec.onresult = e => {
    const text = e.results[0][0].transcript;
    status.textContent = 'Tanish: ' + text;
    const expr = convertSpokenToExpr(text);
    if (expr) {
      expression = expr;
      outEl.textContent = expr;
      compute(expr);
    } else {
      outEl.textContent = 'Tanimadi';
    }
  };

  btnVoice.onclick = () => rec.start();
} else {
  btnVoice.disabled = true;
  status.textContent = "Ovozli tanish brauzerda yo‘q.";
}


const words = {
  "nol": 0, "bir": 1, "ikki": 2, "uch": 3, "tort": 4, "to'rt": 4,
  "besh": 5, "olti": 6, "yetti": 7, "sakkiz": 8, "to'qqiz": 9,
  "on": 10, "o'n": 10, "yigirma": 20, "ottiz": 30, "o'ttiz": 30,
  "qirq": 40, "ellik": 50, "oltmish": 60, "yetmish": 70,
  "sakson": 80, "to'qson": 90, "yuz": 100
};

const ops = [
  ["qo'sh", "+"], ["qosh", "+"], ["plus", "+"],
  ["ayir", "-"], ["minus", "-"],
  ["bo'lin", "/"], ["bolin", "/"], ["divide", "/"],
  ["kopaytir", "*"], ["ko'paytir", "*"], ["times", "*"]
];

function convertSpokenToExpr(t) {
  if (!t) return '';
  t = t.toLowerCase().replace(/[.,!?]/g, ' ');
  ops.forEach(([k, s]) => {
    t = t.replace(new RegExp(k, 'g'), ' ' + s + ' ');
  });

  const toks = t.split(/\s+/).filter(Boolean);
  const res = [];
  let currentNum = 0;
  let hasNum = false;

  function pushNum() {
    if (hasNum) {
      res.push(currentNum);
      currentNum = 0;
      hasNum = false;
    }
  }

  toks.forEach(tok => {
    if (words[tok] !== undefined) {
      currentNum += words[tok];
      hasNum = true;
    } else if (/^\d+$/.test(tok)) {
      currentNum += parseInt(tok);
      hasNum = true;
    } else if (["+", "-", "*", "/"].includes(tok)) {
      pushNum();
      res.push(tok);
    }
  });

  pushNum();
  return res.join(' ');
}
