const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { Navigation } = require('../src/utils/navigation');
const { ConnectionManager } = require('../src/utils/connectionManager');
const { createWindowHandler, findTargetSlot } = require('../src/handlers/windowHandler');
const { createMessageHandler } = require('../src/handlers/messageHandler');
const { getConfiguredDelay, randomizeTimer } = require('../src/utils/timerManager');
const { startBot } = require('../index');
function settings() {
    return { server: { ip: '127.0.0.1', port: 25565 }, account: {username:'Test'},
        visit: { enabled: true, username: 'TestTarget' }, bot: {}, webhook: {},
        cooldowns: {enabled:true, randomization:{enabled:false}, delays:{windowAnalyze:0,retryDelay:0}} };
}
function fixture(config = settings()) {
    let now=100000;
    const commands=[];
    const bot={config,chat:command=>commands.push(command)};
    const manager=new ConnectionManager(config);
    manager.setCurrentBot(bot);manager.handleConnect();
    bot.navigation=new Navigation(bot,config,manager,async()=>{},()=>now);
    return {bot,manager,commands,advance:ms=>{now+=ms}};
}
test('ignores unrelated windows, disabled visits, and other player heads', async()=>{
    const {bot,commands}=fixture();let clicks=0;bot.clickWindow=async()=>clicks++;
    const slots=Array(27).fill(null);slots[11]={name:'skull',displayName:'OtherPlayer'};
    assert.equal(findTargetSlot({title:'Chest',slots},bot.config),-1);
    assert.equal(findTargetSlot({title:'Visit',slots},bot.config),-1);
    assert.equal(findTargetSlot({title:'Visit TestTarget',slots},bot.config),11);
    bot.config.visit.enabled=false;
    await createWindowHandler(bot,async()=>{})({title:'Visit TestTarget',slots});
    assert.equal(clicks,0);assert.deepEqual(commands,[]);bot.navigation.stop();
});
test('recognizes named target, excludes player inventory and partial names',()=>{
    const c=settings();const slots=Array(63).fill(null);
    slots[5]={name:'skull',displayName:'TestTargetExtra'};
    slots[30]={name:'skull',displayName:'TestTarget'};
    assert.equal(findTargetSlot({title:'Visit',slots,inventoryStart:27},c),-1);
    slots[6]={name:'skull',nbt:{display:{Name:'§aTestTarget'}}};
    assert.equal(findTargetSlot({title:'Visit',slots,inventoryStart:27},c),6);
});
test('closed window cancels clicks; a failing open window gets exactly three attempts',async t=>{
    t.mock.timers.enable({apis:['setTimeout']});
    const {bot}=fixture();const slots=Array(27).fill(null);slots[11]={name:'skull'};
    const window={title:'Visit TestTarget',slots};let clicks=0;
    bot.clickWindow=async()=>{clicks++;throw Error('rejected')};
    const handler=createWindowHandler(bot,async()=>{});
    await handler(window);t.mock.timers.tick(0);await Promise.resolve();assert.equal(clicks,0);
    bot.currentWindow=window;await handler(window);
    for(let i=0;i<12;i++){t.mock.timers.tick(0);await Promise.resolve();}
    assert.equal(clicks,3);bot.navigation.stop();
});
test('shares /is cooldown across login navigation and welcome messages',async t=>{
    t.mock.timers.enable({apis:['setTimeout']});
    const c=settings();c.visit.enabled=false;const f=fixture(c);
    f.bot.navigation.target();
    await createMessageHandler(f.bot,async()=>{},c,f.manager)({toString:()=> 'Welcome to Hypixel SkyBlock!'});
    f.advance(5000);t.mock.timers.tick(5000);await Promise.resolve();
    assert.deepEqual(f.commands,['/is']);f.bot.navigation.stop();
});
test('deduplicates commands, caps visit retries, and cancels disconnected work',async t=>{
    t.mock.timers.enable({apis:['setTimeout']});const f=fixture();
    for(let i=0;i<5;i++){f.bot.navigation.target();f.advance(10000)}
    assert.equal(f.commands.length,3);
    f.bot.navigation.skyblock();f.bot.navigation.skyblock();
    f.bot.navigation.stop();t.mock.timers.tick(60000);await Promise.resolve();
    assert.equal(f.commands.length,3);
});
test('configured delays and zero variance are respected',()=>{
    const c=settings();c.cooldowns.delays.windowAnalyze=23;
    assert.equal(getConfiguredDelay('WINDOW_ANALYZE',c),23);
    c.cooldowns.randomization={enabled:true,variance:0};assert.equal(randomizeTimer(1000,c),1000);
    c.cooldowns.randomization.variance=0.3;
    for(let i=0;i<50;i++) assert.ok(randomizeTimer(1000,c)>=700 && randomizeTimer(1000,c)<=1300);
});
test('reconnects once, stops old actions, and quits the current bot on shutdown',async t=>{
    t.mock.timers.enable({apis:['setTimeout']});const bots=[];
    const manager=startBot(settings(),()=>{const b=new EventEmitter();b.username='Test';b.quit=()=>{b.closed=true};b.chat=()=>{};bots.push(b);return b});
    bots[0].emit('login');await Promise.resolve();await Promise.resolve();
    bots[0].emit('end');bots[0].emit('end');await Promise.resolve();await Promise.resolve();
    assert.equal(bots[0].navigation.stopped,true);
    t.mock.timers.tick(5000);await Promise.resolve();assert.equal(bots.length,2);
    manager.stop();assert.equal(bots[1].closed,true);
    t.mock.timers.tick(60000);await Promise.resolve();assert.equal(bots.length,2);
});
test('synchronous connect failures retry with backoff and can be cancelled',async t=>{
    t.mock.timers.enable({apis:['setTimeout']});let attempts=0;
    const manager=startBot(settings(),()=>{attempts++;throw Error('offline')});
    assert.equal(attempts,1);t.mock.timers.tick(5000);await Promise.resolve();await Promise.resolve();
    assert.equal(attempts,2);t.mock.timers.tick(9999);assert.equal(attempts,2);
    manager.stop();t.mock.timers.tick(60000);assert.equal(attempts,2);
});
test('deferred navigation still queues target and counts each visit',async t=>{
    t.mock.timers.enable({apis:['setTimeout']});const f=fixture();
    f.bot.navigation.send('/other');
    f.bot.navigation.send('/skyblock',()=>f.bot.navigation.queueTarget());
    f.advance(3000);t.mock.timers.tick(3000);await Promise.resolve();
    assert.deepEqual(f.commands,['/other','/skyblock']);
    f.advance(3000);t.mock.timers.tick(3000);await Promise.resolve();
    assert.equal(f.bot.navigation.visitAttempts,1);
    assert.equal(f.commands[2],'/visit TestTarget');f.bot.navigation.stop();
});
test('Discord logs use supplied config, truncate embeds, and bound request time',async()=>{
    const {createWebhookLogger}=require('../src/utils/webhookLogger');
    const config=settings();config.webhook={url:'https://example.invalid/webhook'};
    let calls=0;
    const send=createWebhookLogger(config,async(url,options)=>{
        calls++;assert.equal(url,config.webhook.url);assert.ok(options.signal instanceof AbortSignal);
        const body=JSON.parse(options.body);assert.equal(body.embeds[0].description.length,4096);
        return {ok:true};
    });
    await send('x'.repeat(5000));assert.equal(calls,1);
    await createWebhookLogger(settings(),()=>{throw Error('must not send')})('disabled');
});
test('shutdown before plugin injection uses bot.end and cancels retry',()=>{
    const manager=new ConnectionManager(settings());let ended=false;
    manager.setCurrentBot({end:()=>{ended=true}});manager.stop();
    assert.equal(ended,true);assert.equal(manager.canPerformAction(),false);
});
test('invalid account config fails before creating a network client',()=>{
    const config=settings();config.account.username='email';
    assert.throws(()=>startBot(config,()=>{throw Error('network called')}),/compte Microsoft/);
});
