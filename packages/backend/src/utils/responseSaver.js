import fs from 'fs';
import path from 'path';

export const saveAiResponse = (responseText) => {
  try {
    const responsesDir = path.join(process.cwd(), 'gemini-responses');
    if (!fs.existsSync(responsesDir)) {
      fs.mkdirSync(responsesDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(responsesDir, `response-${timestamp}.txt`);
    
    fs.writeFileSync(filePath, responseText, 'utf-8');
    console.log(`AI response saved to: ${filePath}`);
  } catch (error) {
    console.error('Error saving AI response:', error);
  }
};

export const saveFullResponse = (responseObject) => {
  try {
    const responsesDir = path.join(process.cwd(), 'gemini-responses');
    if (!fs.existsSync(responsesDir)) {
      fs.mkdirSync(responsesDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(responsesDir, `full-response-${timestamp}.json`);
    
    // Convert the response object to a formatted JSON string
    const jsonString = JSON.stringify(responseObject, null, 2);
    
    fs.writeFileSync(filePath, jsonString, 'utf-8');
    console.log(`Full response saved to: ${filePath}`);
  } catch (error) {
    console.error('Error saving full response:', error);
  }
};

