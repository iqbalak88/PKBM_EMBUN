import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import md from "markdown-it";

const apiKey = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Nama kamu adalah Genie, kamu adalah seorang assisten guru yang bertugas untuk memberikan pengajaran dan konsultasi mengenai mata pelajaran yang terdapat di dalam kurikulum pembelajaran PKBM seperti matematika, bahasa indonesia, Pendidikan Agama, Pendidikan Kewarganegaraan, IPA, IPS, Bahasa Inggris, dan lain lain.\nselain itu, kamu juga bertugas untuk memberikan pengajaran & konsultasi lain yang berkaitan dengan kewirausahaan UMKM seperti memasak, menjahit, berkebun dan sejenisnya.\nsebelum memulai percakapan, kamu wajib untuk menanyakan nama pengguna terlebih dahulu, serta JANGAN menjawab apapun yang diluar konteks pembelajaran dan pendidikan.\n\nsebagai tambahan jika ada yang bertanya, kamu adalah sebuah virtual assistant yang di miliki oleh PKBM EMBUN dengan detail sebagai berikut : \nNAMA : PKBM EMBUN\nNPSN : P9997333\nStatus : Swasta\nBentuk Pendidikan : PKBM\nSK Pendirian Sekolah : 1871/503/00043/421-IPNF/III.16/IV/2021\nTanggal SK Pendirian : 2021-04-06\nAlamat : Jl. Karimun Jawa, Sukarame, Kec. Sukarame, Kota Bandar Lampung, Lampung 35122, Indonesia\nSK Izin Operasional : 1871/503/00043/421-IPNF/III.16/IV/2021\n\nTanggal SK Izin Operasional : 2021-04-06",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 500,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

let history = [];
let chatSession;

async function initializeChatSession() {
  chatSession = await model.startChat({
    generationConfig,
    safetySettings,
    history: history,
  });
}

async function getResponse(prompt) {
  if (!chatSession) {
    await initializeChatSession();
  }

  const result = await chatSession.sendMessage(prompt);
  const response = await result.response;
  const text = response.text();

  console.log(text);
  return text;
}

// user chat div
export const userDiv = (data) => {
  return `
  <!-- User Chat -->
  <div class="flex items-center gap-2 justify-start">
    <img src="user.png" alt="user icon" class="w-10 h-10 rounded-full" />
    <p class="bg-gemDeep text-white p-1 rounded-md shadow-md">${data}</p>
  </div>
  `;
};

// AI Chat div
export const aiDiv = (data) => {
  return `
  <!-- AI Chat -->
  <div class="flex gap-2 justify-end">
    <pre class="bg-gemRegular/40 text-gemDeep p-1 rounded-md shadow-md whitespace-pre-wrap">
      ${data}
    </pre>
    <img src="chat-bot.jpg" alt="user icon" class="w-10 h-10 rounded-full" />
  </div>
  `;
};

async function handleSubmit(event) {
  event.preventDefault();

  let userMessage = document.getElementById("prompt");
  const chatArea = document.getElementById("chat-container");

  const prompt = userMessage.value.trim();
  if (prompt === "") {
    return;
  }

  console.log("user message", prompt);

  chatArea.innerHTML += userDiv(prompt);
  userMessage.value = "";
  const aiResponse = await getResponse(prompt);
  let md_text = md().render(aiResponse);
  chatArea.innerHTML += aiDiv(md_text);

  let newUserRole = { role: "user", parts: [{ text: prompt }] };
  let newAIRole = { role: "model", parts: [{ text: aiResponse }] };

  history.push(newUserRole);
  history.push(newAIRole);

  console.log(history);
}

document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById("chat-form");
  chatForm.addEventListener("submit", handleSubmit);

  chatForm.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) handleSubmit(event);
  });
});
