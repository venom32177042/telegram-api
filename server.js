// ============================================
// متجر Telegram - الإصدار المعدل لمتغير واحد
// ============================================

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 1. إعدادات Telegram - متغير واحد فقط
// ============================================
// التنسيق: token,chat_id  (بدون مسافات بينهما)
const TELEGRAM_CONFIG = process.env.TELEGRAM_CONFIG || "";
let TELEGRAM_BOT_TOKEN = "";
let TELEGRAM_CHAT_ID = "";

// فصل التوكن ورقم الدردشة من متغير واحد
if (TELEGRAM_CONFIG && TELEGRAM_CONFIG.includes(',')) {
    const parts = TELEGRAM_CONFIG.split(',');
    TELEGRAM_BOT_TOKEN = parts[0] ? parts[0].trim() : "";
    TELEGRAM_CHAT_ID = parts[1] ? parts[1].trim() : "";
    
    console.log('✅ إعدادات Telegram جاهزة');
    console.log(`   🤖 التوكن: ${TELEGRAM_BOT_TOKEN ? 'مضبوط' : 'مفقود'}`);
    console.log(`   💬 رقم الدردشة: ${TELEGRAM_CHAT_ID ? 'مضبوط' : 'مفقود'}`);
} else {
    console.log('⚠️  تنبيه: TELEGRAM_CONFIG غير مضبوط أو تنسيقه خاطئ');
    console.log('   - التنسيق الصحيح: التوكن,رقم_الدردشة');
    console.log('   - مثال: 123456:ABCdef,987654321');
}

// Middleware
app.use(express.json());
app.use(express.static('.'));

// ============================================
// 2. دالة إرسال Telegram
// ============================================
async function sendTelegramMessage(orderData) {
    // إذا لم تكن الإعدادات مكتملة
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('📝 طلب مستلم (لم يتم الإرسال لـ Telegram)');
        console.log('   السبب: إعدادات Telegram غير مكتملة');
        return { success: false, reason: 'telegram_not_configured' };
    }
    
    try {
        const message = `
🛒 **طلب جديد!** #${Date.now().toString().slice(-6)}

📦 **المنتج:** ${orderData.product}
💰 **السعر:** ${orderData.productPrice} ريال
🔢 **الكمية:** ${orderData.quantity}

👤 **العميل:** ${orderData.name}
📱 **الهاتف:** ${orderData.phone}
📍 **العنوان:** ${orderData.address}

💵 **المجموع:** ${orderData.total} ريال
📝 **الملاحظات:** ${orderData.notes || 'لا توجد'}

⏰ **الوقت:** ${orderData.orderTime}
        `;
        
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            console.log(`✅ تم إرسال الطلب إلى Telegram (Message ID: ${data.result.message_id})`);
            return { success: true, messageId: data.result.message_id };
        } else {
            console.error('❌ فشل إرسال Telegram:', data.description);
            return { success: false, reason: 'telegram_error', error: data.description };
        }
        
    } catch (error) {
        console.error('❌ خطأ في إرسال Telegram:', error.message);
        return { success: false, reason: 'network_error', error: error.message };
    }
}

// ============================================
// 3. مسارات API
// ============================================

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// استقبال الطلبات
app.post('/api/order', async (req, res) => {
    console.log('\n📦 === طلب جديد ورد ===');
    
    try {
        const orderData = req.body;
        
        // تسجيل بيانات الطلب
        console.log(`   المنتج: ${orderData.product}`);
        console.log(`   العميل: ${orderData.name}`);
        console.log(`   الهاتف: ${orderData.phone}`);
        console.log(`   المجموع: ${orderData.total} ريال`);
        console.log(`   الوقت: ${new Date().toLocaleString('ar-SA')}`);
        
        // محاولة الإرسال إلى Telegram
        const telegramResult = await sendTelegramMessage(orderData);
        
        // الرد للعميل (دائماً نجاح)
        const response = {
            success: true,
            message: 'تم استلام طلبك بنجاح! سنتصل بك خلال 24 ساعة.',
            orderId: 'ORD-' + Date.now().toString().slice(-6),
            telegramSent: telegramResult.success
        };
        
        console.log(`   ✅ تم الرد للعميل: ${response.orderId}`);
        console.log(`   📤 حالة Telegram: ${telegramResult.success ? 'نعم' : 'لا'}`);
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ خطأ في معالجة الطلب:', error);
        
        // حتى مع الخطأ، نرد بنجاح للعميل
        res.json({
            success: true,
            message: 'تم استلام طلبك بنجاح!',
            orderId: 'TEMP-' + Date.now().toString().slice(-6),
            telegramSent: false
        });
    }
    
    console.log('📦 === نهاية الطلب ===\n');
});

// صفحة الحالة
app.get('/status', (req, res) => {
    const status = {
        service: 'متجر Telegram',
        status: '🟢 يعمل',
        port: PORT,
        telegramConfigured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
        hasToken: !!TELEGRAM_BOT_TOKEN,
        hasChatId: !!TELEGRAM_CHAT_ID,
        timestamp: new Date().toISOString()
    };
    
    console.log('📊 حالة الخدمة:', status);
    res.json(status);
});

// صفحة 404
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/index.html');
});

// ============================================
// 4. تشغيل الخادم
// ============================================
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 متجر Telegram يعمل الآن!');
    console.log('='.repeat(50));
    console.log(`   🔗 الرابط: http://localhost:${PORT}`);
    console.log(`   🔗 الرابط العام: https://telegram-venom.onrender.com`);
    console.log(`   🤖 Telegram: ${TELEGRAM_BOT_TOKEN ? 'مضبوط ✅' : 'غير مضبوط ⚠️'}`);
    console.log(`   💬 Chat ID: ${TELEGRAM_CHAT_ID ? 'مضبوط ✅' : 'غير مضبوط ⚠️'}`);
    console.log('='.repeat(50));
    console.log('📝 ملاحظة: الطلبات ستسجل هنا وفي Telegram إذا كان مضبوطاً\n');
});

// معالجة أخطاء غير متوقعة
process.on('uncaughtException', (error) => {
    console.error('🔥 خطأ غير متوقع:', error);
});<b>رقم الطلب:</b> #${Date.now().toString().slice(-6)}
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
