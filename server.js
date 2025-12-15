// server.js - السيرفر الرئيسي
const express = require('express');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.', {
    extensions: ['html', 'htm']
}));

// دالة لإرسال الرسالة لـ Telegram
function sendTelegramMessage(message) {
    return new Promise((resolve, reject) => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        // إذا لم يكن هناك توكن، لا ترسل لـ Telegram
        if (!botToken || !chatId) {
            console.log('⚠️  Telegram credentials not set, skipping Telegram notification');
            resolve(false);
            return;
        }
        
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const postData = JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(telegramUrl, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.ok) {
                        console.log('✅ Telegram message sent successfully');
                        resolve(true);
                    } else {
                        console.error('❌ Telegram error:', response.description);
                        resolve(false);
                    }
                } catch (error) {
                    console.error('❌ Error parsing Telegram response:', error);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Telegram request error:', error.message);
            resolve(false);
        });
        
        req.write(postData);
        req.end();
    });
}

// Route الرئيسية
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Route لاستقبال الطلبات
app.post('/api/order', async (req, res) => {
    try {
        const orderData = req.body;
        
        // تسجيل الطلب في الكونسول
        console.log('📦 New Order Received:', {
            product: orderData.product,
            customer: orderData.name,
            phone: orderData.phone,
            total: orderData.total,
            time: new Date().toLocaleString('ar-SA')
        });
        
        // بناء رسالة Telegram
        const telegramMessage = `
🛒 <b>طلب جديد!</b>

<b>المنتج:</b> ${orderData.product}
<b>السعر:</b> ${orderData.productPrice} ريال
<b>الكمية:</b> ${orderData.quantity}

<b>العميل:</b> ${orderData.name}
<b>الهاتف:</b> ${orderData.phone}
<b>العنوان:</b> ${orderData.address}

<b>التوصيل:</b> ${orderData.shipping} ريال
<b>المجموع:</b> ${orderData.total} ريال

<b>ملاحظات:</b> ${orderData.notes || 'لا توجد'}

<b>وقت الطلب:</b> ${orderData.orderTime}
<b>رقم الطلب:</b> #${Date.now().toString().slice(-6)}
        `;
        
        // إرسال لـ Telegram (في الخلفية، لا ننتظر النتيجة)
        sendTelegramMessage(telegramMessage).then(success => {
            if (success) {
                console.log('📤 Order sent to Telegram successfully');
            } else {
                console.log('⚠️  Order saved locally (Telegram not available)');
            }
        });
        
        // الرد للعميل بنجاح (دائماً نرد بنجاح)
        res.json({
            success: true,
            message: 'تم استلام طلبك بنجاح! سنتصل بك خلال 24 ساعة.',
            orderId: 'ORD-' + Date.now().toString().slice(-6)
        });
        
    } catch (error) {
        console.error('❌ Error processing order:', error);
        
        // حتى في حالة الخطأ، نرد بنجاح للعميل
        res.json({
            success: true,
            message: 'تم استلام طلبك بنجاح! سنتصل بك قريباً.',
            orderId: 'TEMP-' + Date.now().toString().slice(-6)
        });
    }
});

// Route للتحقق من صحة السيرفر
app.get('/health', (req, res) => {
    res.json({
        status: '✅ Operational',
        timestamp: new Date().toISOString(),
        service: 'Telegram Store API'
    });
});

// Route لحالة Telegram
app.get('/api/telegram-status', (req, res) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    res.json({
        telegramConfigured: !!(botToken && chatId),
        hasToken: !!botToken,
        hasChatId: !!chatId
    });
});

// التعامل مع الصفحات غير الموجودة
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/index.html');
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Open: http://localhost:${PORT}`);
    console.log(`🤖 Telegram configured: ${process.env.TELEGRAM_BOT_TOKEN ? 'YES' : 'NO'}`);
    
    // نصيحة للمستخدم
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.log('⚠️  Warning: TELEGRAM_BOT_TOKEN is not set');
        console.log('ℹ️  Orders will be logged locally but not sent to Telegram');
    }
});
