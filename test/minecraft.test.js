const { test } = require('node:test');
const assert = require('node:assert/strict');
const mc = require('minecraft-protocol');
const mineflayer = require('mineflayer');
const { startBot } = require('../index');
test('real application logs into Minecraft 1.8.9 and sends navigation commands', {timeout:20000}, async t=>{
    const server=mc.createServer({host:'127.0.0.1',port:0,version:'1.8.9','online-mode':false});
    let manager;
    t.after(async()=>{
        const closed=new Promise(resolve=>server.once('close',resolve));
        manager?.stop();server.close();await closed;
    });
    await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject)});
    const received=new Promise((resolve,reject)=>{
        server.on('login',client=>{
            client.write('login',{entityId:1,levelType:'default',gameMode:0,dimension:0,difficulty:1,maxPlayers:1,reducedDebugInfo:false});
            client.write('position',{x:0,y:64,z:0,yaw:0,pitch:0,flags:0});
            const commands=[];client.on('error',reject);
            client.on('chat',p=>{commands.push(p.message);if(commands.length===2)resolve(commands)});
        });
    });
    manager=startBot({server:{ip:'127.0.0.1',port:server.socketServer.address().port},account:{username:'SetupSmoke'},
        visit:{enabled:true,username:'TestTarget'},bot:{},webhook:{},cooldowns:{enabled:false}},
        options=>mineflayer.createBot({...options,auth:'offline'}));
    assert.deepEqual(await received,['/skyblock','/visit TestTarget']);
});

