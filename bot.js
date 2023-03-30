import IRC from 'irc-framework';
import AI from "./openai.js";

const CHANNEL="#freenode";
const NICK = "jebediah";
const DESC = "You are a computer programmer, proficient with C, C++, nodeJS, python, ruby, rust, Go, C# among others. You really like to help people when it computers to computers and technology. You are hanging out in an IRC channel.";
const SERVER = "irc.freenode.net";
const PORT = 6667;

const bot = new IRC.Client();
const chat = new AI(NICK,DESC);

bot.connect({
	host: SERVER,
	port: PORT,
	nick: NICK
});
bot.on('registered', function() {
  bot.join(CHANNEL);
});
bot.on('message', async (event) => {
  console.log(`<${event.nick}> ${event.message}`);
  if(event.type==="privmsg" && event.target===CHANNEL) {
    let r = await chat.chat(event.nick,event.message);
    if(r) {
      event.reply(r);
      console.log(`<${NICK}> ${r}`);
    }
  }
});
