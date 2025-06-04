#!/usr/bin/env node

/**
 * Simple test script for MCP server
 */

import { spawn } from 'child_process';

console.log('🧪 Testing MCP Server...');

// Set environment variables
const env = {
  ...process.env,
  DATABASE_URL: 'postgresql://postgres:password@localhost:5432/padle_world_club'
};

// Spawn MCP server
const mcpServer = spawn('node', ['dist/index.js'], {
  env,
  stdio: ['pipe', 'pipe', 'inherit']
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    },
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

console.log('📤 Sending initialize request...');
mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

// Listen for responses
mcpServer.stdout.on('data', (data) => {
  const response = data.toString().trim();
  console.log('📥 Received response:', response);
  
  try {
    const parsed = JSON.parse(response);
    if (parsed.id === 1) {
      console.log('✅ MCP Server initialized successfully!');
      console.log('🔧 Available tools:', parsed.result?.capabilities?.tools || 'none');
      console.log('📚 Available resources:', parsed.result?.capabilities?.resources || 'none');
      console.log('💬 Available prompts:', parsed.result?.capabilities?.prompts || 'none');
      
      // Test tools/list request
      const toolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      };
      
      console.log('📤 Requesting tools list...');
      mcpServer.stdin.write(JSON.stringify(toolsRequest) + '\n');
    } else if (parsed.id === 2) {
      console.log('🔧 Available tools:');
      parsed.result?.tools?.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
      
      // Close the server
      mcpServer.kill();
      console.log('🎉 Test completed successfully!');
    }
  } catch (error) {
    console.error('❌ Failed to parse response:', error);
  }
});

mcpServer.on('error', (error) => {
  console.error('❌ MCP Server error:', error);
});

mcpServer.on('close', (code) => {
  console.log(`🛑 MCP Server closed with code ${code}`);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - killing server');
  mcpServer.kill();
}, 10000);
