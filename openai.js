import fs from "fs";
import { Configuration, OpenAIApi } from "openai";

const MAX_HISTORY = 25;

class OpenAISimpleChat {
  #name;
  #desc;
  #configuration;
  #openai;
  #history=[];

  constructor(name,desc) {
    if(fs.existsSync("secret")) {
      this.#configuration = new Configuration({ apiKey:fs.readFileSync("secret").toString().trim()});
    }
    else {
      console.error("OpenAI API Key Not Found!");
      process.exit(1);
    }
    this.#openai = new OpenAIApi(this.#configuration);
    this.#name=name;
    this.#desc=desc;
  }
  async chat(name, message) {
    this.#saveHistory(name, message);
    let system = `You are roleplaying as one role in a movie script as "${this.#name}". ${this.#desc}. In the context of the following chat history, please answer either "true" or "false" as to whether you believe someone is talking to you and that you should respond. Remember, you are the helper in this chatroom. Please provide your answer in the format of a PARSEABLE json object like {"shouldRespond":true|false}. DO NOT PROVIDE ANY MORE THAN A JSON RESPONSE. \n\nChat History:\n${this.#getHistory()}\n\nShould you respond (true or false)? Under no circumstances should your response include anything other than the json object itself. ONLY RESPOND WITH A JSON OBJECT (json response).  Here is an example response: {"shouldRespond":true}.\nIf the last message wasn't directed at you, you should respond with false in the json. Read carefully because you are in a chatroom - many people are talking to other people and not you. If this last message was for you, though, you would respond with true in your json. Your json response and no other additional text (max response should be 23 chars):`;
    const completion = await this.#openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "system", content: system},
                 {role: "user", content: message}],
    });
    if(JSON.parse(completion.data.choices[0].message.content).shouldRespond) {
      return this.#respond(name, message);
    }
    else
      return false;
  }
  async #respond(name, message) {
    let system = `You are roleplaying in a movie script as "${this.#name}". ${this.#desc}. In the context of the following chat history, write your response or chat message. Remember, you are ${name}. Your response must only include a single response from ${name} to the message(s).\n\nChat History:\n${this.#getHistory()}\n\nYour response to ${name}'s message:`;
    const completion = await this.#openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "system", content: system},
                 {role: "user", content: message}],
    });
    return completion.data.choices[0].message.content;
  }

  #saveHistory(name, message) {
    this.#history.push(`${name}: ${message}`);
    if(this.#history.length > MAX_HISTORY)
      this.#history.shift();
  }
  #getHistory() {
    return this.#history.join("\n");
  }
}

export default OpenAISimpleChat;
