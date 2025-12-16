import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const generateFestiveTeamNames = async (teams: { members: Player[] }[]): Promise<string[]> => {
  try {
    const teamDescriptions = teams.map((t, i) => `Team ${i + 1}: ${t.members.map(p => p.name).join(', ')}`).join('\n');
    
    const prompt = `Given these teams for a Christmas party, generate a funny, festive team name for each team. Return ONLY a JSON array of strings.
    
    ${teamDescriptions}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating team names:", error);
    // Fallback names
    return teams.map((_, i) => `Jolly Team ${i + 1}`);
  }
};

export const generatePartyChallenge = async (players: Player[]): Promise<{ title: string; description: string }> => {
  try {
    const playerNames = players.map(p => p.name).join(', ');
    const prompt = `Generate a quick, fun, 1-minute Christmas party minigame or trivia question for these players: ${playerNames}. 
    It should be suitable for a casual party.
    Return JSON with 'title' and 'description'.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
        title: result.title || "Mystery Challenge",
        description: result.description || "Sing a Christmas carol!"
    };
  } catch (error) {
    console.error("Error generating challenge:", error);
    return {
      title: "Jingle Bell Rock",
      description: "Everyone must hum 'Jingle Bells'. The first person to laugh loses a point!"
    };
  }
};

export const generateRoastOrToast = async (leader: Player, loser: Player): Promise<string> => {
    try {
        const prompt = `Write a very short, funny, lighthearted 2-sentence commentary for a Christmas party scoreboard. 
        Roast the person in last place (${loser.name}) gently and toast the person in first place (${leader.name}).`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        return response.text || "Merry Christmas to all, and to all a good night!";
    } catch (e) {
        return "Keep playing to see who ends up on the Naughty list!";
    }
}
