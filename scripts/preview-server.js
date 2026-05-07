const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 5173);
const repoRoot = path.resolve(__dirname, '..');
const root = path.resolve(repoRoot, 'apps', 'mobile', 'preview');

loadLocalEnv(path.join(repoRoot, '.env'));

const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
};

function loadLocalEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });

    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function extractResponseText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const textParts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === 'string') {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join('\n').trim();
}

async function handleChatRequest(request, response) {
  if (!openaiApiKey) {
    sendJson(response, 500, {
      error: 'OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다.',
    });
    return;
  }

  let payload;
  try {
    const body = await readRequestBody(request);
    payload = JSON.parse(body || '{}');
  } catch (error) {
    sendJson(response, 400, { error: '요청 JSON을 읽을 수 없습니다.' });
    return;
  }

  const message = String(payload.message || '').trim();
  if (!message) {
    sendJson(response, 400, { error: 'message가 비어 있습니다.' });
    return;
  }

  const context = payload.context || {};
  const appContext = [
    `레벨: ${context.level ?? '알 수 없음'}`,
    `오늘 획득 EXP: ${context.todayExp ?? 0}`,
    `오늘 탑승 횟수: ${context.todayRides ?? 0}`,
    `오늘 이동 정거장: ${context.todayStations ?? 0}`,
    `오늘 환승 횟수: ${context.todayTransfers ?? 0}`,
    `오늘 신규 방문: ${context.todayNewVisits ?? 0}`,
  ].join('\n');

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openaiModel,
        instructions:
          '너는 티머니 티티 앱의 귀여운 이동 도우미 티티야. ' +
          '사용자에게 한국어로 짧고 다정하게 답하고, 이동 기록/경험치/보상/하차 알림과 관련된 질문을 도와줘. ' +
          '확실하지 않은 실제 교통 도착 정보는 추측하지 말고 앱에서 확인해야 한다고 말해.',
        input: `앱 상태:\n${appContext}\n\n사용자 질문: ${message}`,
        max_output_tokens: 220,
      }),
    });

    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      sendJson(response, openaiResponse.status, {
        error: data.error?.message || 'OpenAI API 요청에 실패했습니다.',
      });
      return;
    }

    sendJson(response, 200, {
      reply: extractResponseText(data) || '좋아, 티티가 확인해볼게!',
    });
  } catch (error) {
    sendJson(response, 500, {
      error: '채팅 응답을 가져오지 못했습니다.',
    });
  }
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://localhost:${port}`);

  if (request.method === 'POST' && requestUrl.pathname === '/api/chat') {
    handleChatRequest(request, response);
    return;
  }

  const relativePath = requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname.slice(1);
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
    });
    response.end(data);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Preview server running at http://localhost:${port}`);
});
