#!/usr/bin/env node
/**
 * MCP server for Years--Collect — query latest monitor snapshots from AI tools.
 * Zero third-party deps; speaks MCP JSON-RPC over stdio.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LATEST = join(ROOT, 'data', 'latest.json');
const DATA = join(ROOT, 'data.json');

function loadLatest() {
  if (existsSync(LATEST)) {
    return JSON.parse(readFileSync(LATEST, 'utf8'));
  }
  if (existsSync(DATA)) {
    const d = JSON.parse(readFileSync(DATA, 'utf8'));
    const resources = (d.apis || []).map((a) => {
      const last = (a.history || [])[(a.history || []).length - 1] || {};
      return {
        id: a.id,
        name: a.name,
        link: a.api,
        description: a.note || a.source || '',
        uptime: '-',
        health: {
          is_alive: !!last.ok,
          response_time_ms: last.ms ?? null,
          status_code: a.http ?? null,
          error: last.ok ? null : 'last probe failed',
        },
      };
    });
    return {
      timestamp: d.updated,
      source: d.repo,
      resources,
      stats: {
        total: resources.length,
        alive: resources.filter((r) => r.health.is_alive).length,
      },
    };
  }
  return { resources: [], timestamp: null, stats: {} };
}

function alive(r) {
  return !!r?.health?.is_alive;
}

const tools = {
  get_all_resources: {
    description: '获取所有监测的采集接口列表及其状态信息',
    inputSchema: { type: 'object', properties: {} },
    handler() {
      const data = loadLatest();
      const resources = data.resources || [];
      let out = `采集站信号台监测数据 (更新时间: ${data.timestamp || '未知'})\n\n共监测 ${resources.length} 个接口\n\n`;
      resources.forEach((r, idx) => {
        const health = r.health || {};
        out += `${idx + 1}. ${r.name || '未知'}\n`;
        out += `   链接: ${r.link || '-'}\n`;
        out += `   状态: ${alive(r) ? '在线' : '离线'}\n`;
        out += `   HTTP: ${health.status_code ?? '-'}\n`;
        out += `   响应: ${health.response_time_ms ?? '-'}ms\n`;
        out += `   可用率: ${r.uptime || '-'}\n\n`;
      });
      return out;
    },
  },
  get_online_resources: {
    description: '获取当前所有在线的采集接口',
    inputSchema: { type: 'object', properties: {} },
    handler() {
      const data = loadLatest();
      const online = (data.resources || []).filter(alive);
      let out = `在线接口 (${online.length} 个):\n\n`;
      online.forEach((r, idx) => {
        out += `${idx + 1}. ${r.name}\n   ${r.link}\n   ${r.health?.response_time_ms ?? '-'}ms\n\n`;
      });
      return out;
    },
  },
  get_offline_resources: {
    description: '获取当前所有离线的采集接口及原因',
    inputSchema: { type: 'object', properties: {} },
    handler() {
      const data = loadLatest();
      const offline = (data.resources || []).filter((r) => !alive(r));
      let out = `离线接口 (${offline.length} 个):\n\n`;
      offline.forEach((r, idx) => {
        out += `${idx + 1}. ${r.name}\n   ${r.link}\n   原因: ${r.health?.error || '未知'}\n\n`;
      });
      return out;
    },
  },
  get_statistics: {
    description: '获取监测统计信息（在线率、响应时间）',
    inputSchema: { type: 'object', properties: {} },
    handler() {
      const data = loadLatest();
      const resources = data.resources || [];
      const total = resources.length;
      const online = resources.filter(alive).length;
      const times = resources
        .map((r) => r.health?.response_time_ms)
        .filter((n) => typeof n === 'number' && n > 0);
      const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      return [
        '采集站信号台统计',
        `更新时间: ${data.timestamp || '未知'}`,
        `总计: ${total}`,
        `在线: ${online}`,
        `离线: ${total - online}`,
        `在线率: ${total ? ((online / total) * 100).toFixed(1) : 0}%`,
        `平均响应: ${avg.toFixed(1)}ms`,
        `最快: ${times.length ? Math.min(...times) : '-'}ms`,
        `最慢: ${times.length ? Math.max(...times) : '-'}ms`,
      ].join('\n');
    },
  },
  search_resource: {
    description: '按关键词搜索采集接口（名称/描述/链接）',
    inputSchema: {
      type: 'object',
      properties: { keyword: { type: 'string', description: '搜索关键词' } },
      required: ['keyword'],
    },
    handler({ keyword }) {
      const q = String(keyword || '').toLowerCase();
      const data = loadLatest();
      const matches = (data.resources || []).filter((r) =>
        `${r.name || ''} ${r.description || ''} ${r.link || ''}`.toLowerCase().includes(q));
      if (!matches.length) return `未找到包含 '${keyword}' 的接口`;
      let out = `搜索 '${keyword}' 结果 (${matches.length} 个):\n\n`;
      matches.forEach((r, idx) => {
        out += `${idx + 1}. ${alive(r) ? '[在线]' : '[离线]'} ${r.name}\n   ${r.link}\n\n`;
      });
      return out;
    },
  },
  get_fastest_resources: {
    description: '获取响应速度最快的在线接口',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'number', description: '返回数量，默认 5' } },
    },
    handler({ limit = 5 } = {}) {
      const data = loadLatest();
      const valid = (data.resources || [])
        .filter((r) => alive(r) && typeof r.health?.response_time_ms === 'number')
        .map((r) => [r, r.health.response_time_ms])
        .sort((a, b) => a[1] - b[1])
        .slice(0, Number(limit) || 5);
      let out = `响应最快接口 (Top ${valid.length}):\n\n`;
      valid.forEach(([r, ms], idx) => {
        out += `${idx + 1}. ${r.name}\n   ${r.link}\n   ${ms}ms\n\n`;
      });
      return out;
    },
  },
};

function send(msg) {
  process.stdout.write(`${JSON.stringify(msg)}\n`);
}

function ok(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function fail(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

function handle(msg) {
  const { id, method, params } = msg;
  if (method === 'initialize') {
    return ok(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'years-collect-monitor', version: '1.0.0' },
    });
  }
  if (method === 'notifications/initialized' || method === 'initialized') return;
  if (method === 'tools/list') {
    return ok(id, {
      tools: Object.entries(tools).map(([name, t]) => ({
        name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    });
  }
  if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments || {};
    const tool = tools[name];
    if (!tool) return fail(id, -32601, `Unknown tool: ${name}`);
    try {
      const text = tool.handler(args);
      return ok(id, { content: [{ type: 'text', text: String(text) }] });
    } catch (err) {
      return ok(id, {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      });
    }
  }
  if (method === 'ping') return ok(id, {});
  if (id !== undefined) fail(id, -32601, `Method not found: ${method}`);
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    handle(JSON.parse(trimmed));
  } catch (err) {
    send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: err.message } });
  }
});

console.error('Years--Collect MCP server ready (stdio)');
