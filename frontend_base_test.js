// Test script for /ws/base WebSocket handler
console.log('Testing /ws/base WebSocket connection...');

// 引入统一管理的URL配置
// 注意：浏览器环境下需确保url_config.js已在HTML中通过<script>标签引入
const baseWs = new WebSocket(`${WS_BASE_URL}/ws/base`); // 使用统一配置

baseWs.onopen = function() {
    console.log('✅ Connected to /ws/base');
    
    // Send authentication message
    const authMessage = {
        user_id: "test_user_base"
    };
    console.log('🔐 Sending authentication:', authMessage);
    baseWs.send(JSON.stringify(authMessage));
};

baseWs.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('📨 Received from /ws/base:', data);
    
    if (data.status === 'authenticated') {
        console.log('✅ Authentication successful for user:', data.user_id);
        
        // Send a test message after authentication
        setTimeout(() => {
            const testMessage = {
                content: "Hello from base test client!",
                timestamp: new Date().toISOString()
            };
            console.log('📤 Sending test message:', testMessage);
            baseWs.send(JSON.stringify(testMessage));
        }, 1000);
    }
};

baseWs.onclose = function() {
    console.log('❌ /ws/base connection closed');
};

baseWs.onerror = function(error) {
    console.log('⚠️ /ws/base error:', error);
};